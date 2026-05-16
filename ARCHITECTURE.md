# Fintriq Architecture

Fintriq is a multi-tenant SaaS financial management platform designed for organizations that need a shared workspace for expense tracking, income visibility, dashboard analytics, team administration, and auditability. The application is deployed as a split-stack system with a Next.js frontend on Vercel, an Express API on Render, and PostgreSQL on Supabase.

Public frontend deployment: `https://fintriq.vercel.app/`

## 1. Project Overview

Fintriq is built as an organization-scoped expense and income management system. Each authenticated user operates inside a single tenant context represented by an organization, and every operational path in the application is designed around that tenant boundary. Transaction management, dashboards, team management, and audit visibility all inherit the same organization-scoped access model.

The platform is organized around four engineering goals:

| Goal | Implementation focus in Fintriq |
| --- | --- |
| Scalability | Stateless API processes, cursor pagination, indexed tenant filters, pooled PostgreSQL deployment readiness |
| Security | JWT access tokens, rotating refresh tokens, role-based authorization, `HttpOnly` cookies, Zod validation, Helmet, rate limiting |
| Maintainability | Split frontend/backend codebases, feature-based backend modules, typed request contracts, shared client hooks |
| Performance | Database-side aggregation, TanStack Query caching, bounded payloads, streamed export generation, narrow Prisma selects |

Fintriq is architected as a production-grade SaaS foundation for high-concurrency usage, large tenant datasets, and failure scenarios such as token expiry, transient network interruptions, and database contention around shared reporting queries. The implementation stays monolithic by design, but the system boundaries, route segmentation, and deployment model are already structured for independent scaling of the frontend and API tiers.

## 2. High-Level System Architecture

```txt
Browser
  -> Next.js 14 App Router (Vercel)
  -> Express API (Render)
  -> Prisma ORM
  -> PostgreSQL (Supabase + pooled connection endpoint)
```

### Runtime flow

1. A user opens the Vercel-hosted Next.js application, which bootstraps the App Router tree, global providers, and route-level layouts.
2. `frontend/src/middleware.ts` evaluates the current path and refresh-cookie presence to redirect between `/login`, `/register`, and dashboard routes.
3. The frontend initializes `QueryClientProvider`, Sonner toasts, and the auth context from `frontend/src/app/providers.tsx`.
4. The auth context calls `authApi.getMe()`. If the in-memory access token is missing or expired, the shared Axios client attempts a silent refresh through `/api/auth/refresh`.
5. API requests are sent from the frontend to the Render-hosted Express backend using `withCredentials: true`, allowing the refresh cookie to participate in the session lifecycle.
6. The backend applies global middleware in `backend/src/app.ts`, authenticates and authorizes requests, validates input with Zod-backed middleware, and delegates domain logic into feature services and repositories.
7. Prisma executes tenant-scoped queries and aggregation workloads against PostgreSQL, and the resulting data flows back to the React Query cache for rendering.

### Layer summary

| Layer | Current implementation | Responsibility |
| --- | --- | --- |
| Presentation | Next.js App Router, Tailwind CSS, route layouts, loading states, dialogs, charts | Page composition, SaaS shell, forms, navigation, visual feedback |
| Client State | TanStack Query, React Context, URL state, local component state | Server-state caching, session state, mutation invalidation, filter persistence |
| API | Express + TypeScript feature modules | Auth, transactions, dashboards, organization management, audit access |
| Data Access | Prisma repositories and raw SQL for selected analytics | Query construction, cursor pagination, grouped aggregations, transactional writes |
| Persistence | PostgreSQL on Supabase | Tenant data, refresh token revocation state, audit history, financial records |

## 3. Frontend Architecture

### App Router structure

The frontend uses route groups to separate public auth screens from the authenticated SaaS workspace:

```txt
frontend/src/app
|-- (auth)/
|   |-- layout.tsx
|   |-- login/page.tsx
|   |-- register/page.tsx
|-- (dashboard)/
|   |-- layout.tsx
|   |-- loading.tsx
|   |-- audit/page.tsx
|   |-- dashboard/page.tsx
|   |-- team/page.tsx
|   |-- transactions/page.tsx
|   |-- settings/
|       |-- layout.tsx
|       |-- organization/
|       |-- preferences/
|       |-- profile/
|       |-- security/
|-- error.tsx
|-- layout.tsx
|-- page.tsx
|-- providers.tsx
```

This layout gives Fintriq a clear separation between unauthenticated routes and the main dashboard shell. The `(dashboard)` route group centralizes authenticated navigation, shared header/sidebar composition, and route-level loading UX. `loading.tsx` provides a full dashboard skeleton, while `error.tsx` serves as a global App Router boundary.

### Protection strategy

Protection is layered rather than delegated to a single guard:

- `frontend/src/middleware.ts` performs edge redirects for `/`, `/login`, `/register`, and the main protected route matchers based on refresh-cookie presence.
- `frontend/src/middleware.ts` handles entry-path and auth-route redirects based on refresh-cookie presence and is configured to observe the main protected route namespaces.
- `frontend/src/app/(dashboard)/layout.tsx` performs runtime auth-context validation after hydration and redirects unauthenticated sessions to `/login`.
- The auth context listens for a custom `auth:unauthorized` event and performs a hard client logout when refresh recovery fails.

This split works well for a token model where the backend owns refresh cookies and the frontend owns the short-lived access token in memory.

### State management

| State category | Implementation | Role in the system |
| --- | --- | --- |
| Server state | TanStack Query | Dashboard analytics, transaction lists, audit logs, organization data, members |
| Auth session | React Context + memory-only access token | User identity, role helpers, login/logout, password change, inactivity handling |
| UI state | React hooks + URL query params | Modal visibility, cursor history, filter state, confirmation dialogs, download feedback |

The global query client in `frontend/src/lib/query-client.ts` establishes default behavior across the application:

- `staleTime: 5 minutes`
- `refetchOnWindowFocus: true`
- no automatic retries for `401` or `403`
- up to 3 retries for other transient errors
- mutation-level toast handling through Sonner

### React Query configuration

Fintriq uses feature-level cache policies instead of a single global freshness rule:

| Hook | File | Cache behavior |
| --- | --- | --- |
| `useDashboard` | `frontend/src/hooks/use-dashboard.ts` | `staleTime: 2 minutes`, `refetchInterval: 5 minutes` |
| `useTransactions` | `frontend/src/hooks/use-transactions.ts` | `staleTime: 1 minute` |
| `useOrganization` / `useMembers` | `frontend/src/hooks/use-organization.ts` | `staleTime: 5 minutes` |
| `useAuditLogs` | `frontend/src/hooks/use-audit.ts` | `staleTime: 30 seconds` |

Mutations invalidate affected query families rather than attempting speculative client-side financial recomputation:

- transaction create/update/delete invalidates `['transactions']` and `['dashboard']`
- organization name updates invalidate `['organization']`, `['user']`, and `['auth']`
- member mutations invalidate `['members']`

Fintriq intentionally avoids optimistic updates for core financial data. Dashboard balances, category totals, and audit-sensitive changes are refreshed from the server after successful mutation completion so that the UI remains aligned with the persisted record of truth.

### Component architecture

The component tree is organized by domain:

```txt
frontend/src/components
|-- auth/
|-- dashboard/
|-- layout/
|-- organization/
|-- providers/
|-- shared/
|-- transactions/
|-- ui/
```

- `layout/` contains the dashboard shell, sidebar, and header.
- `auth/` contains role-based rendering helpers such as `role-gate.tsx`.
- `dashboard/` contains visualization and overview components.
- `transactions/` contains the filter bar, table, and modal workflows.
- `organization/` contains member management UI.
- `shared/` contains generic dialogs and reusable structural components.
- `ui/` holds reusable UI primitives that align with the project’s Tailwind-based component system.

### Performance decisions

Performance on the frontend is driven primarily by server-state caching, route segmentation, and targeted memoization:

- App Router performs route-level code splitting automatically.
- The transactions page wraps its search-parameter-driven implementation in `Suspense`.
- URL update helpers in dashboard pages use `useCallback` to keep prop references stable for filter and pagination flows.
- React Query avoids redundant refetches across route transitions.
- Route-level `loading.tsx` files prevent hard visual stalls during navigation.

The current implementation uses targeted memoization where it has the highest signal. The dominant workload in Fintriq is network and database IO, so the codebase leans more on cache correctness and bounded queries than on aggressive client-side memo wrapping.

### Secure token handling

Fintriq uses a split-token session model:

| Token | Storage location | Lifetime characteristics | Primary purpose |
| --- | --- | --- | --- |
| Access token | In-memory module state in `frontend/src/lib/api.ts` | Short-lived JWT (`15m`) | Authorize API requests with `Authorization: Bearer ...` |
| Refresh token | `HttpOnly` cookie set by the backend | Rotated on refresh | Restore access tokens without exposing long-lived credentials to browser JavaScript |

The access token is intentionally not stored in `localStorage` or `sessionStorage`. Keeping it memory-only reduces the impact of client-side script injection and ensures that rehydration depends on the backend-controlled refresh flow rather than persistent browser storage.

The Axios client in `frontend/src/lib/api.ts` implements silent refresh with queueing:

1. outgoing requests attach the in-memory access token when present
2. a `401` response triggers refresh unless the request has already retried
3. concurrent `401` responses wait in `failedQueue` while one refresh request is in flight
4. the refresh request posts to `/api/auth/refresh` with `withCredentials: true` and an `X-CSRF-Token` header
5. a new access token is stored in memory and queued requests are replayed
6. if refresh fails, the client clears auth state and dispatches `auth:unauthorized`

The auth context in `frontend/src/hooks/use-auth.tsx` also enforces a 15-minute inactivity timeout and routes inactive sessions back to `/login`.

## 4. Backend Architecture

The backend is organized as an Express application with feature modules under `backend/src/modules`. Each module encapsulates its HTTP surface, business rules, and Prisma access patterns.

### Layered module structure

The standard domain shape is:

```txt
backend/src/modules/<domain>
|-- <domain>.routes.ts
|-- <domain>.controller.ts
|-- <domain>.service.ts
|-- <domain>.repository.ts
|-- <domain>.validation.ts
```

The repository currently contains the following domain modules:

```txt
backend/src/modules
|-- auth/
|   |-- auth.routes.ts
|   |-- auth.controller.ts
|   |-- auth.service.ts
|   |-- auth.repository.ts
|   |-- auth.validation.ts
|-- transaction/
|   |-- transaction.routes.ts
|   |-- transaction.controller.ts
|   |-- transaction.service.ts
|   |-- transaction.repository.ts
|   |-- transaction.validation.ts
|-- dashboard/
|   |-- dashboard.routes.ts
|   |-- dashboard.controller.ts
|   |-- dashboard.service.ts
|   |-- dashboard.repository.ts
|   |-- dashboard.validation.ts
|-- organization/
|   |-- organization.routes.ts
|   |-- organization.controller.ts
|   |-- organization.service.ts
|   |-- organization.repository.ts
|   |-- organization.validation.ts
|-- audit/
|   |-- audit.routes.ts
|   |-- audit.controller.ts
|   |-- audit.service.ts
|   |-- audit.repository.ts
```

Shared infrastructure lives outside domain modules:

- `backend/src/app.ts` wires global middleware and route mounting
- `backend/src/index.ts` boots the HTTP server
- `backend/src/db/prisma.ts` instantiates Prisma
- `backend/src/middlewares/*` centralizes auth, authorization, validation, CSRF checks, and error handling
- `backend/src/utils/*` contains JWT helpers, logger configuration, and application error types

### Why the separation matters

| Concern | Architectural benefit in Fintriq |
| --- | --- |
| Maintainability | Route wiring stays thin, services own business rules, and repositories isolate Prisma details |
| Testability | Controllers, services, and repositories can evolve independently with stable boundaries |
| Scalability | New domains can follow the same modular convention without introducing route sprawl or cross-cutting logic duplication |

The current production modules are:

- `auth`
- `transaction`
- `dashboard`
- `organization`
- `audit`

This layout gives the codebase a clear monolithic boundary while still supporting internal separation of responsibilities.

## 5. Authentication & Security Design

### JWT access token flow

The access-token path is implemented in `backend/src/modules/auth/auth.service.ts`, `backend/src/modules/auth/auth.controller.ts`, and `backend/src/utils/jwt.ts`.

1. Credentials are validated by Zod middleware before controller execution.
2. The service looks up the user by email and verifies the stored bcrypt hash.
3. A JWT access token is issued with `userId`, `email`, `orgId`, and `role` claims and a `15m` expiry.
4. The controller returns the access token in the JSON response body and sets the refresh token cookie separately.
5. The frontend stores the access token in memory and sends it back on subsequent API calls as a Bearer token.

### Refresh token rotation

Fintriq combines JWT refresh tokens with server-side revocation state in PostgreSQL:

1. Login generates a refresh JWT in `backend/src/utils/jwt.ts`.
2. The raw token is hashed with SHA-256 and stored in the `RefreshToken` table.
3. The controller sets the raw token as an `HttpOnly` cookie.
4. On `/api/auth/refresh`, the backend verifies the JWT signature, hashes the presented token, and loads the stored record through `AuthRepository.findRefreshToken`.
5. The current refresh record is revoked and a replacement record is created inside a Prisma transaction with `replaceRefreshToken`.
6. The controller returns a new access token and rotates the refresh cookie in the same response cycle.

### Reuse protection

Refresh-token reuse is explicitly handled. If the presented token maps to a record that is already marked `revoked`, the backend treats it as a replay signal and revokes all non-revoked refresh tokens for that user through `revokeAllUserRefreshTokens`. This prevents a copied or stale refresh token from continuing to mint valid access sessions.

### RBAC

Authorization is enforced twice: once on the API and once in the UI.

| Role | Backend permissions | Frontend exposure |
| --- | --- | --- |
| `ADMIN` | Full organization management, transaction CRUD, CSV export, audit log access | Full dashboard controls via `RoleGate` |
| `ACCOUNTANT` | Create/update transactions, export CSV, read dashboards and transaction lists | Financial action controls via `RoleGate` |
| `USER` | Read-only access to authenticated dashboards, organization context, and transaction listings | Read-only UI without admin/accounting actions |

Backend enforcement is handled by `authenticate` plus `authorize([...roles])`. UI-level visibility is mirrored by `frontend/src/components/auth/role-gate.tsx`, which suppresses privileged actions for users outside the allowed role list.

### Tenant isolation

Fintriq never trusts a client-supplied `orgId` for data authorization. Tenant context comes from the authenticated JWT, is attached to `req.user`, and is threaded through controllers, services, and repositories.

Representative pattern:

```ts
const orgId = req.user!.orgId;

return prisma.transaction.findMany({
  where: {
    orgId,
    ...(type && { type }),
    ...(category && { category }),
  },
});
```

The same pattern appears across:

- transaction reads and writes
- dashboard aggregates
- organization member queries
- audit log pagination

This is the core multi-tenant isolation strategy in the current implementation.

### Input validation

All request payloads are validated before business logic runs. Examples include:

- `registerSchema` and `loginSchema` in `backend/src/modules/auth/auth.validation.ts`
- `createTransactionSchema` and `updateTransactionSchema` in `backend/src/modules/transaction/transaction.validation.ts`
- `inviteMemberSchema` and `updateRoleSchema` in `backend/src/modules/organization/organization.validation.ts`
- dashboard date-window validation in `backend/src/modules/dashboard/dashboard.validation.ts`

The `validateRequest`, `validateQuery`, and `validateParams` middleware normalize errors into consistent JSON responses and keep controllers focused on business flow rather than input parsing.

### Rate limiting

Rate limiting is mounted centrally in `backend/src/app.ts` using `express-rate-limit`:

| Scope | Configuration |
| --- | --- |
| General API traffic | `250` requests per `15` minutes under `/api` |
| Auth routes | `10` requests per `15` minutes on login and registration paths |

The application returns structured `429` JSON responses. On the frontend, the shared Axios client detects `429`, reads the `retry-after` header when available, and shows a live countdown toast through Sonner so the user gets clear feedback about when to retry.

### Security headers and transport hardening

Security middleware is mounted globally in `backend/src/app.ts`:

- `helmet()` applies a hardened HTTP header profile, including CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`
- `cors()` restricts allowed origins to the configured frontend origin and enables credentials
- `cookie-parser` supports secure refresh-cookie handling
- `verifyCsrfHeader` requires an `X-CSRF-Token` header on refresh and logout flows

The refresh cookie is configured dynamically based on environment:

- development: `httpOnly: true`, `sameSite: 'lax'`, `secure: false`
- production: `httpOnly: true`, `sameSite: 'none'`, `secure: true`

## 6. Database Design

### Normalized schema

The PostgreSQL schema is intentionally compact and normalized around five core entities:

- `Organization`
- `User`
- `Transaction`
- `RefreshToken`
- `AuditLog`

The current Prisma schema is:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

enum Role {
  ADMIN
  ACCOUNTANT
  USER
}

enum TransactionType {
  INCOME
  EXPENSE
}

model Organization {
  id           String        @id @default(uuid())
  name         String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  users        User[]
  transactions Transaction[]
  auditLogs    AuditLog[]
}

model Transaction {
  id           String          @id @default(uuid())
  type         TransactionType
  amount       Float
  category     String
  description  String?
  orgId        String
  organization Organization    @relation(fields: [orgId], references: [id], onDelete: Cascade)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@index([orgId])
  @@index([orgId, type])
  @@index([orgId, createdAt])
  @@index([orgId, category])
  @@index([orgId, category, createdAt])
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  name          String?
  passwordHash  String
  role          Role           @default(USER)
  orgId         String
  organization  Organization   @relation(fields: [orgId], references: [id], onDelete: Cascade)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
  auditLogs     AuditLog[]

  @@index([orgId])
}

model RefreshToken {
  id          String   @id @default(uuid())
  hashedToken String
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  revoked     Boolean  @default(false)
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@index([userId])
  @@unique([hashedToken])
}

model AuditLog {
  id           String       @id @default(uuid())
  orgId        String
  userId       String
  userEmail    String
  action       String
  entityType   String
  entityId     String?
  details      Json?
  ipAddress    String?
  createdAt    DateTime     @default(now())

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([orgId])
  @@index([orgId, createdAt])
}
```

The schema keeps ownership explicit through foreign keys and tenant identifiers, while `onDelete: Cascade` aligns cleanup behavior with parent lifecycle boundaries.

### Indexing strategy

| Index | Purpose |
| --- | --- |
| `Transaction(orgId)` | Fast tenant-scoped base filtering |
| `Transaction(orgId, type)` | Dashboard totals and filtered transaction lists by income/expense type |
| `Transaction(orgId, createdAt)` | Chronological lists, monthly analytics windows, recent transactions |
| `Transaction(orgId, category)` | Category-driven filtering and summaries |
| `Transaction(orgId, category, createdAt)` | Combined category/date filter paths |
| `User(orgId)` | Member listing and role management by organization |
| `RefreshToken(userId)` | Bulk revocation and session cleanup for a user |
| `RefreshToken(hashedToken)` unique | Constant-time lookup during refresh rotation |
| `AuditLog(orgId)` | Tenant-scoped audit queries |
| `AuditLog(orgId, createdAt)` | Recent audit browsing and cursor-based audit pagination |

### Financial consistency

Fintriq uses Prisma transactions where multi-step writes need an all-or-nothing outcome:

- `AuthRepository.createUserWithOrg` creates the organization and its first admin user inside a single `prisma.$transaction`
- `AuthRepository.replaceRefreshToken` revokes the old refresh token and inserts the replacement record atomically
- `OrganizationRepository.removeMember` deletes refresh tokens and removes the user in one transaction

These transaction boundaries are important in a multi-tenant financial application because session state, role changes, and tenant membership updates should never be left partially written.

### N+1 elimination

The codebase consistently avoids row-by-row access patterns:

- `DashboardService.getDashboardData` executes aggregate workloads in parallel with `Promise.all`
- `AuditRepository.findMany` includes related user email and role in the same query
- `OrganizationRepository.getMembers` uses narrow `select` projections instead of loading full user records
- grouped totals are computed with `groupBy` or SQL aggregation rather than application-level loops over raw rows

## 7. Dashboard & Analytics

The dashboard architecture is centered on tenant-scoped aggregate queries rather than client-side arithmetic.

### Aggregation strategy

`backend/src/modules/dashboard/dashboard.repository.ts` computes:

- `SUM(amount)` grouped by `type` for income/expense totals
- `SUM(amount)` grouped by `category` for category summaries
- monthly grouped analytics using `DATE_TRUNC('month', "createdAt")`
- `COUNT(id)` through grouped aggregate counts
- recent transactions ordered by `createdAt DESC`

`DashboardService.getDashboardData` combines those results into a single response payload and also derives month-over-month KPI comparisons for income, expense, and balance.

### Response shape

The dashboard endpoint returns a compact analytics payload with stable keys for charts and cards:

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalIncome": 18500,
      "totalExpense": 9200,
      "balance": 9300,
      "transactionCount": 47,
      "kpi": {
        "currentMonthIncome": 7200,
        "previousMonthIncome": 6800,
        "incomeGrowth": 5.88,
        "currentMonthExpense": 3100,
        "previousMonthExpense": 2950,
        "expenseGrowth": 5.08,
        "balanceGrowth": 6.42
      }
    },
    "categorySummaries": {
      "income": [
        { "category": "Consulting", "total": 10000 }
      ],
      "expense": [
        { "category": "Payroll", "total": 4500 }
      ]
    },
    "monthlyAnalytics": [
      { "month": "2026-01", "income": 5000, "expense": 2300 }
    ],
    "recentTransactions": []
  }
}
```

The frontend can render cards, charts, and recent activity directly from this shape without recomputing domain metrics in the browser.

### Frontend caching

The dashboard hook uses:

- `staleTime: 2 minutes`
- `refetchInterval: 5 minutes`

This gives the dashboard predictable freshness while keeping repeat navigation inexpensive.

## 8. Pagination & Filtering

### Cursor pagination

Fintriq uses cursor-based pagination for all large list surfaces:

- transactions
- organization members
- audit logs

The common response contract is:

```json
{
  "meta": {
    "total": 120,
    "limit": 10,
    "nextCursor": "9f67d0e7-8b7c-4e6d-9c7e-a12d2f5a77ab",
    "hasMore": true
  }
}
```

In repositories, the pattern is consistent:

- fetch `take + 1`
- use Prisma `cursor` and `skip: 1` when a cursor is present
- pop the extra row to compute `nextCursor`

This approach provides stable pagination under growth and avoids the performance cost of large offset scans.

### URL state persistence

Transactions use URL-driven state in `frontend/src/app/(dashboard)/transactions/page.tsx`. The page reads and updates query parameters through `useSearchParams`, `usePathname`, and `useRouter`, which means filters and cursors survive reloads, deep linking, and navigation.

Representative query strings:

```txt
/transactions?type=INCOME&category=Consulting
/transactions?cursor=9f67d0e7-8b7c-4e6d-9c7e-a12d2f5a77ab
```

The page also keeps a local cursor history stack to support previous-page navigation in a cursor-paginated flow.

### Filter design

The transactions API validates and supports:

- `type`
- `category`
- `startDate`
- `endDate`
- `sortBy`
- `sortOrder`
- `limit`
- `cursor`

The UI exposes a debounced filter bar with:

- search text input
- type selector
- category selector

The search field is debounced by `400ms` before URL updates, keeping the interaction responsive while avoiding excessive route churn.

## 9. CSV Export

CSV export is implemented as a server-generated download from `GET /api/transactions/export`.

### Export flow

1. The transactions page calls the export endpoint with `responseType: 'blob'`.
2. The backend authorizes the request for `ADMIN` and `ACCOUNTANT` roles.
3. The controller sets `Content-Type: text/csv` and `Content-Disposition: attachment`.
4. `TransactionService.exportTransactionsCsvStream` writes the CSV header immediately and then streams row batches to the response.
5. The browser creates an object URL from the returned blob and triggers a file download.

### Streaming design

The export path is incremental on the server:

- batch size is `1000` rows
- Prisma `findMany` uses cursor-based batching
- rows are written directly to the response stream
- backpressure is handled by awaiting the `drain` event when `write()` returns `false`
- the stream stops cleanly if the connection closes

This keeps the export path appropriate for large tenant datasets without materializing the entire CSV in backend memory. The endpoint is also protected by authentication, RBAC, and the shared `/api` rate limiter.

## 10. Error Handling & Resilience

### Backend error handling

Fintriq centralizes backend failure handling in `backend/src/middlewares/errorHandler.ts`.

The middleware currently normalizes:

- domain-specific `AppError` instances into structured JSON responses
- `ZodError` validation failures into `400` responses with issue payloads
- unexpected exceptions into `500` responses with a stable `Internal server error` message

Structured logs are emitted through Winston in `backend/src/utils/logger.ts`. In production, the logger writes JSON-formatted entries with timestamps to standard output, which fits well with Render log aggregation.

### Frontend resilience

The frontend has three complementary failure layers:

| Layer | Implementation |
| --- | --- |
| Global rendering boundary | `frontend/src/app/error.tsx` |
| Query retry policy | TanStack Query retry rules in `frontend/src/lib/query-client.ts` |
| Auth recovery | Axios refresh queue + `auth:unauthorized` event + auth-context logout |

When an access token expires, the client attempts silent refresh first. If multiple requests fail simultaneously, they queue behind a single refresh request. If refresh succeeds, the queued requests replay with the new token. If refresh fails, the client clears session state and redirects to `/login`.

### UI states

Fintriq favors explicit state handling throughout the dashboard:

- `loading.tsx` provides dashboard skeletons during route transitions
- tables render empty states instead of blank containers
- mutations surface success and failure feedback through Sonner toasts
- confirmation dialogs are used for destructive operations such as transaction deletion and member removal
- the global error boundary offers both retry and return-to-dashboard actions

This combination gives the product predictable behavior under transient failures, expired sessions, and slow network conditions.

## 11. CI/CD Pipeline

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`. It runs on pushes to `main` and `master`, installs dependencies for both applications, validates Prisma, builds the backend and frontend, and executes the repository’s lint, typecheck, and test commands.

Current workflow:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ "master", "main" ]
  pull_request:
    branches: [ "master", "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}      
      DIRECT_URL: ${{ secrets.DIRECT_URL }}         

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
          cache-dependency-path: |
            frontend/package-lock.json
            backend/package-lock.json

      - name: Install Backend Dependencies
        working-directory: ./backend
        run: npm ci

      - name: Generate Prisma Client
        working-directory: ./backend
        run: npx prisma generate

      - name: Validate Prisma Schema
        working-directory: ./backend
        env:
          DATABASE_URL: ${{ secrets.DIRECT_URL }}    
        run: npx prisma validate

      - name: Check Prisma Migrations
        working-directory: ./backend
        env:
          DATABASE_URL: ${{ secrets.DIRECT_URL }}    
        run: npx prisma migrate status

      - name: Lint Backend
        working-directory: ./backend
        run: npm run lint

      - name: Typecheck Backend
        working-directory: ./backend
        run: npm run typecheck

      - name: Build Backend
        working-directory: ./backend
        run: npm run build

      - name: Run Backend Tests
        working-directory: ./backend
        run: npm test

      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Lint Frontend
        working-directory: ./frontend
        run: npm run lint

      - name: Typecheck Frontend
        working-directory: ./frontend
        run: npm run typecheck

      - name: Build Frontend
        working-directory: ./frontend
        run: npm run build

      - name: Run Frontend Tests
        working-directory: ./frontend
        run: npm test
```

The pipeline is intentionally fail-fast: any non-zero exit from Prisma validation, build, lint, typecheck, or test commands fails the workflow and blocks a green delivery signal.

## 12. Deployment Architecture

### Frontend deployment

The frontend is deployed on Vercel as a standard Next.js 14 App Router application. The critical public environment variable is:

- `NEXT_PUBLIC_API_URL`

The client normalizes this value in `frontend/src/lib/api.ts` and appends `/api` internally, so the configured value should be the backend origin rather than an already-suffixed API path.

Current public frontend:

- `https://fintriq.vercel.app/`

### Backend deployment

The backend is configured for Render through `render.yaml`:

```yaml
services:
  - type: web
    name: fintriq-backend
    runtime: node
    rootDir: backend
    buildCommand: npm ci && npx prisma generate && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: DIRECT_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: JWT_REFRESH_SECRET
        sync: false
      - key: FRONTEND_URL
        sync: false
      - key: PORT
        value: 10000
```

At runtime, `backend/src/index.ts` starts the compiled Express application and logs process startup through the shared Winston logger.

### Database deployment

Fintriq uses managed PostgreSQL on Supabase. The runtime connection model follows the common split between pooled runtime traffic and direct administrative connectivity:

- `DATABASE_URL` for application traffic
- `DIRECT_URL` provisioned for environments that require a direct connection path

This aligns well with PgBouncer-backed SaaS deployments where API traffic should avoid opening unconstrained direct database connections under load.

### Environment variables

| Area | Variable | Purpose |
| --- | --- | --- |
| Frontend | `NEXT_PUBLIC_API_URL` | Backend origin used by the shared Axios client |
| Frontend | `NEXT_PUBLIC_APP_NAME` | Client-side application naming |
| Backend | `DATABASE_URL` | Prisma runtime database connection |
| Backend | `DIRECT_URL` | Direct database connection path for administrative workflows |
| Backend | `JWT_SECRET` | Access-token signing secret |
| Backend | `JWT_REFRESH_SECRET` | Refresh-token signing secret |
| Backend | `FRONTEND_URL` | CORS allowlist origin |
| Backend | `PORT` | HTTP server port |
| Backend | `NODE_ENV` | Environment-aware cookie and logging behavior |

### Cookie configuration

The refresh token is delivered as a cookie with environment-aware security settings:

| Setting | Development | Production |
| --- | --- | --- |
| `httpOnly` | `true` | `true` |
| `secure` | `false` | `true` |
| `sameSite` | `'lax'` | `'none'` |
| `maxAge` | `24 * 60 * 60 * 1000` | `24 * 60 * 60 * 1000` |

This configuration supports local development while remaining compatible with cross-origin frontend/backend deployment in production.

## 13. Performance & Scalability

Fintriq’s scalability model is shaped less by infrastructure sprawl and more by disciplined query boundaries, token lifecycle management, and split deployment topology.

| Technique | Where it appears | Impact |
| --- | --- | --- |
| Connection pooling readiness | Supabase pooled `DATABASE_URL`, Render-hosted stateless API | Protects PostgreSQL from excess per-process connection fan-out |
| Stateless API | Express routes + JWT auth + DB-backed refresh records | Enables horizontal API scaling without sticky sessions |
| Cursor pagination | Transactions, members, audit logs | Keeps response times stable as tenant datasets grow |
| TanStack Query caching | Dashboard, transactions, organization, audit hooks | Reduces redundant network traffic and smooths repeated navigation |
| Parallel aggregates | `DashboardService.getDashboardData` | Lowers end-to-end latency for composite analytics responses |
| Streaming exports | `exportTransactionsCsvStream` | Supports large CSV generation without buffering the full file server-side |
| Targeted memoization | `useCallback` in URL-driven pages and stable hook boundaries | Reduces unnecessary prop churn in interaction-heavy pages |
| Narrow selects and includes | Organization and audit repositories | Avoids over-fetching and prevents accidental N+1 patterns |

The result is a SaaS architecture that stays monolithic but is already shaped for concurrency:

- API workers remain stateless at the request layer
- database access is tenant-bounded and index-aware
- high-volume list views are paginated
- the frontend reuses cached data aggressively
- authentication remains resilient under bursts of token expiry through queued refresh replay

## 14. Technology Decisions

| Decision | Rationale |
| --- | --- |
| Next.js App Router | Route groups, nested layouts, route-level loading states, and a clean separation between auth and dashboard surfaces fit the SaaS shell well |
| TanStack Query | Fintriq is server-state heavy; query caching, invalidation, retries, and stale-time controls are a better fit than ad hoc fetch management |
| Prisma ORM | Typed queries, migrations, grouped aggregates, and transaction APIs keep the backend consistent across CRUD and analytics workloads |
| PostgreSQL | Relational integrity, aggregation support, indexing flexibility, and transactional safety are well suited to multi-tenant financial data |
| Express + TypeScript | Lightweight HTTP control with explicit middleware composition and straightforward feature modularity |
| Zod | Shared runtime validation semantics and consistent error shaping at the API edge |
| `HttpOnly` refresh cookies | Keeps long-lived session credentials out of browser JavaScript while supporting silent session recovery |
| Cursor pagination | Better long-term performance and stability for growing tenant datasets than offset-only pagination |

## 15. Conclusion

Fintriq is a production-oriented multi-tenant SaaS architecture built around strict organization-scoped data access, layered backend modules, memory-safe client token handling, and database-aware performance patterns. The current implementation combines App Router-driven UX, typed Express services, Prisma-backed relational modeling, rotating refresh tokens, structured logging, rate limiting, and deployment-ready separation across Vercel, Render, and Supabase. The result is a financially consistent, role-aware, and operationally scalable foundation for organization-level expense and income management.
