# Import Architecture Report

**Date:** 2026-06-20

---

## Path Aliases Added

### TypeScript (`apps/qr/tsconfig.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Vite (`apps/qr/vite.config.ts`)

```ts
alias: {
  '@': path.resolve(rootDir, 'src'),
  '@autolokate/ui': ...,
  '@autolokate/icons': ...,
  '@autolokate/design-system': ...,
}
```

---

## Import Convention

| Pattern | Status |
|---------|--------|
| `@/features/emergency/...` | ✅ Preferred for cross-feature |
| `@/components/...` | ✅ Preferred |
| `@/journey/...` | ✅ Available |
| `@/shared/...` | ✅ New shared utilities |
| `@autolokate/ui` | ✅ Package imports unchanged |
| `../../../features/...` (3+ levels) | ✅ **Eliminated** (0 remaining) |
| `../../../../...` (4+ levels) | ✅ **Eliminated** (0 remaining) |

---

## Migration Stats

| Metric | Before | After |
|--------|--------|-------|
| Imports with 3+ `../` | ~70 files | **0** |
| `@/` alias imports | 0 | **~120+** |
| Files converted | — | 58 |

Automated conversion: relative paths with depth ≥3 resolved to `@/` from `src/` root.

**2-level relative imports retained** within same feature (e.g. `./Screen.tsx`, `../types.js`) — acceptable for sibling modules.

---

## New Shared Module

```
src/shared/format-mobile.ts   ← canonical mobile formatters
```

Import example:
```ts
import { formatMobileLocal, formatMobileIntl } from '@/shared/format-mobile.js';
```

---

## Package Imports (unchanged)

Monorepo packages continue to use workspace aliases:
- `@autolokate/ui`
- `@autolokate/icons`
- `@autolokate/design-system`
- `@autolokate/utils` (reserved, 0 runtime imports)

---

## Verdict

**PASS** — Deep relative import spaghetti eliminated. Consistent `@/` alias architecture in place.
