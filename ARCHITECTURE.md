# MCPmarket — Architecture Document

## 1. Tech Stack

| Layer             | Technology                                            | Rationale                                                             |
| ----------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| **Framework**     | Next.js 15 (App Router)                               | SSR + API routes in one repo, React Server Components for performance |
| **Language**      | TypeScript 5.3                                        | Type safety across full stack                                         |
| **Database**      | SQLite (dev) / PostgreSQL (prod)                      | Prisma makes switching trivial; SQLite for zero-config local dev      |
| **ORM**           | Prisma 5.7                                            | Type-safe queries, migrations, schema-as-code                         |
| **Auth**          | NextAuth.js v5 (beta)                                 | OAuth providers (GitHub, Google), session management, Prisma adapter  |
| **Payments**      | Stripe (Checkout, Connect, Customer Portal, Webhooks) | Industry standard; handles subscriptions, payouts, invoicing          |
| **Styling**       | Tailwind CSS 3.4 + Radix UI primitives                | Utility-first CSS with accessible component primitives                |
| **Charts**        | Recharts 2.10                                         | Lightweight React charting for developer dashboards                   |
| **Forms**         | React Hook Form + Zod                                 | Performant forms with schema-based validation                         |
| **Data Fetching** | TanStack React Query 5                                | Client-side caching, mutation management, optimistic updates          |
| **Deployment**    | Vercel                                                | Zero-config Next.js hosting, edge functions, preview deploys          |

---

## 2. Database Schema

The complete Prisma schema is already defined in `prisma/schema.prisma`. Below is the annotated reference for every model:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ─── AUTH MODELS ──────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          String    @default("USER")         // USER | DEVELOPER | ADMIN
  stripeCustomerId    String?                      // Stripe Customer ID for billing
  stripeConnectId     String?                      // Stripe Connect account for payouts
  connectOnboarded    Boolean  @default(false)     // Whether Stripe Connect onboarding is complete
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  servers       McpServer[]       @relation("ServerOwner")
  subscriptions Subscription[]
  reviews       Review[]
  apiKeys       ApiKey[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── MARKETPLACE MODELS ───────────────────────────────────────

model McpServer {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique                  // URL-safe identifier
  description     String                             // Short description (max 200 chars)
  longDescription String?                            // Full README in markdown
  logoUrl         String?
  repoUrl         String?
  websiteUrl      String?
  category        String   @default("general")       // developer-tools | data | productivity | security | devops | ai-ml | general
  tags            String   @default("[]")             // JSON string array for flexible tagging
  status          String   @default("PENDING")        // PENDING | APPROVED | REJECTED | SUSPENDED
  rejectionReason String?                             // Admin-provided reason for rejection
  featured        Boolean  @default(false)
  featuredUntil   DateTime?

  // Pricing
  pricingModel    String   @default("FREE")           // FREE | SUBSCRIPTION | USAGE
  price           Float    @default(0)                // Monthly subscription price in cents (for SUBSCRIPTION)
  usagePrice      Float?                              // Per-call price in cents (for USAGE)
  freeCallLimit   Int?                                // Number of free calls per billing period (for USAGE)
  priceId         String?                             // Stripe Price ID
  productId       String?                             // Stripe Product ID

  // Stats
  installCount    Int      @default(0)
  viewCount       Int      @default(0)
  avgRating       Float?                              // Cached average rating

  // Hosting
  managedHosting  Boolean  @default(false)
  hostingStatus   String?                             // PROVISIONING | ACTIVE | ERROR | SUSPENDED
  endpointUrl     String?                             // MCP server endpoint URL
  dockerImage     String?                             // Docker image URL for managed hosting
  githubRepoUrl   String?                             // GitHub repo for managed hosting builds

  // Revenue
  totalRevenue    Float    @default(0)                // Lifetime revenue in cents
  platformFee     Float    @default(0.20)             // Revenue share percentage (20%)

  ownerId         String
  owner           User     @relation("ServerOwner", fields: [ownerId], references: [id])

  subscriptions   Subscription[]
  reviews         Review[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Subscription {
  id                   String   @id @default(cuid())
  userId               String
  serverId             String
  status               String   @default("ACTIVE")    // ACTIVE | CANCELED | PAST_DUE
  stripeSubscriptionId String?  @unique
  stripePriceId        String?
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean  @default(false)

  user   User      @relation(fields: [userId], references: [id])
  server McpServer @relation(fields: [serverId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, serverId])
}

model Review {
  id       String  @id @default(cuid())
  rating   Int                                        // 1-5
  comment  String?
  userId   String
  serverId String

  user   User      @relation(fields: [userId], references: [id])
  server McpServer @relation(fields: [serverId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, serverId])
}

model ApiKey {
  id          String    @id @default(cuid())
  name        String                                   // Human-readable label
  keyHash     String    @unique                        // SHA-256 hash of the key (never store plaintext)
  keyPrefix   String                                   // First 8 chars for identification (e.g., "mcpm_abc1")
  userId      String
  serverId    String?                                  // Null = global key, else scoped to a specific server
  lastUsed    DateTime?
  expiresAt   DateTime?
  permissions String    @default("[]")                 // JSON string array
  isActive    Boolean   @default(true)

  user User @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Transaction {
  id                    String   @id @default(cuid())
  amount                Float                          // Total amount in cents
  currency              String   @default("usd")
  platformFee           Float                          // Platform's 20% cut in cents
  developerPayout       Float                          // Developer's 80% in cents
  status                String   @default("PENDING")   // PENDING | COMPLETED | REFUNDED
  stripePaymentIntentId String?
  stripeTransferId      String?                        // Stripe Connect transfer ID
  serverId              String
  buyerId               String
  sellerId              String
  subscriptionId        String?                        // Link to subscription that generated this

  createdAt DateTime @default(now())
}

model FeaturedListing {
  id                   String   @id @default(cuid())
  serverId             String   @unique
  startDate            DateTime
  endDate              DateTime
  paid                 Boolean  @default(false)
  stripeSubscriptionId String?

  createdAt DateTime @default(now())
}

model UsageRecord {
  id         String   @id @default(cuid())
  apiKeyId   String
  serverId   String
  userId     String
  endpoint   String?                                   // Which MCP tool/method was called
  statusCode Int?
  createdAt  DateTime @default(now())
}
```

### Schema Changes from Existing

The following fields are **added** to the existing schema to support all SPEC features:

- `User`: `stripeConnectId`, `connectOnboarded` — for Stripe Connect payouts
- `McpServer`: `rejectionReason`, `usagePrice`, `freeCallLimit`, `avgRating`, `dockerImage`, `githubRepoUrl` — for admin workflow, usage pricing, and managed hosting
- `ApiKey`: renamed `key` → `keyHash` + added `keyPrefix` — security (never store plaintext API keys)
- `Transaction`: `stripeTransferId`, `subscriptionId` — for Connect transfer tracking
- New model `UsageRecord` — for usage-based metering (F013)

---

## 3. API Design

All API routes live under `src/app/api/`. Auth is via NextAuth session (cookie-based for browser) or API key (Bearer token for MCP clients).

### Auth Routes

| Method   | Path                      | Auth           | Description                                      |
| -------- | ------------------------- | -------------- | ------------------------------------------------ |
| GET/POST | `/api/auth/[...nextauth]` | Public         | NextAuth.js catch-all (OAuth callbacks, session) |
| POST     | `/api/auth/upgrade-role`  | Session (USER) | Upgrade user role to DEVELOPER                   |

**POST `/api/auth/upgrade-role`**

```ts
// Request: empty body (uses session user)
// Response: { success: true, role: "DEVELOPER" }
// Errors: 401 Unauthorized, 400 Already a developer
```

### Server Routes

| Method | Path                    | Auth                  | Description                       |
| ------ | ----------------------- | --------------------- | --------------------------------- |
| GET    | `/api/servers`          | Public                | Browse/search servers (paginated) |
| GET    | `/api/servers/[slug]`   | Public                | Get server detail                 |
| POST   | `/api/servers`          | Session (DEVELOPER)   | Create new server listing         |
| PUT    | `/api/servers/[slug]`   | Session (owner)       | Update server listing             |
| DELETE | `/api/servers/[slug]`   | Session (owner/ADMIN) | Delete/suspend server             |
| GET    | `/api/servers/featured` | Public                | Get featured servers              |

**GET `/api/servers`**

```ts
// Query params: ?q=search&category=developer-tools&pricing=SUBSCRIPTION&sort=popular|newest|rating&page=1&limit=20
// Response: { servers: McpServer[], total: number, page: number, totalPages: number }
```

**POST `/api/servers`**

```ts
// Request:
{
  name: string,
  description: string,          // max 200 chars
  longDescription?: string,     // markdown
  category: string,
  tags: string[],
  pricingModel: "FREE" | "SUBSCRIPTION" | "USAGE",
  price?: number,               // cents, required if SUBSCRIPTION
  usagePrice?: number,          // cents per call, required if USAGE
  freeCallLimit?: number,       // required if USAGE
  endpointUrl: string,
  logoUrl?: string,
  repoUrl?: string,
  websiteUrl?: string,
  managedHosting?: boolean,
  dockerImage?: string,
  githubRepoUrl?: string
}
// Response: { server: McpServer }
// Side effects: Creates Stripe Product + Price if paid. Auto-generates slug from name.
```

### Subscription Routes

| Method | Path                             | Auth            | Description                       |
| ------ | -------------------------------- | --------------- | --------------------------------- |
| GET    | `/api/subscriptions`             | Session         | List user's subscriptions         |
| POST   | `/api/subscriptions/checkout`    | Session         | Create Stripe Checkout session    |
| POST   | `/api/subscriptions/[id]/cancel` | Session (owner) | Cancel subscription at period end |
| GET    | `/api/subscriptions/[id]/config` | Session (owner) | Get MCP client config snippet     |

**POST `/api/subscriptions/checkout`**

```ts
// Request: { serverId: string }
// Response: { checkoutUrl: string }
// Side effects: Creates Stripe Checkout Session with server's priceId
```

**GET `/api/subscriptions/[id]/config`**

```ts
// Response:
{
  config: {
    mcpServers: {
      [serverName]: {
        url: string,
        headers: { Authorization: "Bearer mcpm_..." }
      }
    }
  }
}
```

### Billing Routes

| Method | Path                           | Auth                | Description                           |
| ------ | ------------------------------ | ------------------- | ------------------------------------- |
| POST   | `/api/billing/portal`          | Session             | Create Stripe Customer Portal session |
| POST   | `/api/billing/connect/onboard` | Session (DEVELOPER) | Create Stripe Connect onboarding link |
| GET    | `/api/billing/connect/status`  | Session (DEVELOPER) | Check Connect onboarding status       |
| POST   | `/api/webhooks/stripe`         | Stripe signature    | Handle all Stripe webhooks            |

**POST `/api/webhooks/stripe`**

```ts
// Handled events:
// - checkout.session.completed     → Create Subscription + ApiKey, record Transaction
// - invoice.payment_succeeded      → Record Transaction, transfer to Connect account
// - invoice.payment_failed         → Update Subscription status to PAST_DUE
// - customer.subscription.updated  → Sync subscription status
// - customer.subscription.deleted  → Mark subscription CANCELED
// - account.updated                → Update Connect onboarding status
// All events verified via stripe.webhooks.constructEvent()
```

### Review Routes

| Method | Path                          | Auth                 | Description               |
| ------ | ----------------------------- | -------------------- | ------------------------- |
| GET    | `/api/servers/[slug]/reviews` | Public               | List reviews for a server |
| POST   | `/api/servers/[slug]/reviews` | Session (subscriber) | Create/update review      |

**POST `/api/servers/[slug]/reviews`**

```ts
// Request: { rating: number (1-5), comment?: string }
// Response: { review: Review }
// Validation: User must have active subscription to this server
// Side effect: Recalculates server.avgRating
```

### API Key Routes

| Method | Path             | Auth            | Description                              |
| ------ | ---------------- | --------------- | ---------------------------------------- |
| GET    | `/api/keys`      | Session         | List user's API keys (shows prefix only) |
| POST   | `/api/keys`      | Session         | Generate new API key for a server        |
| DELETE | `/api/keys/[id]` | Session (owner) | Revoke an API key                        |

**POST `/api/keys`**

```ts
// Request: { serverId: string, name?: string }
// Response: { apiKey: { id, name, key: "mcpm_...", prefix, serverId, createdAt } }
// NOTE: `key` field contains the plaintext key. It is shown ONCE and never retrievable again.
// Side effect: Hashes key with SHA-256 before storing as keyHash.
```

### Developer Analytics Routes

| Method | Path                                    | Auth                | Description                             |
| ------ | --------------------------------------- | ------------------- | --------------------------------------- |
| GET    | `/api/developer/stats`                  | Session (DEVELOPER) | Aggregate stats across all servers      |
| GET    | `/api/developer/servers/[id]/analytics` | Session (owner)     | Per-server analytics (30-day)           |
| GET    | `/api/developer/transactions`           | Session (DEVELOPER) | Transaction history with payout details |

**GET `/api/developer/stats`**

```ts
// Response:
{
  totalSubscribers: number,
  totalRevenue: number,          // cents, all-time
  monthlyRevenue: number,        // cents, current month
  totalInstalls: number,
  servers: Array<{
    id: string,
    name: string,
    subscribers: number,
    revenue: number,
    status: string
  }>,
  revenueChart: Array<{ month: string, revenue: number }>  // last 12 months
}
```

### Admin Routes

| Method | Path                              | Auth            | Description                   |
| ------ | --------------------------------- | --------------- | ----------------------------- |
| GET    | `/api/admin/stats`                | Session (ADMIN) | Platform-wide stats           |
| GET    | `/api/admin/servers/pending`      | Session (ADMIN) | List pending server approvals |
| POST   | `/api/admin/servers/[id]/approve` | Session (ADMIN) | Approve a server listing      |
| POST   | `/api/admin/servers/[id]/reject`  | Session (ADMIN) | Reject with reason            |
| GET    | `/api/admin/users`                | Session (ADMIN) | Search/list users             |

**POST `/api/admin/servers/[id]/reject`**

```ts
// Request: { reason: string }
// Response: { server: McpServer }
// Side effect: Sets status=REJECTED, stores rejectionReason
```

### API Key Authentication (for MCP clients)

| Method | Path              | Auth             | Description                              |
| ------ | ----------------- | ---------------- | ---------------------------------------- |
| POST   | `/api/verify-key` | API Key (Bearer) | Verify an API key and return access info |

**POST `/api/verify-key`**

```ts
// Headers: Authorization: Bearer mcpm_xxxxx
// Response: { valid: true, userId: string, serverId: string, permissions: string[] }
// Side effect: Updates ApiKey.lastUsed timestamp
```

---

## 4. Page / Route Map

All pages use the Next.js App Router under `src/app/`.

### Public Pages (no auth)

| URL               | File                              | Data Requirements                                            | Description                          |
| ----------------- | --------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| `/`               | `src/app/page.tsx`                | None (static)                                                | Landing page with hero, pricing, FAQ |
| `/servers`        | `src/app/servers/page.tsx`        | `GET /api/servers`                                           | Browse & search marketplace          |
| `/servers/[slug]` | `src/app/servers/[slug]/page.tsx` | `GET /api/servers/[slug]`, `GET /api/servers/[slug]/reviews` | Server detail page                   |
| `/pricing`        | `src/app/pricing/page.tsx`        | None (static)                                                | Detailed pricing page                |

### Auth Pages

| URL            | File                           | Data Requirements  | Description                |
| -------------- | ------------------------------ | ------------------ | -------------------------- |
| `/auth/signin` | `src/app/auth/signin/page.tsx` | NextAuth providers | Sign in with GitHub/Google |
| `/auth/error`  | `src/app/auth/error/page.tsx`  | Error params       | Auth error display         |

### Dashboard Pages (auth required: any role)

| URL                        | File                                       | Data Requirements        | Description                       |
| -------------------------- | ------------------------------------------ | ------------------------ | --------------------------------- |
| `/dashboard`               | `src/app/dashboard/page.tsx`               | `GET /api/subscriptions` | User home — active subscriptions  |
| `/dashboard/subscriptions` | `src/app/dashboard/subscriptions/page.tsx` | `GET /api/subscriptions` | All subscriptions with management |
| `/dashboard/api-keys`      | `src/app/dashboard/api-keys/page.tsx`      | `GET /api/keys`          | API key management                |
| `/dashboard/settings`      | `src/app/dashboard/settings/page.tsx`      | Session user             | Account settings, role upgrade    |

### Developer Pages (auth required: DEVELOPER role)

| URL                                      | File                                                     | Data Requirements                                                    | Description                    |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------ |
| `/dashboard/developer`                   | `src/app/dashboard/developer/page.tsx`                   | `GET /api/developer/stats`                                           | Developer analytics overview   |
| `/dashboard/developer/servers/new`       | `src/app/dashboard/developer/servers/new/page.tsx`       | None                                                                 | Create new server listing form |
| `/dashboard/developer/servers/[id]`      | `src/app/dashboard/developer/servers/[id]/page.tsx`      | `GET /api/developer/servers/[id]/analytics`                          | Per-server analytics           |
| `/dashboard/developer/servers/[id]/edit` | `src/app/dashboard/developer/servers/[id]/edit/page.tsx` | `GET /api/servers/[slug]`                                            | Edit server listing            |
| `/dashboard/developer/payouts`           | `src/app/dashboard/developer/payouts/page.tsx`           | `GET /api/developer/transactions`, `GET /api/billing/connect/status` | Payout history & Connect setup |

### Admin Pages (auth required: ADMIN role)

| URL              | File                             | Data Requirements                | Description              |
| ---------------- | -------------------------------- | -------------------------------- | ------------------------ |
| `/admin`         | `src/app/admin/page.tsx`         | `GET /api/admin/stats`           | Admin dashboard overview |
| `/admin/servers` | `src/app/admin/servers/page.tsx` | `GET /api/admin/servers/pending` | Server approval queue    |
| `/admin/users`   | `src/app/admin/users/page.tsx`   | `GET /api/admin/users`           | User management          |

---

## 5. Component Hierarchy

### Layouts

```
src/app/layout.tsx                        # Root layout: Navbar + Footer + metadata
├── src/app/(marketing)/layout.tsx        # Marketing pages (landing, pricing) — full-width
├── src/app/(app)/layout.tsx              # App pages (dashboard, etc.) — sidebar + auth gate
│   ├── src/app/dashboard/layout.tsx      # Dashboard sidebar nav (user tabs)
│   └── src/app/admin/layout.tsx          # Admin sidebar nav (admin tabs)
```

### Shared Components (`src/components/`)

```
src/components/
├── ui/                           # Primitive UI components (Radix-based)
│   ├── button.tsx                # Already exists
│   ├── input.tsx                 # Text input with label + error
│   ├── textarea.tsx              # Multi-line input
│   ├── select.tsx                # Dropdown select
│   ├── card.tsx                  # Card container with header/content/footer
│   ├── badge.tsx                 # Status/category badges
│   ├── dialog.tsx                # Modal dialog
│   ├── avatar.tsx                # User/server avatar
│   ├── skeleton.tsx              # Loading skeleton
│   ├── tabs.tsx                  # Tab navigation
│   ├── dropdown-menu.tsx         # User menu dropdown
│   └── toast.tsx                 # Toast notifications
├── navbar.tsx                    # Already exists — add auth state (user menu vs sign-in)
├── footer.tsx                    # Already exists
├── sidebar.tsx                   # Dashboard sidebar navigation
├── server-card.tsx               # Server listing card (used in browse grid)
├── server-grid.tsx               # Grid of server cards with loading state
├── search-bar.tsx                # Search input with debounce
├── category-filter.tsx           # Category filter pills
├── pricing-toggle.tsx            # Free/Paid filter toggle
├── sort-select.tsx               # Sort dropdown (Popular, Newest, Top Rated)
├── review-card.tsx               # Individual review display
├── review-form.tsx               # Review submission form (star rating + comment)
├── star-rating.tsx               # Star rating display (read-only + interactive)
├── config-snippet.tsx            # MCP config JSON display with copy button
├── api-key-row.tsx               # API key list row with revoke action
├── subscription-card.tsx         # Subscription card with status + actions
├── stats-card.tsx                # Metric card (number + label + trend)
├── revenue-chart.tsx             # Revenue line chart (Recharts wrapper)
├── server-form.tsx               # Server listing create/edit form
├── stripe-connect-banner.tsx     # CTA banner for Connect onboarding
├── empty-state.tsx               # Empty state illustration + CTA
├── markdown-renderer.tsx         # Sanitized markdown to HTML renderer
└── providers.tsx                 # React Query + Session providers wrapper
```

### Page Components

Each page file (`page.tsx`) is a thin orchestrator that:

1. Fetches data (server component) or sets up React Query hooks (client component)
2. Composes shared components
3. Handles page-level state (search params, filters)

---

## 6. Data Flow

### Flow 1: User Subscribes to a Server

```
User clicks "Subscribe" on /servers/[slug]
  → Client calls POST /api/subscriptions/checkout { serverId }
    → API verifies user session
    → API fetches server from DB (gets priceId)
    → API creates Stripe Checkout Session (mode: subscription, with application_fee_percent: 20)
    → API returns { checkoutUrl }
  → Client redirects to Stripe Checkout
  → User completes payment on Stripe
  → Stripe sends webhook: checkout.session.completed
    → POST /api/webhooks/stripe
      → Verify webhook signature
      → Create Subscription record (status: ACTIVE)
      → Generate API key (hash + store)
      → Create Transaction record
      → Increment server.installCount
      → Transfer 80% to developer via Stripe Connect
  → User redirected to /dashboard?success=true
    → Dashboard shows new subscription + API key (displayed once)
```

### Flow 2: Developer Lists a Server

```
Developer visits /dashboard/developer/servers/new
  → Fills out server-form.tsx (name, description, pricing, endpoint, etc.)
  → Client calls POST /api/servers
    → API validates input with Zod schema
    → API generates slug from name
    → If paid: API creates Stripe Product + Price
    → API creates McpServer record (status: PENDING)
    → API returns { server }
  → Developer sees server in dashboard with "Pending Review" status
  → Admin visits /admin/servers, sees pending server
  → Admin clicks "Approve"
    → POST /api/admin/servers/[id]/approve
      → Sets status=APPROVED
  → Server appears in public browse page
```

### Flow 3: Developer Sets Up Payouts

```
Developer visits /dashboard/developer/payouts
  → Page checks GET /api/billing/connect/status
    → Returns { onboarded: false }
  → Developer clicks "Set Up Payouts"
    → POST /api/billing/connect/onboard
      → Creates Stripe Connect account (type: express)
      → Returns { onboardingUrl }
  → Developer redirected to Stripe Connect onboarding
  → Completes KYC and bank details on Stripe
  → Stripe sends webhook: account.updated
    → POST /api/webhooks/stripe
      → Updates user.connectOnboarded = true
  → Developer returns to /dashboard/developer/payouts
    → Shows payout history + next payout estimate
```

### Flow 4: API Key Authentication (MCP Client → Server)

```
MCP Client (Claude, Cursor, etc.) makes a tool call
  → Client reads mcp.json config: { url, headers: { Authorization: "Bearer mcpm_xxx" } }
  → Request sent to MCP server endpoint with Bearer token
  → MCP server calls POST /api/verify-key with the token
    → API hashes the token with SHA-256
    → Looks up ApiKey by keyHash
    → Verifies isActive=true, not expired
    → Updates lastUsed timestamp
    → Returns { valid: true, userId, serverId }
  → MCP server processes the request
  → Response returned to MCP client
```

---

## 7. Security Checklist

### Authentication & Authorization

- [x] OAuth-only auth (GitHub, Google) — no password storage
- [x] NextAuth.js session with secure, httpOnly cookies
- [x] Role-based access control: USER, DEVELOPER, ADMIN
- [x] All dashboard/admin routes check session + role in middleware
- [x] Server-side session verification on every API route (no client-only checks)

### API Security

- [x] Stripe webhook signature verification (`stripe.webhooks.constructEvent`)
- [x] API keys hashed with SHA-256 before storage — plaintext never persisted
- [x] API key prefix system (`mcpm_`) for identification without exposing the key
- [x] Rate limiting via middleware: 100 req/min (public), 1000 req/min (authenticated)
- [x] All inputs validated with Zod schemas before processing
- [x] SQL injection prevented by Prisma parameterized queries

### Data Protection

- [x] No plaintext secrets in database (API keys hashed, Stripe tokens managed by Stripe)
- [x] Environment variables for all secrets (DATABASE_URL, STRIPE_SECRET_KEY, NEXTAUTH_SECRET)
- [x] `.env` in `.gitignore` — never committed
- [x] Stripe Customer Portal for PCI-compliant payment method management (card data never touches our servers)

### Web Security

- [x] CSRF: NextAuth.js CSRF token on all auth mutations
- [x] XSS: Markdown rendered with sanitization (strip `<script>`, `onclick`, etc.)
- [x] Content-Security-Policy headers (configured in `next.config.js`)
- [x] X-Frame-Options: DENY (clickjacking prevention, configured in `next.config.js`)
- [x] X-Content-Type-Options: nosniff (configured in `next.config.js`)
- [x] HTTPS-only in production (enforced by Vercel)

### Billing Security

- [x] Stripe Checkout for payment collection — PCI SAQ-A compliance
- [x] Idempotency keys on webhook processing to prevent duplicate charges
- [x] Webhook event deduplication via `stripePaymentIntentId` unique check
- [x] Revenue split (80/20) calculated server-side — never client-controlled
- [x] `application_fee_percent` set on Stripe Connect, enforced by Stripe

### Infrastructure

- [x] Database backups (Vercel Postgres automatic daily backups in production)
- [x] Error monitoring via Next.js built-in error boundaries + logging
- [x] No stack traces or internal paths in API error responses
- [x] Prisma connection pooling for production workloads

---

## 8. File Structure

```
src/
├── app/
│   ├── layout.tsx                                    # Root layout
│   ├── page.tsx                                      # Landing page (F010)
│   ├── globals.css
│   ├── (marketing)/
│   │   └── pricing/
│   │       └── page.tsx                              # Pricing page
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx                              # Sign in page (F004)
│   │   └── error/
│   │       └── page.tsx                              # Auth error page
│   ├── servers/
│   │   ├── page.tsx                                  # Browse servers (F002)
│   │   └── [slug]/
│   │       └── page.tsx                              # Server detail (F003)
│   ├── dashboard/
│   │   ├── layout.tsx                                # Dashboard layout with sidebar
│   │   ├── page.tsx                                  # User dashboard home (F007)
│   │   ├── subscriptions/
│   │   │   └── page.tsx                              # Subscription management (F007)
│   │   ├── api-keys/
│   │   │   └── page.tsx                              # API key management (F008)
│   │   ├── settings/
│   │   │   └── page.tsx                              # Account settings
│   │   └── developer/
│   │       ├── page.tsx                              # Developer dashboard (F006)
│   │       ├── servers/
│   │       │   ├── new/
│   │       │   │   └── page.tsx                      # Create server (F001)
│   │       │   └── [id]/
│   │       │       ├── page.tsx                      # Server analytics (F006)
│   │       │       └── edit/
│   │       │           └── page.tsx                  # Edit server (F001)
│   │       └── payouts/
│   │           └── page.tsx                          # Payout management (F009)
│   ├── admin/
│   │   ├── layout.tsx                                # Admin layout
│   │   ├── page.tsx                                  # Admin dashboard (F012)
│   │   ├── servers/
│   │   │   └── page.tsx                              # Server approval queue (F012)
│   │   └── users/
│   │       └── page.tsx                              # User management (F012)
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/
│       │   │   └── route.ts                          # NextAuth catch-all (F004)
│       │   └── upgrade-role/
│       │       └── route.ts                          # Role upgrade (F004)
│       ├── servers/
│       │   ├── route.ts                              # GET list / POST create (F001, F002)
│       │   ├── featured/
│       │   │   └── route.ts                          # GET featured servers (F014)
│       │   └── [slug]/
│       │       ├── route.ts                          # GET detail / PUT update / DELETE (F003)
│       │       └── reviews/
│       │           └── route.ts                      # GET / POST reviews (F011)
│       ├── subscriptions/
│       │   ├── route.ts                              # GET user subscriptions (F007)
│       │   ├── checkout/
│       │   │   └── route.ts                          # POST create checkout (F005)
│       │   └── [id]/
│       │       ├── cancel/
│       │       │   └── route.ts                      # POST cancel subscription (F005)
│       │       └── config/
│       │           └── route.ts                      # GET MCP config snippet (F007)
│       ├── billing/
│       │   ├── portal/
│       │   │   └── route.ts                          # POST customer portal (F007)
│       │   └── connect/
│       │       ├── onboard/
│       │       │   └── route.ts                      # POST Connect onboarding (F009)
│       │       └── status/
│       │           └── route.ts                      # GET Connect status (F009)
│       ├── keys/
│       │   ├── route.ts                              # GET list / POST create (F008)
│       │   └── [id]/
│       │       └── route.ts                          # DELETE revoke key (F008)
│       ├── verify-key/
│       │   └── route.ts                              # POST verify API key (F008)
│       ├── developer/
│       │   ├── stats/
│       │   │   └── route.ts                          # GET developer stats (F006)
│       │   ├── servers/
│       │   │   └── [id]/
│       │   │       └── analytics/
│       │   │           └── route.ts                  # GET per-server analytics (F006)
│       │   └── transactions/
│       │       └── route.ts                          # GET transaction history (F009)
│       ├── admin/
│       │   ├── stats/
│       │   │   └── route.ts                          # GET platform stats (F012)
│       │   ├── servers/
│       │   │   ├── pending/
│       │   │   │   └── route.ts                      # GET pending servers (F012)
│       │   │   └── [id]/
│       │   │       ├── approve/
│       │   │       │   └── route.ts                  # POST approve (F012)
│       │   │       └── reject/
│       │   │           └── route.ts                  # POST reject (F012)
│       │   └── users/
│       │       └── route.ts                          # GET users (F012)
│       └── webhooks/
│           └── stripe/
│               └── route.ts                          # POST Stripe webhooks (F005, F009)
├── components/
│   ├── ui/                                           # Primitive UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── toast.tsx
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── sidebar.tsx
│   ├── server-card.tsx
│   ├── server-grid.tsx
│   ├── search-bar.tsx
│   ├── category-filter.tsx
│   ├── pricing-toggle.tsx
│   ├── sort-select.tsx
│   ├── review-card.tsx
│   ├── review-form.tsx
│   ├── star-rating.tsx
│   ├── config-snippet.tsx
│   ├── api-key-row.tsx
│   ├── subscription-card.tsx
│   ├── stats-card.tsx
│   ├── revenue-chart.tsx
│   ├── server-form.tsx
│   ├── stripe-connect-banner.tsx
│   ├── empty-state.tsx
│   ├── markdown-renderer.tsx
│   └── providers.tsx
├── lib/
│   ├── utils.ts                                      # Utility functions (existing)
│   ├── prisma.ts                                     # Prisma client singleton
│   ├── auth.ts                                       # NextAuth config + helpers
│   ├── stripe.ts                                     # Stripe client + helpers
│   ├── api-keys.ts                                   # API key generation + hashing
│   ├── validations/
│   │   ├── server.ts                                 # Server form Zod schemas
│   │   ├── review.ts                                 # Review Zod schema
│   │   └── common.ts                                 # Shared validation schemas
│   └── constants.ts                                  # App-wide constants (categories, etc.)
└── types/
    ├── index.ts                                      # Shared TypeScript types
    ├── api.ts                                        # API request/response types
    └── next-auth.d.ts                                # NextAuth type augmentation
```
