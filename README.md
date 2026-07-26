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
3. **MMD 模型**：整个模型文件夹放入 `public/models/<角色id>/`，在角色数据中填写 `model.path`。
   也可以不放服务器——角色详情页支持**从本地文件夹加载**模型，浏览者选择自己电脑上的
   模型文件夹即可预览（详见 `public/models/README.md`，注意模型作者的使用条款）。

## 部署

仓库内置 GitHub Pages 工作流（`.github/workflows/deploy.yml`）：
推送到 `main` 分支后自动构建并发布。首次使用需在仓库
**Settings → Pages → Source** 中选择 **GitHub Actions**。

构建产物是完全静态的相对路径站点，也可以直接托管到任意对象存储 / CDN / 网盘直链。

## 免责声明

本项目为玩家自发建立的非官方档案，与勇仕网络及其关联公司无关。
《深空之眼》游戏素材、角色形象与美术作品版权归原权利方所有；
本站内容仅供交流学习与纪念存档，请勿用于商业用途。
