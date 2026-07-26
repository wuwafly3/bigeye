import { initLayout, revealOnScroll } from '../shared/layout.js'
import charactersData from '../data/characters.json'
import timelineData from '../data/timeline.json'
import storyData from '../data/story.json'
import galleryData from '../data/gallery.json'
import enemiesData from '../data/enemies.json'

initLayout()

/* ---------- 数据统计 ---------- */
const counts = {
  characters: charactersData.characters.length,
  timeline: timelineData.events.length,
  story: storyData.chapters.length,
  gallery: galleryData.artworks.length,
  enemies: enemiesData.enemies.length
}

const stats = [
  [counts.characters, '位修正者'],
  [counts.timeline, '条时间线记录'],
  [counts.story, '章剧情'],
  [counts.gallery, '张插画'],
  [counts.enemies, '种敌人']
]

document.getElementById('hero-stats').innerHTML = stats
  .map(([num, label]) => `
    <div class="stat-pill">
      <span class="stat-num" data-target="${num}">0</span>
      <span class="stat-label">${label}</span>
    </div>`)
  .join('')

/* 数字滚动动画 */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
document.querySelectorAll('.stat-num').forEach(el => {
  const target = +el.dataset.target
  if (reduceMotion || target === 0) { el.textContent = target; return }
  const start = performance.now()
  const dur = 900
  const tick = now => {
    const t = Math.min(1, (now - start) / dur)
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)))
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

/* ---------- 模块入口 ---------- */
const modules = [
  ['characters.html', '01', 'Characters', '角色图鉴', '全部修正者的档案：属性、技能、语音与 3D 模型展示。', `${counts.characters} 条记录`],
  ['timeline.html', '02', 'Timeline', '时间线', '从公测到落幕，每个版本与重要节点的编年史。', `${counts.timeline} 条记录`],
  ['story.html', '03', 'Story', '剧情回顾', '主线章节的剧情梗概与回顾，重温泽塔阿尔法的故事。', `${counts.story} 章`],
  ['gallery.html', '04', 'Gallery', '插画合集', '游戏内 CG 与官方社媒发布的美术作品收藏。', `${counts.gallery} 张`],
  ['enemies.html', '05', 'Enemies', '敌人图鉴', '视骸与诸多敌人的资料档案。', `${counts.enemies} 条记录`]
]

document.getElementById('module-grid').innerHTML = modules
  .map(([href, index, en, title, desc, count]) => `
    <a class="card module-card" href="${href}">
      <div class="module-head">
        <span class="module-index">${index} /</span>
        <span class="module-en">${en}</span>
      </div>
      <h3>${title}</h3>
      <p class="module-desc">${desc}</p>
      <span class="module-count">${count}</span>
      <span class="module-arrow">→</span>
    </a>`)
  .join('')

revealOnScroll(document.querySelectorAll('.module-card'), { stagger: 70 })

/* ---------- 星空背景 ---------- */
const canvas = document.getElementById('starfield')
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d')
  let stars = []
  /* 嘉年华彩纸：气球色的圆点与小方片，缓慢上浮 + 左右摇曳 */
  const PALETTE = ['#1899d6', '#8b7ce0', '#f2708f', '#f0b23a', '#2fbfa8']
  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio
    canvas.height = innerHeight * devicePixelRatio
    const n = Math.min(150, Math.floor(innerWidth * innerHeight / 11000))
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (Math.random() * 1.8 + 0.7) * devicePixelRatio,
      s: Math.random() * 0.3 + 0.08,
      p: Math.random() * Math.PI * 2,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      square: Math.random() < 0.3
    }))
  }
  resize()
  addEventListener('resize', resize)
  const draw = t => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const st of stars) {
      const tw = 0.55 + 0.45 * Math.sin(t / 1400 + st.p)
      ctx.globalAlpha = tw * 0.4
      ctx.fillStyle = st.color
      if (st.square) {
        ctx.save()
        ctx.translate(st.x, st.y)
        ctx.rotate(t / 3000 + st.p)
        ctx.fillRect(-st.r, -st.r, st.r * 2, st.r * 2)
        ctx.restore()
      } else {
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
        ctx.fill()
      }
      st.y -= st.s
      st.x += Math.sin(t / 1800 + st.p) * 0.18
      if (st.y < -6) { st.y = canvas.height + 6; st.x = Math.random() * canvas.width }
      if (st.x < -6) st.x = canvas.width + 6
      if (st.x > canvas.width + 6) st.x = -6
    }
    requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)
}
