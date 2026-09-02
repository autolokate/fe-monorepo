# Rider Skip Confirmation Report

**Date:** 2026-06-21  
**Sprint:** P0 iOS Contact Support + Rider Confirmation  
**Status:** FIXED

---

## Requirement

When user taps **Skip for now** on R0 (rider prompt):

1. Show Figma-quality confirmation sheet (`AlPermissionSheet`)
2. **Add Rider** — dismiss sheet, stay on R0
3. **Continue Without Rider** — `riderSkipped: true`, phase `completed`, navigate to `/journey/completed`
4. Must not reopen R0, emergency contacts, or loop

Applies to **Purchase**, **Prepaid**, **B2B2C** (shared R0 route).

---

## Copy

| Field     | Text                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title     | Continue without adding a rider?                                                                                                                              |
| Body      | You can always add riders later from your vehicle profile. Adding a rider allows another trusted person to receive emergency alerts and access plan benefits. |
| Primary   | Add Rider                                                                                                                                                     |
| Secondary | Continue Without Rider                                                                                                                                        |

---

## Implementation

| File                           | Change                                                                    |
| ------------------------------ | ------------------------------------------------------------------------- |
| `EmergencyRoutes.tsx` R0       | `AlPermissionSheet` on skip; `finishWithoutRider()` sets skip + completed |
| `EmergencyRoutes.tsx` R0       | `riderSkipped` guard → redirect to `getCompletedPath()`                   |
| `EmergencyRoutes.tsx` E0       | `riderSkipped` guard → redirect to completed                              |
| `EmergencyRoutes.tsx` wildcard | `riderSkipped` → completed (not contacts-empty)                           |

### Skip flow

```
R0 → Skip for now → Confirmation sheet
  → Add Rider → stay on R0
  → Continue Without Rider → riderSkipped + /journey/completed
```

### Loop prevention

- `getContactsSummaryRiderContext` — `shouldEnterRiderFlowOnContinue` false when `riderSkipped`
- R0 / E0 / emergency wildcard — redirect to completed if `riderSkipped`

---

## Component reuse

- `AlPermissionSheet` from `@autolokate/ui` — same primitive as iOS install / permission flows
- No custom modal duplication

---

## Constraints preserved

- ❌ No route path changes (uses existing `/journey/completed`)
- ❌ No new session keys
- ❌ Rider optional business rule unchanged — skip now requires explicit confirmation

---

## Verdict

**FIXED** — Skip rider requires confirmation; continue without rider finishes onboarding at completed.
