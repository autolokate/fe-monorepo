# Unused Code Removal Report

**Date:** 2026-06-20  
**Scope:** Full repository — verified before deletion

---

## Summary

| Metric                   |  Count |
| ------------------------ | -----: |
| Directories removed      |     16 |
| Standalone files removed |      3 |
| Production route impact  |  **0** |
| Bundle JS reduction      | ~17 KB |
| Bundle CSS reduction     |  ~3 KB |

---

## Files Removed

### Never wired — zero production references

| Path                                             | Why safe                                     | Replaced by                        | Route dependency |
| ------------------------------------------------ | -------------------------------------------- | ---------------------------------- | ---------------- |
| `components/compositions/language-picker-sheet/` | Never imported; not in routes or dev catalog | N/A — feature removed from product | No               |
| `components/compositions/language-switcher/`     | Never imported                               | N/A                                | No               |
| `components/compositions/permission-row/`        | Only used by archived R14                    | N/A (R14 archived)                 | No               |

### Dev-only orphan screens — not in PurchaseRoutes

| Path                                                    | Why safe                    | Replaced by              | Route dependency |
| ------------------------------------------------------- | --------------------------- | ------------------------ | ---------------- |
| `features/qr-purchase/screens/p01-plan-selection/`      | Phase-5 legacy              | R06–R10 active graph     | No               |
| `features/qr-purchase/screens/p02-plan-details/`        | Phase-5 legacy              | R06–R10                  | No               |
| `features/qr-purchase/screens/p03-rider-selection/`     | Phase-5 legacy              | R07                      | No               |
| `features/qr-purchase/screens/p04-checkout-summary/`    | Phase-5 legacy              | R08                      | No               |
| `features/qr-purchase/screens/p05-payment-processing/`  | Phase-5 legacy              | R09                      | No               |
| `features/qr-purchase/screens/p06-payment-success/`     | Phase-5 legacy              | R10                      | No               |
| `features/qr-purchase/screens/r14-permissions/`         | Archived per PROJECT_STATUS | R10 → Emergency terminal | No               |
| `features/qr-purchase/screens/r15-activation-complete/` | Archived                    | JourneyCompletedScreen   | No               |

### Deprecated auth scaffolds — superseded by A1/A2

| Path                                                 | Why safe          | Replaced by    | Route dependency |
| ---------------------------------------------------- | ----------------- | -------------- | ---------------- |
| `features/shared-auth/screens/r03-mobile-number/`    | Not in AuthRoutes | A1MobileScreen | No               |
| `features/shared-auth/screens/r04-otp-verification/` | Not in AuthRoutes | A2OtpScreen    | No               |

### Dead feature folder

| Path                                     | Why safe                              | Replaced by                    | Route dependency                        |
| ---------------------------------------- | ------------------------------------- | ------------------------------ | --------------------------------------- |
| `features/qr-activation/` (QrScanScreen) | Routes redirect; screen never mounted | FlowEntryScreen + R03 redirect | No — `/journey/qr-scan` still redirects |

### Dead data modules

| Path                                                | Why safe             | Replaced by                             | Route dependency |
| --------------------------------------------------- | -------------------- | --------------------------------------- | ---------------- |
| `features/qr-purchase/data/plan-data.ts`            | P01–P05 only         | purchase-plans.ts + purchase-pricing.ts | No               |
| `features/qr-purchase/data/purchase-permissions.ts` | R14 only             | N/A (archived)                          | No               |
| `features/qr-purchase/screens/inventory.ts`         | Dev catalog metadata | N/A                                     | No               |

---

## Cascade Cleanups (not file deletions)

| Item                           | Action                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `screens/index.ts`             | Removed R14/R15/inventory exports                                                      |
| `types-checkout.ts`            | Removed permission types (R14-only)                                                    |
| `purchase-pricing.ts`          | Removed R15-only helpers; kept `getActivationCompleteTitle` for JourneyCompletedScreen |
| `shared-auth/screens/index.ts` | Removed R03/R04 deprecated exports                                                     |
| `index.ts` (package)           | Removed R03/R04 public exports                                                         |
| `dev/ScreenDevApp.tsx`         | Removed P01–P06, R14/R15, QrScan catalog entries                                       |

---

## Intentionally Retained

| Item                                       | Reason                                                         |
| ------------------------------------------ | -------------------------------------------------------------- |
| `purchase-activation/` screens + demo-data | demo-data used by vahan-demo, R05, PWA                         |
| `qr-prepaid/screens/pr01–pr03`             | Dev preview catalog only; production uses PrepaidWelcomeScreen |
| `@autolokate/ui` unused exports            | Consumed by ui-preview design system app                       |
| `docs/archive/`                            | Historical audit trail — not runtime code                      |

---

## Verification

```bash
pnpm -r typecheck  # PASS
pnpm -r lint       # PASS
pnpm -r build      # PASS
```

No production flow, route order, or session schema changes.
