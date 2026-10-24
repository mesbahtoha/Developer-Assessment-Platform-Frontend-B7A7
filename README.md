# AssessDev | Developer Assessment Platform (Frontend)

Next.js 14 App Router frontend for the Developer Assessment and Coding Platform. It consumes the
backend REST API (`/api/v1`) with JWT auth, role based dashboards for **CANDIDATE**,
**RECRUITER** and **ADMIN**, and real **Stripe Checkout** payments.

> Live API: `https://developerassessmentbackend.vercel.app/api/v1`

## Accounts and access

Create an account from `/register` as a Candidate or Recruiter. Admin accounts are provisioned
by platform owners. Google sign in is available when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set.

## Tech stack

| Category | Choice |
|---|---|
| Framework | Next.js 14 App Router, TypeScript (strict) |
| Styling/UI | Tailwind CSS plus Radix UI primitives, Corporate Trust design tokens |
| Theming | next-themes with light and dark mode |
| Data fetching | TanStack Query (caching, retries, invalidation) |
| Client state | Zustand (auth session synced to cookies for middleware) |
| Forms | React Hook Form plus Zod (mirrors backend schemas) |
| Charts | Recharts (admin analytics) |
| Icons/media | Lucide React |
| Toasts | Sonner |
| Payments | Stripe Checkout redirect plus server side session verification |

## Routes

```
# Public
/                    Home landing with 9 sections
/about               About plus architecture
/services            Platform services
/assessments         Live catalog (auth gated data)
/assessments/[id]    Assessment detail
/contact             Contact (validated form)
/pricing             Free vs paid tiers plus payment FAQ
/unauthorized        403 page

# Auth
/login               Login plus Google sign in
/register            Register as CANDIDATE or RECRUITER

# Candidate (CANDIDATE plus ADMIN)
/dashboard                    Overview (attempts, invites, summary, payments)
/dashboard/assessments        Browse plus search
/dashboard/assessments/[id]   Detail with invitation, Stripe paywall, start
/dashboard/invitations        Accept or decline
/dashboard/attempts           History with status filter
/dashboard/attempts/[id]      Exam runner (timer, MCQ plus CODE, finalize)
/dashboard/results            Filterable results
/dashboard/results/[id]       Per problem breakdown
/dashboard/payments           Stripe history
/dashboard/profile            Account plus developer profile plus password

# Recruiter (RECRUITER plus ADMIN)
/recruiter                     Overview
/recruiter/problems            Problem bank CRUD plus filters
/recruiter/assessments         Lifecycle list
/recruiter/assessments/new    3 step wizard (basics, problems, publish)
/recruiter/assessments/[id]   Manage (edit, transitions, attach, invite, results, report)
/recruiter/invitations         Send plus track
/recruiter/evaluation          Pending CODE queue plus manual scoring dialog
/recruiter/results             Per assessment results plus leaderboard plus publish
/recruiter/profile             Account plus company plus password

# Admin (ADMIN only)
/admin               Analytics charts (users, attempts, payments, results)
/admin/users         Role plus status controls with search
/admin/assessments   Platform register
/admin/payments      Platform register plus Stripe refunds
/admin/audit-logs    Action and search explorer

# Payments
/payment/success     Verifies session id through GET /payments/verify/:sessionId
/payment/cancel      Cancelled checkout (no charge)
```

Every data page implements loading skeletons (`loading.tsx`), empty states, toast plus `error.tsx`
error handling, and URL synced filters for bookmarkable views.

## Environment

```bash
cp .env.example .env.local   # then set your values
```

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Recommended | Backend base URL including `/api/v1`. Defaults to the public deployed API if omitted. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical frontend origin for metadata, `robots.txt` and `sitemap.xml`. Auto-detected on Vercel when omitted. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | Enables the "Continue with Google" button on `/login`. |

> `NEXT_PUBLIC_*` values are embedded at build time. Set them in Vercel before the first
> deploy, and redeploy whenever they change.
>
> The backend `CLIENT_URL` allow list must include your frontend origin, otherwise CORS will
> reject API calls. The backend Stripe success and cancel URLs must point at
> `<frontend>/payment/success` and `<frontend>/payment/cancelled`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run type-check # strict tsc
npm run build      # production build
npm start          # serve production
```

## Stripe payments

1. Open a paid assessment as a candidate.
2. Click **Pay with Stripe** to open Stripe Checkout.
3. Pay with `4242 4242 4242 4242`, any future expiry, any CVC.
4. You return to `/payment/success?session_id=...` which verifies through `GET /payments/verify/:sessionId`.
5. **Start timed attempt** unlocks. Cancel returns to `/payment/cancelled`.

## Deployment (Vercel)

This repository is a standalone Next.js app at the repository root, so it can be imported
into Vercel as-is.

1. Push this folder to GitHub (already done).
2. Vercel -> **Add New -> Project -> Import Git Repository**, pick the frontend repo.
3. Keep the defaults:
   - Framework preset: **Next.js**
   - Root directory: `./`
   - Build command: `next build` (`npm run build`)
   - Output directory: `.next` (default)
   - Install command: `npm install`
   - Node.js version: **22.x** (pinned through `engines` in `package.json`)
4. Add environment variables (Production and Preview):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://developerassessmentbackend.vercel.app/api/v1` |
   | `NEXT_PUBLIC_SITE_URL` | your final frontend URL, e.g. `https://your-app.vercel.app` |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | only if Google sign in is enabled |

5. Click **Deploy**. The build runs `next build` and the app is served by Vercel.
6. After the first deploy, copy the production URL and set it in the **backend**
   environment as part of `CLIENT_URL`, then redeploy the backend so CORS accepts the
   frontend origin.
7. If Google sign in is enabled, add the frontend URL to the OAuth client's
   **Authorized JavaScript origins** and make sure the backend uses the same
   `GOOGLE_CLIENT_ID`.
8. For Stripe, confirm the backend's redirect base points at the deployed frontend
   (`/payment/success`, `/payment/cancelled`) and the Stripe webhook targets the
   deployed backend.

## Production notes

- All core workflows use the real API with no mock data.
- Auth uses bearer access tokens with silent refresh rotation, middleware plus role guards plus conditional UI.
- Frontend Zod schemas mirror backend Zod rules, so validation messages match the API.
- `middleware.ts` protects `/dashboard`, `/recruiter`, `/admin` and redirects each role correctly.
