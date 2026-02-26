# EComPrime - Next.js E-Commerce + Admin Dashboard

A complete, production-structured e-commerce scaffold built with Next.js App Router, TypeScript, Tailwind CSS, mock APIs, auth-protected routes, and Midtrans-ready payment endpoints.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Supabase client utilities (`@supabase/supabase-js`)
- Midtrans integration hooks (`midtrans-client`)
- App Router API route handlers for storefront, checkout, auth, and payment webhooks

## Features Implemented

### Storefront

- `/` Homepage with hero, category cards, featured and trending products
- `/shop` Product listing with:
  - debounced search
  - category filter
  - rating filter
  - sort (newest, price asc/desc, top rated)
  - pagination
- `/products/[slug]` Product detail with gallery, variants, stock, and reviews
- `/cart` Cart management with quantity updates, promo estimator, shipping estimator
- `/cart` Cart checklist per item (select which items to checkout)
- `/checkout` Checkout form with validation and payment flow
- `/orders` and `/orders/[id]` Order history + timeline tracking
- `/profile` Editable profile page

### Authentication + Access Control

- `/login`, `/register`, `/forgot-password`
- Cookie-based session routes:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/auth/logout`
  - `GET /api/auth/session`
- `proxy.ts` protection:
  - `/profile`, `/orders`, `/checkout` require authenticated user
  - `/admin/*` requires `admin` role

### Admin Dashboard

- `/admin` KPI overview + charts + quick actions
- `/admin/products` Supabase-backed product CRUD with per-item edit + stock controls + image preview
- `/admin/orders` Supabase-backed status tabs + expandable rows + status actions
- `/admin/users` Supabase-backed role management
- `/admin/notifications` email template editor + preview
- `/admin/analytics` Supabase-backed revenue + category breakdown + low stock alerts

### Payment (Midtrans Ready)

- `POST /api/create-payment`
  - creates Midtrans transaction if env keys exist
  - falls back to mock payment if env keys are missing
- `POST /api/payment-notification` webhook handler + status sync to Supabase
- `POST /api/payment-status` fallback status sync from Midtrans API (used when webhook is delayed/unreachable)
- Payment result pages:
  - `/payment/success`
  - `/payment/pending`
  - `/payment/error`

## API Routes

- `GET /api/products` - search/filter/sort/paginate products
- `GET/POST /api/orders` - list/update orders (Supabase + fallback mock)
- `GET /api/orders/[id]` - order detail by id/order number
- `POST /api/cart` - cart payload validation + totals
- `POST /api/checkout` - checkout validation (mock helper)
- `POST /api/create-payment` - create payment and persist order + items
- `POST /api/payment-notification` - webhook receiver and status updater
- `POST /api/payment-status` - force-sync payment status from Midtrans by order id/number
- `GET/POST/PATCH/DELETE /api/admin/products` - admin product management (real Supabase data)
- `GET/PATCH /api/admin/orders` - admin order listing and status updates (real Supabase data)
- `GET/PATCH /api/admin/users` - admin profile/role management (real Supabase data)

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill values for:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or use anon key)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
   - `MIDTRANS_SERVER_KEY`
   - `MIDTRANS_MERCHANT_ID`
   - `MIDTRANS_IS_PRODUCTION`
   - `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION`
   - `MIDTRANS_ENABLED_PAYMENTS` (optional, comma-separated. Example: `gopay,qris`)
   - `APP_URL` (recommended for Midtrans callback redirects, e.g. `http://localhost:3000`)

3. Set Midtrans webhook notification URL in Midtrans Dashboard:
   - `https://your-public-domain/api/payment-notification`
   - For local development, expose your app via tunnel (for example ngrok) because Midtrans cannot call `localhost` directly.

If Midtrans keys are not set, checkout automatically runs in mock mode.

## Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build + Lint

```bash
npm run lint
npm run build
```

## Database Schema

- Supabase SQL schema is included at:
  - `supabase-schema.sql`

Run this script in Supabase SQL Editor to create core tables and baseline RLS policies.

## Demo Login Roles

Role is inferred from email in mock auth:

- `admin@...` -> `admin`
- `seller@...` -> `seller`
- `staff@...` -> `staff`
- `support@...` / `cs@...` -> `cs`
- any other email -> `customer`

## Notes

- This repo is production-structured and ready to connect to real Supabase tables.
- Product catalog is still mock data in `src/lib/mock-data.ts`.
- Orders and payment status are Supabase-backed when env keys + schema are set.
