import { initLayout, revealOnScroll, assetUrl } from '../shared/layout.js'
import charactersData from '../data/characters.json'
import timelineData from '../data/timeline.json'
import storyData from '../data/story.json'
import galleryData from '../data/gallery.json'
import enemiesData from '../data/enemies.json'
import functorsData from '../data/functors.json'

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
  functors: functorsData.functors.length,
  timeline: timelineData.events.length,
  story: storyData.chapters.length,
  gallery: galleryData.artworks.length,
  enemies: enemiesData.enemies.length
}

const stats = [
  [counts.characters, '位修正者'],
  [counts.functors, '件钥从'],
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
  ['characters.html', '01', 'Characters', '角色图鉴', '全部修正者的档案：属性、技能、语音与 3D 模型展示。', `${counts.characters} 条记录`, 'images/game-art/main/main_icon_system_01__88x88.png'],
  ['functors.html', '02', 'Functors', '钥从图鉴', '收录 S、A 级钥从的名称与官方图标。', `${counts.functors} 条记录`, 'images/game-art/main/icon_weaponservant_new__102x110.png'],
  ['timeline.html', '03', 'Timeline', '时间线', '从公测到落幕，每个版本与重要节点的编年史。', `${counts.timeline} 条记录`],
  ['story.html', '04', 'Story', '剧情回顾', '主线章节的剧情梗概与回顾，重温泽塔阿尔法的故事。', `${counts.story} 章`],
  ['gallery.html', '05', 'Gallery', '插画合集', '游戏内 CG 与官方社媒发布的美术作品收藏。', `${counts.gallery} 张`],
  ['enemies.html', '06', 'Enemies', '敌人图鉴', '视骸与诸多敌人的资料档案。', `${counts.enemies} 条记录`]
]

document.getElementById('module-grid').innerHTML = modules
  .map(([href, index, en, title, desc, count, icon]) => `
    <a class="card module-card" href="${href}">
      ${icon ? `<span class="module-art" aria-hidden="true"><img src="${assetUrl(icon)}" alt="" draggable="false"></span>` : ''}
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

/* ---------- 交互网格背景（magicui）：仅精细指针设备挂载；失败静默回退 body 准线网格 ---------- */
const gridBg = document.getElementById('grid-bg')
if (gridBg && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  import('../magicui/bg-entry.jsx')
    .then((m) => m.mountBackground(gridBg))
    .catch(() => {})
}
