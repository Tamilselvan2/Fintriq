# Fintriq - Project Overview

Fintriq is a modern, multi-tenant SaaS financial management platform designed to help organizations seamlessly manage their finances. Fintriq provides tenant-scoped transaction tracking, role-based access control, real-time dashboard analytics, and deep audit visibility within a robust, secure, and performant full-stack architecture. 

The core problem Fintriq solves is enabling small-to-medium teams to collaboratively manage their income and expenses in a secure, isolated environment without the overhead of complex enterprise ERPs.

## Live Links

- **Frontend:** https://fintriq.vercel.app
- **Backend API:** https://tecratech-saas.onrender.com/api
- **GitHub:** https://github.com/Tamilselvan2/Fintriq

## Features

### Authentication
- Register new organization accounts
- Login securely with encrypted credentials
- JWT Authentication (Memory-stored access tokens)
- Refresh Tokens (HttpOnly cookies for enhanced security)
- Secure Logout (Token revocation)

### Password Recovery
- Forgot Password via Email (Token-based)
- Reset Password via secure link

### Organization Management
- Multi-Tenant Organizations (Strict backend-enforced isolation via `orgId`)
- Team Members list and management
- Role Based Access (Admin, Accountant, User workflows)

### Invitation System
- Email Invitations to join organizations
- Pending Invitations management
- Resend Invitation capability
- Accept Invitation Flow (Seamless onboarding for new members)

### Profile Management
- Edit Profile details
- Profile Picture Upload & Storage

### Transactions
- Create new Income or Expense records
- Update existing transactions
- Delete transactions safely
- Filter by Type, Category, Date, and Search
- Cursor-based pagination for high performance

### Dashboard
- KPI Cards (Total Income, Total Expense, Net Balance)
- Income vs Expense Chart (Visual financial breakdown)
- Monthly Analytics (Aggregated organizational data)

### CSV Export
- Enhanced CSV Reports (Respects active filters, fully calculated financials)
- Export formatting optimized for Excel and Google Sheets

### Audit Logs
- User Activity Tracking (Immutable logs of all CRUD operations)
- Secure, Admin-only visibility

### Loading Experience
- High-fidelity Skeleton Loaders to prevent layout shift
- Background Fetch Indicators (Subtle updates during filtering and pagination)

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | Next.js 14 App Router, TypeScript, Tailwind CSS, React Query, Shadcn UI, Recharts |
| **Backend** | Express.js, TypeScript, Prisma ORM, Zod, JWT |
| **Database** | PostgreSQL |
| **Authentication** | HttpOnly refresh cookies, RBAC, Helmet, rate limiting, request validation |
| **File Storage** | Cloudinary (Profile Pictures) |
| **Email Service** | Brevo (Transactional Emails) |
| **Deployment** | Vercel (Frontend), Render (Backend), Supabase (Database) |

## Local Setup

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

Required Backend Environment Variables (`backend/.env`):
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```
- API runs on `http://localhost:5000`

### Frontend Setup

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Required Frontend Environment Variables (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Fintriq
```
- App runs on `http://localhost:3000`

## Folder Structure

```txt
.
|-- frontend/              # Next.js application
|   |-- src/app/           # Next.js App Router pages
|   |-- src/components/    # React components (UI, Skeletons, Shared)
|   |-- src/hooks/         # React Query hooks
|   |-- src/types/         # TypeScript definitions
|
|-- backend/               # Express + Prisma API
|   |-- prisma/            # Database schema and migrations
|   |-- src/modules/       # Feature modules (Auth, Transaction, Audit, Org)
|   |-- src/utils/         # Utilities (Email, Errors, Storage)
|
|-- .github/workflows/     # CI/CD GitHub Actions
|-- render.yaml            # Render backend deployment config
|-- ARCHITECTURE.md        # Detailed system architecture document
|-- README.md              # Project documentation
```

## Screenshots

*(Screenshots to be added here - Dashboard, Transactions, Settings, etc.)*

## Future Enhancements
- Expanded test coverage (Unit and E2E)
- Invoice generation and PDF exports
- Advanced financial forecasting tools
- Plaid / Bank API integration for automated transaction syncing
