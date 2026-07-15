# Emergency Routing Fix Report

**Date:** 2026-06-18  
**Issue:** R10 Continue → blank screen (descendant route path mismatch)  
**Fix:** Convert `EmergencyRoutes` child `path` props to relative segments  
**Scope:** Routing only — no UI or Figma changes

---

## Summary

`EmergencyRoutes.tsx` child routes now use **relative** paths under parent `/journey/emergency/*`, matching the working `PurchaseRoutes` pattern. `emergencyJourneyPaths` full URLs and all `navigate()` calls are unchanged.

**Build:** `pnpm --filter @autolokate/qr build` — ✅ pass  
**Runtime:** All four plans verified in browser @ `http://127.0.0.1:5173`

---

## Before route config

Parent in `JourneyRoutes.tsx`:

```tsx
<Route path="/journey/emergency/*" element={<EmergencyActivationRoute />} />
```

Child routes in `EmergencyRoutes.tsx` (broken — absolute paths):

```tsx
<Routes>
  <Route path="/journey/emergency/rider-setup" element={<LegacyRiderSetupRedirect />} />
  <Route path="/journey/emergency/rider-prompt" element={<R0Route />} />
  <Route path="/journey/emergency/rider-mobile" element={<R1Route />} />
  <Route path="/journey/emergency/rider-otp" element={<R2Route />} />
  <Route path="/journey/emergency/rider-name" element={<R3Route />} />
  <Route path="/journey/emergency/riders-summary" element={<R4Route />} />
  <Route path="/journey/emergency/contacts-empty" element={<E0Route />} />
  <Route path="/journey/emergency/contact-mobile" element={<E1Route />} />
  <Route path="/journey/emergency/contact-otp" element={<E2Route />} />
  <Route path="/journey/emergency/contact-name" element={<E3Route />} />
  <Route path="/journey/emergency/contacts-summary" element={<E5Route />} />
  <Route
    path="/journey/emergency/*"
    element={<Navigate to={emergencyJourneyPaths.riderPrompt} replace />}
  />
</Routes>
```

**Runtime result:** URL changed correctly after R10 Continue, but descendant `<Routes>` matched **zero** routes → empty `journey-frame` → blank screen.

---

## After route config

```tsx
<Routes>
  <Route path="rider-setup" element={<LegacyRiderSetupRedirect />} />
  <Route path="rider-prompt" element={<R0Route />} />
  <Route path="rider-mobile" element={<R1Route />} />
  <Route path="rider-otp" element={<R2Route />} />
  <Route path="rider-name" element={<R3Route />} />
  <Route path="riders-summary" element={<R4Route />} />
  <Route path="contacts-empty" element={<E0Route />} />
  <Route path="contact-mobile" element={<E1Route />} />
  <Route path="contact-otp" element={<E2Route />} />
  <Route path="contact-name" element={<E3Route />} />
  <Route path="contacts-summary" element={<E5Route />} />
  <Route path="*" element={<Navigate to={emergencyJourneyPaths.riderPrompt} replace />} />
</Routes>
```

**Unchanged:**

- `emergencyJourneyPaths` in `emergency-routing.ts` (full URLs for navigation)
- All `navigate(emergencyJourneyPaths.*)` calls across the app
- `getEmergencyHandoffPath(session)` return values
- Screen components and purchase handoff logic

**Removed:** unused `journeyPaths` import from `EmergencyRoutes.tsx`

---

## Per-plan navigation verification

Seeded journey: `AUTH_COMPLETED`, `selectedFlow: purchase`, `paymentStatus: success`.  
Flow: R10 → Continue (runtime click).

| Plan        | R10 destination URL                 | Matched child path | Rendered screen               | Heading                   |
| ----------- | ----------------------------------- | ------------------ | ----------------------------- | ------------------------- |
| **Safe**    | `/journey/emergency/contacts-empty` | `contacts-empty`   | `E05ContactsEmptyScreen` (E0) | Who should we call?       |
| **Secure**  | `/journey/emergency/rider-prompt`   | `rider-prompt`     | `E01RiderPromptScreen` (R0)   | Add your rider’s details? |
| **Shield**  | `/journey/emergency/rider-prompt`   | `rider-prompt`     | `E01RiderPromptScreen` (R0)   | Add your rider’s details? |
| **Shield+** | `/journey/emergency/rider-prompt`   | `rider-prompt`     | `E01RiderPromptScreen` (R0)   | Add your rider’s details? |

Safe E0 body copy: _"Add 1 person we'll alert if you're in a crash."_ — plan-aware via `getContactsEmptyDescription('safe')`.

---

## Rendered component verification

| Check                                          | Before fix      | After fix                                    |
| ---------------------------------------------- | --------------- | -------------------------------------------- |
| `journey-frame` empty                          | ✅ Always blank | ❌ Contains screen UI                        |
| Accessibility nodes                            | 0               | 5–7+ per screen                              |
| Blank screen                                   | ✅              | ❌ Fixed                                     |
| Redirect loop                                  | None            | None                                         |
| Unknown path `/journey/emergency/unknown-path` | Blank           | Redirects once to `rider-prompt`, renders R0 |

---

## Session persistence verification

After each plan's R10 → Emergency handoff:

| Field                             | Preserved      |
| --------------------------------- | -------------- |
| `session.purchase.selectedPlanId` | ✅             |
| `session.purchase.riderCount`     | ✅             |
| `session.purchase.paymentStatus`  | ✅ `'success'` |
| `session.purchase.paidAmountInr`  | ✅             |

No `patchPurchase`, `clearJourney`, or session wipe on handoff.

---

## Build verification

```bash
pnpm --filter @autolokate/qr build
```

```
✓ tsc -p tsconfig.json
✓ vite build — 369 modules, exit 0
```

---

## Files changed

| File                                             | Change                                           |
| ------------------------------------------------ | ------------------------------------------------ |
| `apps/qr/src/journey/routes/EmergencyRoutes.tsx` | Relative child `path` props; `path="*"` fallback |

---

## Related docs

- Root cause: `docs/EMERGENCY_BLANK_SCREEN_ROOT_CAUSE.md`
- Handoff wiring: `docs/EMERGENCY_HANDOFF_FIX_REPORT.md`

---

_Routing fix applied and runtime-verified. Emergency screens render after R10 Continue for all plans._
