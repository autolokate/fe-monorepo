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

   | Variable                              | Purpose                                                                         |
   | ------------------------------------- | ------------------------------------------------------------------------------- |
   | `NEXT_PUBLIC_SITE_URL`                | Public site origin (canonical URLs, metadata). Example: `http://localhost:3000` |
   | `NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL` | Backend API base URL (defaults to staging in code if unset)                     |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID`         | _(Optional)_ Razorpay publishable key for **book session** / payment flows      |

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

| Area                   | Choice                                                                            |
| ---------------------- | --------------------------------------------------------------------------------- |
| Framework              | [Next.js 15](https://nextjs.org/) (App Router)                                    |
| UI library             | [React 19](https://react.dev/)                                                    |
| Language               | [TypeScript](https://www.typescriptlang.org/)                                     |
| Styling                | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/postcss`)              |
| Components             | [Radix UI](https://www.radix-ui.com/) primitives (accordion, dialog, tabs, etc.)  |
| Icons                  | [Lucide React](https://lucide.dev/)                                               |
| HTTP client            | [Axios](https://axios-http.com/) (via shared API service)                         |
| Utilities              | `clsx`, `tailwind-merge`, `class-variance-authority`; **date-fns**; **js-cookie** |
| Toasts                 | [Sonner](https://sonner.emilkowal.ski/)                                           |
| Calendar / dates in UI | **react-day-picker**                                                              |
| Tooling                | ESLint 9 + `eslint-config-next`                                                   |

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
├── services/                # API layer (axios wrappers, catalogue, taxonomy, prices, …)
├── providers/               # React context / providers
└── config/                  # Central config (e.g. env)
```

- **`app/`** — Each route (or route group) owns its `page.tsx` and often colocated `components/` and `config/` (metadata, copy).
- **`components/`** — Feature components that are reused across routes; `ui/` follows a design-system style for Radix + Tailwind pieces.
- **`hooks/`** — Data fetching and client behavior kept out of presentational components.
- **`lib/`** — Types, URL builders, compare matrix logic, deduped fetch cache, etc.
- **`services/`** — HTTP endpoints and response shaping close to the backend contract.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Next.js deployment](https://nextjs.org/docs/app/building-your-application/deploying) (e.g. Vercel or any Node host)
