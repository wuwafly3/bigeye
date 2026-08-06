# Watchdog notes — bigeye（深空之眼档案馆）

审查本项目的 Magic UI 组件替换实验（分支 `experiment/component-replacement`）。

## 当前背景

- 原生 Vite 站点（无框架），已引入 React 19 + motion + Tailwind v4（仅 utilities，无 preflight）
- 组件源码复制自 magicui registry 到 `src/components/ui/`（`shimmer-button.jsx`、`border-beam.jsx`），React 入口 `src/magicui/entry.jsx` 经 `home.js` 动态挂载
- 设计约束：橙色系（琥珀金 CTA/强调）保留；技术色为石板灰/冷银（亮 `#334155` / 暗 `#94a3b8`）；字体英文 JetBrains Mono、中文 HarmonyOS Sans
- 现有 `.module-card .module-cta` 是琥珀金切角平行四边形按钮（纯 CSS）

## 待讨论的方案 1

用 Magic UI ShimmerButton 替换首页模块卡的 CTA（`.module-card .module-cta`）。

请重点评估：

1. **React 渲染方式**：CTA 位于 `home.js` 模板字符串生成的 `.module-card` 内，替换需要 React 挂载点进入卡片（每卡一个 root？还是整块 module-grid 交给 React？）。评估侵入性与现有 CSS 的边界。
2. **视觉一致性**：ShimmerButton 默认黑底白 shimmer + 圆角 100px，与站点切角梯形、琥珀金 CTA 风格冲突。若保留琥珀色系（background 用琥珀渐变、shimmer 用白/金）是否合理，还是引入黑底会破坏"橙色保留"约束。
3. **性能与加载**：React 运行时 110KB gzip 懒加载只为一个按钮是否划算；若后续还要替换更多组件（卡片 hover 特效等），本方案是否应成为"模块网格整体 React 化"的第一步。
4. **交互细节**：hover/active 反馈、focus 可见性、`prefers-reduced-motion`（现有站点全局禁用动画）、切角 clip-path 与圆角冲突。
5. **风险清单**：Tailwind utilities 与现有 CSS 层叠冲突、React 卸载/导航问题、动态 import 失败兜底。

给出明确建议：值得做 / 需要调整 / 反对，以及理由与替代方案。
