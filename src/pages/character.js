/**
 * 角色详情页：?id= 定位角色，左栏 3D MMD 查看器 + 右栏档案信息面板。
 */
import { initLayout, imageFallback, escapeHtml, formatDate, assetUrl } from '../shared/layout.js'
import charactersData from '../data/characters.json'
import { createMMDViewer } from './mmd-viewer.js'

initLayout()

const roster = (charactersData && charactersData.characters) || []
const root = document.getElementById('char-page')

const RARITY_CLASS = { S: 'badge-s', A: 'badge-a', B: 'badge-b' }

const trimmed = value => String(value == null ? '' : value).trim()

/** 转义非空文本，空值返回 ''（用于“有则显示”判断） */
const escIf = value => (trimmed(value) ? escapeHtml(trimmed(value)) : '')

/** 多段纯文本 → <p> 列表（按换行分段，逐段转义） */
function textParagraphs(text) {
  return String(text == null ? '' : text)
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join('')
}

/** 展示名：fullName 优先，缺省按官方惯例拼 codename·name（与图鉴页一致） */
function displayName(c) {
  if (!c) return '未知修正者'
  if (trimmed(c.fullName)) return trimmed(c.fullName)
  if (trimmed(c.codename)) return `${trimmed(c.codename)}·${trimmed(c.name)}`
  return trimmed(c.name) || '未知修正者'
}

/** 小节：标题 + 内容（内容为空则整块不渲染） */
function block(title, inner) {
  if (!inner) return ''
  return `
    <section class="detail-block">
      <h2 class="detail-heading">${title}</h2>
      ${inner}
    </section>`
}

/** kv 表格行：值已转义；空值行自动剔除，全空返回 '' */
function kvRows(pairs) {
  const rows = pairs.filter(([, value]) => value)
  if (!rows.length) return ''
  return rows.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join('')
}

/* ---------- 入口 ---------- */

const id = new URLSearchParams(location.search).get('id') || ''
const index = id ? roster.findIndex(c => c && c.id === id) : -1

if (index === -1) {
  renderMissing()
} else {
  renderCharacter(roster[index], index)
}

/* ---------- 未找到 / 缺参数 ---------- */

function renderMissing() {
  const msg = !roster.length
    ? '档案数据待补充。'
    : (id ? '未找到该修正者的档案，可能尚未收录或链接有误。' : '缺少角色参数，请从角色图鉴进入。')
  root.innerHTML = `
    <div class="empty-state char-empty">
      <div class="empty-icon">🛰️</div>
      <p>${escapeHtml(msg)}</p>
      <div class="empty-actions">
        <a class="btn btn-primary" href="characters.html">返回角色图鉴</a>
      </div>
    </div>`
}

/* ---------- 角色详情 ---------- */

function renderCharacter(c, i) {
  const name = displayName(c)
  document.title = `${name} · 深空之眼档案馆`

  /* 徽章行：稀有度 / 属性 / 武器 / 阵营 */
  const rarity = trimmed(c.rarity)
  const element = trimmed(c.element)
  const badges = []
  if (rarity) badges.push(`<span class="badge ${RARITY_CLASS[rarity] || ''}">${escapeHtml(rarity)}</span>`)
  if (element) badges.push(`<span class="badge" data-element="${escapeHtml(element)}">${escapeHtml(element)}</span>`)
  if (escIf(c.weapon)) badges.push(`<span class="badge">${escIf(c.weapon)}</span>`)
  if (escIf(c.faction)) badges.push(`<span class="badge">${escIf(c.faction)}</span>`)

  /* 档案信息：实装版本 / 日期 + CV */
  const va = c.voiceActor || {}
  const infoRows = kvRows([
    ['实装版本', escIf(c.releaseVersion)],
    ['实装日期', trimmed(c.releaseDate) ? escapeHtml(formatDate(trimmed(c.releaseDate))) : ''],
    ['中文配音', escIf(va.cn)],
    ['日语配音', escIf(va.jp)]
  ])

  /* 角色介绍：按换行分段 */
  const descHtml = trimmed(c.description)
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join('')

  /* 角色资料小表格 */
  const profile = c.profile || {}
  const profileRows = kvRows([
    ['身高', escIf(profile.height)],
    ['生日', escIf(profile.birthday)],
    ['爱好', escIf(profile.hobby)]
  ])

  /* 技能列表 */
  const skills = Array.isArray(c.skills)
    ? c.skills.filter(s => s && (trimmed(s.name) || trimmed(s.description)))
    : []
  const skillsHtml = skills
    .map(s => {
      const type = trimmed(s.type) || '技能'
      const skillName = escIf(s.name)
      const skillDesc = escIf(s.description)
      return `
        <li class="skill-item">
          <span class="badge skill-type">${escapeHtml(type)}</span>
          <div class="skill-body">
            ${skillName ? `<div class="skill-name">${skillName}</div>` : ''}
            ${skillDesc ? `<p class="skill-desc">${skillDesc}</p>` : ''}
          </div>
        </li>`
    })
    .join('')

  /* 语音摘录 */
  const quotes = Array.isArray(c.quotes) ? c.quotes.map(trimmed).filter(Boolean) : []
  const quotesHtml = quotes
    .map(q => `<blockquote class="quote">${escapeHtml(q)}</blockquote>`)
    .join('')

  /* 档案（纯文本档案节点） */
  const archives = Array.isArray(c.archives)
    ? c.archives.filter(a => a && (trimmed(a.title) || trimmed(a.content)))
    : []
  const archivesHtml = archives
    .map((a, idx) => `
      <details class="fold-item"${idx === 0 ? ' open' : ''}>
        <summary>${escapeHtml(trimmed(a.title) || `档案 ${idx + 1}`)}</summary>
        <div class="fold-body">${textParagraphs(a.content)}</div>
      </details>`)
    .join('')

  /* 誓约心链（个人剧情，纯文本记录） */
  const heartlinks = Array.isArray(c.heartlinks)
    ? c.heartlinks.filter(h => h && (trimmed(h.title) || trimmed(h.content) || trimmed(h.summary)))
    : []
  const heartlinksHtml = heartlinks
    .map((h, idx) => `
      <details class="fold-item fold-heartlink">
        <summary>${escapeHtml(trimmed(h.title) || `心链 ${idx + 1}`)}</summary>
        <div class="fold-body">
          ${trimmed(h.summary) ? `<p class="fold-summary">${escapeHtml(trimmed(h.summary))}</p>` : ''}
          ${textParagraphs(h.content)}
        </div>
      </details>`)
    .join('')

  /* 立绘与皮肤：默认 + skins 组成可切换的变体列表 */
  const skins = Array.isArray(c.skins) ? c.skins.filter(Boolean) : []
  const variants = [
    { name: '默认', fullArt: trimmed(c.fullArt), model: c.model || null },
    ...skins.map(s => ({
      name: trimmed(s.name) || '换装',
      fullArt: trimmed(s.fullArt),
      model: s.model || null
    }))
  ]
  const artVariants = variants.filter(v => v.fullArt)
  const modelVariants = variants.filter(v => v.model && trimmed(v.model.path))

  const artTabsHtml = artVariants.length > 1
    ? `<div class="variant-tabs" id="art-tabs" role="tablist" aria-label="立绘切换">
        ${artVariants.map((v, idx) => `
          <button type="button" class="chip${idx === 0 ? ' active' : ''}" data-index="${idx}">${escapeHtml(v.name)}</button>`).join('')}
      </div>`
    : ''
  const artHtml = artVariants.length
    ? `${artTabsHtml}<div class="full-art" id="full-art-box"></div>`
    : ''

  /* 上一位 / 下一位（按 roster 顺序循环） */
  let pagerHtml = ''
  if (roster.length > 1) {
    const prev = roster[(i - 1 + roster.length) % roster.length]
    const next = roster[(i + 1) % roster.length]
    pagerHtml = `
      <nav class="char-pager" aria-label="角色切换">
        <a class="btn pager-prev" href="character.html?id=${encodeURIComponent(prev.id || '')}">← 上一位：${escapeHtml(displayName(prev))}</a>
        <a class="btn pager-next" href="character.html?id=${encodeURIComponent(next.id || '')}">下一位：${escapeHtml(displayName(next))} →</a>
      </nav>`
  }

  root.innerHTML = `
    <div class="char-detail-layout">
      <div class="char-viewer-col">
        <div id="mmd-container" class="mmd-viewer" aria-label="3D 模型查看器"></div>
        ${modelVariants.length > 1 ? `
        <div class="variant-tabs model-tabs" id="model-tabs" role="tablist" aria-label="模型切换">
          ${modelVariants.map((v, idx) => `
            <button type="button" class="chip${idx === 0 ? ' active' : ''}" data-index="${idx}">${escapeHtml(v.name)}</button>`).join('')}
        </div>` : ''}
        <p class="viewer-note">3D 模型在浏览器本地渲染；「从本地文件夹加载」不会上传任何文件。</p>
      </div>
      <div class="char-info-col">
        <a class="back-link" href="characters.html">← 返回角色图鉴</a>
        <h1 class="detail-name">${escapeHtml(name)}</h1>
        ${badges.length ? `<div class="detail-badges">${badges.join('')}</div>` : ''}
        ${block('档案信息', infoRows ? `<dl class="kv-table">${infoRows}</dl>` : '')}
        ${block('角色介绍', descHtml ? `<div class="detail-desc">${descHtml}</div>` : '')}
        ${block('角色资料', profileRows ? `<dl class="kv-table">${profileRows}</dl>` : '')}
        ${block('技能', skillsHtml ? `<ul class="skill-list">${skillsHtml}</ul>` : '')}
        ${block('语音摘录', quotesHtml)}
        ${block('档案', archivesHtml)}
        ${block('誓约心链', heartlinksHtml)}
        ${block('立绘', artHtml)}
      </div>
    </div>
    ${pagerHtml}
    <p class="module-note">本页档案长期留存 —— 服务器谢幕之后，仍可在此回望每一位修正者。</p>`

  /* 立绘渲染与多套切换 */
  const artBox = document.getElementById('full-art-box')
  const showArt = idx => {
    const v = artVariants[idx]
    if (!artBox || !v) return
    artBox.innerHTML = `<img src="${escapeHtml(assetUrl(v.fullArt))}" alt="${escapeHtml(name)} 立绘 - ${escapeHtml(v.name)}" loading="lazy" />`
    imageFallback(artBox.querySelector('img'), trimmed(c.name) || name)
  }
  if (artBox) showArt(0)
  const artTabs = document.getElementById('art-tabs')
  if (artTabs) {
    artTabs.addEventListener('click', e => {
      const btn = e.target.closest('button[data-index]')
      if (!btn) return
      artTabs.querySelectorAll('.chip').forEach(b => b.classList.toggle('active', b === btn))
      showArt(+btn.dataset.index)
    })
  }

  /* 3D 查看器：默认加载首个有模型的变体，多套模型时可切换 */
  const firstModel = (modelVariants[0] && modelVariants[0].model) || {}
  const viewer = createMMDViewer(document.getElementById('mmd-container'), {
    modelPath: trimmed(firstModel.path),
    modelScale: Number(firstModel.scale) || 1,
    screenshotName: trimmed(c.id) || 'model'
  })
  const modelTabs = document.getElementById('model-tabs')
  if (modelTabs) {
    modelTabs.addEventListener('click', e => {
      const btn = e.target.closest('button[data-index]')
      if (!btn) return
      modelTabs.querySelectorAll('.chip').forEach(b => b.classList.toggle('active', b === btn))
      const v = modelVariants[+btn.dataset.index]
      if (v && v.model) viewer.loadSite(v.model.path, v.model.scale)
    })
  }
  addEventListener('pagehide', e => {
    if (!e.persisted) viewer.dispose()
  })
}
