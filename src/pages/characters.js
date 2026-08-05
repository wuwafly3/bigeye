import { initLayout, imageFallback, escapeHtml, revealOnScroll, assetUrl, showHudTransition } from '../shared/layout.js'
import charactersData from '../data/characters.json'

initLayout()

const characters = (charactersData && charactersData.characters) || []

const toolbar = document.getElementById('char-toolbar')
const searchInput = document.getElementById('char-search')
const resultCount = document.getElementById('result-count')
const grid = document.getElementById('char-grid')
const emptyFilter = document.getElementById('empty-filter')
const emptyData = document.getElementById('empty-data')

/* ---------- 工具 ---------- */

/** 展示名：fullName 优先，缺省按官方惯例拼 codename·name */
function displayName(c) {
  if (c.fullName) return c.fullName
  if (c.codename) return `${c.codename}·${c.name || ''}`
  return c.name || '未知修正者'
}

/** 从数据中按出现顺序收集某字段的非空取值 */
function collectOptions(key) {
  const seen = []
  for (const c of characters) {
    const v = String(c[key] || '').trim()
    if (v && !seen.includes(v)) seen.push(v)
  }
  return seen
}

/** 稀有度按 S / A / B 优先排序，未知值排后 */
function sortRarity(options) {
  const order = ['S', 'A', 'B']
  return [...options].sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib)
  })
}

const RARITY_CLASS = { S: 'badge-s', A: 'badge-a', B: 'badge-b' }
const GRADE_ICON = {
  B: 'com_grade_1__70x68.png',
  A: 'com_grade_2__70x68.png',
  S: 'com_grade_3__70x68.png'
}

/* 神系徽章（来自 hero_godatlas 导出图） */
const FACTION_ICON = {
  '真樱': 'zhenying', '奥山': 'aoshan', '圣树': 'shengshu',
  '众星': 'zhonxin', '尼罗': 'niluo', '天垣': 'tianyuan'
}
/* 元素图标（来自 atlas/hero 精灵图） */
const ELEMENT_ICON = {
  '火': 'fire', '雷': 'ray', '冰': 'ice', '水': 'water',
  '风': 'wind', '暗': 'dark', '光': 'light', '物理': 'physical'
}

/* ---------- 筛选状态 ---------- */

const state = { q: '', element: '', rarity: '', faction: '' }

/* 搜索用的小写索引：神名 / 代号 / 全名 */
const haystacks = characters.map(c =>
  `${c.name || ''} ${c.codename || ''} ${c.fullName || ''}`.toLowerCase()
)

function matches(c, i) {
  if (state.element && String(c.element || '').trim() !== state.element) return false
  if (state.rarity && String(c.rarity || '').trim() !== state.rarity) return false
  if (state.faction && String(c.faction || '').trim() !== state.faction) return false
  if (state.q && !haystacks[i].includes(state.q)) return false
  return true
}

/* ---------- 渲染 ---------- */

let cards = []

function cardHtml(c) {
  const name = displayName(c)
  const rarity = String(c.rarity || '').trim()
  const element = String(c.element || '').trim()
  const faction = String(c.faction || '').trim()

  const badges = []
  if (rarity) {
    const gradeIcon = GRADE_ICON[rarity]
    badges.push(gradeIcon
      ? `<img class="grade-icon" src="${assetUrl('images/game-art/hero-grade/' + gradeIcon)}" alt="${escapeHtml(rarity)}级" draggable="false">`
      : `<span class="badge ${RARITY_CLASS[rarity] || ''}">${escapeHtml(rarity)}</span>`)
  }
  if (element) {
    const icon = ELEMENT_ICON[element]
    if (icon) {
      badges.push(
        `<span class="badge char-element" data-element="${escapeHtml(element)}"><img class="element-icon" src="${assetUrl('images/game-art/hero/icon_' + icon + '__80x80.png')}" alt="" onerror="this.style.display='none'" draggable="false">${escapeHtml(element)}</span>`
      )
    } else {
      badges.push(
        `<span class="badge" data-element="${escapeHtml(element)}">${escapeHtml(element)}</span>`
      )
    }
  }
  if (faction) {
    const icon = FACTION_ICON[faction]
    if (icon) {
      badges.push(
        `<span class="char-faction"><span class="faction-emblem"><img class="faction-frame" src="${assetUrl('images/game-art/hud/system/bg_groupBase.png')}" alt="" draggable="false"><img class="faction-icon" src="${assetUrl('images/game-art/hero_godatlas/' + icon + '.png')}" alt="" onerror="this.style.display='none'" draggable="false"></span>${escapeHtml(faction)}</span>`
      )
    } else {
      badges.push(`<span class="char-faction">${escapeHtml(faction)}</span>`)
    }
  }

  const attr = rarity ? ` data-rarity="${escapeHtml(rarity)}"` : ''

  return `
    <a class="card char-card"${attr} href="character.html?id=${encodeURIComponent(c.id || '')}">
      <div class="char-portrait">
        <img src="${escapeHtml(assetUrl(c.portrait))}" alt="${escapeHtml(name)}" loading="lazy" />
      </div>
      <div class="char-info">
        <div class="char-name" title="${escapeHtml(name)}">${escapeHtml(name)}</div>
        <div class="char-meta">${badges.join('')}</div>
      </div>
    </a>`
}

function renderCards() {
  grid.innerHTML = characters.map(cardHtml).join('')
  cards = Array.from(grid.children)
  grid.querySelectorAll('.char-portrait img').forEach((img, i) => {
    const c = characters[i]
    imageFallback(img, c.name || c.codename || '?')
  })
  revealOnScroll(cards, { stagger: 30, maxDelay: 300 })
}

function applyFilter() {
  let n = 0
  characters.forEach((c, i) => {
    const ok = matches(c, i)
    cards[i].classList.toggle('hide', !ok)
    if (ok) n++
  })
  resultCount.textContent = `共 ${n} 名修正者`
  emptyFilter.hidden = n !== 0
}

/* ---------- 筛选控件 ---------- */

function buildChips(containerId, key, options) {
  const wrap = document.getElementById(containerId)
  wrap.innerHTML = ['', ...options]
    .map(v => `
      <button
        type="button"
        class="chip${v === '' ? ' active' : ''}"
        data-value="${escapeHtml(v)}"
      >${v === '' ? '全部' : escapeHtml(v)}</button>`)
    .join('')

  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.chip')
    if (!btn) return
    state[key] = btn.dataset.value
    wrap.querySelectorAll('.chip').forEach(ch =>
      ch.classList.toggle('active', ch === btn)
    )
    showHudTransition()
    applyFilter()
  })
}

/* ---------- 初始化 ---------- */

if (!characters.length) {
  toolbar.hidden = true
  emptyData.hidden = false
} else {
  buildChips('chips-element', 'element', collectOptions('element'))
  buildChips('chips-rarity', 'rarity', sortRarity(collectOptions('rarity')))
  buildChips('chips-faction', 'faction', collectOptions('faction'))

  searchInput.addEventListener('input', () => {
    state.q = searchInput.value.trim().toLowerCase()
    showHudTransition(180)
    applyFilter()
  })

  renderCards()
  applyFilter()
}
