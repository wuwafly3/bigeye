import { initLayout, escapeHtml, revealOnScroll, assetUrl } from '../shared/layout.js'
import functorsData from '../data/functors.json'

initLayout()

const functors = (functorsData && functorsData.functors) || []
const grid = document.getElementById('functor-grid')
const search = document.getElementById('functor-search')
const count = document.getElementById('functor-count')
const rarity = document.getElementById('functor-rarity')
const empty = document.getElementById('functor-empty')
const state = { q: '', rarity: '' }

const GRADE_ICON = {
  A: 'com_grade_2__70x68.png',
  S: 'com_grade_3__70x68.png'
}

function cardHtml(item) {
  return `
    <article class="functor-card" id="functor-${escapeHtml(item.id)}" data-rarity="${escapeHtml(item.rarity)}">
      <div class="functor-art">
        <img src="${assetUrl(item.icon)}" alt="${escapeHtml(item.name)}" loading="lazy" />
      </div>
      <div class="functor-copy">
        <img class="grade-icon" src="${assetUrl('images/game-art/hero-grade/' + GRADE_ICON[item.rarity])}" alt="${escapeHtml(item.rarity)}级" draggable="false" />
        <div class="functor-text">
          <h2>${escapeHtml(item.name)}</h2>
          <span>NO. ${escapeHtml(item.id)}</span>
        </div>
      </div>
    </article>`
}

function render() {
  const q = state.q.toLowerCase()
  const matches = functors.filter(item =>
    (!state.rarity || item.rarity === state.rarity) &&
    (!q || `${item.name} ${item.id}`.toLowerCase().includes(q))
  )
  grid.innerHTML = matches.map(cardHtml).join('')
  count.textContent = `共 ${matches.length} 件钥从`
  empty.hidden = matches.length !== 0
  revealOnScroll(grid.children, { stagger: 20, maxDelay: 180 })
}

rarity.innerHTML = ['', 'S', 'A'].map(value =>
  `<button type="button" class="chip${value === '' ? ' active' : ''}" data-rarity="${value}">${value || '全部'}</button>`
).join('')

rarity.addEventListener('click', event => {
  const button = event.target.closest('[data-rarity]')
  if (!button) return
  state.rarity = button.dataset.rarity
  rarity.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('active', chip === button))
  render()
})

search.addEventListener('input', () => {
  state.q = search.value.trim()
  render()
})

render()
