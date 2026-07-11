# Real Device Evidence Report

**Date:** 2026-06-21  
**Target:** `https://onboarding-lemon-six.vercel.app`  
**References:** `REAL_DEVICE_SIGNOFF_V2.md`, `IOS_INSTALL_REPORT.md`, `IOS_CONTACT_PICKER_REPORT.md`, `RIDER_LOOP_FIX_REPORT.md`  
**Auditor:** Static / remote checks only — **no physical devices connected in this session**

---

## Evidence policy

Per release criteria:

- **FIXED / PASS** requires: screenshot or video + device name + OS version + browser version
- **This session produced:** none of the above
- Desktop browser automation or viewport emulation **does not** satisfy the device matrix

---

## Device matrix execution status

| Device / Browser | Available in session | Tests executed | Evidence attached |
|------------------|---------------------|----------------|-------------------|
| Android Chrome | ❌ No | ❌ None | ❌ None |
| Samsung Internet | ❌ No | ❌ None | ❌ None |
| iPhone Safari | ❌ No | ❌ None | ❌ None |
| iPhone Chrome | ❌ No | ❌ None | ❌ None |

---

## Remote static checks (not device evidence)

These were run against production URL only. They **do not** validate install, picker, rider loop, or visual QA on hardware.

| Check | Result | Timestamp (UTC) |
|-------|--------|-----------------|
| `GET /journey` | HTTP 200 | 2026-06-21 |
| `GET /manifest.webmanifest` | HTTP 200 | 2026-06-21 |
| Production JS bundle | `index-D1UH5oZ4.js` (~1.1 MB) | 2026-06-21 |
| Bundle string scan | Contains minified refs to `PwaIosSafariInstallBanner`, `riderSkipped` | 2026-06-21 |

**Limitation:** String presence in a minified bundle does not prove runtime behaviour on any device.

---

## Test-by-test status

### TEST 1 — Install experience (Android Chrome)

| Step | Status | Evidence |
|------|--------|----------|
| Install App CTA | **NOT RUN** | — |
| Launch from icon | **NOT RUN** | — |
| Kill app → reopen | **NOT RUN** | — |
| Standalone mode | **NOT RUN** | — |
| No browser chrome | **NOT RUN** | — |
| Theme persistence | **NOT RUN** | — |
| Session persistence | **NOT RUN** | — |

---

### TEST 2 — iPhone Safari (A2HS + flows)

| Step | Status | Evidence |
|------|--------|----------|
| Add to Home Screen guidance | **NOT RUN** | — |
| Add to Home Screen | **NOT RUN** | — |
| Launch from icon | **NOT RUN** | — |
| Safe areas | **NOT RUN** | — |
| Keyboard | **NOT RUN** | — |
| OTP | **NOT RUN** | — |
| Camera | **NOT RUN** | — |
| Location | **NOT RUN** | — |

---

### TEST 3 — iPhone Chrome (install UX)

| Step | Status | Evidence |
|------|--------|----------|
| No Android install banner | **NOT RUN** | — |
| Correct Safari guidance sheet | **NOT RUN** | — |
| No dead CTA | **NOT RUN** | — |
| No broken links | **NOT RUN** | — |

---

### TEST 4 — Emergency contact flow

| Step | Android Chrome | iPhone Safari |
|------|----------------|---------------|
| Native contact picker | **NOT RUN** | N/A (fallback expected) |
| Mobile auto-filled + editable | **NOT RUN** | **NOT RUN** |
| OTP path | **NOT RUN** | **NOT RUN** |
| Name auto-filled + editable | **NOT RUN** | **NOT RUN** |
| No loops / duplicate nav | **NOT RUN** | **NOT RUN** |

---

### TEST 5 — Rider flow (Purchase / Prepaid / B2B2C)

| Flow | Skip → contact → completed | No R0 return | Evidence |
|------|---------------------------|--------------|----------|
| Purchase | **NOT RUN** | **NOT RUN** | — |
| Prepaid | **NOT RUN** | **NOT RUN** | — |
| B2B2C | **NOT RUN** | **NOT RUN** | — |

---

### TEST 6 — Visual QA (393px, dark/light)

| Item | Status | Evidence |
|------|--------|----------|
| Consent checkbox alignment | **NOT RUN** | — |
| OTP boxes | **NOT RUN** | — |
| Back button spacing | **NOT RUN** | — |
| Title spacing | **NOT RUN** | — |
| Input active state | **NOT RUN** | — |
| No clipping / overflow / jumps | **NOT RUN** | — |

---

## Code vs device gap

Prior sprint reports (`REAL_DEVICE_SIGNOFF_V2.md`, `IOS_*`, `RIDER_LOOP_*`) document **code-level fixes** with device QA marked **pending**. This session **did not close that gap**.

| Prior report claim | Device evidence in repo |
|--------------------|-------------------------|
| iOS contact picker FIXED | ❌ No screenshots/videos |
| Rider loop FIXED | ❌ No screenshots/videos |
| iOS install FIXED | ❌ No screenshots/videos |

---

## Evidence required to upgrade status

For each device in the matrix, attach:

1. **Device name** (e.g. Pixel 8, iPhone 15 Pro)
2. **OS version** (e.g. Android 14, iOS 18.x)
3. **Browser + version** (e.g. Chrome 125, Safari 18, Samsung Internet 25)
4. **Screenshot or screen recording** per test step
5. **Date/time** of capture

Suggested folder: `docs/real-device-evidence/YYYY-MM-DD/{device-id}/`

---

## Verdict (this report)

# ISSUES FOUND

**Real device evidence does not exist for this release candidate.**  
All matrix tests remain **NOT RUN** in this audit session.  
**Do not mark FIXED or RELEASE READY** until hardware evidence is attached.
