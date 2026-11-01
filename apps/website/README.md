# Autolokate — Frontend

Web app for **Autolokate**, an automotive discovery and marketplace experience. Users can explore **cars** and **bikes**, browse brands and models, open detailed model pages, **compare** variants, manage their **profile**, book sessions, and use marketing pages (home, media, how-qr-works, about, contact, and more). The UI talks to the **Autolokate backend API** for catalogue data, auth, and related features.

## Requirements

- **Node.js** 20+ recommended (matches `@types/node` in the project)
- **npm**, **pnpm**, **yarn**, or **bun** (examples below use `npm`)

## How to run

1. **Install dependencies**

   ```bash
   cd autolokate-fe
   npm install
   ```

2. **Environment variables**

   Copy the example file and adjust if needed:

   ```bash
   cp .env.example .env.local
   ```

   | Variable                              | Purpose                                                                                                                          |
   | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
   | `NEXT_PUBLIC_SITE_URL`                | Public site origin (canonical URLs, metadata). Example: `http://localhost:3000`                                                  |
   | `NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL` | Backend API base URL. **Required for `next build`** (the build fails if unset); `next dev` falls back to `http://localhost:8080` |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID`         | _(Unused)_ the `/buy` checkout takes the Razorpay key from the backend pay response                                              |

3. **Development server** (uses [Turbopack](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack))

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Production build**

   ```bash
   npm run build
   npm start
   ```

5. **Lint**

   ```bash
   npm run lint
   ```

## Tech stack

| Area                   | Choice                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Framework              | [Next.js 15](https://nextjs.org/) (App Router)                                        |
| UI library             | [React 19](https://react.dev/)                                                        |
| Language               | [TypeScript](https://www.typescriptlang.org/)                                         |
| Styling                | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/postcss`)                  |
| Components             | [Radix UI](https://www.radix-ui.com/) primitives (accordion, dialog, tabs, etc.)      |
| Icons                  | [Lucide React](https://lucide.dev/)                                                   |
| HTTP client            | Shared `@autolokate/api-client` (fetch) + `@autolokate/auth` TokenManager — see below |
| Utilities              | `clsx`, `tailwind-merge`, `class-variance-authority`; **date-fns**                    |
| Toasts                 | [Sonner](https://sonner.emilkowal.ski/)                                               |
| Calendar / dates in UI | **react-day-picker**                                                                  |
| Tooling                | ESLint 9 + `eslint-config-next`                                                       |

Architecturally, pages live under `src/app`, shared UI under `src/components`, API modules under `src/services`, and domain helpers under `src/lib` and `src/hooks`.

## Folder structure (`src/`)

High-level map of how the repo is organized:

```
src/
├── app/                    # Next.js App Router: routes, layouts, page-level composition
│   ├── layout.tsx          # Root layout
│   ├── styles/             # Global CSS
│   ├── home/               # Landing / home sections
│   ├── cars/ , bikes/      # Vehicle-type entry routes
│   ├── [vehicleType]/      # Dynamic routes: explore, brands, compare, etc.
│   ├── (private)/          # Auth-gated groups (e.g. login, signup, book-session)
│   ├── profile/            # User profile
│   ├── media/ , how-qr-works/ , about-us/ , contact-us/ …
│   └── …
├── components/             # Reusable UI
│   ├── ui/                 # Low-level primitives (button, card, tabs, …)
│   ├── catalogue/          # Explore, brand hub, model detail, etc.
│   ├── compare/            # Compare workspace and tooling
│   ├── shared/             # Cross-feature pieces (header-related, logos, …)
│   └── …
├── hooks/                   # React hooks (catalogue, auth, preferences, prices, booking, …)
├── layouts/                 # Layout shells (e.g. header)
├── lib/                     # Pure TS: API helpers, catalogue normalization, SEO, preferences, …
├── services/                # API layer over the shared client (auth, catalogue, prices, bookings, purchase, …)
├── providers/               # React context / providers
└── config/                  # Central config (e.g. env)
```

- **`app/`** — Each route (or route group) owns its `page.tsx` and often colocated `components/` and `config/` (metadata, copy).
- **`components/`** — Feature components that are reused across routes; `ui/` follows a design-system style for Radix + Tailwind pieces.
- **`hooks/`** — Data fetching and client behavior kept out of presentational components.
- **`lib/`** — Types, URL builders, compare matrix logic, deduped fetch cache, etc.
- **`services/`** — HTTP endpoints and response shaping close to the backend contract.

## API access & session model

- **One HTTP stack.** Every backend call goes through `src/lib/api/client.ts` — a thin facade over the
  shared `@autolokate/api-client` `ApiClient`. Paths for domains the shared client models (auth,
  profile, plans, cart, consents, legal, retail orders) come from its endpoint map; only
  website-only domains (catalogue, prices, taxonomy, contact, booking slots/bookings, addresses)
  are listed in `src/lib/api/endpoints.ts`.
- **One session.** `src/lib/session` holds the token pair in the shared `@autolokate/auth`
  `TokenManager`, backed by **sessionStorage** (the same model as Admin and the QR PWA). Login,
  profile, book-session and the `/buy` purchase journey all read it. On a 401 the client performs a
  single-flight `POST /v1/auth/refresh` with `{ refreshToken }`, stores the **rotated** pair, and
  replays the request once. Tokens are cleared only when the server rejects the refresh token.
- **No auth cookies.** Nothing server-rendered needs the session (every authenticated surface is a
  client component guarded with `useIsAuthenticated`), so there are no JS-readable cookies and no
  tokens in localStorage; the legacy stores are migrated/purged on first load. Trade-off: a session
  lasts for the tab (a new tab or browser restart asks for OTP again), which also avoids two tabs
  rotating the same refresh token and tripping the backend's reuse detection. If SSR ever needs the
  session, add a BFF route that keeps the refresh token in an **HttpOnly** cookie — do not bring
  back JS-readable cookies.
- **Auth contract.** `POST /v1/auth/otp/request`, `POST /v1/auth/otp/verify`, `POST /v1/auth/refresh`,
  `POST /v1/auth/logout`, `GET /v1/profiles`, `PATCH /v1/profile`.

### Product decisions recorded here

- **Book a session (`/book-session`).** The backend has slots (`/v1/booking-slots`) and bookings
  (`/v1/bookings/*`) but **no payment route** for sessions and no link to retail orders. The site
  therefore creates a booking request and shows the server status (PENDING → "Requested",
  CONFIRMED only when the server says so). No online payment step is shown until the backend has one.
- **QR purchase.** `/buy` → `/checkout/:cartId/*` → `/orders` is the only purchase flow; the legacy
  `/purchase` and `/my-orders` routes redirect there.
- **Public QR scan page (WEB-08).** Lives in `apps/qr`, not here. Kept as-is pending a product
  decision on masking the plate / hiding protection status; no website change.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Next.js deployment](https://nextjs.org/docs/app/building-your-application/deploying) (e.g. Vercel or any Node host)
