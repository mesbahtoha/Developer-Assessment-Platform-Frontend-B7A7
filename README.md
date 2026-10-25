# 🧑‍💻 AssessDev — Developer Assessment Platform (Frontend)

A responsive **Next.js frontend** for the Developer Assessment & Coding Platform. It gives candidates a place to discover assessments, accept invitations, complete timed MCQ/CODE tests, and review results. Recruiters can build assessments, invite candidates, evaluate code submissions, and review reports. Administrators can monitor platform activity, manage users, inspect payments, and review audit logs.

The frontend consumes the platform's versioned REST API and supports JWT authentication, role-based dashboards, and **real Stripe Checkout** for paid assessments.

| | |
|---|---|
| **Live Frontend** | [Open Frontend](https://developer-assessment-platform-front-eight.vercel.app/) |
| **Live Backend** | [Open Backend](https://developerassessmentbackend.vercel.app/) |
| **API Base URL** | `https://developerassessmentbackend.vercel.app/api/v1` |
| **Framework** | Next.js 14 App Router |
| **Language** | TypeScript (strict mode) |
| **Authentication** | JWT, refresh-token rotation, optional Google sign-in |
| **Payments** | Stripe Checkout with server-side verification |
| **Deployment** | Vercel |

---

# 👤 Demo Accounts

The seed script creates dedicated development/evaluation accounts.

| Role          | Email                           | Password         |
| ------------- | ------------------------------- | ---------------- |
| **ADMIN**     | `admin@assessment.com`          | `Admin@1234`     |
| **RECRUITER** | `recruiter@assessment.com`      | `Recruiter@1234` |
| **CANDIDATE** | `candidate@assessment.com`      | `Candidate@1234` |
| **CANDIDATE** | `jane.candidate@assessment.com` | `Jane@1234`      |

The admin seed credentials can be overridden using:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

> ⚠️ These are demo credentials for evaluation/testing only and should not be used as production credentials.

---

## 📌 Project Overview

AssessDev is the user-facing application for a developer assessment workflow. The frontend organizes the experience around three roles: **CANDIDATE**, **RECRUITER**, and **ADMIN**. Access to protected pages is guarded by middleware, role checks, and conditional UI; the backend remains responsible for enforcing authorization and validating every protected operation.

### End-to-End Workflow

```text
                         Recruiter
                            |
                            v
                   Create an Assessment
                            |
                            v
                      Add Problems
                       MCQ / CODE
                            |
                            v
                         Publish
                            |
                            v
                     Invite Candidates
                            |
                            v
                         Candidate
                            |
                            v
                    Accept Invitation
                            |
                            v
                    Paid Assessment?
                       /         \
                     Yes          No
                      |            |
                      v            |
                 Stripe Checkout  |
                      |            |
                      v            |
             Verify Checkout with API
                      |            |
                      +-----+------+
                            |
                            v
                    Start Timed Attempt
                            |
                            v
                     Answer MCQ / CODE
                            |
                            v
                     Submit Assessment
                            |
                            v
                  Automatic / Manual Review
                            |
                            v
                    Results and Reports
```

The frontend handles presentation, navigation, forms, client-side state, and API communication. The backend owns business rules, resource authorization, payment confirmation, assessment deadlines, evaluation, and persisted results.

---

## ✨ Key Features

### 🔐 Authentication & Account Management

- Register as a **CANDIDATE** or **RECRUITER**.
- Sign in with email and password.
- Optional Google sign-in when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is configured.
- JWT-based authenticated API requests with refresh-token rotation.
- Auth session synchronized with cookies so middleware can protect routes.
- Profile and password management for candidates and recruiters.
- Role-aware navigation and unauthorized-access handling.

> Admin accounts are provisioned by platform owners; public registration is intended for candidates and recruiters.

### 🧩 Assessment Discovery

- Browse the assessment catalog and open assessment details.
- Search and filter assessments from dashboard views.
- View invitation status and assessment information.
- Gate protected actions behind authentication and role checks.
- Support bookmarkable views through URL-synchronized filters where implemented.

### ⏱️ Candidate Assessment Experience

- Accept or decline invitations.
- Start eligible assessments from the dashboard.
- Complete timed attempts containing MCQ and CODE problems.
- Track attempt status and review attempt history.
- View results, summaries, and per-problem breakdowns.
- Review Stripe payment history.
- Loading skeletons, empty states, toast messages, and route-level error handling across data pages.

The backend is the source of truth for attempt deadlines, submission acceptance, attempt uniqueness, scoring, and final result generation.

### 🧑‍💼 Recruiter Workspace

- Create and manage problems in the problem bank.
- Search and filter problems by supported criteria.
- Create assessments using a three-step wizard: basics, problems, and publishing.
- Manage assessment lifecycle transitions and attach or detach problems.
- Invite candidates and monitor invitation status.
- Review pending CODE submissions and assign manual scores and feedback.
- Inspect assessment results, leaderboards, and reports.
- Manage company profile and password settings.

### 🛡️ Admin Console

- Review platform analytics for users, attempts, payments, and results.
- Search users and manage supported role/status controls.
- Inspect platform assessment and payment registers.
- Review audit logs and filter recorded administrative actions.
- Initiate supported Stripe refunds through the backend API.

### 💳 Stripe Checkout

- Redirect candidates to Stripe Checkout for paid assessments.
- Return to a success page that verifies the Checkout session with the backend.
- Keep the assessment locked until the backend confirms payment.
- Provide a cancellation page when checkout is cancelled.
- Display payment history from the real API rather than simulated payment records.

**Payment security is enforced by the backend.** The frontend must not decide that a payment succeeded merely because a user returns to the success URL. Session verification and webhook processing happen server-side.

### 🎨 User Experience

- Responsive layouts for desktop, tablet, and mobile screens.
- Light and dark themes.
- Reusable UI built with Tailwind CSS and Radix UI primitives.
- Form validation with React Hook Form and Zod.
- Toast feedback through Sonner.
- Charts for admin analytics using Recharts.
- Lucide icons and consistent design tokens.

---

## 👥 User Roles & Routes

| Role | Main workspace | Core capabilities |
|---|---|---|
| **CANDIDATE** | `/dashboard` | Browse assessments, respond to invitations, take timed attempts, view results, manage profile, and review payments. |
| **RECRUITER** | `/recruiter` | Manage problems and assessments, invite candidates, evaluate CODE submissions, and review reports. |
| **ADMIN** | `/admin` | Platform analytics, user controls, assessment/payment registers, audit logs, and supported refund actions. |

Admin users can access recruiter and candidate-oriented capabilities where the application and backend permit them. The backend remains the authority for resource ownership and role authorization.

### Route Reference

#### 🌐 Public Routes

| Route | Purpose |
|---|---|
| `/` | Landing page with nine content sections. |
| `/about` | Platform overview and architecture information. |
| `/services` | Platform services. |
| `/assessments` | Assessment catalog; protected data/actions require authentication as appropriate. |
| `/assessments/[id]` | Assessment details. |
| `/contact` | Validated contact form. |
| `/pricing` | Free and paid tiers plus payment FAQ. |
| `/unauthorized` | Unauthorized-access page. |

#### 🔐 Authentication Routes

| Route | Purpose |
|---|---|
| `/login` | Email/password sign-in and optional Google sign-in. |
| `/register` | Candidate or recruiter registration. |

#### 👤 Candidate Routes

| Route | Purpose |
|---|---|
| `/dashboard` | Overview of attempts, invitations, result summary, and payments. |
| `/dashboard/assessments` | Browse and search assessments. |
| `/dashboard/assessments/[id]` | Assessment details, invitation context, payment gate, and start action. |
| `/dashboard/invitations` | Accept or decline invitations. |
| `/dashboard/attempts` | Attempt history with status filtering. |
| `/dashboard/attempts/[id]` | Timed exam runner for MCQ and CODE questions, with finalization. |
| `/dashboard/results` | Filterable result list. |
| `/dashboard/results/[id]` | Result details and per-problem breakdown. |
| `/dashboard/payments` | Payment history. |
| `/dashboard/profile` | Account, developer profile, and password settings. |

#### 🧑‍💼 Recruiter Routes

| Route | Purpose |
|---|---|
| `/recruiter` | Recruiter overview. |
| `/recruiter/problems` | Problem bank CRUD and filters. |
| `/recruiter/assessments` | Assessment lifecycle list. |
| `/recruiter/assessments/new` | Three-step assessment creation wizard. |
| `/recruiter/assessments/[id]` | Edit/manage assessment, lifecycle transitions, problems, invitations, results, and reports. |
| `/recruiter/invitations` | Send and track candidate invitations. |
| `/recruiter/evaluation` | Pending CODE evaluation queue and scoring dialog. |
| `/recruiter/results` | Assessment results, leaderboard, and publishing controls. |
| `/recruiter/profile` | Account, company profile, and password settings. |

#### 🛡️ Admin Routes

| Route | Purpose |
|---|---|
| `/admin` | Analytics charts for users, attempts, payments, and results. |
| `/admin/users` | User search, role controls, and status controls. |
| `/admin/assessments` | Platform-wide assessment register. |
| `/admin/payments` | Payment register and supported Stripe refunds. |
| `/admin/audit-logs` | Search and explore recorded actions. |

#### 💳 Payment Return Routes

| Route | Purpose |
|---|---|
| `/payment/success` | Reads the Stripe Checkout session ID and asks the backend to verify it. |
| `/payment/cancel` | Displays the cancelled-checkout state without treating it as a successful payment. |

> **Deployment check:** Make sure the backend's Stripe success/cancel redirect URLs match the exact paths implemented in this frontend. The cancellation path must be consistent across the frontend route, backend configuration, and Stripe Checkout session creation.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 App Router | Routing, page layouts, loading/error route boundaries, and application rendering. |
| Language | TypeScript (strict) | Type safety across components, API interactions, and form data. |
| Styling | Tailwind CSS | Responsive styling and utility-first design. |
| UI primitives | Radix UI | Accessible building blocks for interactive UI. |
| Design system | Corporate Trust design tokens | Shared visual styles and design consistency. |
| Theming | `next-themes` | Light and dark theme support. |
| Server state | TanStack Query | API data fetching, caching, retry behavior, and invalidation. |
| Client state | Zustand | Client-side auth/session state. |
| Forms | React Hook Form | Form state and submission handling. |
| Validation | Zod | Frontend input validation aligned with backend schemas. |
| Charts | Recharts | Admin analytics visualizations. |
| Icons | Lucide React | Consistent interface icons. |
| Notifications | Sonner | Toast feedback for user actions. |
| Payments | Stripe Checkout | Hosted payment flow for paid assessments. |
| API | REST API (`/api/v1`) | Reads and updates persistent platform data. |
| Hosting | Vercel | Frontend deployment and production hosting. |

---

## 🏗️ Frontend Architecture

```text
                        Browser
                           |
                           v
                  Next.js App Router
                           |
             +-------------+--------------+
             |                            |
             v                            v
      Public / Auth Pages         Protected Workspaces
                                        |
                                        v
                              Middleware + Role Guards
                                        |
                                        v
                               Page / UI Components
                                        |
                       +----------------+----------------+
                       |                                 |
                       v                                 v
                React Hook Form                  TanStack Query
                       |                                 |
                       v                                 v
                    Zod Schemas                  API Client / JWT
                                                        |
                                                        v
                                           Backend REST API (/api/v1)
                                                        |
                           +----------------------------+--------------------+
                           |                                                 |
                           v                                                 v
                    PostgreSQL / Redis                                Stripe Services
                     via backend                                      via backend
```

### Layer Responsibilities

**App Router and layouts**

- Organize public, authentication, candidate, recruiter, admin, and payment routes.
- Provide route-level loading and error handling where defined.
- Support Next.js metadata and deployment routing.

**Middleware and role guards**

- Protect `/dashboard`, `/recruiter`, and `/admin` route groups.
- Redirect users according to their role and authentication state.
- Improve navigation and user experience, but do not replace backend authorization.

**Forms and validation**

- React Hook Form manages form state and submission.
- Zod validates client-side input and provides user-friendly feedback.
- The backend validates requests independently; frontend validation is not a security boundary.

**Server-state management**

- TanStack Query handles API data, caching, retries, and invalidation.
- Mutations should invalidate or update related query data so dashboards and lists remain current.

**Client-side session state**

- Zustand stores auth/session state used by interactive components.
- The session is synchronized with cookies for middleware-based route checks.
- The API and backend remain responsible for validating JWTs and refresh sessions.

---

## 🔌 Backend API Integration

### API Base URL

```text
https://developerassessmentbackend.vercel.app/api/v1
```

Set `NEXT_PUBLIC_API_URL` to your target API base URL. Local development can point to a local backend; production should use the deployed API shown above.

### API Areas Used by the Platform

| API area | Typical frontend use |
|---|---|
| `/auth` | Registration, login, Google login, refresh, logout, current-user information, and password changes. |
| `/users` | Account and profile retrieval/updates. |
| `/problems` | Recruiter problem bank management and filtering. |
| `/assessments` | Catalog, details, assessment management, problem attachment, and starting attempts. |
| `/invitations` | Sending, listing, accepting, and rejecting invitations. |
| `/attempts` and `/submissions` | Attempt history, attempt details, answer submission, and finalization. |
| `/evaluation` | Pending CODE queue, scores, feedback, results, and reports. |
| `/results` | Candidate results, summaries, result publishing, and leaderboards. |
| `/payments` | Checkout creation, session verification, payment history, and supported refunds. |
| `/admin` | Platform stats, user management, payment/assessment registers, and audit logs. |

The backend returns a consistent response envelope. Successful responses generally contain `success`, `message`, and `data`; errors contain `success`, `message`, and may include `errors`. The frontend should surface meaningful API errors rather than silently treating failed requests as successful actions.

### Authentication Flow

```text
User submits login form
          |
          v
Frontend sends credentials to API
          |
          v
Backend validates credentials
          |
          v
Frontend stores/synchronizes session state
          |
          v
Protected pages and API requests use the session
          |
          v
Expired access session -> refresh flow
          |
          v
Continue request or return user to login
```

Access tokens and refresh sessions must be handled according to the backend's auth contract. Never expose backend secrets in frontend code or commit local environment files.

---

## 💳 Stripe Checkout Integration

The frontend initiates the checkout experience, while the backend creates and verifies Checkout sessions and processes signed Stripe webhooks.

### Payment Flow

```text
Candidate opens a paid assessment
             |
             v
      Clicks Pay with Stripe
             |
             v
Frontend requests checkout session from backend
             |
             v
Backend validates price and creates session
             |
             v
       Stripe Checkout page
             |
         +---+----+
         |        |
         v        v
       Paid     Cancelled
         |        |
         v        v
/payment/success  /payment/cancel
         |
         v
GET /payments/verify/:sessionId
         |
         v
Backend confirms payment state
         |
         v
Eligible assessment can be started
```

### Test Mode

For Stripe Test Mode, the backend README documents this successful test card:

```text
4242 4242 4242 4242
Any future expiry date
Any CVC
```

Use Stripe test keys for testing and never commit secret keys. The frontend does not need a Stripe secret key: session creation, webhook signature verification, price verification, payment state changes, and refunds belong on the backend.

### Production Requirements

- Configure Stripe and webhook secrets only in the backend environment.
- Confirm backend success and cancel URLs match this frontend's deployed route paths.
- Confirm the backend's CORS allowlist includes the deployed frontend origin.
- Test successful checkout, cancellation, verification failure, and payment-history updates before release.

---

## 🌱 Environment Variables

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Configure the following values as needed:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Recommended | Backend API base URL, including `/api/v1`. Defaults to the deployed API if omitted. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical frontend origin for metadata, `robots.txt`, and `sitemap.xml`. Vercel may auto-detect the URL if omitted. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | Enables Google sign-in on `/login` when configured. |

Example `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://developerassessmentbackend.vercel.app/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

> **Important:** `NEXT_PUBLIC_*` values are embedded into the client bundle at build time. Configure them in Vercel before deploying and redeploy when they change. Only public configuration belongs in `NEXT_PUBLIC_*` variables; never place Stripe secret keys, JWT secrets, database credentials, or other server secrets in the frontend environment.

### Backend Configuration Dependencies

The backend environment must also be configured correctly:

- `CLIENT_URL` must include `https://developer-assessment-platform-front-eight.vercel.app` so the backend CORS allowlist accepts browser requests.
- `FRONTEND_URL` and the backend's Stripe success/cancel redirect configuration must use `https://developer-assessment-platform-front-eight.vercel.app` as the frontend origin and point to the implemented payment return routes.
- If Google sign-in is enabled, the Google OAuth client's authorized JavaScript origins must include the deployed frontend origin, and the backend must use the matching Google client ID.

---

## 🚀 Local Development

### Prerequisites

- Node.js **22.x** (the project is pinned to this major version in `package.json`).
- npm.
- Access to the backend API, either the deployed API or a running local backend.
- Google OAuth configuration only if testing Google sign-in.
- Stripe Test Mode configured on the backend only if testing paid assessments.

### Installation

From the frontend repository root:

```bash
npm install
cp .env.example .env.local
```

Update `.env.local` with the API base URL and optional public configuration.

### Start Development Server

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

### Type Check and Production Build

```bash
npm run type-check
npm run build
npm start
```

`npm start` serves the production build, so run `npm run build` first.

---

## ☁️ Deployment — Vercel

The frontend is a standalone Next.js app located at the repository root and can be imported into Vercel as a Next.js project.

### Deployment Steps

1. Push the frontend project to its Git repository.
2. In Vercel, select **Add New → Project** and import the frontend repository.
3. Use these build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | Next.js |
   | Root directory | `./` |
   | Build command | `npm run build` (`next build`) |
   | Output directory | `.next` (default) |
   | Install command | `npm install` |
   | Node.js version | `22.x` |

4. Add environment variables for **Production** and **Preview** as appropriate:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://developerassessmentbackend.vercel.app/api/v1` |
   | `NEXT_PUBLIC_SITE_URL` | `https://developer-assessment-platform-front-eight.vercel.app` |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Set only when Google sign-in is enabled. |

5. Deploy the project and copy the resulting production URL.
6. Ensure the backend's `CLIENT_URL` allowlist includes `https://developer-assessment-platform-front-eight.vercel.app` and redeploy the backend if its configuration changes.
7. If Google sign-in is enabled, add the frontend origin to the Google OAuth client's **Authorized JavaScript origins** and confirm the backend uses the same Google client ID.
8. Confirm Stripe Checkout redirects to the deployed frontend's success/cancel pages and that the Stripe webhook points to the deployed backend.
9. Test login, role-based navigation, invitation workflow, timed attempts, result pages, and payment verification against the deployed API.

### Production Checklist

- [ ] Environment variables are set for the correct deployment environment.
- [ ] `NEXT_PUBLIC_API_URL` includes `/api/v1` and points to the intended backend.
- [ ] Backend CORS configuration includes the frontend origin.
- [ ] Middleware redirects users to the appropriate role workspace.
- [ ] Google OAuth origins match the deployed frontend, if enabled.
- [ ] Stripe success/cancel URLs exactly match implemented frontend routes.
- [ ] The backend webhook is configured and payment verification succeeds.
- [ ] Type checking and production build pass.
- [ ] No secrets or local environment files are committed.

---

## 🧪 Quality, Loading & Error States

The frontend README specification includes these data-page behaviors:

- **Loading:** route-level `loading.tsx` skeletons while data is being fetched.
- **Empty results:** clear empty states when lists have no matching data.
- **Action feedback:** toast notifications for successes and failures.
- **Errors:** route-level `error.tsx` boundaries and API error feedback.
- **Filters:** URL-synchronized filters for bookmarkable views where implemented.
- **Validation:** React Hook Form and Zod for client-side input feedback.

Before submitting changes, run the project's available checks:

```bash
npm run type-check
npm run build
```

These commands help catch TypeScript and production-build errors. They do not replace manual testing of authentication, permissions, timed attempts, or Stripe workflows.

---

## 🔒 Security Responsibilities

| Area | Frontend responsibility | Backend responsibility |
|---|---|---|
| Authentication | Submit credentials, synchronize session UI, and handle expired sessions. | Verify credentials/tokens, rotate refresh sessions, and revoke sessions. |
| Role-based access | Hide inappropriate navigation and guard protected routes for a better user experience. | Enforce role permissions on every protected API operation. |
| Resource ownership | Display data returned for the authenticated user and avoid exposing unrelated records in the UI. | Verify ownership at the service/API level. |
| Validation | Provide immediate form feedback using Zod. | Independently validate request bodies, query parameters, and route parameters. |
| Timed attempts | Display the timer and submit answers/finalization requests. | Enforce the authoritative start time and deadline. |
| Payments | Start Checkout and request server-side session verification. | Validate prices, verify Stripe signatures, process idempotent webhooks, update payment state, and issue refunds. |
| Secrets | Keep only public configuration in `NEXT_PUBLIC_*` variables. | Store database credentials, JWT secrets, Stripe secret keys, and webhook secrets server-side. |

**Client-side route guards are not a security boundary.** Do not rely on hiding a button or blocking a page to protect backend data; the API must reject unauthorized requests independently.

---

## 🧭 Troubleshooting

### API requests fail in the browser

- Confirm `NEXT_PUBLIC_API_URL` includes `/api/v1`.
- Confirm the backend is reachable.
- Check the backend `CLIENT_URL` allowlist for the exact frontend origin.
- If you changed a `NEXT_PUBLIC_*` variable in Vercel, rebuild and redeploy.

### Protected pages redirect unexpectedly

- Confirm the user is signed in and the session state/cookies are synchronized.
- Confirm the account has the role required for the destination.
- Remember that backend API authorization is authoritative even if the frontend allows navigation.

### Google sign-in is unavailable

- Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the frontend environment.
- Add the deployed site origin to the Google OAuth client's authorized JavaScript origins.
- Confirm the backend is configured with the matching `GOOGLE_CLIENT_ID`.

### Stripe payment does not unlock an assessment

- Confirm the backend Checkout session was created for the expected assessment.
- Verify that the browser returns to the configured success page with a `session_id` query parameter.
- Confirm the success page calls `GET /payments/verify/:sessionId` and handles the result returned by the backend.
- Check backend Stripe webhook configuration and payment status; returning from Checkout alone is not proof of payment.
- Make sure the backend redirect paths match the frontend's actual success and cancellation routes.

### Production build fails

```bash
npm run type-check
npm run build
```

Review the first TypeScript or Next.js build error and resolve it before redeploying.

---

## 🔗 Related Backend Resources

- **Live Frontend:** [https://developer-assessment-platform-front-eight.vercel.app/](https://developer-assessment-platform-front-eight.vercel.app/)
- **Live Backend:** [https://developerassessmentbackend.vercel.app/](https://developerassessmentbackend.vercel.app/)
- **API v1:** [https://developerassessmentbackend.vercel.app/api/v1](https://developerassessmentbackend.vercel.app/api/v1)
- **Backend README:** [Developer Assessment Platform — Backend API](https://github.com/mesbahtoha/Developer-Assessment-Platform-Backend-B7A6/blob/main/README.md)
- **Postman Guide:** [POSTMAN.md](https://github.com/mesbahtoha/Developer-Assessment-Platform-Backend-B7A6/blob/main/POSTMAN.md)
- **Postman Collection:** [POSTMAN.json](https://github.com/mesbahtoha/Developer-Assessment-Platform-Backend-B7A6/blob/main/POSTMAN.json)

---

## 👨‍💻 Author

**Md. Mesbahul Alam**

Full Stack MERN Developer building full-stack applications with a focus on React, Next.js, TypeScript, Node.js, REST APIs, authentication, and payment integrations.

---

> **AssessDev — Developer Assessment Platform**  
> A role-based frontend for discovering assessments, completing timed developer evaluations, managing recruitment workflows, reviewing results, and securely accessing Stripe-powered paid assessments through the backend API.
