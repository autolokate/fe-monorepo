# Input Validation Audit

**Scope:** Mobile number inputs + text selection (global)

## Mobile number — root cause

- No `maxLength` on any mobile field
- Auth formatted on change but did not **clamp** before 11th digit
- Emergency rider/contact routes passed raw `value` through

## Fix

### Shared utilities (`auth-flow.validation.ts`)

```typescript
MOBILE_DIGIT_MAX = 10
MOBILE_INPUT_DISPLAY_MAX = 11  // "12345 67890"

clampMobileInput(value)  // strips non-digits, slices to 10, formats
```

### Wired locations

| Surface | Route / screen | Input clamp | maxLength |
|---------|----------------|-------------|-----------|
| Auth A1 | `/journey/auth/mobile` | `clampMobileInput` in AuthRoutes | 11 |
| Emergency R1 | `/journey/emergency/rider-mobile` | `clampMobileInput` in EmergencyRoutes | 11 |
| Emergency E1 | `/journey/emergency/contact-mobile` | `clampMobileInput` in EmergencyRoutes | 11 |

### Files changed

| File | Change |
|------|--------|
| `features/shared-auth/auth-flow/auth-flow.validation.ts` | `clampMobileInput`, constants |
| `features/emergency/emergency.validation.ts` | Re-export helpers |
| `journey/routes/AuthRoutes.tsx` | Use clamp on change |
| `journey/routes/EmergencyRoutes.tsx` | Use clamp on change |
| `A1MobileScreen.tsx` | `maxLength={11}` |
| `E02RiderMobileScreen.tsx` | `maxLength={11}` |
| `E06ContactMobileScreen.tsx` | `maxLength={11}` |

## Text selection — root cause

Browser default selection highlight (opaque blue/gray) on dark-themed inputs.

## Fix

Global rules in `apps/qr/src/styles/screen-viewport.css`:

- `::selection` / `::-moz-selection` with `color-mix` focus token
- Input-specific overrides for auth mobile field
- Autofill selection text color preserved

## Before / after

| Before | After |
|--------|-------|
| User could type 11+ digits in emergency mobile fields | Input stops at 10 digits (11 chars formatted) |
| Auth allowed extra digits until submit normalization | Clamped on every keystroke |
| Blue/gray selection blocks on mobile input | Subtle theme-aware selection tint |

## Parity score

**Mobile validation:** 100% of active journey mobile inputs covered  
**Selection styling:** ~90% — native OTP cells may still use platform defaults

## Remaining drift

- Demo validator `isValidMobile` still requires exact `9999999999` (demo rule, not input length)
- Deprecated `R03MobileNumberScreen` not updated (dev-only)
- No shared `AlMobileField` primitive yet (future consolidation)
