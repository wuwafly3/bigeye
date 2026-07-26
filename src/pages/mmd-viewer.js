/**
 * 3D MMD 模型查看器（three.js / MMDLoader）
 *
 * 用法：
 *   const viewer = createMMDViewer(container, {
 *     modelPath: 'models/xxx/model.pmx',  // 站内模型路径（相对 public/，可为空）
 *     modelScale: 1,                      // 站内模型缩放
 *     screenshotName: 'xxx'               // 截图文件名前缀
 *   })
 *   viewer.dispose()  // 清理 geometry/material/texture、渲染器与 ObjectURL
 *
 * 设计约定：
 * - 不引入物理引擎（ammo），VMD 动作以 physics:false 播放；
 * - 站内模型缺失 / 加载失败时静默回到占位状态，不打扰访问者；
 * - “从本地文件夹加载”完全离线：所有文件转为 ObjectURL，通过
 *   LoadingManager.setURLModifier 将贴图相对路径映射到 blob URL，文件不会上传。
 */
import * as THREE from 'three'
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js'
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TGALoader } from 'three/addons/loaders/TGALoader.js'
import { assetUrl } from '../shared/assets.js'

export function createMMDViewer(container, opts = {}) {
  const options = {
    modelPath: String(opts.modelPath || '').trim(),
    modelScale: Number(opts.modelScale) > 0 ? Number(opts.modelScale) : 1,
    screenshotName: String(opts.screenshotName || 'mmd-model').trim() || 'mmd-model'
  }
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ---------- DOM 结构 ---------- */
  container.classList.add('mmd-viewer')
  container.innerHTML = `
    <div class="mmd-stage" aria-label="3D 模型渲染区"></div>
    <div class="mmd-progress" hidden><div class="mmd-progress-fill"></div></div>
    <div class="notice mmd-error" role="alert" hidden></div>
    <div class="mmd-placeholder">
      <div class="mmd-ph-icon" aria-hidden="true">⬡</div>
      <p class="mmd-ph-title">尚未加载 3D 模型</p>
      <p class="mmd-ph-text">
        方式一：将 MMD 模型文件夹放入仓库 <code>public/models/</code>
        并在角色数据中填写 <code>model.path</code>（见 <code>public/models/README.md</code>）；<br />
        方式二：点击下方按钮选择本地模型文件夹（含 .pmx / .pmd 与贴图），
        模型仅在浏览器内渲染，文件不会上传。
      </p>
      <button type="button" class="btn btn-primary mmd-ph-load">从本地文件夹加载模型</button>
    </div>
    <div class="mmd-controls" role="toolbar" aria-label="模型查看器控制栏">
      <button type="button" class="btn" data-act="rotate">自动旋转</button>
      <button type="button" class="btn active" data-act="grid">网格</button>
      <button type="button" class="btn" data-act="reset" disabled>重置视角</button>
      <button type="button" class="btn" data-act="shot" disabled>截图</button>
      <button type="button" class="btn" data-act="folder">从本地文件夹加载</button>
      <button type="button" class="btn" data-act="vmd" disabled>加载动作(VMD)</button>
      <button type="button" class="btn" data-act="play" disabled>播放</button>
    </div>
    <input class="mmd-input-folder" type="file" webkitdirectory multiple hidden />
    <input class="mmd-input-vmd" type="file" accept=".vmd" hidden />`

  const stage = container.querySelector('.mmd-stage')
  const progressEl = container.querySelector('.mmd-progress')
  const progressFill = container.querySelector('.mmd-progress-fill')
  const errorEl = container.querySelector('.mmd-error')
  const placeholderEl = container.querySelector('.mmd-placeholder')
  const phLoadBtn = container.querySelector('.mmd-ph-load')
  const rotateBtn = container.querySelector('[data-act="rotate"]')
  const gridBtn = container.querySelector('[data-act="grid"]')
  const resetBtn = container.querySelector('[data-act="reset"]')
  const shotBtn = container.querySelector('[data-act="shot"]')
  const folderBtn = container.querySelector('[data-act="folder"]')
  const vmdBtn = container.querySelector('[data-act="vmd"]')
  const playBtn = container.querySelector('[data-act="play"]')
  const folderInput = container.querySelector('.mmd-input-folder')
  const vmdInput = container.querySelector('.mmd-input-vmd')

  /* ---------- 状态 UI ---------- */
  function showError(msg) {
    errorEl.textContent = msg
    errorEl.hidden = false
  }
  function hideError() {
    errorEl.hidden = true
    errorEl.textContent = ''
  }
  function showProgress() {
    progressFill.style.width = '4%'
    progressEl.hidden = false
  }
  function setProgress(ratio) {
    const pct = Math.max(4, Math.min(100, Math.round(ratio * 100)))
    progressFill.style.width = pct + '%'
    progressEl.hidden = false
  }
  function hideProgress() {
    progressEl.hidden = true
    progressFill.style.width = '0'
  }

  /* ---------- WebGL 环境检测 ---------- */
  let renderer = null
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,                 // 透明背景，露出站点深空底色
      preserveDrawingBuffer: true  // 供截图使用
    })
  } catch (e) {
    renderer = null
  }
  if (!renderer) {
    showError('无法初始化 WebGL，当前浏览器暂不支持 3D 模型查看。')
    ;[rotateBtn, gridBtn, resetBtn, shotBtn, folderBtn, vmdBtn, playBtn, phLoadBtn]
      .forEach(btn => { btn.disabled = true })
    return { dispose() { container.innerHTML = '' } }
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  stage.appendChild(renderer.domElement)

  /* ---------- 场景 ---------- */
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)
  camera.position.set(0, 13, 34) // MMD 模型高约 20 单位，先给一个合理默认位

  // 微暖主光 + 冷色环境光，贴合站点深空色调
  const hemiLight = new THREE.HemisphereLight(0xcfe0ff, 0x1a2340, 0.95)
  const keyLight = new THREE.DirectionalLight(0xffe9d2, 1.15)
  keyLight.position.set(8, 24, 14)
  scene.add(hemiLight, keyLight)

  const gridHelper = new THREE.GridHelper(50, 25, 0x3a6bd8, 0x22315a)
  gridHelper.material.transparent = true
  gridHelper.material.opacity = 0.35
  scene.add(gridHelper)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = !reduceMotion
  controls.dampingFactor = 0.08
  controls.autoRotateSpeed = 1.6
  controls.target.set(0, 10, 0)
  controls.update()

  const clock = new THREE.Clock()
  const homeView = { position: camera.position.clone(), target: controls.target.clone() }

  /* ---------- 运行时状态 ---------- */
  let mesh = null
  let helper = null
  let animLoaded = false
  let animPlaying = false
  let disposed = false
  let animId = 0
  const objectUrls = new Set()

  function revokeObjectUrls() {
    for (const url of objectUrls) URL.revokeObjectURL(url)
    objectUrls.clear()
  }

  /* ---------- 自适应尺寸 ---------- */
  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }
  resize()
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)

  /* ---------- 渲染循环 ---------- */
  function tick() {
    animId = requestAnimationFrame(tick)
    const delta = clock.getDelta()
    if (helper && animPlaying) helper.update(delta)
    controls.update()
    renderer.render(scene, camera)
  }
  tick()

  /* ---------- 取景与模型管理 ---------- */
  function setModelButtons(enabled) {
    resetBtn.disabled = !enabled
    shotBtn.disabled = !enabled
    vmdBtn.disabled = !enabled
  }

  /** 按包围盒自动取景：target 设在约胸口高度，距离按模型尺寸计算 */
  function frameModel(target3d) {
    const box = new THREE.Box3().setFromObject(target3d)
    if (box.isEmpty()) return
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const focus = new THREE.Vector3(center.x, box.min.y + size.y * 0.55, center.z)
    const maxDim = Math.max(size.x, size.y, size.z, 0.001)
    const dist = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.35

    camera.position.set(focus.x, focus.y + size.y * 0.06, focus.z + dist)
    camera.near = Math.max(dist / 200, 0.01)
    camera.far = Math.max(dist * 50, 500)
    camera.updateProjectionMatrix()
    controls.target.copy(focus)
    controls.minDistance = maxDim * 0.15
    controls.maxDistance = dist * 6
    controls.update()

    homeView.position.copy(camera.position)
    homeView.target.copy(controls.target)
  }

  /** 移除当前模型并释放 geometry / material / texture */
  function clearModel() {
    if (helper && mesh) {
      try { helper.remove(mesh) } catch (e) { /* 未注册时忽略 */ }
    }
    helper = null
    animLoaded = false
    animPlaying = false
    playBtn.disabled = true
    playBtn.textContent = '播放'

    if (!mesh) return
    scene.remove(mesh)
    mesh.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose()
      const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : [])
      for (const mat of mats) {
        for (const key of Object.keys(mat)) {
          const value = mat[key]
          if (value && value.isTexture) value.dispose()
        }
        mat.dispose()
      }
    })
    mesh = null
  }

  /** 统一创建 LoadingManager：进度条 + TGA 贴图支持 + 可选 URL 重写 */
  function createManager(urlModifier) {
    const manager = new THREE.LoadingManager()
    manager.onProgress = (url, loaded, total) => {
      if (!disposed) setProgress(total ? loaded / total : 0)
    }
    manager.onLoad = () => { if (!disposed) hideProgress() }
    manager.onError = () => { /* 个别贴图缺失不视为致命错误 */ }
    if (urlModifier) manager.setURLModifier(urlModifier)
    manager.addHandler(/\.tga$/i, new TGALoader(manager))
    return manager
  }

  function addModel(loadedMesh, scale) {
    if (disposed) return
    clearModel()
    if (scale && scale !== 1) loadedMesh.scale.setScalar(scale)
    scene.add(loadedMesh)
    mesh = loadedMesh
    frameModel(loadedMesh)
    hideProgress()
    hideError()
    placeholderEl.hidden = true
    setModelButtons(true)
  }

  /* ---------- 方式一：站内路径加载 ---------- */
  function loadSiteModel(path, scale) {
    hideError()
    showProgress()
    const manager = createManager(null)
    new MMDLoader(manager).load(
      assetUrl(path),
      loadedMesh => addModel(loadedMesh, scale),
      undefined,
      () => {
        // 站内模型不存在或无法解析：静默回到占位状态，不打扰访问者
        if (disposed) return
        hideProgress()
        placeholderEl.hidden = false
      }
    )
  }

  /* ---------- 方式二：本地文件夹加载（离线，不上传） ---------- */
  function loadLocalFolder(files) {
    const entryFile =
      files.find(f => /\.pmx$/i.test(f.name)) ||
      files.find(f => /\.pmd$/i.test(f.name))
    if (!entryFile) {
      showError('所选文件夹中未找到 .pmx / .pmd 模型文件。')
      return
    }

    // 换新文件夹时释放上一批 ObjectURL
    revokeObjectUrls()

    // 键：webkitRelativePath 去掉首层目录、反斜杠归一、转小写；另按纯文件名建一份索引
    const relMap = new Map()
    const nameMap = new Map()
    let entryUrl = ''
    for (const file of files) {
      const raw = (file.webkitRelativePath || file.name).replace(/\\/g, '/')
      const parts = raw.split('/')
      const rel = (parts.length > 1 ? parts.slice(1).join('/') : raw).toLowerCase()
      const url = URL.createObjectURL(file)
      objectUrls.add(url)
      if (!relMap.has(rel)) relMap.set(rel, url)
      const base = file.name.toLowerCase()
      if (!nameMap.has(base)) nameMap.set(base, url)
      if (file === entryFile) entryUrl = url
    }

    // 贴图相对路径 → blob URL：先按完整相对路径“结尾匹配”，再退回纯文件名匹配
    const urlModifier = url => {
      if (objectUrls.has(url)) return url
      let u = String(url)
      try { u = decodeURIComponent(u) } catch (e) { /* 保持原样 */ }
      u = u.replace(/\\/g, '/').toLowerCase()
      for (const [rel, blobUrl] of relMap) {
        if (u === rel || u.endsWith('/' + rel)) return blobUrl
      }
      const base = u.slice(u.lastIndexOf('/') + 1)
      if (nameMap.has(base)) return nameMap.get(base)
      return url
    }

    hideError()
    showProgress()
    const manager = createManager(urlModifier)
    new MMDLoader(manager).load(
      entryUrl,
      loadedMesh => addModel(loadedMesh, 1),
      undefined,
      err => {
        if (disposed) return
        hideProgress()
        showError('模型加载失败：' + ((err && err.message) || '文件无法解析。'))
      }
    )
  }

  /* ---------- VMD 动作 ---------- */
  function loadVmd(file) {
    if (!mesh) return
    const url = URL.createObjectURL(file)
    objectUrls.add(url)
    hideError()
    new MMDLoader().loadAnimation(
      url,
      mesh,
      clip => {
        if (disposed) return
        if (helper) {
          try { helper.remove(mesh) } catch (e) { /* 忽略 */ }
        }
        helper = new MMDAnimationHelper()
        helper.add(mesh, { animation: clip, physics: false }) // 不引入 ammo 物理
        animLoaded = true
        animPlaying = !reduceMotion // 减少动态偏好：默认暂停，由访问者手动播放
        playBtn.disabled = false
        playBtn.textContent = animPlaying ? '暂停' : '播放'
      },
      undefined,
      () => { if (!disposed) showError('动作文件(VMD)加载失败。') }
    )
  }

  /* ---------- 控制栏交互 ---------- */
  rotateBtn.addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate
    rotateBtn.classList.toggle('active', controls.autoRotate)
  })

  gridBtn.addEventListener('click', () => {
    gridHelper.visible = !gridHelper.visible
    gridBtn.classList.toggle('active', gridHelper.visible)
  })

  resetBtn.addEventListener('click', () => {
    camera.position.copy(homeView.position)
    controls.target.copy(homeView.target)
    controls.update()
  })

  shotBtn.addEventListener('click', () => {
    renderer.render(scene, camera)
    const link = document.createElement('a')
    link.download = options.screenshotName + '.png'
    link.href = renderer.domElement.toDataURL('image/png')
    link.click()
  })

  const openFolderPicker = () => folderInput.click()
  folderBtn.addEventListener('click', openFolderPicker)
  phLoadBtn.addEventListener('click', openFolderPicker)

  folderInput.addEventListener('change', () => {
    const files = Array.from(folderInput.files || [])
    folderInput.value = ''
    if (files.length) loadLocalFolder(files)
  })

  vmdBtn.addEventListener('click', () => vmdInput.click())
  vmdInput.addEventListener('change', () => {
    const file = (vmdInput.files || [])[0]
    vmdInput.value = ''
    if (file) loadVmd(file)
  })

  playBtn.addEventListener('click', () => {
    if (!animLoaded) return
    animPlaying = !animPlaying
    playBtn.textContent = animPlaying ? '暂停' : '播放'
  })

  /* ---------- 初始加载 ---------- */
  if (options.modelPath) loadSiteModel(options.modelPath, options.modelScale)

  /** 运行时切换站内模型（皮肤/换装用），path 相对 public/ */
  function loadSite(path, scale) {
    const p = String(path || '').trim()
    if (!p || disposed) return
    loadSiteModel(p, Number(scale) > 0 ? Number(scale) : 1)
  }

  /* ---------- 清理 ---------- */
  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(animId)
    resizeObserver.disconnect()
    clearModel()
    gridHelper.geometry.dispose()
    gridHelper.material.dispose()
    controls.dispose()
    renderer.dispose()
    if (typeof renderer.forceContextLoss === 'function') renderer.forceContextLoss()
    revokeObjectUrls()
    container.innerHTML = ''
  }

  return { dispose, loadSite }
}
