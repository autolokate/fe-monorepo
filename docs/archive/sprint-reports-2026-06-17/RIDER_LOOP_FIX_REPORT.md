# Rider Loop Fix Report

**Date:** 2026-06-17  
**Sprint:** P0 iOS Contact Picker + Rider Loop + iOS Install  
**Status:** FIXED

---

## Problem

After skipping the rider prompt (R0), adding an emergency contact, and continuing from E5 (contacts summary), the app could **reopen the rider flow** — especially on **Purchase** plans with rider entitlement.

---

## Root cause

1. **`getContactsSummaryRiderContext`** treated Purchase differently:
   - `blockedBySkip = riderSkipped && flow !== 'purchase'`
   - Purchase skip did **not** block rider re-entry on E5 Continue

2. **`E5Route` `useLayoutEffect`** cleared `riderSkipped` on Purchase when riders were still owed:
   - Reset skip flag → `shouldEnterRiderFlowOnContinue` became true → loop

3. **`EmergencyWildcardRedirect`** always sent users to `rider-prompt` unless purchase payment success — ignored `riderSkipped`

4. **`R0Route`** did not guard against re-entry when `riderSkipped === true`

---

## Fix

| Location                       | Change                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `emergency-limits.ts`          | `shouldEnterRiderFlowOnContinue = ridersOwed && !riderSkipped` for **all flows** |
| `EmergencyRoutes.tsx` E5       | Removed `useLayoutEffect` that reset `riderSkipped`                              |
| `EmergencyRoutes.tsx` R0       | Redirect to E0 when `riderSkipped`                                               |
| `EmergencyRoutes.tsx` wildcard | Redirect to E0 when `riderSkipped` or no rider entitlement                       |

**Unchanged business rules:**

- R0 skip still sets `riderSkipped: true`
- Rider remains optional
- User can still add riders later from E5 if they did **not** skip (via `goToRiderSetup`)

---

## Flow verification

| Flow     | Plan                  | Skip rider → add contact → E5 Continue | Expected               |
| -------- | --------------------- | -------------------------------------- | ---------------------- |
| Purchase | Secure/Shield + rider | Yes                                    | → `/journey/completed` |
| Prepaid  | Plan + rider          | Yes                                    | → completed            |
| B2B2C    | plan-rider            | Yes                                    | → completed            |
| Purchase | Secure + rider        | No skip, riders owed                   | → R0/R1 rider setup    |

| Back navigation after skip | Expected                              |
| -------------------------- | ------------------------------------- |
| E0 Back                    | Flow back (R10 for purchase) — not R0 |
| E5 Back                    | E0 contacts-empty                     |

---

## Verdict

**FIXED** — `riderSkipped` is honoured across Purchase, Prepaid, and B2B2C. No rider loop after explicit skip.
