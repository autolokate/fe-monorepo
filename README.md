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

| App     | Command                                 | Notes                                    |
| ------- | --------------------------------------- | ---------------------------------------- |
| QR PWA  | `pnpm --filter @autolokate/qr dev`      | API URL in `apps/qr/.env.development`    |
| Admin   | `pnpm --filter @autolokate/admin dev`   | API URL in `apps/admin/.env.development` |
| Website | `pnpm --filter @autolokate/website dev` |                                          |

**Staging QR PWA:** https://qr-staging.autolokate.com/

## Scripts

| Command      | Description                          |
| ------------ | ------------------------------------ |
| `pnpm dev`   | Run dev servers across the workspace |
| `pnpm build` | Build all packages and apps          |
| `pnpm lint`  | Lint all packages and apps           |
| `pnpm clean` | Clean build artifacts                |

## Development deployment

Pushing or merging to `dev` runs
[`.github/workflows/deploy-dev.yml`](.github/workflows/deploy-dev.yml), which builds the website
image, pushes it to the `autolokate-frontend` ECR repository, and waits for the
`autolokate-frontend-service` ECS service to become stable.

Configure these repository Actions variables before deploying:

| Variable                           | Purpose                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `AWS_DEV_FRONTEND_DEPLOY_ROLE_ARN` | Terraform `github_dev_frontend_deployer_role_arn` output for AWS OIDC access |
| `AWS_DEV_SITE_URL`                 | Public website URL embedded in the website build                            |
| `AWS_DEV_API_BASE_URL`             | Development API base URL embedded in the website build                      |
| `AWS_DEV_RAZORPAY_KEY_ID`          | Optional publishable Razorpay key embedded in the website build             |
