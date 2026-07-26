/**
 * 弥弥尔（Mi-Mi）站点小助手 —— 右下角互动部件
 *
 * - 气泡文案：从 src/data/mimir.json 随机抽取，定时自动冒泡，点击本体立即换一条
 * - 形象三档（mimir.json 的 mode 字段）：
 *   "svg"    内置动画 SVG 小机器人（默认，零素材可用）
 *   "image"  使用 image 字段指定的图片（相对 public/）
 *   "live2d" 动态加载 Live2D 运行库并挂载模型（素材放置见 public/mimir/README.md），
 *            任一环节失败时自动回退到 SVG
 * - 可收起（右上角 ×），状态记忆在 localStorage；遵守 prefers-reduced-motion
 */
import mimirData from '../data/mimir.json'
import '../styles/mimir.css'

const STORE_KEY = 'agarchive-mimir-hidden'

const esc = s => String(s == null ? '' : s)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;')

/* 内置形象：浮动的小机器人（眨眼动画在 CSS 中） */
const BOT_SVG = `
<svg class="mimir-bot" viewBox="0 0 64 64" aria-hidden="true">
  <line x1="32" y1="10" x2="32" y2="17" stroke="var(--line-strong)" stroke-width="2"/>
  <circle class="mimir-antenna" cx="32" cy="7" r="3.4" fill="var(--accent)"/>
  <rect x="13" y="17" width="38" height="31" rx="9" fill="var(--ink)"/>
  <rect x="18" y="23" width="28" height="15" rx="6" fill="#0d3448"/>
  <rect class="mimir-eye" x="23" y="26.5" width="5.5" height="8" rx="2.6" fill="#3fc3ff"/>
  <rect class="mimir-eye mimir-eye-r" x="35.5" y="26.5" width="5.5" height="8" rx="2.6" fill="#3fc3ff"/>
  <rect x="26" y="42" width="12" height="2.6" rx="1.3" fill="rgba(233,237,242,0.4)"/>
  <rect x="9" y="26" width="4" height="10" rx="2" fill="var(--accent)"/>
  <rect x="51" y="26" width="4" height="10" rx="2" fill="var(--accent)"/>
  <ellipse class="mimir-shadow" cx="32" cy="58" rx="13" ry="2.6" fill="rgba(24,60,90,0.18)"/>
</svg>`

export function initMimir() {
  const cfg = mimirData || {}
  if (!cfg.enabled || document.getElementById('mimir-widget')) return

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const quotes = Array.isArray(cfg.quotes) ? cfg.quotes.filter(Boolean) : []
  const name = cfg.name || '弥弥尔'

  /* ---------- DOM ---------- */
  const widget = document.createElement('div')
  widget.id = 'mimir-widget'
  widget.className = 'mimir-widget'
  widget.innerHTML = `
    <div class="mimir-bubble" hidden>
      <span class="mimir-bubble-text" role="status" aria-live="polite"></span>
    </div>
    <button type="button" class="mimir-close" aria-label="收起${esc(name)}" title="收起">×</button>
    <button type="button" class="mimir-avatar" aria-label="${esc(name)}：点击听它说话"></button>`
  document.body.appendChild(widget)

  const restore = document.createElement('button')
  restore.type = 'button'
  restore.id = 'mimir-restore'
  restore.className = 'mimir-restore'
  restore.hidden = true
  restore.setAttribute('aria-label', `召唤${name}`)
  restore.title = name
  restore.textContent = '弥'
  document.body.appendChild(restore)

  const avatar = widget.querySelector('.mimir-avatar')
  const bubble = widget.querySelector('.mimir-bubble')
  const bubbleText = widget.querySelector('.mimir-bubble-text')

  /* ---------- 形象挂载：live2d / image → 失败回退 svg ---------- */
  const mountSvg = () => { avatar.innerHTML = BOT_SVG }
  if (cfg.mode === 'image' && cfg.image) {
    const img = new Image()
    img.className = 'mimir-img'
    img.alt = ''
    img.onerror = mountSvg
    img.src = './' + cfg.image
    avatar.appendChild(img)
  } else if (cfg.mode === 'live2d' && cfg.live2d && cfg.live2d.model) {
    mountSvg() // 先显示内置形象，加载成功后替换
    mountLive2D(avatar, cfg.live2d).catch(() => mountSvg())
  } else {
    mountSvg()
  }

  /* ---------- 气泡 ---------- */
  let hideTimer = 0
  let lastIndex = -1
  function say(text) {
    if (!text) return
    bubbleText.textContent = text
    bubble.hidden = false
    bubble.classList.remove('pop')
    void bubble.offsetWidth // 重启入场动画
    bubble.classList.add('pop')
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => { bubble.hidden = true }, (cfg.bubbleSeconds || 7) * 1000)
  }
  function sayRandom() {
    if (!quotes.length) return
    let idx = Math.floor(Math.random() * quotes.length)
    if (quotes.length > 1 && idx === lastIndex) idx = (idx + 1) % quotes.length
    lastIndex = idx
    say(quotes[idx])
  }
  function greeting() {
    const g = cfg.greetings || {}
    const h = new Date().getHours()
    if (h < 5) return g.dawn
    if (h < 11) return g.morning
    if (h < 18) return g.afternoon
    return g.evening
  }

  avatar.addEventListener('click', () => {
    sayRandom()
    if (!reduceMotion) {
      avatar.classList.remove('bounce')
      void avatar.offsetWidth
      avatar.classList.add('bounce')
    }
  })
  bubble.addEventListener('click', () => { bubble.hidden = true })

  /* ---------- 收起 / 召回 ---------- */
  const setHidden = hidden => {
    widget.hidden = hidden
    restore.hidden = !hidden
    try { localStorage.setItem(STORE_KEY, hidden ? '1' : '') } catch (e) { /* 隐私模式忽略 */ }
  }
  widget.querySelector('.mimir-close').addEventListener('click', () => setHidden(true))
  restore.addEventListener('click', () => { setHidden(false); sayRandom() })

  let startHidden = false
  try { startHidden = localStorage.getItem(STORE_KEY) === '1' } catch (e) { /* 忽略 */ }
  if (startHidden) {
    widget.hidden = true
    restore.hidden = false
    return
  }

  /* ---------- 自动冒泡 ---------- */
  setTimeout(() => say(greeting() || quotes[0]), 1400)
  const interval = Math.max(10, Number(cfg.autoIntervalSeconds) || 26) * 1000
  setInterval(() => {
    if (!widget.hidden && bubble.hidden && !document.hidden) sayRandom()
  }, interval)
}

/**
 * Live2D 挂载：按 mimir.json 的 live2d 配置动态加载运行库与模型。
 * 所需文件与放置方式见 public/mimir/README.md；任何一步失败都会抛错，
 * 由调用方回退到内置 SVG 形象。
 */
async function mountLive2D(container, cfg) {
  const loadScript = src => new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = './' + src
    s.onload = resolve
    s.onerror = () => reject(new Error('加载失败: ' + src))
    document.head.appendChild(s)
  })

  if (cfg.core) await loadScript(cfg.core)
  for (const lib of cfg.libs || []) await loadScript(lib)

  const PIXI = window.PIXI
  if (!PIXI || !PIXI.live2d || !PIXI.live2d.Live2DModel) {
    throw new Error('Live2D 运行库未就绪')
  }

  const width = Number(cfg.width) || 200
  const height = Number(cfg.height) || 230
  const app = new PIXI.Application({
    width,
    height,
    backgroundAlpha: 0,
    autoStart: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2)
  })
  const model = await PIXI.live2d.Live2DModel.from('./' + cfg.model)
  const scale = Math.min(width / model.width, height / model.height)
  model.scale.set(scale)
  model.x = (width - model.width * scale) / 2
  model.y = height - model.height * scale
  app.stage.addChild(model)

  container.innerHTML = ''
  container.classList.add('mimir-live2d')
  container.appendChild(app.view)
}
