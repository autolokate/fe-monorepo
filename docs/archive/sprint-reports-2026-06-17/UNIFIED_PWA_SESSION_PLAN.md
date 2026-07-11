# Unified PWA Session Plan

**Date:** 2026-06-17  
**Scope:** Plan only — no implementation  
**Parent:** [UNIFIED_PWA_MIGRATION_AUDIT.md](./UNIFIED_PWA_MIGRATION_AUDIT.md)

---

## Objective

Define how to achieve **one session** for Autolokate PWA without breaking Purchase, Prepaid, B2B2C, Emergency, or PWA Scanner — while resolving schema conflicts, storage quota risks, and field collisions.

---

## Current state

| Store | Key | Schema | Persistence file |
|-------|-----|--------|------------------|
| Journey | `al-journey-v1` (sessionStorage) | `PersistedJourneyState` | `journey/persistence.ts` |
| Journey flow | `al-selected-flow` (localStorage) | `ActivationFlowId` | `journey/persistence.ts` |
| PWA | `al-pwa-scan-v1` (sessionStorage) | `PwaScanSession` | `post-activation-pwa/storage/pwa-scan-storage.ts` |
| Theme | `al-qr-theme` (localStorage) | `'light' \| 'dark'` | App root |

**No cross-reads.** Journey code never reads `al-pwa-scan-v1`. PWA code never reads `al-journey-v1`.

---

## Why naive single-key merge is blocked

| Issue | Detail |
|-------|--------|
| **Photo quota** | PWA stores base64 images in session; journey session is JSON-only. Merging triggers `QuotaExceededError` during activation. |
| **Field collisions** | `mobile`, name fields, vehicle plate exist in both with different semantics. |
| **Auth model** | Journey: `authStatus` + nested `auth`. PWA: flat `verified` + `mobile`. |
| **Size** | PWA session can exceed 5MB sessionStorage limit; journey session is ~KB. |

---

## Target architecture — sliced unified session

### Recommended schema (conceptual)

```typescript
// Version 2 — future key: al-autolokate-v2
type AutolokatePersistedState = {
  version: 2;

  // Activation domain (maps from PersistedJourneyState)
  activation: {
    selectedFlow: ActivationFlowId | null;
    authStatus: AuthStatus;
    session: JourneySession; // unchanged shape
  };

  // Scanner domain (maps from PwaScanSession minus photos)
  scanner: {
    session: PwaScanSessionCore; // photos extracted
  };
};
```

### Photo extraction (required)

```typescript
// Separate storage — not in main session blob
type PwaPhotoStore = {
  parkMePhotos: PwaParkMePhotos;
  sosPhotos: PwaSosPhotos;
};

// Keys (future):
// al-autolokate-v2        — main state (no base64)
// al-autolokate-photos-v1 — IndexedDB preferred, or sessionStorage fallback
```

**Rationale:** `pwa-scan-storage.ts` already estimates photo bytes and handles quota. Main session merge must not regress this.

---

## Slice ownership

| Slice | Source schema | Owner module | Never written by |
|-------|---------------|--------------|------------------|
| `activation.session.auth` | `AuthSession` | shared-auth | PWA routes |
| `activation.session.vehicle` | `VehicleSession` | qr-purchase | PWA (except explicit cross-flow — none today) |
| `activation.session.purchase` | `PurchaseCheckoutSession` | qr-purchase | PWA |
| `activation.session.prepaid` | `PrepaidLandingSession` | qr-prepaid | PWA |
| `activation.session.b2b2c` | `B2b2cLandingSession` | qr-b2b2c | PWA |
| `activation.session.emergency` | `EmergencySession` | emergency | PWA |
| `scanner.session.*` | `PwaScanSession` | post-activation-pwa | Activation routes |
| `photos.*` | Photo blobs | post-activation-pwa | Activation routes |

---

## Auth slice — do NOT unify fields

Owner and bystander auth must remain **separate namespaces** even in one session document.

| Concept | Activation path | Scanner path |
|---------|---------------|--------------|
| Mobile | `activation.session.auth.mobile` | `scanner.session.mobile` |
| Name | `activation.session.auth.ownerName` | `scanner.session.name` |
| Verified | `activation.authStatus` + `auth.otpVerified` | `scanner.session.verified` |
| Consent | `activation.session.auth.consentAccepted` | `scanner.session.consentAccepted` |

**Rule:** Shared A1/A2/A3 screens receive values via props from the correct slice. Never write bystander mobile into `auth.mobile`.

---

## Vehicle slice — three contexts preserved

| Context | Location | Used when |
|---------|----------|-----------|
| Owner activation vehicle | `activation.session.vehicle` | R03–R05 purchase, prepaid/b2b2c seed |
| Scanned vehicle (QR target) | `scanner.session.scannedVehicle` | PWA vehicle hub |
| Reporter vehicle (Park Me) | `scanner.session.reporterPlate` etc. | Bystander's own vehicle |

**Do not collapse** into single `vehicle` object.

---

## Emergency slice — two domains preserved

| Domain | Location | Actor |
|--------|----------|-------|
| Owner emergency setup | `activation.session.emergency` | Vehicle owner during activation |
| Bystander SOS dispatch | `scanner.session.sosStatus`, `sosPhotos`, `location` | QR scanner |

Journey `EmergencySession` (contacts, riders) and PWA SOS state serve different lifecycles. Unified session document may contain both slices; **must not merge types**.

---

## Migration strategy

### Step S0 — No change (current)

Keep `al-journey-v1` + `al-pwa-scan-v1`. Provider nested mount only.

### Step S1 — Unified key, dual-write

| Action | Detail |
|--------|--------|
| Introduce `al-autolokate-v2` | New key with sliced shape |
| Dual-write | On every save, write both v2 and legacy keys |
| Read priority | v2 if present, else hydrate from legacy |
| Photos | Still in separate store from day one of S1 |

**Rollback:** Delete v2 key; legacy keys untouched.

### Step S2 — Dual-read, single-write to v2

| Action | Detail |
|--------|--------|
| Read | v2 primary, legacy fallback |
| Write | v2 + photo store only |
| Legacy | Read-only fallback for one release |

### Step S3 — Legacy deprecation

| Action | Detail |
|--------|--------|
| Stop writing | `al-journey-v1`, `al-pwa-scan-v1` |
| Migration on boot | One-time copy legacy → v2 if v2 missing |
| Keep | `al-selected-flow` in localStorage (or move to `activation.selectedFlow` only) |

### Step S4 — Remove legacy keys

After telemetry confirms no legacy reads.

---

## Hydration mapping

### From `al-journey-v1`

```
PersistedJourneyState → activation: {
  selectedFlow,
  authStatus,
  session
}
```

### From `al-pwa-scan-v1`

```
PwaScanSession → scanner.session: { ...fields except photos if extracted }
photos → al-autolokate-photos-v1
```

### Default hydration

| Slice | Default when missing |
|-------|---------------------|
| activation | `{ selectedFlow: null, authStatus: 'pending', session: {} }` |
| scanner | `defaultPwaScanSession()` |

---

## Persistence API (future)

```typescript
// Conceptual
loadAutolokateState(): AutolokatePersistedState;
saveActivationSlice(patch: Partial<PersistedJourneyState>): void;
saveScannerSlice(patch: PwaSessionPatch): SavePwaScanSessionResult;
savePhotos(store: PwaPhotoStore): SavePwaScanSessionResult;
clearActivationSlice(): void;  // maps to clearJourney
clearScannerSlice(): void;     // maps to resetSession
```

**Compatibility:** Existing `saveJourneyState` / `savePwaScanSession` become thin wrappers during S1–S2.

---

## Storage key plan

| Key | Phase | Contents |
|-----|-------|----------|
| `al-journey-v1` | S0–S2 legacy | Full journey state |
| `al-pwa-scan-v1` | S0–S2 legacy | Full PWA state incl. photos |
| `al-selected-flow` | All phases | Selected activation flow |
| `al-autolokate-v2` | S1+ | Sliced unified state (no photos) |
| `al-autolokate-photos-v1` | S1+ | Park Me + SOS photos |
| `al-qr-theme` | All phases | Theme (unchanged) |

---

## Session conflict resolution rules

| Conflict | Resolution |
|----------|------------|
| Same user activates then scans | Slices coexist; activation slice read-only during scan unless explicit "owner mode" |
| `clearJourney()` on completed | Clears activation slice only |
| `resetSession()` in PWA | Clears scanner slice + photos only |
| User returns to `/journey` after PWA | Activation slice intact in storage; provider remount reloads from v2 |
| QR entry after partial activation | Activation slice resumes; scanner slice empty until scan flow |

---

## Business rule preservation

These functions read `JourneySession` — **shape must not change**:

| Function | File |
|----------|------|
| `getPostAuthActivationPath()` | `journey/activation-routing.ts` |
| `getEmergencyHandoffPath()` | `journey/activation-routing.ts` |
| `getPurchasePostPaymentEmergencyPath()` | `journey/activation-routing.ts` |
| `applyLandingEntitlementToSession()` | `features/b2b-shared/apply-landing-entitlement.ts` |
| `shouldEnterRiderPrompt()` | `features/emergency/emergency-limits.ts` |
| `RequireSelectedFlowMatch` | `journey/guards/JourneyRouteGuards.tsx` |

**Rule:** `JourneySession` type remains stable inside `activation.session`. Unified session wraps it; does not flatten it.

---

## PWA-specific preservation

| Behavior | Depends on |
|----------|------------|
| Photo quota error UI | `storageError` from photo save |
| `pendingFlow` resume after verify | `scanner.session.pendingFlow` |
| Demo vehicle seed | `defaultPwaScanSession().scannedVehicle` |
| `bootstrapComplete` gate | `scanner.session.bootstrapComplete` |
| `simulateNetworkFail` demo | `scanner.session.simulateNetworkFail` |

---

## Testing checklist (when implemented)

- [ ] Legacy hydration: existing `al-journey-v1` users resume purchase mid-checkout
- [ ] Legacy hydration: existing `al-pwa-scan-v1` users resume SOS mid-flow
- [ ] Photo persistence survives v1 → v2 migration
- [ ] Quota error still surfaces on photo capture, not on auth mobile entry
- [ ] `clearJourney` leaves scanner photos intact
- [ ] `resetSession` leaves activation auth intact
- [ ] Prepaid entitlement seed survives slice write
- [ ] B2B2C variant survives slice write
- [ ] Emergency riders/contacts survive slice write

---

## Verdict for session plan

| Approach | Verdict |
|----------|---------|
| Keep dual keys indefinitely | ✅ SAFE — current state |
| Sliced v2 + photo extraction + dual-write migration | ✅ SAFE TO MERGE (phased) |
| Single key, inline photos, flat fields | ❌ NOT SAFE TO MERGE |
| Merge owner/bystander auth fields | ❌ NOT SAFE TO MERGE |
| Change `JourneySession` shape | ❌ NOT SAFE TO MERGE |

**Prerequisite for provider P2:** Photo extraction (S1) must ship before or with merged context.
