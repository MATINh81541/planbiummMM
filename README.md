# PlanBium

Beautiful digital planners designed to make planning simple, enjoyable, and premium.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:5173.

## Build

```bash
npm run build
```

Production output is written to `dist/`.

## Other scripts

```bash
npm run typecheck   # TypeScript type checking (no emit)
npm run lint        # ESLint
npm run preview     # Preview the production build locally
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### Client-safe (prefixed with `VITE_`)

| Variable | Description |
|---|---|
| `VITE_APP_URL` | Public URL of the deployed app (e.g. `https://planbium.ir`). |
| `VITE_APP_ENV` | Environment name (`development` or `production`). |

### Server-only (used by edge functions, not exposed to the browser)

| Variable | Description |
|---|---|
| `ZARINPAL_MERCHANT_ID` | Zarinpal merchant ID. |
| `ZARINPAL_ENABLED` | Enable Zarinpal payments. |
| `SMTP_HOST` | SMTP server host. |
| `SMTP_PORT` | SMTP server port. |
| `SMTP_USERNAME` | SMTP username. |
| `SMTP_PASSWORD` | SMTP password. |
| `SMTP_FROM` | From address for outgoing email. |
| `STORAGE_BUCKET` | Storage bucket name for downloadable assets. |
| `APP_URL` | Server-side app URL. |
| `APP_ENV` | Server-side environment name. |

## Folder structure

```
public/                  Static assets (favicon, logo)
src/
  components/            Reusable UI components (header, footer, cards, etc.)
  components/ui/         Primitive UI building blocks (Button, Container, GlassCard)
  hooks/                 React hooks (useCatalog, useDocumentTitle, etc.)
  layouts/               Page layouts (PublicLayout, DashboardLayout, AdminLayout)
  lib/
    auth/                Route guards and auth context
    config/              Environment, locales, countries, payment regions
    i18n/                Translations and locale context
    services/            Client-side service layer (catalog, cart, checkout, etc.)
  pages/                 Route components (public, dashboard, admin)
  pages/admin/           Admin-only pages
supabase/
  migrations/            Database schema migrations
  functions/             Edge functions (checkout, payment, download, admin, webhook)
```
