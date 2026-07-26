import { initLayout, escapeHtml, revealOnScroll } from '../shared/layout.js'
import storyData from '../data/story.json'

initLayout()

const BASE_TITLE = '剧情回顾 · 深空之眼档案馆'

const chapters = (storyData.chapters || [])
  .slice()
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

const tocView = document.getElementById('toc-view')
const readerView = document.getElementById('reader-view')

/* ---------- 工具 ---------- */

/** 章节装饰序号：0 -> "00"，12 -> "12" */
function chapterNum(ch) {
  return String(ch.order ?? 0).padStart(2, '0')
}

function hasSections(ch) {
  return Array.isArray(ch.sections) && ch.sections.length > 0
}

/** 从 location.hash 解析章节，未知返回 null */
function chapterFromHash() {
  let id = location.hash.replace(/^#/, '')
  if (!id) return null
  try { id = decodeURIComponent(id) } catch { /* 保留原文 */ }
  return chapters.find(ch => ch.id === id) || null
}

function scrollToTop() {
  /* base.css 中 html 的 scroll-behavior 已按 prefers-reduced-motion 处理 */
  window.scrollTo(0, 0)
}

/* ---------- 目录视图 ---------- */

function renderToc() {
  if (!chapters.length) {
    tocView.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📖</div>
        <p>档案数据待补充</p>
      </div>`
    return
  }

  tocView.innerHTML = `
    <div class="chapter-list">
      ${chapters.map(ch => {
        const readable = hasSections(ch)
        const chips = (ch.characters || [])
          .map(name => `<span class="chip chip-static">${escapeHtml(name)}</span>`)
          .join('')
        return `
          <article class="card chapter-card${readable ? '' : ' chapter-card-empty'}">
            <div class="chapter-num" aria-hidden="true">${chapterNum(ch)}</div>
            <div class="chapter-body">
              <h2 class="chapter-title">
                ${escapeHtml(ch.title || '未命名章节')}
                ${ch.subtitle ? `<span class="chapter-subtitle">${escapeHtml(ch.subtitle)}</span>` : ''}
              </h2>
              ${ch.summary ? `<p class="chapter-summary">${escapeHtml(ch.summary)}</p>` : ''}
              ${chips ? `<div class="chapter-chars">${chips}</div>` : ''}
              ${readable
                ? `<a class="btn btn-primary chapter-read" href="#${encodeURIComponent(ch.id)}">阅读本章 →</a>`
                : `<button class="btn chapter-read" disabled>待补充</button>`}
            </div>
          </article>`
      }).join('')}
    </div>`
  revealOnScroll(tocView.querySelectorAll('.chapter-card'), { stagger: 60 })
}

/* ---------- 阅读视图 ---------- */

function renderReader(ch) {
  const idx = chapters.indexOf(ch)
  const prev = idx > 0 ? chapters[idx - 1] : null
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null

  const sectionsHtml = hasSections(ch)
    ? ch.sections.map(sec => `
        <section class="story-section">
          <h3 class="section-title">${escapeHtml(sec.heading || '')}</h3>
          ${String(sec.content || '')
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
            .map(p => `<p>${escapeHtml(p)}</p>`)
            .join('')}
        </section>`).join('')
    : `
      <div class="empty-state">
        <div class="empty-icon">📖</div>
        <p>本章详细剧情档案待补充</p>
      </div>`

  readerView.innerHTML = `
    <a class="back-link" href="#">← 返回目录</a>
    <header class="reader-header">
      <div class="reader-num">CHAPTER ${chapterNum(ch)}</div>
      <h2 class="reader-title">${escapeHtml(ch.title || '未命名章节')}</h2>
      ${ch.subtitle ? `<p class="reader-subtitle">${escapeHtml(ch.subtitle)}</p>` : ''}
    </header>
    ${ch.summary ? `<blockquote class="reader-summary">${escapeHtml(ch.summary)}</blockquote>` : ''}
    <div class="reader-body">${sectionsHtml}</div>
    <nav class="reader-nav" aria-label="章节切换">
      ${prev
        ? `<a class="btn reader-nav-btn" href="#${encodeURIComponent(prev.id)}">← ${escapeHtml(prev.title || '上一章')}</a>`
        : '<span class="reader-nav-spacer"></span>'}
      ${next
        ? `<a class="btn reader-nav-btn" href="#${encodeURIComponent(next.id)}">${escapeHtml(next.title || '下一章')} →</a>`
        : '<span class="reader-nav-spacer"></span>'}
    </nav>`

  tocView.hidden = true
  readerView.hidden = false
  document.title = `${ch.title || '章节'} · ${BASE_TITLE}`
}

function showToc() {
  readerView.hidden = true
  readerView.innerHTML = ''
  tocView.hidden = false
  document.title = BASE_TITLE
}

/* ---------- hash 路由 ---------- */

function route() {
  const ch = chapterFromHash()
  if (ch) {
    renderReader(ch)
  } else {
    if (location.hash) {
      /* 未知 hash：清掉并回目录，不新增历史记录 */
      history.replaceState(null, '', location.pathname + location.search)
    }
    showToc()
  }
  scrollToTop()
}

renderToc()
route()
window.addEventListener('hashchange', route)
