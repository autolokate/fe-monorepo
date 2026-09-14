# Milestone M0 — Reproducible Foundation Report

**Date:** 2026-08-30  
**Status:** Complete with documented external prerequisites

## Goal and scope

Establish the required Node/pnpm runtime, reconcile the frozen dependency graph, make typechecking and tests discoverable from the root, rebuild shared package declarations, and obtain a trustworthy baseline without changing product behavior.

Affected areas: root workspace/tooling, all shared packages, and verification entry points for website, QR, admin, and UI preview.

## Existing behavior

- `.nvmrc` required Node 24 but the machine only had Node 22.19.0 active.
- pnpm 11.10.0 was correct, but the installed dependency tree did not match the current workspace configuration.
- The staged pnpm build policy ignored required postinstall scripts, causing `ERR_PNPM_IGNORED_BUILDS`.
- Root scripts did not expose typecheck, test, or a combined verification workflow.
- UI preview had no typecheck script.
- Shared `dist` declarations were stale, producing misleading admin missing-export errors.

## Implemented

1. Installed and validated Node 24.20.0 through nvm; `.nvmrc` remains `24`.
2. Completed `CI=true pnpm install --frozen-lockfile` with pnpm 11.10.0. The lockfile was verified and not rewritten.
3. Corrected the pnpm 11 strict build allowlist for `@firebase/util`, `esbuild`, `protobufjs`, `sharp`, and `unrs-resolver`.
4. Added root scripts:
   - `typecheck`
   - `test` / `test:qr`
   - `test:admin:e2e`
   - `verify`
5. Added `typecheck` to `@autolokate/ui-preview`.
6. Rebuilt all shared packages before app validation, eliminating stale declaration failures.
7. Installed the matching Playwright Chromium used by the existing QR integration harness.

No route, UI, API contract, business rule, token behavior, or product feature was changed.

## Validation evidence

| Check                 | Result                                | Evidence/notes                                                                                                                                                      |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime               | PASS                                  | Node 24.20.0; pnpm 11.10.0.                                                                                                                                         |
| Frozen install        | PASS                                  | 797 packages; supply-chain policy checked 929 lockfile entries; required postinstalls completed.                                                                    |
| Typecheck             | PASS                                  | 12/12 Turbo tasks successful across every app with a typecheck plus dependency builds.                                                                              |
| Lint                  | PASS                                  | 22/22 Turbo tasks successful.                                                                                                                                       |
| QR integration test   | PASS                                  | FID registration harness: 20/20 checks, including late FID, rotation, never-arrives, and unregistration cases.                                                      |
| Shared package builds | PASS                                  | Config, types, utils, design-system, icons, brand, auth, UI, and API client.                                                                                        |
| Admin build           | PASS                                  | Vite production output generated.                                                                                                                                   |
| QR build              | PASS                                  | Vite/PWA production output and service worker generated.                                                                                                            |
| UI preview build      | PASS                                  | Vite production output generated.                                                                                                                                   |
| Website build         | PASS                                  | Next.js compiled, typechecked, generated 44 static pages, and emitted route traces.                                                                                 |
| Root aggregate build  | PARTIAL COMMAND / COMPLETE WORKSPACES | 13/14 tasks completed in the aggregate run; it was interrupted after the sandbox blocked Google font downloads. Website then passed separately with network access. |
| Admin E2E             | NOT RUN                               | Requires a running API/admin environment and test credentials/tokens.                                                                                               |

## Measured build baseline

- QR main JavaScript: 1,564.68 kB / 402.96 kB gzip.
- QR CSS: 197.62 kB / 27.87 kB gzip.
- QR PWA precache: 38 entries / 1,766.01 KiB.
- Admin entry JavaScript: 517.83 kB / 158.68 kB gzip.
- UI preview JavaScript: 639.06 kB / 191.16 kB gzip.
- SOS audio copied into QR, admin, and UI preview builds: 3,528.04 kB.
- Website shared first-load JavaScript: 259 kB; `/purchase` reaches 317 kB first load.
- Next emitted an ESLint integration warning because its plugin was not detected by the website build, although the root lint command passed.
- QR emitted the known `lottie-web` `eval` security/minification warning.

These measurements are build output sizes, not Core Web Vitals or runtime performance results.

## Files changed by M0

- `package.json`
- `apps/ui-preview/package.json`
- `pnpm-workspace.yaml` (only the required build-policy correction overlaps a pre-existing workspace edit)
- This report

The audit document remains at `docs/PLATFORM_ARCHITECTURE_AUDIT_2026-08-30.md`. Pre-existing edits in QR API timeout handling, UI preview CSS, and Next configuration were preserved.

## Environment and operational prerequisites

- Contributors and CI must activate Node 24 before pnpm commands (`nvm use` or equivalent).
- A fresh verification requires dependency-registry access.
- The website currently needs network access to download Inter and Plus Jakarta Sans during `next/font` compilation. Self-hosting these fonts should be considered for hermetic builds.
- Browser integration tests require the matching Playwright browser install and permission to bind localhost ports.
- Admin E2E additionally requires its documented API URL, app URL, and credentials/token environment.

## Remaining issues

1. Bundle and media budgets are not met; QR and UI preview exceed Vite's 500 kB warning threshold, and the SOS WAV is 3.53 MB.
2. The website's shared first-load JavaScript is high for public routes.
3. No unit-test framework/suites exist; root `test` currently represents the only self-contained QR integration harness.
4. Admin E2E is not self-contained and was not executed.
5. Accessibility, Lighthouse, responsive visual, and real-device tests remain for later milestones.
6. `apps/onboarding` is empty and currently matched by `apps/*`, but without a package manifest it is not included as a pnpm project. Its removal/exclusion can wait for proven cleanup ownership.

## Architectural decisions

- Keep package `dist` exports and Turbo dependency builds for now; replacing this with source-path development exports is a separate reviewed change.
- Keep strict pnpm build-script default denial with a small explicit allowlist.
- Do not make production builds pretend to be green when external fonts or browser binaries are unavailable; document and provision those dependencies.
- Do not add an empty Turbo `test` task that would report success without running tests.

## Acceptance result and next milestone

M0 acceptance is met: the required runtime and frozen dependency graph are reproducible, current source typechecks and lints cleanly, every production workspace builds, and the available self-contained integration suite passes.

Recommended next milestone: **M1 — Contract and boundary consolidation**, beginning with an exhaustive endpoint/client inventory and compatibility tests, then moving the website's duplicated endpoint and transport ownership into `@autolokate/api-client` one domain at a time.
