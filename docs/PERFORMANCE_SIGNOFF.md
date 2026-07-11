# Performance Signoff

**Date:** 2026-06-17  
**Verdict:** **PASS WITH KNOWN GAPS** (bundle size + audio asset)

---

## Production Build Output

Command: `cd apps/onboarding && pnpm run build`

| Asset | Size | Gzip |
|-------|-----:|-----:|
| `index-*.js` | 1,107.56 KB | 282.19 KB |
| `index-*.css` | 166.63 KB | 23.14 KB |
| `sos-emergency-alarm-*.wav` | 3,528.04 KB | — |
| `al-logo-figma-dark-*.png` | 9.01 KB | — |
| `workbox-window.prod.es5-*.js` | 5.75 KB | 2.36 KB |

**Rollup warning:** Main chunk > 500 KB after minification.

PWA precache: 26 entries (~1,343 KB).

---

## Bundle Composition Notes

- **894 modules** transformed in Vite build
- **lottie-web** included (confetti animation) — contributes to JS size; uses `eval` (Vite warning)
- No route-level `React.lazy` / dynamic imports applied (out of scope — no route graph changes)

---

## Rerender Risk (Static Review)

| Hot path | Mitigation |
|----------|------------|
| Journey context | `useMemo` on context value object |
| Emergency route guards | Early returns before heavy screen mount |
| PWA SOS hold | Dedicated `use-hold-progress` hooks |
| Plan carousel | Local state + controlled slides |

No profiler run in this pass — code review only.

---

## Duplicate Dependencies

Monorepo uses **pnpm workspaces** with shared `packages/*`. No duplicate React/React-DOM versions observed in build graph (single Vite bundle).

---

## CSS

- Single CSS chunk: 167 KB — includes journey + PWA + UI package styles
- No orphan CSS files found outside imported chains
- Dead CSS purge not run (would require tooling beyond scope)

---

## Images & Icons

| Category | Finding |
|----------|---------|
| Bundled raster | 1 logo PNG |
| Icons | SVG via `@autolokate/icons` — tree-shaken by named imports |
| Visual truth PNGs | 61 files in `docs/` — not in bundle |

---

## Animations

| Animation | Cost |
|-----------|------|
| Lottie confetti | JS library weight |
| SOS hold progress | CSS/RAF — lightweight |
| Relation grid transitions | CSS only (420ms) |

---

## Recommendations (P2 — Not Applied)

1. **Code-split** PWA SOS/Park Me routes via `React.lazy` (+ route graph review)
2. **Compress or stream** SOS alarm wav (3.5 MB dominates transfer on first SOS visit)
3. **Manual chunks** for lottie-web in Vite config
4. **Lazy-load** dev-only `ScreenDevApp` (already excluded from prod entry)

---

## Signoff Checklist

- [x] Build succeeds
- [x] PWA precache generated
- [x] No duplicate React bundles
- [x] Largest assets identified
- [ ] Bundle under 500 KB — **not met**
- [ ] SOS audio optimized — **not met**

**Signed:** Engineering hardening pass 2026-06-17
