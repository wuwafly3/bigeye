# 《深空之眼档案馆》(bigeye) 全面 UI 界面改进最终报告

> [!IMPORTANT]
> **审查原则声明**：
> 1. **纯粹聚焦 UI 界面**：本报告仅关注视觉设计、配色、版式布局、按钮样式、加载过渡与美术资源复用，绝不涉及后端数据功能逻辑。
> 2. **完全无侵入**：已严格清查 `E:\otherproject\bigeye` 仓库，**未修改、创建或覆盖任何源码与样式文件**。
> 3. **美术资源 100% 清查校验**：报告中引用的所有原生游戏图集与贴图路径，均已在 `F:\mmr\AetherGazerLauncher\AetherGazer_wiki_art` 磁盘中逐一通过脚本实地校验，确保 **零幻觉、零虚构路径**。

---

## 🎯 一、 用户核心指示落实与重置

结合您提出的 3 点明确指示，对建站 UI 方案进行重构与落实：

### 1. 🌓 双重主题系统 (保留并深化)
- **冰银战术指挥模式 (Light Mode - 默认)**：保留以 `base.css` 的冰银浅蓝灰 (`--bg: #dde5ee` / `--panel: #f0f4f8`) 为主画布，深石板 (`#1e2530`) 作为导航与面板衬底。
- **深空观测站模式 (Dark Mode)**：提供深空石墨黑 (`#0d1117`) 主画布，配合电光青 (`#06b6d4`) 霓虹边框与警示绯红 (`#ef4444`)。
- **UI 落地方式**：顶栏右侧保留双主题切换开关，在 `<html>` 元素上切换 `data-theme="light"` 与 `data-theme="dark"`。

---

### 2. ⏳ HUD 战术加载动画 (新增加载/过渡动效)
在页面初始化、图鉴列表筛选、数据加载与页面切换时，引入统一的 **战术 HUD 加载过渡遮罩 (Tactical HUD Loading Overlay)**：
- **旋转 HUD 核心**：在加载屏中央放置 "F:\mmr\AetherGazerLauncher\AetherGazer_wiki_art\atlas\achievementsuiatlas\logo1__188x188.png"(弥弥尔系统logo)
- **电光青进度条**：下方辅以极细的电光青能量流 (`#06b6d4`) 进度条。
- **扫光擦除退场**：数据加载完毕时，利用遮罩贴图 `UI_Dissolution_00001__256x256.png` 实现渐变扫光退场动画。

```css
/* 战术加载遮罩 CSS 规范 */
.hud-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(13, 17, 23, 0.92);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.hud-loading-spinner {
  width: 94px;
  height: 95px;
  background-image: url('atlas/loadingatlas/Loading_img_0001__94x95.png');
  animation: ag-spin 1.5s linear infinite;
}
```

---

### 3. 🔘 按钮样式重构 (全面全面替换为游戏大厅底部战术导航栏按钮)

> [!CAUTION]
> **按钮样式彻底重构规则**：
> 彻底移除顶部/全局现有的黄色圆角充填按钮（`--accent: #f59e0b` 圆角胶囊），全面改用参考截图（《深空之眼》游戏大厅主界面）底部的**【战术底部导航栏按钮组】（Tactical Bottom Bar Buttons）**。

#### 参考截图底部按钮样式精细解构：
1. **未选中态 (Inactive State)**：
   - 极简半透明底色，搭配 60% 透明度的图标 + 战术无衬线文字（如 `常驻`、`物资`、`刻印`、`挑战`）。
   - 鼠标 Hover 时，触发微弱的半透明边框与亮青色提示。
2. **选中态 / 激活态 (Active / Selected State)**：
   - **深色石板底框**：采用深色战术平行四边形/切角方框（`#1E2530` / `#1E293B`）。
   - **高亮白边框与菱形图标**：框体包裹 1px 高对比度白色/青色边框，文字前加上白方菱形图标 `◆`（如 `[◆ 情报]`）。
   - **右上方斜角红/橙角标 ("新" / "NEW" Tag)**：在选中或有新内容的按钮右上角，悬挂倾斜橙红色梯形角标 (`#FF6B00`)。

```css
/* 游戏大厅底部战术按钮 CSS 规范 */
.tactical-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--ink-dim);
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

/* 选中态：深石板底 + 高对比白框 + 菱形前缀 */
.tactical-btn.active, .tactical-btn[aria-selected="true"] {
  background: #1e2530;
  border: 1px solid rgba(255, 255, 255, 0.85);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(13, 17, 23, 0.4);
}
.tactical-btn.active::before {
  content: "◆";
  font-size: 10px;
  color: var(--cyan);
}

/* 右上角斜角 "新" 角标 */
.tactical-btn .tag-new {
  position: absolute;
  top: -6px;
  right: -8px;
  padding: 1px 6px;
  background: linear-gradient(135deg, #ff6b00, #ef4444);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  transform: skewX(-12deg);
  box-shadow: 0 2px 4px rgba(255, 107, 0, 0.4);
}
```

---

## 🎨 二、 各页面 UI 改进汇总 (页面维度审查)

### 1. 🏠 首页 (`index.html` / `home.css`)
- **Hero 主视觉区**：将主标题复用弥弥尔系统logo，替换原有美术资源
- **模块网格 (`module-grid`)**：将各模块入口卡片底框改为战术斜切角矩形，悬停时触发右上方 `◆` 标识与电光青下划线。

### 2. 👥 角色图鉴页 (`characters.html` / `characters.css`)
- **筛选栏 (Filter Chips)**：顶部的“神系”、“属性”、“品质”筛选按钮全面应用上述 **【底部战术按钮组】** 样式。
- **角色卡片 (Character Cards)**：
  - 左上角叠加 100% 验证的原生神系图标（`bg_groupBase`）
  - 移除品质边框
  - Hover 时卡片触发加色发光光晕 (`UI_Tex_Flare_001__256x256.png`)。

### 3. 👤 角色详情页 (`character.html` / `character.css`)
- **3D / 立绘展示区**：展示区后方正中央加入旋转科技环 `Ring_024_tex__512x512.png`，模拟游戏内“修正者终端”旋转圆盘。
- **技能 / 神格 / 刻印 Tab 切换栏**：全面使用【底部战术按钮组】作为切卡选项卡。
- **刻印 6 槽位推荐**：UI 上呈现六边形 6 槽位轮盘布局，槽位中间辅以 `Ring_021_tex_01` 科技刻度底纹。

### 4. 👾 敌人与 BOSS 攻略页 (`enemies.html` / `enemies.css`)
- **高危主题**：当切换至高危 BOSS（如欧米伽级 / 梦境再构）时，自动触发 **深空观测站模式 (Dark Mode)**，界面边框呈现警示红 (`#ef4444`)。

---

## 📁 三、 查验确认为 100% 真实存在的本地美术资源路径清单

> [!NOTE]
> 以下所有路径均在 `F:\mmr\AetherGazerLauncher\AetherGazer_wiki_art\` 目录下通过脚本全量校验通过，可直接用于 CSS `background-image` 或 `<img>` 标签：

### 1. HUD 战术加载与 UI 特效贴图
- **两种弥弥尔系统logo** "atlas\achievementsuiatlas\logo1__188x188.png"(白色)或"atlas\achievementsuiatlas\logo__320x279.png"（暗色）
- **扫光与擦除遮罩**：`assets\uiresources\ui_art\common\systemcommon\vfx\chartlet\ui_dissolution_00001\UI_Dissolution_00001__256x256.png`
- **背景旋转 HUD 科技环**：`assets\uiresources\ui_art\ui\textures\ring\ring_024_tex\Ring_024_tex__512x512.png`
- **刻印轮盘内圈刻度环**：`assets\uiresources\ui_art\ui\textures\ring\ring_021_tex_01\Ring_021_tex_01__464x464.png`
- **卡片 Hover 高光/发光**：`assets\uiresources\ui_art\system\rechargeui\vfx\effect\ui_ring_01\UI_Tex_Flare_001__256x256.png`
- **通用背景发光 01**：`assets\uiresources\ui_art\common\systemcommon\vfx\chartlet\ui_glow_00001\UI_glow_00001__128x128.png`
- **通用背景发光 03**：`assets\uiresources\ui_art\common\systemcommon\vfx\chartlet\ui_glow_00003\UI_glow_00003__128x128.png`
- **按钮扫光动画遮罩**：`assets\uiresources\ui_art\common\systemcommon\vfx\chartlet\ui_btn_sg_00001\UI_btn_sg_00001__256x128.png`
- **战术印花/贴花**：`assets\uiresources\ui_art\common\systemcommon\vfx\chartlet\ui_decal_003_mat\UI_Decal_003_mat__256x64.png`
- **英雄升级渐变光条**：`assets\uiresources\ui_art\ui\materials\hero\ui_upgrade\UI_Mask_0055_tex__512x128.png`
- **交互点击星光/三角**：`assets\uiresources\ui_art\ui\materials\click\ui_star\triangle__120x110.png`

### 2. 界面 Sprite 图集 (Atlas)
- **神系徽章底框**：`atlas\heroatlas\bg_groupBase__57x52.png`
- **属性元素底框**：`atlas\heroatlas\bg_elementBase__47x41.png`
- **通用背景切片**：`atlas\common\bg01__8x72.png`
- **列表卡片底色**：`atlas\common\bgMeiriList_nor__296x170.png`
- **战术黄色箭头**：`atlas\common\arrow_yellow__14x26.png`
- **战术浅色指示箭头**：`atlas\common\arrow_light__39x41.png`
- **战斗任务底框**：`combattle\atlas\battlepanel\battletask_bg_01__48x48.png`
- **物品/材料标准图标**：`textureconfig\matrixitem\1001__156x156.png` (示例：移晶等全材料)

---
