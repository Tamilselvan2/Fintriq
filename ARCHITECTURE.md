# Fintriq System Architecture

This document outlines the detailed architecture, data flows, and technical decisions of the Fintriq platform.

## System Architecture

### Frontend
- **Framework:** Next.js 14 (App Router)
- **PWA:** next-pwa (Offline support and installability)
- **State Management:** React Query (Server state), React Context (Local state)
- **Styling:** Tailwind CSS, Shadcn UI (Accessible, customizable components)
- **Data Visualization:** Recharts (Responsive, animated financial charts)
- **Testing:** Jest + React Testing Library (Isolated tsconfig scopes)

### Backend
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Validation:** Zod (Request payload schemas)
- **Testing:** Jest (Supertest API integration ready)

### Database
- **Engine:** PostgreSQL
- **Host:** Supabase
- **Structure:** Multi-tenant (all major entities are scoped via an enforced `orgId`)

---

## Data Flows

### Authentication Flow

Fintriq uses a robust dual-token mechanism. Access tokens are stored ephemerally in memory to prevent XSS, while refresh tokens are secured in `HttpOnly` cookies.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL
    
    U->>F: Enters credentials
    F->>B: POST /api/auth/login
    B->>DB: Verify user & password hash
    DB-->>B: User data
    B->>B: Generate Access & Refresh tokens
    B-->>F: Access token (JSON) + Refresh token (HttpOnly Cookie)
    F->>F: Store Access token in memory (Zustand/Context)
    F->>U: Redirect to Dashboard
```

### Password Reset Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant E as Brevo (Email)
    participant DB as PostgreSQL
    
    U->>F: Requests password reset
    F->>B: POST /api/auth/forgot-password
    B->>DB: Generate & Store PasswordResetToken
    B->>E: Send reset email
    E-->>U: Receives email with secure link
    U->>F: Clicks link, submits new password
    F->>B: POST /api/auth/reset-password
    B->>DB: Validate token & Update password
    B-->>F: Success
```

### Invitation Flow

Fintriq allows Admins to securely onboard new team members to their isolated organization workspace.

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend
    participant E as Brevo (Email)
    participant DB as PostgreSQL
    
    A->>F: Inputs invitee email & role
    F->>B: POST /api/organizations/invite
    B->>DB: Create InvitationToken (Linked to orgId)
    B->>E: Send invitation email via SMTP
    E-->>User: Receives email with /accept-invitation link
    User->>F: Opens link, fills registration form
    F->>B: POST /api/auth/register (includes token)
    B->>DB: Validate token, Create User, Link to orgId
    B-->>F: Auth Tokens generated
    F->>User: Redirects to Dashboard
```

### Profile Picture Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant C as File Storage (Cloudinary)
    participant DB as PostgreSQL
    
    U->>F: Uploads image file
    F->>B: POST multipart/form-data
    B->>C: Streams upload to cloud storage
    C-->>B: Returns secure URL & public_id
    B->>DB: Update User record with image details
    B-->>F: Returns updated User object
    F->>U: Displays new avatar
```

### Dashboard Analytics Flow

The dashboard requires rapid aggregation of organizational data.

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL
    
    F->>B: GET /api/dashboard/stats
    B->>DB: prisma.transaction.aggregate (grouped by type, filtered by date & orgId)
    DB-->>B: Aggregated raw data
    B->>B: Format net balance, trends, and chart structures
    B-->>F: JSON (Stats, ChartData, RecentActivity)
    F->>F: Recharts renders visual data
```

### CSV Export Flow

Generating robust financial reports securely.

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL
    
    F->>F: Compiles active filters (search, dates, category)
    F->>B: GET /api/transactions/export (with query params)
    B->>DB: Run aggregate calculations (Total Income/Expense)
    B->>B: Set Content-Disposition (attachment; filename=...)
    B->>B: Write CSV Header block
    loop Over 1000 records batch
        B->>DB: Fetch batch of filtered transactions
        B->>B: Format row and stream to HTTP response
    end
    B-->>F: Complete File Blob
    F->>F: Triggers browser download prompt
```

### Audit Log Flow

Ensuring compliance and accountability across the platform.

```mermaid
sequenceDiagram
    participant B as Backend Modules
    participant A as Audit Service
    participant DB as PostgreSQL
    
    B->>B: Core action completes (e.g., Delete Transaction)
    B->>A: Fire-and-forget logRequest()
    A->>DB: Asynchronously insert AuditLog (orgId, userId, action, details)
    DB-->>A: Saved
```

---

## Deployment Architecture

Fintriq uses a decoupled, modern serverless/PaaS deployment architecture for optimal scaling and minimal DevOps overhead.

```mermaid
graph TD
    Client[Web Browser] -->|HTTPS| V[Vercel]
    
    subgraph Frontend Tier
        V[Vercel] -->|Hosts| NextApp[Next.js Application]
    end
    
    NextApp -->|REST API Requests| R[Render]
    
    subgraph Backend Tier
        R[Render] -->|Hosts| ExpressAPI[Express.js Node Server]
    end
    
    subgraph Infrastructure
        ExpressAPI -->|Prisma Connection| DB[(Supabase PostgreSQL)]
        ExpressAPI -->|SMTP| Email[Brevo Email Service]
        ExpressAPI -->|API| Storage[Cloudinary Image Storage]
    end
```

### Deployment Configuration Highlights
- **Vercel:** Automates frontend builds directly from the GitHub repository (`main` branch).
- **Render:** Utilizes a `render.yaml` configuration file as infrastructure-as-code for the backend API.
- **Supabase:** Provides highly available PostgreSQL with automated backups. Database migrations are applied automatically during the Render build step via `npx prisma migrate deploy`.
