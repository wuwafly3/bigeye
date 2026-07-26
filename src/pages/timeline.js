import { initLayout, escapeHtml, formatDate } from '../shared/layout.js'
import timelineData from '../data/timeline.json'

initLayout()

/* ---------- 数据准备：按 date 升序（数据可能乱序） ---------- */
const CATEGORY_ORDER = ['版本', '活动', '剧情', '运营']

const events = [...(timelineData.events || [])]
  .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))

const categories = CATEGORY_ORDER.filter(c => events.some(e => e.category === c))
for (const e of events) {
  if (e.category && !categories.includes(e.category)) categories.push(e.category)
}

const chipsEl = document.getElementById('filter-chips')
const countEl = document.getElementById('result-count')
const rootEl = document.getElementById('timeline-root')

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
let currentFilter = '全部'
let observer = null

/* ---------- 筛选 chips ---------- */
chipsEl.innerHTML = ['全部', ...categories]
  .map(c => `<button type="button" class="chip${c === currentFilter ? ' active' : ''}" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`)
  .join('')

chipsEl.addEventListener('click', e => {
  const chip = e.target.closest('.chip')
  if (!chip || chip.dataset.filter === currentFilter) return
  currentFilter = chip.dataset.filter
  chipsEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip))
  render()
})

/* ---------- 渲染 ---------- */
function eventCard (ev, side) {
  const cat = ev.category || ''
  const meta = [
    `<span class="tl-date">${escapeHtml(formatDate(ev.date || ''))}</span>`,
    ev.version ? `<span class="badge tl-version">v${escapeHtml(ev.version)}</span>` : '',
    cat ? `<span class="tl-cat">${escapeHtml(cat)}</span>` : ''
  ].filter(Boolean).join('')

  return `
    <article class="tl-item tl-${side} reveal" data-cat="${escapeHtml(cat)}">
      <span class="tl-dot" aria-hidden="true"></span>
      <div class="tl-card card">
        <div class="tl-meta">${meta}</div>
        <h3 class="tl-title">${escapeHtml(ev.title || '')}</h3>
        ${ev.description ? `<p class="tl-desc">${escapeHtml(ev.description)}</p>` : ''}
      </div>
    </article>`
}

function render () {
  const list = currentFilter === '全部' ? events : events.filter(e => e.category === currentFilter)
  countEl.textContent = `共 ${list.length} 条记录`

  if (!events.length) {
    rootEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕰️</div>
        <p>档案数据待补充</p>
      </div>`
    return
  }
  if (!list.length) {
    rootEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕰️</div>
        <p>该类别下暂无记录，档案数据待补充</p>
      </div>`
    return
  }

  /* 按年份分组（保持已排序顺序） */
  const groups = []
  for (const ev of list) {
    const year = (/^\d{4}/.exec(String(ev.date || '')) || ['未注明'])[0]
    const last = groups[groups.length - 1]
    if (last && last.year === year) last.items.push(ev)
    else groups.push({ year, items: [ev] })
  }

  /* 桌面端左右交替，由 CSS 在窄屏退化为单侧 */
  let side = 0
  const body = groups.map(g => `
    <div class="tl-year reveal"><span>${escapeHtml(g.year)}</span></div>
    ${g.items.map(ev => eventCard(ev, side++ % 2 === 0 ? 'left' : 'right')).join('')}
  `).join('')

  rootEl.innerHTML = `
    <div class="timeline">${body}</div>
    <div class="tl-ending panel reveal">
      <div class="tl-ending-dot" aria-hidden="true"></div>
      <p class="tl-ending-text">故事在此告一段落，但记忆永存。</p>
      <div class="tl-ending-en">END OF RECORD</div>
    </div>`

  observeReveal()
}

/* ---------- 入场动画：淡入上移，prefers-reduced-motion 时禁用 ---------- */
function observeReveal () {
  const items = rootEl.querySelectorAll('.reveal')
  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    items.forEach(el => el.classList.add('in'))
    return
  }
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in')
        observer.unobserve(entry.target)
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
  items.forEach(el => observer.observe(el))
}

render()
