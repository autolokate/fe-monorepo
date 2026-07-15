# Back Button Spacing Report

**Date:** 2026-06-17  
**Sprint:** P0 Device + UX Fix  
**Status:** FIXED

---

## Problem

Excessive vertical gap between the back button and title block on screens without a progress track — caused by a flex-grow progress spacer consuming header space.

---

## Root cause

`ob-shell__progress-spacer` used `flex: 1` inside the header column, pushing the title block down even when no progress bar was rendered.

---

## Solution

### Shared chrome — `step-shell-chrome.css`

```css
.ob-step-chrome__header--compact {
  gap: 0;
}
.ob-step-chrome__header--compact + .ob-step-chrome__body {
  padding-block-start: var(--ob-shell-header-stack-gap); /* 20px Figma */
}
```

Back → title spacing is now exactly **20px** (`--ob-shell-header-stack-gap`) via body padding, not flex expansion.

### Shells updated

| Shell                    | Compact header when       |
| ------------------------ | ------------------------- |
| `AuthStepShell`          | No progress track         |
| `FlowStepShell`          | No progress track         |
| `WelcomeActivationShell` | Always (back-only header) |
| `PurchaseStatusShell`    | When back shown           |
| `LegalReaderHeader`      | Always (back-only header) |

### Removed

- `ob-shell__progress-spacer` element from `AuthStepShell` and `FlowStepShell`
- `flex: 1` progress spacer rule from `flow-step-shell.css`

### Unchanged (by design)

| Shell                       | Reason                                                                    |
| --------------------------- | ------------------------------------------------------------------------- |
| `PwaScanShell`              | Figma wordmark header — back + brand row, not step-shell progress pattern |
| Screens with progress track | Full header stack gap preserved for back + track + title                  |

---

## Flow coverage

| Area                    | Shell                             | Spacing                           |
| ----------------------- | --------------------------------- | --------------------------------- |
| Auth A1–A3              | `AuthStepShell`                   | ✅ 20px                           |
| Purchase R\*            | `FlowStepShell` / `AuthStepShell` | ✅ 20px                           |
| Emergency E\*           | `FlowStepShell`                   | ✅ 20px                           |
| B2B / B2B2C welcome     | `WelcomeActivationShell`          | ✅ 20px                           |
| Purchase status R04/R09 | `PurchaseStatusShell`             | ✅ 20px                           |
| Legal L1                | `LegalReaderHeader`               | ✅ 20px                           |
| PWA scan                | `PwaScanShell`                    | Separate Figma layout (unchanged) |

---

## Verdict

**FIXED** — Back → title spacing normalized at shared chrome layer across all step shells.
