# Post-Activation PWA — Route Graph

**Base:** `/pwa/scan`  
**Provider:** `PwaScanProvider` (isolated from `JourneyProvider`)

---

## Complete route graph

```mermaid
flowchart TD
  ENTRY["/journey card OR /pwa/scan/*"] --> L01["/pwa/scan/loading"]
  L01 --> L02["/pwa/scan/vehicle"]

  L02 -->|Park Me| PM06["/pwa/scan/park-me/vehicle-number"]
  L02 -->|Emergency| SOS14["/pwa/scan/sos"]

  subgraph verify [Bystander verify — if not verified]
    L02 --> V03["/pwa/scan/verify/mobile"]
    V03 --> V04["/pwa/scan/verify/otp"]
    V04 --> V05["/pwa/scan/verify/name"]
    V05 --> L02
  end

  subgraph parkMe [Park Me]
    PM06 --> PM07["/pwa/scan/park-me/looking-up"]
    PM07 --> PM08["/pwa/scan/park-me/confirm"]
    PM07 --> PM08b["/pwa/scan/park-me/confirm-protected"]
    PM08 --> PM09a["/pwa/scan/park-me/permissions"]
    PM08b --> PM09a
    PM09a --> PM09["/pwa/scan/park-me/photos"]
    PM09 --> PM09b["/pwa/scan/park-me/review"]
    PM09b --> PM10["/pwa/scan/park-me/status/checking"]
    PM10 --> PM11["/pwa/scan/park-me/status/calling"]
    PM11 --> PM12["/pwa/scan/park-me/status/resolved"]
    PM10 --> PM13["/pwa/scan/park-me/photo-not-clear"]
    PM13 --> PM09
  end

  subgraph sos [SOS]
    SOS14 --> SOS14b["/pwa/scan/sos/holding"]
    SOS14 --> SOS14c["/pwa/scan/sos/allow-location"]
    SOS14 --> SOS14d["/pwa/scan/sos/leave-confirm"]
    SOS14b --> SOS15["/pwa/scan/sos/scene-photos"]
    SOS15 --> SOS15b["/pwa/scan/sos/scene-photos/captured"]
    SOS15b --> SOS17["/pwa/scan/sos/sending"]
    SOS17 --> SOS19["/pwa/scan/sos/help-received"]
    SOS19 --> SOS20["/pwa/scan/sos/help-dispatched"]
    SOS20 --> SOS21["/pwa/scan/sos/resolved"]
    SOS16["/pwa/scan/sos/location-unavailable"] --> SOS23["/pwa/scan/sos/contacts-only"]
    SOS18["/pwa/scan/sos/couldnt-send"] --> SOS17
    SOS17 --> SOS22["/pwa/scan/sos/alert-cancelled"]
    SOS22 --> L02
  end
```

---

## SOS journey (state machine)

```mermaid
stateDiagram-v2
  [*] --> VehicleFound
  VehicleFound --> SOSIdle: Emergency card
  SOSIdle --> SOSHolding: Long-press
  SOSHolding --> ScenePhotos: Release complete
  ScenePhotos --> Sending: Send
  Sending --> HelpReceived: Success
  HelpReceived --> Dispatched: Auto advance
  Dispatched --> Resolved: Auto advance
  Sending --> CouldntSend: Network fail
  CouldntSend --> Sending: Retry
  SOSIdle --> LocationUnavailable: GPS blocked
  LocationUnavailable --> ContactsOnly: Fallback
  Sending --> AlertCancelled: Cancel
  AlertCancelled --> VehicleFound: Done
  Resolved --> [*]
```

---

## Park Me journey (state machine)

```mermaid
stateDiagram-v2
  [*] --> VehicleFound
  VehicleFound --> ReporterPlate: Park Me card
  ReporterPlate --> LookingUp: Continue
  LookingUp --> ConfirmPlain: Non-consumer
  LookingUp --> ConfirmProtected: Consumer match
  ConfirmPlain --> Permissions
  ConfirmProtected --> Permissions
  Permissions --> TakePhotos
  TakePhotos --> Review
  Review --> StatusChecking: Send
  StatusChecking --> StatusCalling
  StatusCalling --> StatusResolved
  StatusChecking --> PhotoNotClear: QC fail
  PhotoNotClear --> TakePhotos: Retake
  StatusResolved --> [*]
```

---

## Path constants

Defined in `apps/qr/src/features/post-activation-pwa/constants/pwa-scan-paths.ts`

---

## Orchestrator wiring

```
BrowserRouter
├── /pwa/scan/*  → PwaScanRoutes (PwaScanProvider)
└── /*           → JourneyProvider → JourneyRoutes
```

Onboarding routes under `/journey/*` are **unchanged**.
