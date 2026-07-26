import { initLayout, imageFallback, escapeHtml, formatDate, revealOnScroll } from '../shared/layout.js'
import galleryData from '../data/gallery.json'

initLayout()

const artworks = (galleryData && galleryData.artworks) || []

/* ---------- DOM ---------- */

const toolbar = document.getElementById('gallery-toolbar')
const notice = document.getElementById('sample-notice')
const chipsSource = document.getElementById('chips-source')
const chipsTag = document.getElementById('chips-tag')
const resultCount = document.getElementById('result-count')
const flow = document.getElementById('gallery-flow')
const emptyFilter = document.getElementById('empty-filter')
const emptyData = document.getElementById('empty-data')

const lightbox = document.getElementById('lightbox')
const lbMask = document.getElementById('lightbox-mask')
const lbClose = document.getElementById('lightbox-close')
const lbPrev = document.getElementById('lightbox-prev')
const lbNext = document.getElementById('lightbox-next')
const lbFigure = document.getElementById('lightbox-figure')
const lbTitleRow = document.getElementById('lightbox-title-row')
const lbDesc = document.getElementById('lightbox-desc')
const lbMeta = document.getElementById('lightbox-meta')

/* ---------- 工具 ---------- */

const SOURCES = [
  ['', '全部'],
  ['game', '游戏内'],
  ['official', '官方社媒']
]
const SOURCE_LABEL = { game: '游戏内', official: '官方社媒' }
const SOURCE_BADGE = { game: 'badge-game', official: 'badge-official' }

function sourceBadge(source) {
  const label = SOURCE_LABEL[source]
  if (!label) return ''
  return `<span class="badge ${SOURCE_BADGE[source]}">${label}</span>`
}

/** 图片占位文字：去掉【示例】前缀后取首字 */
function fallbackLabel(a) {
  const t = String(a.title || '').replace(/^【示例】/, '').trim()
  return t.slice(0, 1) || '画'
}

/* ---------- 筛选状态 ---------- */

const state = { source: '', tag: '' }

function matches(a) {
  if (state.source && String(a.source || '') !== state.source) return false
  if (state.tag && !(Array.isArray(a.tags) && a.tags.includes(state.tag))) return false
  return true
}

/* ---------- 瀑布流渲染（保持数据原有顺序） ---------- */

let cards = []
let visible = []

function cardHtml(a, i) {
  const title = String(a.title || '未命名作品').trim()
  const date = formatDate(String(a.date || ''))

  return `
    <article
      class="card art-card"
      role="button"
      tabindex="0"
      aria-haspopup="dialog"
      aria-label="查看 ${escapeHtml(title)} 大图"
      data-index="${i}"
    >
      <div class="art-figure">
        <img src="./${escapeHtml(a.image || '')}" alt="${escapeHtml(title)}" loading="lazy" />
      </div>
      <div class="art-info">
        <div class="art-title" title="${escapeHtml(title)}">${escapeHtml(title)}</div>
        <div class="art-meta">
          <span class="art-date">${escapeHtml(date)}</span>
          ${sourceBadge(a.source)}
        </div>
      </div>
    </article>`
}

function renderCards() {
  flow.innerHTML = artworks.map(cardHtml).join('')
  cards = Array.from(flow.children)
  flow.querySelectorAll('.art-figure img').forEach((img, i) => {
    imageFallback(img, fallbackLabel(artworks[i]))
  })
  revealOnScroll(cards)
}

function applyFilter() {
  visible = []
  artworks.forEach((a, i) => {
    const ok = matches(a)
    cards[i].classList.toggle('hide', !ok)
    if (ok) visible.push(i)
  })
  resultCount.textContent = `共 ${visible.length} 幅作品`
  emptyFilter.hidden = visible.length !== 0
}

/* ---------- 来源 / 标签筛选 ---------- */

function buildSourceChips() {
  chipsSource.innerHTML = SOURCES.map(([v, label]) => `
    <button
      type="button"
      class="chip${v === '' ? ' active' : ''}"
      data-value="${v}"
    >${label}</button>`).join('')

  chipsSource.addEventListener('click', e => {
    const btn = e.target.closest('.chip')
    if (!btn) return
    state.source = btn.dataset.value
    chipsSource.querySelectorAll('.chip').forEach(ch =>
      ch.classList.toggle('active', ch === btn)
    )
    applyFilter()
  })
}

function buildTagChips() {
  const tags = []
  artworks.forEach(a => (Array.isArray(a.tags) ? a.tags : []).forEach(t => {
    const tag = String(t).trim()
    if (tag && !tags.includes(tag)) tags.push(tag)
  }))

  if (!tags.length) {
    chipsTag.hidden = true
    return
  }

  chipsTag.innerHTML = tags.map(t => `
    <button
      type="button"
      class="chip"
      data-value="${escapeHtml(t)}"
      aria-pressed="false"
    >${escapeHtml(t)}</button>`).join('')

  /* 标签为二次点击可取消的单选 */
  chipsTag.addEventListener('click', e => {
    const btn = e.target.closest('.chip')
    if (!btn) return
    state.tag = state.tag === btn.dataset.value ? '' : btn.dataset.value
    chipsTag.querySelectorAll('.chip').forEach(ch => {
      const on = ch.dataset.value === state.tag
      ch.classList.toggle('active', on)
      ch.setAttribute('aria-pressed', String(on))
    })
    applyFilter()
  })
}

/* ---------- 灯箱（按当前筛选结果循环切换） ---------- */

let pos = -1
let lastFocus = null

function renderLightbox() {
  const a = artworks[visible[pos]]
  if (!a) return
  const title = String(a.title || '未命名作品').trim()
  const desc = String(a.description || '').trim()
  const date = formatDate(String(a.date || ''))
  const tags = Array.isArray(a.tags) ? a.tags : []

  lbFigure.innerHTML =
    `<img src="./${escapeHtml(a.image || '')}" alt="${escapeHtml(title)}" />`
  imageFallback(lbFigure.querySelector('img'), fallbackLabel(a))

  lbTitleRow.innerHTML =
    `<h2 class="lightbox-title" id="lightbox-title">${escapeHtml(title)}</h2>${sourceBadge(a.source)}`

  lbDesc.textContent = desc
  lbDesc.hidden = !desc

  const parts = []
  if (date) parts.push(`<span class="lightbox-date">${escapeHtml(date)}</span>`)
  tags.forEach(t => parts.push(`<span class="lightbox-tag">${escapeHtml(String(t))}</span>`))
  parts.push(`<span class="lightbox-count">${pos + 1} / ${visible.length}</span>`)
  lbMeta.innerHTML = parts.join('')

  const single = visible.length < 2
  lbPrev.hidden = single
  lbNext.hidden = single
}

function openLightbox(index) {
  const p = visible.indexOf(index)
  if (p === -1) return
  pos = p
  renderLightbox()
  lastFocus = document.activeElement
  lightbox.hidden = false
  document.body.classList.add('lightbox-lock')
  lbClose.focus()
}

function closeLightbox() {
  if (lightbox.hidden) return
  lightbox.hidden = true
  document.body.classList.remove('lightbox-lock')
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus()
  lastFocus = null
  pos = -1
}

function step(delta) {
  if (!visible.length || pos === -1) return
  pos = (pos + delta + visible.length) % visible.length
  renderLightbox()
}

lbMask.addEventListener('click', closeLightbox)
lbClose.addEventListener('click', closeLightbox)
lbPrev.addEventListener('click', () => step(-1))
lbNext.addEventListener('click', () => step(1))

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return
  if (e.key === 'Escape') {
    closeLightbox()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    step(-1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    step(1)
  }
})

/* 卡片点击 / 键盘打开灯箱 */
flow.addEventListener('click', e => {
  const card = e.target.closest('.art-card')
  if (card) openLightbox(+card.dataset.index)
})
flow.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return
  const card = e.target.closest('.art-card')
  if (!card) return
  e.preventDefault()
  openLightbox(+card.dataset.index)
})

/* ---------- 初始化 ---------- */

if (!artworks.length) {
  toolbar.hidden = true
  notice.hidden = true
  emptyData.hidden = false
} else {
  buildSourceChips()
  buildTagChips()
  renderCards()
  applyFilter()
}
