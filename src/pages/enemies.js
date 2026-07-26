import { initLayout, imageFallback, escapeHtml, revealOnScroll } from '../shared/layout.js'
import enemiesData from '../data/enemies.json'

initLayout()

const enemies = (enemiesData && enemiesData.enemies) || []

const toolbar = document.getElementById('enemy-toolbar')
const chipsWrap = document.getElementById('chips-category')
const searchInput = document.getElementById('enemy-search')
const resultCount = document.getElementById('result-count')
const grid = document.getElementById('enemy-grid')
const emptyFilter = document.getElementById('empty-filter')
const emptyData = document.getElementById('empty-data')

const modal = document.getElementById('enemy-modal')
const modalMask = document.getElementById('modal-mask')
const modalClose = document.getElementById('modal-close')
const modalFigure = document.getElementById('modal-figure')
const modalTitleRow = document.getElementById('modal-title-row')
const modalMeta = document.getElementById('modal-meta')
const modalDesc = document.getElementById('modal-desc')

/* ---------- 工具 ---------- */

const CATEGORIES = ['普通', '精英', '首领']
const BADGE_CLASS = { 首领: 'badge-s', 精英: 'badge-a' }

function categoryBadge(category) {
  if (!category) return ''
  return `<span class="badge ${BADGE_CLASS[category] || ''}">${escapeHtml(category)}</span>`
}

/* ---------- 筛选状态 ---------- */

const state = { q: '', category: '' }

const haystacks = enemies.map(e => String(e.name || '').toLowerCase())

function matches(e, i) {
  if (state.category && String(e.category || '').trim() !== state.category) return false
  if (state.q && !haystacks[i].includes(state.q)) return false
  return true
}

/* ---------- 卡片渲染（保持数据原有顺序） ---------- */

let cards = []

function cardHtml(e, i) {
  const name = String(e.name || '未知敌人').trim()
  const category = String(e.category || '').trim()
  const faction = String(e.faction || '').trim()
  const desc = String(e.description || '').trim()

  return `
    <article
      class="card enemy-card"
      role="button"
      tabindex="0"
      aria-haspopup="dialog"
      aria-label="查看 ${escapeHtml(name)} 详情"
      data-index="${i}"
    >
      <div class="enemy-figure">
        <img src="./${escapeHtml(e.image || '')}" alt="${escapeHtml(name)}" loading="lazy" />
      </div>
      <div class="enemy-info">
        <div class="enemy-name-row">
          <span class="enemy-name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
          ${categoryBadge(category)}
        </div>
        ${faction ? `<div class="enemy-faction">${escapeHtml(faction)}</div>` : ''}
        ${desc ? `<p class="enemy-desc">${escapeHtml(desc)}</p>` : ''}
      </div>
    </article>`
}

function renderCards() {
  grid.innerHTML = enemies.map(cardHtml).join('')
  cards = Array.from(grid.children)
  grid.querySelectorAll('.enemy-figure img').forEach((img, i) => {
    imageFallback(img, String(enemies[i].name || '?').slice(0, 1))
  })
  revealOnScroll(cards, { stagger: 35 })
}

function applyFilter() {
  let n = 0
  enemies.forEach((e, i) => {
    const ok = matches(e, i)
    cards[i].classList.toggle('hide', !ok)
    if (ok) n++
  })
  resultCount.textContent = `共 ${n} 种敌人`
  emptyFilter.hidden = n !== 0
}

/* ---------- 类别筛选 ---------- */

function buildChips() {
  chipsWrap.innerHTML = ['', ...CATEGORIES]
    .map(v => `
      <button
        type="button"
        class="chip${v === '' ? ' active' : ''}"
        data-value="${escapeHtml(v)}"
      >${v === '' ? '全部' : escapeHtml(v)}</button>`)
    .join('')

  chipsWrap.addEventListener('click', e => {
    const btn = e.target.closest('.chip')
    if (!btn) return
    state.category = btn.dataset.value
    chipsWrap.querySelectorAll('.chip').forEach(ch =>
      ch.classList.toggle('active', ch === btn)
    )
    applyFilter()
  })
}

/* ---------- 详情弹层 ---------- */

let lastFocus = null

function openModal(index) {
  const e = enemies[index]
  if (!e) return
  const name = String(e.name || '未知敌人').trim()
  const category = String(e.category || '').trim()
  const faction = String(e.faction || '').trim()
  const appears = String(e.appearsIn || '').trim()
  const desc = String(e.description || '').trim()

  modalFigure.innerHTML =
    `<img src="./${escapeHtml(e.image || '')}" alt="${escapeHtml(name)}" />`
  imageFallback(modalFigure.querySelector('img'), name.slice(0, 1))

  modalTitleRow.innerHTML =
    `<h2 class="modal-name" id="modal-name">${escapeHtml(name)}</h2>${categoryBadge(category)}`

  const lines = []
  if (faction) lines.push(`<div class="modal-line modal-faction">${escapeHtml(faction)}</div>`)
  if (appears) lines.push(`<div class="modal-line modal-appears">出现于：${escapeHtml(appears)}</div>`)
  modalMeta.innerHTML = lines.join('')
  modalMeta.hidden = lines.length === 0

  modalDesc.textContent = desc || '档案描述待补充。'

  lastFocus = document.activeElement
  modal.hidden = false
  document.body.classList.add('modal-lock')
  modalClose.focus()
}

function closeModal() {
  if (modal.hidden) return
  modal.hidden = true
  document.body.classList.remove('modal-lock')
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus()
  lastFocus = null
}

modalMask.addEventListener('click', closeModal)
modalClose.addEventListener('click', closeModal)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); return }
  if (e.key !== 'Tab' || modal.hidden) return
  /* 焦点圈闭：Tab 在弹层内循环，不逃逸到背景内容 */
  const focusables = modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
  if (!focusables.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus()
  } else if (!modal.contains(document.activeElement)) {
    e.preventDefault(); first.focus()
  }
})

/* 卡片点击 / 键盘打开详情 */
grid.addEventListener('click', e => {
  const card = e.target.closest('.enemy-card')
  if (card) openModal(+card.dataset.index)
})
grid.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return
  const card = e.target.closest('.enemy-card')
  if (!card) return
  e.preventDefault()
  openModal(+card.dataset.index)
})

/* ---------- 初始化 ---------- */

if (!enemies.length) {
  toolbar.hidden = true
  emptyData.hidden = false
} else {
  buildChips()
  searchInput.addEventListener('input', () => {
    state.q = searchInput.value.trim().toLowerCase()
    applyFilter()
  })
  renderCards()
  applyFilter()
}
