/**
 * 公共布局：注入顶部导航与页脚、图片占位处理。
 * 每个页面 JS 的入口都应先调用 initLayout()。
 */
import { initMimir } from './mimir.js'

const NAV_ITEMS = [
  ['index.html', '首页'],
  ['characters.html', '角色图鉴'],
  ['timeline.html', '时间线'],
  ['story.html', '剧情回顾'],
  ['gallery.html', '插画合集'],
  ['enemies.html', '敌人图鉴']
]

/** 子页面归属到导航主项（如 character.html 高亮"角色图鉴"） */
const PAGE_ALIAS = {
  'character.html': 'characters.html'
}

function currentPage() {
  const path = location.pathname.split('/').pop() || 'index.html'
  return PAGE_ALIAS[path] || path
}

export function initLayout() {
  const active = currentPage()

  const header = document.createElement('header')
  header.className = 'site-header'
  header.innerHTML = `
    <div class="header-inner">
      <a class="site-logo" href="index.html" aria-label="返回首页">
        <span class="logo-cn">深空之眼档案馆</span>
        <span class="logo-en">Aether Gazer Archive</span>
      </a>
      <button class="nav-toggle" aria-label="打开菜单">☰</button>
      <nav class="nav-links">
        ${NAV_ITEMS.map(([href, label]) =>
          `<a href="${href}"${href === active ? ' class="active"' : ''}>${label}</a>`
        ).join('')}
      </nav>
    </div>`
  document.body.prepend(header)

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

  initClickEffect()
  initMimir()
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
