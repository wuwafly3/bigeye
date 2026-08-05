/**
 * 档案投稿 / 纠错接口（Cloudflare Worker）+ 静态资源服务
 *
 * 投稿不入数据库：直接在仓库创建一条 GitHub Issue，供维护者审核后
 * 修改 src/data/*.json 落档。档案数据因此保持纯静态。
 *
 * 路由：
 * - POST /api/submit  投稿接口
 * - 其余路径         由 Workers Static Assets 直接服务 dist/ 构建产物
 *
 * 需要的环境变量（wrangler.jsonc / 控制台配置）：
 * - GITHUB_TOKEN  必填。细粒度 PAT，只需目标仓库的 Issues: Read and write 权限
 * - GITHUB_REPO   可选，默认 "wuwafly3/bigeye"
 * 本地开发可写入 .dev.vars（已 gitignore）
 */

const LIMITS = { title: 120, content: 4000, contact: 200 }
const TYPES = ['纠错', '补充资料', '素材线索', '其他']
const MODULES = ['角色图鉴', '时间线', '剧情回顾', '插画合集', '敌人图鉴', '整站', '其他']

/* 每实例内存级限流（尽力而为的防刷；实例回收后重置） */
const hits = new Map()
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 5

function json(status, obj, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  })
}

async function handleSubmit(request, env) {
  if (request.method !== 'POST') {
    return json(405, { ok: false, error: 'method_not_allowed' })
  }

  let body = {}
  try {
    body = await request.json()
  } catch {
    /* 非 JSON 体按空对象处理，走 missing_fields */
  }
  if (body === null || typeof body !== 'object') body = {}

  /* 蜜罐字段：机器人填了就假装成功，不产生 Issue */
  if (String(body.website || '').trim() !== '') {
    return json(200, { ok: true })
  }

  const type = TYPES.includes(body.type) ? body.type : '其他'
  const module_ = MODULES.includes(body.module) ? body.module : '其他'
  const title = String(body.title || '').trim().slice(0, LIMITS.title)
  const content = String(body.content || '').trim().slice(0, LIMITS.content)
  const contact = String(body.contact || '').trim().slice(0, LIMITS.contact)

  if (!title || !content) {
    return json(400, { ok: false, error: 'missing_fields' })
  }

  /* CF 直连接口取真实客户端 IP */
  const ip = request.headers.get('CF-Connecting-IP')
    || String(request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || 'unknown'
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => t > now - WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    return json(429, { ok: false, error: 'rate_limited' })
  }
  recent.push(now)
  hits.set(ip, recent)

  const token = env.GITHUB_TOKEN
  const repo = env.GITHUB_REPO || 'wuwafly3/bigeye'
  if (!token) {
    return json(503, { ok: false, error: 'not_configured' })
  }

  const issueBody = [
    `**类型**：${type}`,
    `**相关模块**：${module_}`,
    contact ? `**联系方式**：${contact}` : null,
    '',
    '---',
    '',
    content,
    '',
    '---',
    '_来自档案馆站内「投稿与纠错」表单_'
  ].filter(v => v !== null).join('\n')

  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'aether-gazer-archive',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `[${type}] ${title}`,
        body: issueBody,
        labels: ['archive-submission']
      })
    })
    if (!resp.ok) {
      return json(502, { ok: false, error: 'github_error' })
    }
    const issue = await resp.json()
    return json(200, { ok: true, url: issue.html_url })
  } catch (e) {
    return json(502, { ok: false, error: 'network_error' })
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname === '/api/submit') {
      return handleSubmit(request, env)
    }
    /* 其余请求全部落到 Workers Static Assets（dist/）；
       html_handling: none 时根路径需显式映射到 index.html */
    if (url.pathname === '/') {
      url.pathname = '/index.html'
      return env.ASSETS.fetch(new Request(url, request))
    }
    return env.ASSETS.fetch(request)
  }
}
