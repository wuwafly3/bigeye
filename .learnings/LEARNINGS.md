# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20260803-001] correction

**Logged**: 2026-08-03T00:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
Theme and shared-header visuals still have three user-facing regressions after the first UI pass.

### Details
- Light mode briefly flashes the dark HUD loading overlay during initial page load.
- Dark mode leaves the homepage hero/header backdrop visually white.
- The added top logo treatment reduces the intended visual quality and should be removed.

### Suggested Action
Apply the saved/default theme before body paint, make homepage hero backdrop theme-aware, and remove the top logo image/stack while preserving navigation identity.

### Metadata
- Source: user_feedback
- Related Files: src/shared/layout.js, src/styles/base.css, src/styles/home.css, index.html
- Tags: theme, loading, header, homepage

### Resolution
- **Resolved**: 2026-08-03T00:00:00+08:00
- **Notes**: Made the loading overlay theme-aware, added dark homepage hero treatment, and removed the shared header logo markup. Verified both themes at initial loading and stable render states with Playwright.

---
