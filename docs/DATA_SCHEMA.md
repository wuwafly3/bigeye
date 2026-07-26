# 数据结构说明（DATA_SCHEMA）

档案馆的全部内容都存放在 `src/data/*.json`，页面在构建时通过 ES import 读取。
向档案馆补充内容 = 编辑这些 JSON 文件（+ 把图片/模型放进 `public/`）。

通用约定：

- 所有文本使用简体中文；未知字段填 `""` 或省略，**不要编造**。
- `id` 使用小写拉丁字母/数字/连字符（如 `apollo`），作为文件夹名与页面锚点。
- 图片路径相对 `public/`（如 `images/characters/apollo/portrait.png`），页面引用时写 `./images/...`。
- 日期一律 `YYYY-MM-DD`（只知道年月时可写 `YYYY-MM`）。

---

## characters.json — 角色图鉴

```jsonc
{
  "characters": [
    {
      "id": "tsukuyomi-zhenli",          // 必填，唯一
      "name": "月读",                     // 神名
      "codename": "震离",                 // 神格代号
      "fullName": "震离·月读",            // 展示名，缺省为 codename·name（官方惯例：神格·神名）
      "rarity": "S",                     // S / A / B
      "element": "雷",                   // 属性：火 / 冰 / 水 / 雷 / 风 / 光 / 暗 / 物理
      "weapon": "",                      // 武器类型
      "faction": "",                     // 所属神系（真樱 / 圣树 / 奥山 / 尼罗 / 众星 / 天垣 …）
      "voiceActor": { "cn": "", "jp": "" },
      "releaseVersion": "",              // 实装版本号
      "releaseDate": "",                 // 实装日期
      "description": "",                 // 角色介绍（1-3 段）
      "profile": { "height": "", "birthday": "", "hobby": "" },
      "quotes": ["……"],                  // 语音 / 台词摘录
      "skills": [
        { "name": "", "type": "普攻|技能|终结技|连携", "description": "" }
      ],
      "portrait": "images/characters/tsukuyomi-zhenli/portrait.png", // 头像/半身
      "fullArt": "images/characters/tsukuyomi-zhenli/full.png",      // 全身立绘（默认）
      "model": { "path": "models/tsukuyomi-zhenli/model.pmx", "scale": 1 }, // 可选，MMD 模型（默认）
      "skins": [                          // 可选：换装/皮肤，详情页出现多套切换卡
        {
          "name": "夏日祭",               // 换装名称（切换卡上显示）
          "fullArt": "images/characters/tsukuyomi-zhenli/skin-summer.png", // 可选
          "model": { "path": "models/tsukuyomi-zhenli-summer/model.pmx", "scale": 1 } // 可选
        }
      ],
      "archives": [                       // 可选：档案（游戏内解锁的纯文本档案节点）
        { "title": "档案一", "content": "正文，可用 \n 分段" }
      ],
      "heartlinks": [                     // 可选：誓约心链（个人剧情，文本记录）
        { "title": "心链一 标题", "summary": "一句话引言（可选）", "content": "剧情文本，\n 分段" }
      ]
    }
  ]
}
```

> `skins` 里的 `fullArt` 与 `model` 均可省略：只要任意一套之外还有第二套立绘或模型，
> 详情页就会自动出现对应的切换卡；`archives` / `heartlinks` 为空时整块隐藏。

> 版本与日期的史实（公测日、版本上线日等）以 `timeline.json` 为唯一事实源，
> 其他文件与页面文案与其保持一致。

## timeline.json — 时间线

```jsonc
{
  "events": [
    {
      "date": "2023-05-23",             // 必填
      "version": "",                    // 可选，版本号
      "title": "国际服 Aether Gazer 上线", // 必填
      "category": "运营",               // 版本 / 活动 / 剧情 / 运营
      "description": "……"
    }
  ]
}
```

## story.json — 剧情回顾

```jsonc
{
  "chapters": [
    {
      "id": "chapter-1",
      "order": 1,
      "title": "第一章 标题",
      "subtitle": "",                   // 副标题/引言
      "summary": "一段话概括本章剧情",
      "sections": [                     // 详细剧情，按小节
        { "heading": "小节标题", "content": "正文，可含 \n 分段" }
      ],
      "characters": ["阿波罗"]          // 主要登场角色中文名，可选
    }
  ]
}
```

## gallery.json — 插画合集

```jsonc
{
  "artworks": [
    {
      "id": "art-001",
      "title": "作品标题",
      "source": "game",                 // game=游戏内 / official=官方社媒
      "date": "2022-03",
      "description": "",
      "image": "images/gallery/art-001.jpg",
      "tags": ["主视觉"]
    }
  ]
}
```

## enemies.json — 敌人图鉴

```jsonc
{
  "enemies": [
    {
      "id": "enemy-001",
      "name": "敌人名",
      "category": "普通",               // 普通 / 精英 / 首领
      "faction": "",                    // 势力/种类，如"视骸"
      "description": "",
      "appearsIn": "",                  // 出现章节/玩法
      "image": "images/enemies/enemy-001.png"
    }
  ]
}
```

---

## mimir.json — 弥弥尔小助手

右下角互动部件的配置与文案库：

```jsonc
{
  "enabled": true,                    // false 可整体关闭
  "name": "弥弥尔",
  "mode": "svg",                      // svg（内置形象）/ image / live2d
  "image": "",                        // mode=image 时的图片路径（相对 public/）
  "live2d": { "core": "", "libs": [], "model": "", "width": 200, "height": 230 },
  "autoIntervalSeconds": 26,          // 自动冒泡间隔
  "bubbleSeconds": 7,                 // 气泡停留时长
  "greetings": { "dawn": "…", "morning": "…", "afternoon": "…", "evening": "…" },
  "quotes": ["随机气泡文案，随意增删"]
}
```

形象升级（图片 / Live2D）的素材放置见 `public/mimir/README.md`。

---

## 素材放置位置

- 角色图：`public/images/characters/<id>/portrait.png`（头像）、`full.png`（立绘）
- 插画：`public/images/gallery/<id>.<ext>`
- 敌人图：`public/images/enemies/<id>.<ext>`
- MMD 模型：`public/models/<id>/` 目录整体放入（.pmx + 贴图），详见 `public/models/README.md`

图片缺失时页面会自动显示占位块，不会报错，可以放心先填文字数据。
