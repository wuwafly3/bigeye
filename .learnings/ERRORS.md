# Errors

Command failures and integration errors.

---

## [ERR-20260804-001] playwright-core cached browser mismatch

**Logged**: 2026-08-04T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Playwright Core 1.62 looked for browser revision 1234 while the local cache contained revision 1200.

### Error
`browserType.launch: Executable doesn't exist at ...chromium_headless_shell-1234...`

### Resolution
Launched the existing cached Chromium executable explicitly with `executablePath`; desktop and mobile UI checks completed successfully without downloading dependencies.

### Metadata
- Reproducible: yes
- Related Files: package.json

---

## [ERR-20260804-001] PowerShell large JSON and Unicode path parsing

**Logged**: 2026-08-04
**Context**: Importing official functor metadata from the local game extraction.
**Issue**: Windows PowerShell `ConvertFrom-Json` failed on a large JSON file and Node could not receive a Chinese path reliably through an inline command.
**Resolution**: Copy the source JSON into the workspace, parse it with Node, then remove the temporary copy. Use Node for generated UTF-8 JSON and file-list processing.

---

## [ERR-20260803-006] PowerShell ripgrep quoting

**Logged**: 2026-08-03T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
The initial HTML search command used shell quoting that produced an invalid ripgrep pattern.

### Error
`rg: regex parse error: unclosed group`

### Context
- The command was only exploratory and did not modify files.

### Suggested Fix
Use a simpler literal search or PowerShell `Select-String` for HTML attributes.

### Metadata
- Reproducible: no
- Related Files: *.html

### Resolution
- **Resolved**: 2026-08-03T00:00:00+08:00
- **Notes**: Switched to literal file inspection.

---

## [ERR-20260803-005] mobile fixed navigation containing block

**Logged**: 2026-08-03T00:00:00+08:00
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
The mobile bottom navigation was positioned against the sticky header instead of the viewport and intercepted header tool clicks.

### Error
Playwright reported that the last navigation link intercepted clicks on `.theme-toggle`.

### Context
- `.nav-links` is a descendant of `.site-header`.
- The header's `backdrop-filter` established a containing block for fixed descendants in Chromium.

### Suggested Fix
Disable the header backdrop filter at the mobile breakpoint so the fixed navigation uses the viewport.

### Metadata
- Reproducible: yes
- Related Files: src/styles/base.css

### Resolution
- **Resolved**: 2026-08-03T00:00:00+08:00
- **Notes**: Removed the mobile header backdrop filter and repeated the browser interaction checks.

---

## [ERR-20260803-004] node custom test extension

**Logged**: 2026-08-03T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
The repository test file uses a `.js.test` suffix that Node's built-in test runner does not recognize as a JavaScript module.

### Error
`TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".test"`

### Context
- Attempted `node --test src/shared/assets.js.test`.
- The project has no test script documenting a custom loader.

### Suggested Fix
Use the project test runner/loader when one is defined, or rename the fixture to a standard `*.test.js` convention in a separate maintenance change.

### Metadata
- Reproducible: yes
- Related Files: src/shared/assets.js.test, package.json

### Resolution
- **Resolved**: 2026-08-03T00:00:00+08:00
- **Notes**: Treated as an existing test harness limitation; production build and browser checks remain the verification path for this UI task.

---

## [ERR-20260803-003] npm.ps1 execution policy

**Logged**: 2026-08-03T00:00:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
PowerShell blocked the `npm.ps1` shim under the current execution policy.

### Error
`无法加载文件 E:\\node\\npm.ps1，因为在此系统上禁止运行脚本。`

### Context
- Verification was started with `npm run build` from PowerShell.

### Suggested Fix
Use `npm.cmd` for npm scripts in this managed PowerShell environment.

### Metadata
- Reproducible: yes
- Related Files: package.json

### Resolution
- **Resolved**: 2026-08-03T00:00:00+08:00
- **Notes**: Retried with `npm.cmd run build`.

---

## [ERR-20260803-002] parallel verification

**Logged**: 2026-08-03T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
A parallel verification batch stopped on a `git diff --check` whitespace finding and obscured the other command results.

### Error
`src/styles/base.css:755: trailing whitespace.`

### Context
- The build, unit test, and diff check were launched together.
- The wrapper reported the first non-zero result without preserving the other outputs.

### Suggested Fix
Remove the whitespace and run build/tests as separate verification commands when complete outputs matter.

### Metadata
- Reproducible: no
- Related Files: src/styles/base.css

### Resolution
- **Resolved**: 2026-08-03T00:00:00+08:00
- **Notes**: Removed the trailing space and reran checks individually.

---

## [ERR-20260803-001] apply_patch

**Logged**: 2026-08-03T00:00:00+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
The first shared-layout patch did not match the existing navigation template context.

### Error
`apply_patch verification failed: Failed to find expected lines in src/shared/layout.js`

### Context
- A large patch assumed `aria-current` was already present in the active navigation link.
- The existing file used a simpler active-class template.

### Suggested Fix
Read the exact target section and apply smaller context-specific patches.

### Metadata
- Reproducible: no
- Related Files: src/shared/layout.js

### Resolution
- **Resolved**: 2026-08-03T00:00:00+08:00
- **Notes**: Continued with smaller patches based on the current file contents.

---
