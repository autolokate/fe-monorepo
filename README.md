# Autolokate Web

Monorepo for Autolokate web applications and shared packages.

## Structure

```
autolokate-web/
├── apps/
│   ├── qr/           # QR PWA — consumer activation, purchase, SOS, Park Me
│   ├── website/      # Marketing / public website
│   ├── admin/        # Internal admin dashboard
│   └── ui-preview/   # Design system preview
├── packages/         # Shared libraries (ui, api-client, auth, design-system, …)
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+

## Getting started

```bash
pnpm install
```

## Local development

| App | Command | Notes |
|-----|---------|-------|
| QR PWA | `pnpm --filter @autolokate/qr dev` | API URL in `apps/qr/.env.development` |
| Admin | `pnpm --filter @autolokate/admin dev` | API URL in `apps/admin/.env.development` |
| Website | `pnpm --filter @autolokate/website dev` | |

**Staging QR PWA:** https://qr-staging.autolokate.com/

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run dev servers across the workspace |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages and apps |
| `pnpm clean` | Clean build artifacts |
