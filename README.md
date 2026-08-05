# 深空之眼档案馆 · Aether Gazer Archive

为即将停止运营的《深空之眼》建立的**非官方粉丝档案馆**——一个纯静态网站，
长期留存角色、剧情、时光与美术作品。

## 模块

| 页面 | 说明 |
| --- | --- |
| `index.html` | 首页：档案总览与入口 |
| `characters.html` / `character.html` | 角色图鉴：筛选检索 + 角色详情 + **3D MMD 模型展示**（three.js，支持 PMX/PMD + VMD 动作） |
| `timeline.html` | 时间线：从公测到落幕的版本与事件编年史 |
| `story.html` | 剧情回顾：主线章节梗概与阅读模式 |
| `gallery.html` | 插画合集：游戏内 CG 与官方社媒美术，支持筛选与灯箱浏览 |
| `enemies.html` | 敌人图鉴：视骸等敌人资料 |

## 设计

严格按项目 `design.md`（AetherGazer_SciFi_Tactical_UI / 近未来战术终端风）实现：银冰画布 `#DDE5EE` + 白浮层卡 `#F0F4F8`；
深石板 `#0D1117` 仅用于指定件（顶部工具条、页脚、弹层背景等）。主行动按钮是琥珀金切角梯形 `#F59E0B`，
激活态变为同系胶囊；电青 `#06B6D4` 用于扫描线、进度、击赞助金、页签标记点；
卡片带 8px 圆角 + 1px `#CBD5E1` 细边、悬停提高、按下 scale 0.97 上移动 1px——点击反馈直接可见。
所有交互动效均按压曲线反馈（点击按简移动 + scale 压缩），并遵守 prefers-reduced-motion。
设计令牌集中在 `src/styles/base.css`。字体为自托管的
[MiSans](https://hyperos.mi.com/font/)（Regular/Medium/Semibold，按 unicode-range
分片按需加载，可免费商用，许可见 `src/fonts/misans/LICENSE`）。

## 快速开始

```bash
npm install
npm run dev      # 本地开发 http://localhost:5173
npm run build    # 构建到 dist/，可部署到任意静态托管
npm run preview  # 预览构建产物
```

## 如何补充内容

全站内容都是数据驱动的，不需要改页面代码：

1. **文字数据**：编辑 `src/data/*.json`，字段说明见 [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md)。
2. **图片**：放入 `public/images/`（角色立绘、插画、敌人图），路径写进对应 JSON 即可；缺图时页面自动显示占位块。
   图片量大时可迁移到图床：在 `src/data/site.json` 配置 `assetBase` 一处即可整体切换，
   单条数据也可直接填完整外链 URL（详见 `docs/DATA_SCHEMA.md` 的 site.json 一节）。
3. **MMD 模型**：整个模型文件夹放入 `public/models/<角色id>/`，在角色数据中填写 `model.path`。
   也可以不放服务器——角色详情页支持**从本地文件夹加载**模型，浏览者选择自己电脑上的
   模型文件夹即可预览（详见 `public/models/README.md`，注意模型作者的使用条款）。

## 部署

### GitHub Pages（纯静态）

仓库内置 GitHub Pages 工作流（`.github/workflows/deploy.yml`）：
推送到 `main` 分支后自动构建并发布。首次使用需在仓库
**Settings → Pages → Source** 中选择 **GitHub Actions**。

构建产物是完全静态的相对路径站点，也可以直接托管到任意对象存储 / CDN / 网盘直链。

### Cloudflare Workers（静态 + 投稿接口）

仓库已内置 Workers 配置（`wrangler.jsonc` + `worker/index.js`）：静态资源由
Workers Static Assets 直接服务 `dist/`，`POST /api/submit` 投稿接口由 Worker 处理。
前置：安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)（已在 devDependencies 中）。

```bash
npx wrangler login          # 浏览器登录 Cloudflare 账号（CI 用 CLOUDFLARE_API_TOKEN）
npx wrangler secret put GITHUB_TOKEN   # 必填。细粒度 PAT，只需目标仓库的 Issues: Read and write 权限
npm run cf:deploy           # = npm run build && wrangler deploy
```

本地联调：

```bash
npm run cf:dev              # 构建后在本机 8787 端口跑完整 Worker + 静态站点
```

- `GITHUB_REPO` 可选（默认 `wuwafly3/bigeye`），改 `wrangler.jsonc` 的 `vars` 即可。
- 本地开发时把 `GITHUB_TOKEN` 写入 `.dev.vars`（已 gitignore），不要提交。
- 推送 `main` 分支后由 `.github/workflows/deploy-cf.yml` 自动部署，需先在仓库
  **Settings → Secrets and variables → Actions** 添加 `CLOUDFLARE_API_TOKEN`。

> 提示：`*.workers.dev` 域名在中国大陆访问可能不稳定，建议绑定自有域名。
> 两种部署可以并存：GitHub Pages 提供纯静态镜像，Cloudflare Workers 提供带投稿接口的主站。

## 免责声明

本项目为玩家自发建立的非官方档案，与勇仕网络及其关联公司无关。
《深空之眼》游戏素材、角色形象与美术作品版权归原权利方所有；
本站内容仅供交流学习与纪念存档，请勿用于商业用途。
