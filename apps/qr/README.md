# @autolokate/qr

Consumer QR PWA — sticker scan entry, purchase activation, prepaid/B2B2C flows, and post-activation SOS / Park Me.

## Local dev

```bash
cp .env.example .env.development   # once
pnpm --filter @autolokate/qr dev
```

Open http://127.0.0.1:5173/journey/auth/mobile

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API (local: ngrok tunnel; staging: set in CI) |
| `VITE_RAZORPAY_KEY` | Razorpay test key for checkout |
| `VITE_ENVIRONMENT` | `development` \| `staging` \| `production` |

Staging deploy: https://qr-staging.autolokate.com/

## Package name

Previously referenced as `@autolokate/onboarding` / `apps/onboarding` — renamed to **`@autolokate/qr`** / **`apps/qr`**.
