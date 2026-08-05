import { initLayout, revealOnScroll, assetUrl } from '../shared/layout.js'
import charactersData from '../data/characters.json'
import timelineData from '../data/timeline.json'
import storyData from '../data/story.json'
import galleryData from '../data/gallery.json'
import enemiesData from '../data/enemies.json'

initLayout()

/* 主视觉背景：经 assetUrl 解析，配置图床 assetBase 后自动改从图床加载 */
const backdropImg = document.querySelector('.hero-backdrop-img')
if (backdropImg) {
  backdropImg.style.backgroundImage =
    `url('${assetUrl('images/backdrop/home-hero.jpg')}'), url('${assetUrl('images/backdrop/home-hero.svg')}')`
}

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

document.getElementById('hero-stats').innerHTML =
  '<div class="stats-lead">ARCHIVE INDEX</div>' + stats
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
      <span class="module-entry" aria-hidden="true"></span>
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
  /* 深空星野：冷色系圆点星 + 少量十字微闪烁星，缓慢抬升 + 轻微漂移 */
  const PALETTE = ['#cbd5e1', '#94a3b8', '#64748b', '#cbd5e1']
  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio
    canvas.height = innerHeight * devicePixelRatio
    const n = Math.min(120, Math.floor(innerWidth * innerHeight / 13000))
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (Math.random() * 1.6 + 0.6) * devicePixelRatio,
      s: Math.random() * 0.26 + 0.07,
      p: Math.random() * Math.PI * 2,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      cross: Math.random() < 0.16
    }))
  }
  resize()
  addEventListener('resize', resize)
  const draw = t => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const st of stars) {
      const tw = 0.55 + 0.45 * Math.sin(t / 1600 + st.p)
      ctx.globalAlpha = tw * 0.42
      ctx.fillStyle = st.color
      if (st.cross) {
        /* 十字微闪烁星：微亮星用两种重叠短线呈现闪烁 */
        const len = st.r * 3.2
        ctx.fillRect(st.x - len / 2, st.y - 0.5, len, 1)
        ctx.fillRect(st.x - 0.5, st.y - len / 2, 1, len)
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r * 0.6, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2)
        ctx.fill()
      }
      st.y -= st.s
      st.x += Math.sin(t / 2200 + st.p) * 0.12
      if (st.y < -6) { st.y = canvas.height + 6; st.x = Math.random() * canvas.width }
      if (st.x < -6) st.x = canvas.width + 6
      if (st.x > canvas.width + 6) st.x = -6
    }
    requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)
}
