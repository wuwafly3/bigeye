# 弥弥尔（Mi-Mi）小助手素材说明

右下角的弥弥尔部件由 `src/data/mimir.json` 配置驱动，形象有三档，
按你手头素材的丰富程度逐级升级：

## 档位一：内置 SVG（默认，无需任何素材）

`"mode": "svg"` —— 使用内置的动画小机器人（浮动 + 眨眼），开箱即用。

## 档位二：静态/GIF 图片

1. 把图片放入本目录，如 `public/mimir/mimir.png`（透明底 PNG 或 GIF）。
2. 修改 `src/data/mimir.json`：

```json
"mode": "image",
"image": "mimir/mimir.png"
```

## 档位三：Live2D 模型

需要三类文件，全部放入 `public/mimir/`：

1. **Cubism Core 运行库**：`lib/live2dcubismcore.min.js`
   （从 Live2D 官方 Cubism SDK for Web 中获取，注意遵守其发布许可）
2. **渲染库**：`lib/pixi.min.js`（PixiJS v6）与
   `lib/pixi-live2d-display.min.js`（pixi-live2d-display 的 cubism4 版本，MIT）
3. **模型文件**：整个模型文件夹，如 `model/mimir.model3.json` 及其贴图、
   动作、物理文件（保持原相对路径结构）

然后修改 `src/data/mimir.json`：

```json
"mode": "live2d",
"live2d": {
  "core": "mimir/lib/live2dcubismcore.min.js",
  "libs": ["mimir/lib/pixi.min.js", "mimir/lib/pixi-live2d-display.min.js"],
  "model": "mimir/model/mimir.model3.json",
  "width": 200,
  "height": 230
}
```

任何文件缺失或加载失败时，部件会自动回退到内置 SVG 形象，页面不会报错。

## 文案维护

气泡文案在 `src/data/mimir.json` 的 `quotes` 数组中随意增删；
`greetings` 是按时段的问候语（凌晨/上午/下午/晚间）；
`autoIntervalSeconds` 控制自动冒泡间隔，`bubbleSeconds` 控制气泡停留时长；
`"enabled": false` 可整体关闭部件。

## ⚠️ 版权提醒

从游戏客户端提取的 Live2D 模型属于官方素材，公开仓库中收录前请确认
风险自担；不确定时建议使用档位一/二，或使用社区自制的同人形象。
