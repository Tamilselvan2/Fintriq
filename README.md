# Fintriq

Fintriq is a multi-tenant financial management SaaS platform built with Next.js, Express, Prisma, and PostgreSQL. The current implementation focuses on tenant-scoped transaction management, dashboard analytics, team access control, and audit visibility in a single full-stack codebase.

## What Fintriq Includes

- Multi-tenant organization model with backend-enforced `orgId` isolation
- JWT authentication with rotating refresh tokens stored in `HttpOnly` cookies
- Role-based access control for admin and finance workflows
- Transaction CRUD with filtering, cursor pagination, and CSV export
- Dashboard analytics for balances, income, expenses, trends, and recent activity
- Organization member management and admin-only audit log access
- React Query caching for server state across dashboard, transactions, members, and audit views

## Architecture

```txt
Browser -> Next.js App Router -> Express API -> Prisma -> PostgreSQL
```

Implementation details are documented in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS, React Query, Axios |
| Backend | Express.js, TypeScript, Zod, JWT, Prisma ORM |
| Database | PostgreSQL |
| Security | HttpOnly refresh cookies, RBAC, Helmet, rate limiting, request validation |
| Tooling | GitHub Actions, Render deployment config |

## Repository Structure

```txt
.
|-- frontend/              Next.js application
|-- backend/               Express + Prisma API
|-- .github/workflows/     CI workflow
|-- render.yaml            Render backend deployment config
|-- ARCHITECTURE.md        System architecture document
|-- README.md
```

## Local Development

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL

### Backend Setup

```powershell
cd backend
Copy-Item .env.example .env
npm ci
npx prisma generate
npx prisma migrate dev
npm run dev
```

Required backend environment variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Backend endpoints:

- API base: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`

### Frontend Setup

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Required frontend environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Fintriq
```

Use the backend origin for `NEXT_PUBLIC_API_URL`. The client normalizes the value and appends `/api` internally, so you do not need to add `/api` yourself.

Frontend URL:

- `http://localhost:3000`

## Available Scripts

| Area | Command | Notes |
| --- | --- | --- |
| Backend | `npm run dev` | Starts the API in development mode |
| Backend | `npm run build` | Compiles TypeScript to `dist/` |
| Backend | `npm run start` | Runs the compiled backend |
| Backend | `npm run typecheck` | Runs `tsc --noEmit` |
| Backend | `npm run lint` | Currently a placeholder command |
| Backend | `npm test` | Currently a placeholder command |
| Frontend | `npm run dev` | Starts the Next.js app |
| Frontend | `npm run lint` | Runs Next.js ESLint checks |
| Frontend | `npm run typecheck` | Runs `tsc --noEmit` |
| Frontend | `npm run build` | Builds the production app |
| Frontend | `npm run start` | Starts the production frontend |
| Frontend | `npm test` | Currently a placeholder command |

## API Modules

- `/api/auth` for registration, login, token refresh, logout, session lookup, and password change
- `/api/transactions` for financial records, filtering, pagination, and export
- `/api/dashboard` for tenant-scoped KPI and chart aggregation
- `/api/organizations` for organization settings and member management
- `/api/audit` for admin audit visibility

## Security Model

- Access tokens are kept in memory on the client instead of `localStorage`
- Refresh tokens are stored in `HttpOnly` cookies
- Refresh and logout flows require a CSRF header
- Request payloads are validated with Zod before reaching business logic
- Helmet is enabled globally in the API
- Rate limiting is applied at the API level, with stricter limits on auth routes
- RBAC and tenant filtering are enforced on the backend, not trusted to the client

## CI/CD

The GitHub Actions workflow in `.github/workflows/ci.yml` runs on pushes to `main` and `master` and currently performs:

- dependency installation for backend and frontend
- Prisma client generation
- Prisma schema validation
- Prisma migration status checks
- backend build and typecheck
- frontend lint, typecheck, and build
- backend and frontend test script execution

Current note: the workflow shape is production-oriented, but backend linting and both test commands are still scaffolded rather than full quality gates.

## Deployment

- Frontend: Vercel-compatible Next.js App Router application
- Backend: Render deployment configuration is included in [render.yaml](./render.yaml)
- Database: PostgreSQL through Prisma using `DATABASE_URL` and `DIRECT_URL`
- Production auth: secure cross-site cookie handling plus CORS restricted by `FRONTEND_URL`

## Current Status

Fintriq is a strong full-stack SaaS foundation with a clear tenant model, modular backend, and production-minded auth flow. The repository already includes architecture documentation, CI wiring, deployment configuration, and multi-tenant business features, while backend lint coverage and automated test depth are still areas to complete.
