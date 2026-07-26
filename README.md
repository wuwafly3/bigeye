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

工业科技风设计语言（参考明日方舟系 UI 的公开设计语法）：浅灰纸面 + 近黑墨色 +
单一低饱和淡蓝信号色；直角、1px 细线、切角与括号角标；大标题紧排、微标签疏排。
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

### Vercel（静态 + 投稿接口）

1. 在 [vercel.com](https://vercel.com) Import 本仓库，框架自动识别为 Vite，
   构建配置已由 `vercel.json` 提供，无需改动。
2. 在项目 **Settings → Environment Variables** 添加：
   - `GITHUB_TOKEN`（必填）：细粒度 Personal Access Token，只勾选本仓库的
     **Issues: Read and write** 权限 —— 供「投稿与纠错」接口创建 Issue 使用。
   - `GITHUB_REPO`（可选）：默认 `wuwafly3/bigeye`。
3. 部署完成后，站内 `submit.html` 的表单会通过 `api/submit.js`
   把投稿写成仓库 Issue（标签 `archive-submission`），审核后再更新进数据文件。
   未配置 token 时表单会自动降级，引导访客直接去 GitHub 提 Issue。

> 提示：`*.vercel.app` 域名在中国大陆访问可能不稳定，建议绑定自有域名。
> 两种部署可以并存：GitHub Pages 提供纯静态镜像，Vercel 提供带投稿接口的主站。

## 免责声明

本项目为玩家自发建立的非官方档案，与勇仕网络及其关联公司无关。
《深空之眼》游戏素材、角色形象与美术作品版权归原权利方所有；
本站内容仅供交流学习与纪念存档，请勿用于商业用途。
