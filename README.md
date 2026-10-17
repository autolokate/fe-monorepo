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
`autolokate-frontend-service` ECS service to become stable. It also builds admin and QR and syncs
their static output to separate private S3 buckets, then invalidates their CloudFront distributions.
The website continues to run on ECS Fargate behind its CloudFront distribution; admin and QR are
served from private S3 buckets through their CloudFront distributions. Access all three apps using
the HTTPS URLs from Terraform:

```bash
cd infra_latest/dev
terraform output -json frontend_urls
```

Direct S3 URLs are expected to return Access Denied. The workflow invalidates admin and QR after
publishing their new files. The website distribution has caching disabled, so ECS deployments do not
require CloudFront invalidation.

Configure these repository Actions variables before deploying:

| Variable                        | Purpose                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- |
| `AWS_DEV_DEPLOY_ROLE_ARN`       | Terraform `github_dev_deployer_role_arn` output for AWS OIDC access     |
| `AWS_DEV_SITE_URL`              | Public website URL embedded in the website build                        |
| `AWS_DEV_API_BASE_URL`          | Development API base URL embedded in the website, admin, and QR builds  |
| `AWS_DEV_RAZORPAY_KEY_ID`       | Optional publishable Razorpay key embedded in the website and QR builds |
| `AWS_DEV_ADMIN_BUCKET`          | Terraform `frontend_bucket_names.admin` output                          |
| `AWS_DEV_QR_BUCKET`             | Terraform `frontend_bucket_names.qr` output                             |
| `AWS_DEV_ADMIN_DISTRIBUTION_ID` | Terraform `frontend_distribution_ids.admin` output                      |
| `AWS_DEV_QR_DISTRIBUTION_ID`    | Terraform `frontend_distribution_ids.qr` output                         |

Set the bucket and distribution variables to the corresponding values from the
`frontend_bucket_names` and `frontend_distribution_ids` Terraform outputs in `infra_latest/dev`.
Use the `github_dev_deployer_role_arn` output for `AWS_DEV_DEPLOY_ROLE_ARN`. The deploy role needs
website ECR push and ECS redeployment permissions, `s3:ListBucket`, `s3:PutObject`, `s3:GetObject`,
and `s3:DeleteObject` permissions on the admin and QR buckets, and
`cloudfront:CreateInvalidation` on both distributions. The workflow uses the existing website
Dockerfile at `apps/website/Dockerfile`; it does not build or deploy the website as a static S3 site.
