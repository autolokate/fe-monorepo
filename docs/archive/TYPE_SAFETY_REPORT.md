# Type Safety Report

**Date:** 2026-06-20

---

## Verification ✅

| Check               | Result       |
| ------------------- | ------------ |
| `pnpm -r typecheck` | **0 errors** |
| `pnpm -r lint`      | **0 errors** |
| `pnpm -r build`     | **PASS**     |

---

## Suppression Audit

| Pattern            |                                                            Count |
| ------------------ | ---------------------------------------------------------------: |
| `: any` / `as any` |                                                                0 |
| `@ts-ignore`       |                                                                0 |
| `@ts-expect-error` |                                                                0 |
| `eslint-disable`   | 3 (intentional deprecated shims in auth screens + routes.schema) |

---

## Types Removed (dead code cleanup)

| Type                           | Was used by         | Action                         |
| ------------------------------ | ------------------- | ------------------------------ |
| `PurchasePermissionId`         | R14 only            | Removed from types-checkout.ts |
| `PurchasePermissionsState`     | R14 only            | Removed                        |
| `PurchasePermissionDefinition` | R14 + PermissionRow | Removed                        |
| `DEFAULT_PURCHASE_PERMISSIONS` | R14 dev preview     | Removed                        |

---

## Types Retained

| Type                         | Reason                                                                 |
| ---------------------------- | ---------------------------------------------------------------------- |
| `PurchaseScreenState`        | Exported from qr-purchase package API                                  |
| `R03MobileNumberScreenProps` | In shared-auth/types.ts — deprecated type stub for external API compat |
| `getActivationCompleteTitle` | Used by JourneyCompletedScreen                                         |

---

## Shared Models

| Domain            | Single source               |
| ----------------- | --------------------------- |
| Mobile formatting | `@/shared/format-mobile.ts` |
| Purchase plans    | `purchase-plans.ts`         |
| Emergency limits  | `emergency-limits.ts`       |
| Journey session   | `journey/types.ts`          |
| PWA session       | `pwa-scan-types.ts`         |

---

## Verdict

**PASS — 0 TypeScript errors, 0 warnings.** Strict mode maintained throughout cleanup.
