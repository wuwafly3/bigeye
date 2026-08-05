---
name: AetherGazer_Wiki_Design_System
colors:
  primary-bg-light: "#DDE5EE"
  primary-bg-dark: "#0D1117"
  surface-card-light: "#F0F4F8"
  surface-card-dark: "#1E2530"
  accent-gold: "#F59E0B"
  accent-cyan: "#06B6D4"
  accent-blue: "#38BDF8"
  text-primary-dark: "#0F172A"
  text-primary-light: "#F8FAFC"
  text-secondary: "#64748B"
  status-danger: "#EF4444"
  status-success: "#10B981"
---

# Design System: Aether Gazer Wiki (深空之眼 Wiki 官方风设计规范)

## 1. Visual Theme & Atmosphere

**Futuristic Cyber-Tactical Wiki (近未来科幻二次元战术 Wiki 风格)**

This design system translates the in-game HUD interface of *Aether Gazer* (深空之眼) into a modern, high-performance web Wiki platform. It balances the futuristic, high-tech tactical aesthetics (angled cuts, HUD gridlines, cyan energy glows, and dark/light contrast) with top-tier web ergonomics (fast readability, rich data visualization, responsive layout, and quick navigation).

### Core Aesthetic Pillars
- **Dual Visual Modes (双重视觉主题)**:
  - **Light Mode ("Icy Silver Command Mode" 冰银战术指挥模式 - 默认)**: Clean cool silver-gray canvas (`#DDE5EE` to `#F0F4F8`) with dark slate containers (`#1E2530`), cyber amber highlights (`#F59E0B`), and crisp high-contrast dark text (`#0F172A`).
  - **Dark Mode ("Deep Space Observatory Mode" 深空观测站模式)**: Deep space obsidian base (`#0D1117`) with glowing electric cyan details (`#06B6D4`), crimson high-risk alerts (`#EF4444`), and frosted glass dark panels (`rgba(30, 37, 48, 0.85)`).
- **Tactical Geometry & HUD Accents**: Slanted chamfered polygon cards (`clip-path`), fine crosshair reticles, hex grid overlays, and subtle corner reticle markers.
- **Data-Dense Yet Breathable Layout**: Ample whitespace for character showcase pages, paired with structured, highly scannable grid layouts for databases (Modifiers, Sigils, Functors).

---

## 2. Color Palette & Roles

### Primary Foundation
- **Icy Silver Light Canvas (`#DDE5EE` / `#E8EEF5`)**: Primary background for light mode pages, wiki article body, and main container canvas.
- **Deep Space Dark Obsidian (`#0D1117` / `#161B22`)**: Dark mode canvas background, hero section backdrops, and combat guide areas.
- **Light Surface Card (`#F0F4F8` / `rgba(255, 255, 255, 0.9)`)**: Card backgrounds for database entries, character attribute popups, and filter containers.
- **Tactical Slate Panel (`#1E2530` / `#252D3B`)**: Dark container cards, sidebar navigation, table headers, and code block backgrounds.

### Accent & Interactive
- **Cyber Amber Gold (`#F59E0B` / `#FBBF24`)**: Primary Action Buttons ("前往模拟", "配装方案", "S/SS/SSS" Rank Badges), active tab indicators, tier list SSS ratings.
- **Electric Cyan / Energy Blue (`#06B6D4` / `#38BDF8`)**: Skill energy bars, active links, filter tags, interactive node connections, active search highlight.
- **Tactical Dark Slate Pill (`#1E293B` / `#242D3C`)**: Secondary filter buttons, tag pills, dark theme button fills.

### Typography & Hierarchy Colors
- **Primary Text (`#0F172A` Light / `#F8FAFC` Dark)**: Article headings, character names, primary card titles.
- **Secondary Body Text (`#475569` Light / `#94A3B8` Dark)**: Skill descriptions, lore text, guide details.
- **Numeric & Meta Gray (`#64748B` / `#808C9C`)**: Stat numbers, cooldowns (CD 15s), energy costs, timestamps, UID tags.

### Functional & Genzone Colors (神系色彩标识)
- **Shinou / 罗真 (`#E11D48`)**: Crimson Rose Accent.
- **Olympus / 奥林匹斯 (`#3B82F6`)**: Bright Royal Blue.
- **Nile / 尼罗 (`#EAB308`)**: Golden Amber.
- **Yggdrasill / 游园 (`#10B981`)**: Emerald Green.
- **Asterism / 梵天 (`#8B5CF6`)**: Electric Violet.
- **Tianhang / 天行 (`#06B6D4`)**: Cyan Energy.

---

## 3. Web Typography & Grid Rules

### Web Font Stack
`font-family: system-ui, -apple-system, "DIN Alternate", "Noto Sans SC", "PingFang SC", sans-serif;`

### Type Hierarchy
- **Wiki Page Title / H1 (32px - 40px, Bold)**: Wide tracking (`letter-spacing: 0.06em`), e.g., `修正者数据库 | Modifiers Index`.
- **Section Title / H2 (22px - 28px, SemiBold)**: Left cyan indicator bar, e.g., `技能机制与连携奥义`.
- **Card Title / H3 (16px - 18px, Bold)**: High contrast, truncated with ellipsis if long.
- **Body Text (14px - 16px, Regular)**: Line height `1.6`, relaxed reading spacing.
- **Data & Stat Value (14px - 18px, DIN Bold)**: Tabular figures for clean vertical alignment in stat tables.

---

## 4. Web Component Stylings & Modular UI Design

### A. Global Top HUD Bar & Quick Navigation (全局战术导航栏)
- **Sticky Top Bar**: High-translucency frosted glass (`backdrop-filter: blur(12px); background: rgba(221, 229, 238, 0.85);`).
- **Global Search Bar (Command Palette `Ctrl + K`)**:
  - Slanted input capsule with cyan focus border (`#06B6D4`).
  - Instant autocomplete dropdown showing Modifier avatar, Sigil icon, or Guide title with quick category tags.
- **Quick Switch Tools**: Wiki Calculator, Team Builder, Tier List, Theme Toggle (Light/Dark).

### B. Modifier (修正者/角色) Database Module
- **Filter Toolbar**:
  - Multi-select pills for Genzone (神系), Combat Role (输出/辅助/控制), Damage Element (物理/火/冰/风/雷/光/暗), Rarity (S/A/B).
  - Search input & Sort selector (Release Date, Tier Rank, Base ATK).
- **Character Grid Card (3:4 Aspect Ratio)**:
  - Chamfered top-right corner polygon (`clip-path`).
  - Full-bleed character artwork with subtle hover scale (`scale(1.03)`).
  - Rank badge on top-left: S/SS/SSS in Cyber Amber Gold (`#F59E0B`).
  - Bottom info bar: Character Name, Element Icon, Genzone Badge, Base Stats summary.
- **Character Detail View (角色详情大页)**:
  - **Hero Showcase Section**: Large 3D render / Live2D art toggle with background tactical grid.
  - **Skill Inspector (技能分析) Tab**: Interactive skill level slider (Lv 1 - Lv 13), showcasing damage multiplier changes, energy consumption, and combo video/GIF preview.
  - **Code Node Tree (神格盘 3分支树形图)**: Interactive node chart; clicking a node displays its detailed passive effect.
  - **Recommended Build (推荐刻印与钥从)**:
    - 6-slot Sigil layout (Slots I-VI) showing 3+3 or 2+2+2 set effects.
    - Signature Functor (专武/钥从) description & rank scaling.

### C. Sigil & Build Calculator Module (刻印与配装模拟器)
- **6-Slot Interactive Wheel**: Graphical hex wheel representing Slots I to VI.
- **Dynamic Set Effect Summary**: Real-time calculation of active 2-piece and 3-piece set bonuses.
- **Enchantment Simulator (赋能模拟器)**: Add sub-stats (Attack %, Crit Rate, Crit Damage, Elemental Damage) and calculate theoretical damage output.

### D. Boss & Stage Strategy Hub (副本与 BOSS 攻略馆)
- **High-Risk Red Theme (`#EF4444`)**: Dark obsidian backdrop with crimson hazard stripes for Recurring Dream (梦境再构) & Omega Bosses.
- **Boss Move & Vulnerability Breakdown**: Phase tabs (Phase 1, Phase 2, Enrage state), move GIF previews, and counter strategies.
- **Recommended Team Comps (推荐阵容)**: Drag-and-drop 3-character team card showing Team Genzone Synergy (神系共鸣) & Chain Ultimate (连携奥义) activation.

---

## 5. Web Layout & Responsive Rules

- **Desktop (>= 1280px)**: 12-column grid layout, sticky right Table of Contents (TOC), left sidebar filters.
- **Tablet (768px - 1279px)**: 8-column grid layout, collapsible filter drawer, top tabbed navigation.
- **Mobile (< 768px)**: 4-column stacked layout, bottom navigation bar, touch-friendly 44px+ hit targets.

---

## 6. Stitch Generation & Web Component Prompts

### Recommended AI Prompts for Web UI Generation
1. **Modifier Database Index**:
   *"Build a responsive game wiki character database page for Aether Gazer. Include a sticky top frosted glass header with a search bar (Ctrl+K), multi-select filter tags for Genzone (神系) and Element, and a 4-column responsive grid of 3:4 aspect ratio character cards with chamfered corners, gold rank badges (S/SS), and cyan active hover glows."*
2. **Character Detail Page**:
   *"Create an Aether Gazer character wiki detail page. Left side features a large character artwork with tactical grid background; right side contains tabbed navigation for Attributes, Skill Inspector with Lv 1-13 slider, 3-branch 神格 Code Node interactive tree, and a 6-slot Sigil set build recommendation card."*
3. **Interactive Team Builder**:
   *"Design an Aether Gazer team composition calculator web app. Include 3 large slot cards for Main DPS, Sub DPS, and Support characters, dynamically updating Team Genzone Synergy badges and Chain Ultimate (连携奥义) video preview."*
