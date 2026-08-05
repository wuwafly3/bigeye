/**
 * 公共布局：注入顶部导航与页脚、图片占位处理。
 * 每个页面 JS 的入口都应先调用 initLayout()。
 */
import { initMimir } from './mimir.js'
import { assetUrl } from './assets.js'
import charactersData from '../data/characters.json'
import functorsData from '../data/functors.json'
export { assetUrl } from './assets.js'

const NAV_ITEMS = [
  ['index.html', '首页'],
  ['characters.html', '角色图鉴'],
  ['functors.html', '钥从图鉴'],
  ['timeline.html', '时间线'],
  ['story.html', '剧情回顾'],
  ['gallery.html', '插画合集'],
  ['enemies.html', '敌人图鉴']
]

/** 子页面归属到导航主项（如 character.html 高亮"角色图鉴"） */
const PAGE_ALIAS = {
  'character.html': 'characters.html'
}

const THEME_KEY = 'bigeye-theme'

function preferredTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return 'light'
}

export function setTheme(theme, { persist = true } = {}) {
  const next = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = next
  document.documentElement.style.colorScheme = next
  const themeColor = document.querySelector('meta[name="theme-color"]')
  if (themeColor) themeColor.content = next === 'dark' ? '#0d1117' : '#dde5ee'
  if (persist) localStorage.setItem(THEME_KEY, next)
  document.querySelectorAll('.theme-toggle').forEach(button => {
    button.setAttribute('aria-pressed', String(next === 'dark'))
    button.setAttribute('aria-label', next === 'dark' ? '切换至浅色主题' : '切换至深色主题')
    button.title = next === 'dark' ? '浅色主题' : '深色主题'
  })
}

function currentPage() {
  const path = location.pathname.split('/').pop() || 'index.html'
  return PAGE_ALIAS[path] || path
}

export function initLayout() {
  setTheme(preferredTheme(), { persist: false })
  const active = currentPage()

  const loading = document.createElement('div')
  loading.className = 'hud-loading-overlay'
  loading.setAttribute('role', 'status')
  loading.setAttribute('aria-label', '正在载入档案')
  loading.innerHTML = `
    <div class="hud-loading-core">
      <span class="hud-loading-ring" aria-hidden="true"></span>
      <img src="${assetUrl('images/game-art/hud/system/logo1.png')}" alt="" />
    </div>
    <div class="hud-loading-label">ARCHIVE LINK</div>
    <div class="hud-loading-track"><span></span></div>`
  document.body.prepend(loading)

  const header = document.createElement('header')
  header.className = 'site-header'
  header.innerHTML = `
    <div class="header-inner">
      <a class="site-wordmark" href="index.html" aria-label="弥弥尔资料站首页">弥弥尔资料站</a>
      <button class="nav-toggle" aria-label="打开菜单">☰</button>
      <nav class="nav-links">
        ${NAV_ITEMS.map(([href, label]) =>
          `<a href="${href}"${href === active ? ' class="active" aria-current="page"' : ''}>${label}</a>`
        ).join('')}
      </nav>
      <div class="header-tools">
        <button class="icon-btn search-toggle" type="button" aria-label="打开全站搜索" title="全站搜索"><svg class="icon-search" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"></circle><path d="m16 16 5 5"></path></svg></button>
        <button class="icon-btn theme-toggle" type="button" aria-label="切换主题" title="切换主题">◐</button>
      </div>
    </div>`
  document.body.prepend(header)

  const search = document.createElement('div')
  search.className = 'command-palette'
  search.hidden = true
  search.innerHTML = `
    <div class="command-mask" data-command-close></div>
    <section class="command-panel" role="dialog" aria-modal="true" aria-labelledby="command-title">
      <div class="command-head">
        <span class="command-mark" aria-hidden="true">◆</span>
        <label id="command-title" for="command-input">全站档案检索</label>
        <button class="icon-btn command-close" type="button" aria-label="关闭搜索">×</button>
      </div>
      <input id="command-input" class="command-input" type="search" autocomplete="off" placeholder="输入角色或档案模块名称" />
      <div class="command-results" id="command-results"></div>
    </section>`
  document.body.append(search)

  const footer = document.createElement('footer')
  footer.className = 'site-footer'
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-title">深空之眼档案馆 · AETHER GAZER ARCHIVE</div>
      <div>本站为非官方粉丝档案项目，旨在为《深空之眼》留存记忆，与勇仕网络及其关联公司无关。</div>
      <div>游戏内素材、角色形象与美术作品的版权归原权利方所有；本站内容仅供交流学习，请勿用于商业用途。</div>
      <div class="footer-links"><a href="submit.html">投稿与纠错</a></div>
    </div>`
  document.body.append(footer)

  const toggle = header.querySelector('.nav-toggle')
  const links = header.querySelector('.nav-links')
  toggle.addEventListener('click', () => links.classList.toggle('open'))
  header.querySelector('.theme-toggle').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')
  })

  initCommandPalette(search, header.querySelector('.search-toggle'))

  const finishLoading = () => {
    requestAnimationFrame(() => loading.classList.add('is-complete'))
    setTimeout(() => loading.remove(), 560)
  }
  if (document.readyState === 'complete') finishLoading()
  else addEventListener('load', finishLoading, { once: true })

  initClickEffect()
  initMimir()
}

export function showHudTransition(duration = 260) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  let overlay = document.querySelector('.hud-action-overlay')
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = 'hud-action-overlay'
    overlay.innerHTML = '<span></span>'
    document.body.append(overlay)
  }
  overlay.classList.remove('pulse')
  void overlay.offsetWidth
  overlay.classList.add('pulse')
  clearTimeout(overlay._timer)
  overlay._timer = setTimeout(() => overlay.classList.remove('pulse'), duration)
}

function initCommandPalette(root, trigger) {
  const input = root.querySelector('.command-input')
  const results = root.querySelector('.command-results')
  const characters = ((charactersData && charactersData.characters) || []).map(c => ({
    title: c.codename && c.name ? `${c.codename}·${c.name}` : (c.name || c.codename || '未知修正者'),
    meta: [c.element, c.faction].filter(Boolean).join(' / ') || '修正者档案',
    href: `character.html?id=${encodeURIComponent(c.id || '')}`,
    image: c.portrait ? assetUrl(c.portrait) : ''
  }))
  const functors = ((functorsData && functorsData.functors) || []).map(item => ({
    title: item.name || `钥从 ${item.id}`,
    meta: `钥从 / ${item.rarity || '-'}级`,
    href: `functors.html#functor-${encodeURIComponent(item.id || '')}`,
    image: item.icon ? assetUrl(item.icon) : ''
  }))
  const pages = NAV_ITEMS.map(([href, title]) => ({ title, meta: '档案模块', href, image: '' }))
  const items = [...pages, ...characters, ...functors]

  const render = () => {
    const q = input.value.trim().toLowerCase()
    const matches = items.filter(item => !q || `${item.title} ${item.meta}`.toLowerCase().includes(q)).slice(0, 8)
    results.innerHTML = matches.length ? matches.map((item, index) => `
      <a class="command-result${index === 0 ? ' is-active' : ''}" href="${item.href}">
        <span class="command-thumb">${item.image ? `<img src="${escapeHtml(item.image)}" alt="" />` : '◆'}</span>
        <span class="command-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></span>
        <span class="command-arrow" aria-hidden="true">→</span>
      </a>`).join('') : '<div class="command-empty">未检索到匹配档案</div>'
  }
  const open = () => {
    root.hidden = false
    document.body.classList.add('command-lock')
    input.value = ''
    render()
    requestAnimationFrame(() => input.focus())
  }
  const close = () => {
    root.hidden = true
    document.body.classList.remove('command-lock')
    trigger.focus()
  }
  trigger.addEventListener('click', open)
  root.querySelectorAll('[data-command-close], .command-close').forEach(el => el.addEventListener('click', close))
  input.addEventListener('input', render)
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      root.hidden ? open() : close()
      return
    }
    if (root.hidden) return
    if (event.key === 'Escape') close()
    if (event.key === 'Enter') {
      const active = results.querySelector('.command-result')
      if (active) location.href = active.href
    }
  })
}

/** 点击特效：在点击处生成一个斜置方块，扩散淡出（遵守 prefers-reduced-motion） */
function initClickEffect() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.addEventListener('pointerdown', e => {
    if (e.button !== 0) return
    const fx = document.createElement('div')
    fx.className = 'click-fx'
    fx.style.left = e.clientX + 'px'
    fx.style.top = e.clientY + 'px'
    document.body.appendChild(fx)
    fx.addEventListener('animationend', () => fx.remove(), { once: true })
    setTimeout(() => fx.remove(), 700) // 动画事件缺失时的兜底清理
  }, { passive: true })
}

/**
 * 图片加载失败时替换为占位块。
 * @param {HTMLImageElement} img
 * @param {string} label 占位显示的文字（一般用角色名首字或简称）
 */
export function imageFallback(img, label = '?') {
  img.addEventListener('error', () => {
    const ph = document.createElement('div')
    ph.className = 'img-placeholder'
    ph.style.flexDirection = 'column'
    ph.innerHTML = `<span>${escapeHtml(label.slice(0, 2))}</span><small>暂无图片</small>`
    if (img.parentElement) img.parentElement.replaceChild(ph, img)
  }, { once: true })
}

/** 简单 HTML 转义，渲染任意数据文本前使用 */
export function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * 批量入场动画：给元素加 .anim-rise，进入视口时错落显示。
 * 在列表首次渲染完成后调用一次即可；遵守 prefers-reduced-motion。
 * @param {Iterable<Element>|string} target 元素集合或选择器
 */
export function revealOnScroll(target, { stagger = 45, maxDelay = 360 } = {}) {
  const els = typeof target === 'string' ? document.querySelectorAll(target) : target
  const items = Array.from(els)
  if (!items.length) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined') {
    items.forEach(el => el.classList.add('anim-rise', 'in'))
    return
  }
  items.forEach((el, i) => {
    el.classList.add('anim-rise')
    el.style.setProperty('--rise-delay', Math.min(i * stagger, maxDelay) + 'ms')
  })
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in')
        io.unobserve(entry.target)
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })
  items.forEach(el => io.observe(el))
}

/** 格式化日期 2022-03-24 -> 2022年3月24日；容错返回原文 */
export function formatDate(iso = '') {
  const m = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/.exec(iso)
  if (!m) return iso
  return m[3] ? `${m[1]}年${+m[2]}月${+m[3]}日` : `${m[1]}年${+m[2]}月`
}
