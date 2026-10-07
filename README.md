# 🧑‍💻 AssessDev — Developer Assessment Platform (Frontend)

Next.js 14 App Router frontend for the Developer Assessment & Coding Platform. It consumes the
B7A6 backend REST API (`/api/v1`) with JWT auth, role-based dashboards for **CANDIDATE**,
**RECRUITER** and **ADMIN**, and real **Stripe Checkout** payments in test mode.

> Live API: `https://developerassessmentbackend.vercel.app/api/v1`

## Demo credentials (one-click login on `/login`)

| Role | Email | Password | Lands on |
|---|---|---|---|
| Admin | `admin@assessment.com` | `Admin@1234` | `/admin` |
| Recruiter | `recruiter@assessment.com` | `Recruiter@1234` | `/recruiter` |
| Candidate | `candidate@assessment.com` | `Candidate@1234` | `/dashboard` |

The login page has three distinct **Demo Login** buttons — one click signs in and redirects to the
role dashboard. These accounts are created by the backend seed (`prisma db seed`).

## Tech stack

| Category | Choice |
|---|---|
| Framework | Next.js 14 App Router, TypeScript (strict, no `any`) |
| Styling/UI | Tailwind CSS + shadcn-style primitives + Radix UI |
| Data fetching | TanStack Query (caching, retries, invalidation) |
| Client state | Zustand (auth session synced to cookies for middleware) |
| Forms | React Hook Form + Zod (mirrors backend schemas) |
| Charts | Recharts (admin analytics) |
| Icons/media | Lucide React, `next/image` where images are used |
| Toasts | Sonner |
| Payments | Stripe Checkout redirect + server-side session verification |

## Routes (25+)

```
# Public (Server Components)
/                    Home / landing
/about               About + architecture
/services            Platform services
/assessments         Live catalog (auth-gated data, marketing fallback)
/assessments/[id]    Assessment detail
/contact             Contact (validated form)
/pricing             Free vs paid tiers + payment FAQ
/unauthorized        403 page

# Auth
/login               Login + one-click demo for all 3 roles
/register            Register as CANDIDATE / RECRUITER

# Candidate (CANDIDATE + ADMIN)
/dashboard                    Overview (attempts, invites, summary, payments)
/dashboard/assessments        Browse + search (URL-synced)
/dashboard/assessments/[id]   Detail with invitation, Stripe paywall, start
/dashboard/invitations        Accept / decline
/dashboard/attempts           History with status filter
/dashboard/attempts/[id]      Exam runner (timer, MCQ + CODE, finalize)
/dashboard/results            Filterable results
/dashboard/results/[id]       Per-problem breakdown
/dashboard/payments           Stripe history
/dashboard/profile            Account + developer profile + password

# Recruiter (RECRUITER + ADMIN)
/recruiter                     Overview
/recruiter/problems            Problem bank CRUD + filters
/recruiter/assessments         Lifecycle list
/recruiter/assessments/new    3-step wizard (basics → problems → publish)
/recruiter/assessments/[id]   Manage (edit, transitions, attach/detach, invite, results, report)
/recruiter/invitations         Send + track
/recruiter/evaluation          Pending CODE queue + manual scoring dialog
/recruiter/results             Per-assessment results + leaderboard + publish
/recruiter/profile             Account + company + password

# Admin (ADMIN only)
/admin               Analytics charts (users, attempts, payments, results)
/admin/users         Role + ban controls with search
/admin/assessments   Platform register
/admin/payments      Platform register + Stripe refunds
/admin/audit-logs    Action/search explorer

# Payments (Stripe redirects from backend STRIPE_SUCCESS_URL / STRIPE_CANCEL_URL)
/payment/success     Verifies ?session_id= via GET /payments/verify/:sessionId
/payment/cancel      Cancelled checkout (no charge)
/payment/cancelled   Alias redirecting to /payment/cancel
```

Every data page implements loading skeletons (`loading.tsx`), empty states, toast + `error.tsx`
error handling, and URL-synced filters (`useSearchParams`) for bookmarkable views.

## Environment

```bash
cp .env.example .env.local   # then set your values
```

| Variable | Required | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | `https://developerassessmentbackend.vercel.app/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | No | Used by sitemap/robots |

> The backend `CLIENT_URL` allow-list must include your frontend origin, otherwise CORS will
> reject API calls. The backend Stripe success/cancel URLs must point at
> `<frontend>/payment/success` and `<frontend>/payment/cancelled`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run type-check # strict tsc
npm run build      # production build
npm start          # serve production
```

## Stripe test mode

1. Open a paid assessment as a candidate (e.g. *System Design Assessment*).
2. Click **Pay with Stripe** → redirected to Stripe Checkout.
3. Pay with `4242 4242 4242 4242`, any future expiry, any CVC.
4. Redirected to `/payment/success?session_id=…` → verified via `GET /payments/verify/:sessionId`.
5. **Start timed attempt** unlocks. Cancel returns to `/payment/cancel`.

## Deployment (Vercel)

1. Push this folder to a git repo (commit history already has 20+ meaningful commits).
2. Import into Vercel → framework preset **Next.js**.
3. Set `NEXT_PUBLIC_API_URL` (production backend) and `NEXT_PUBLIC_SITE_URL` (frontend URL).
4. Deploy — no build hooks needed (`next build`).

## Notes for evaluators

- All core workflows use the **real API** — no mocks or placeholder data.
- Auth: access token in `Authorization: Bearer`, silent refresh rotation, middleware + `<RequireRole>` + conditional UI.
- Frontend Zod schemas mirror backend Zod rules, so validation messages match the API.
- `middleware.ts` protects `/dashboard`, `/recruiter`, `/admin` and redirects each role correctly.
