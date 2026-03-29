# MCPmarket — Test Plan

> **Generated:** 2026-03-29
> **Scope:** All P0 acceptance criteria (SPEC.md) + P1 features already scaffolded in ARCHITECTURE.md
> **Stack:** Next.js 15 App Router · TypeScript · Prisma/SQLite → PostgreSQL · NextAuth v5 · Stripe · Zod · Vitest · Playwright

---

## Table of Contents

1. [Test Strategy & Philosophy](#1-test-strategy--philosophy)
2. [Pyramid Ratios & Tooling](#2-pyramid-ratios--tooling)
3. [Unit Tests](#3-unit-tests)
4. [Integration Tests (API Routes)](#4-integration-tests-api-routes)
5. [End-to-End Tests](#5-end-to-end-tests)
6. [Property-Based Tests](#6-property-based-tests)
7. [Acceptance Criteria Traceability Matrix](#7-acceptance-criteria-traceability-matrix)
8. [Per-Module Coverage Targets](#8-per-module-coverage-targets)
9. [Test Data & Fixtures](#9-test-data--fixtures)
10. [CI/CD Integration](#10-cicd-integration)

---

## 1. Test Strategy & Philosophy

### 1.1 Guiding Principles

MCPmarket is a **payments-critical marketplace**. The blast radius of a bug varies enormously by subsystem:

| Subsystem                         | Bug Cost                    | Test Priority |
| --------------------------------- | --------------------------- | ------------- |
| Stripe webhook handler            | Revenue loss, wrong payouts | **Critical**  |
| API key hashing / verification    | Security breach             | **Critical**  |
| Revenue split calculation (80/20) | Financial liability         | **Critical**  |
| Auth / RBAC enforcement           | Privilege escalation        | **Critical**  |
| Server approval workflow          | Bad actor exposure          | **High**      |
| Subscription lifecycle            | Customer churn              | **High**      |
| Search / browse / pagination      | Poor UX                     | **Medium**    |
| UI cosmetics / copy               | Low                         | **Low**       |

Tests are written **risk-first, not coverage-first**. A 100% line-coverage number that misses the Stripe signature bypass is worthless.

### 1.2 Test Types in Use

```
         ┌───────────────────────┐
         │    E2E (Playwright)   │  ~10% of test count, highest confidence
         ├───────────────────────┤
         │  Integration (Vitest  │  ~25% — API routes with real DB (SQLite)
         │  + fetch-mock/MSW)    │
         ├───────────────────────┤
         │  Unit (Vitest)        │  ~65% — pure functions, validators, helpers
         └───────────────────────┘
         Also: fast-check for property tests on validators & serializers
```

### 1.3 Boundary Decisions

| Boundary         | Decision                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Stripe SDK calls | **Mock** at the `stripe.*` call level; never hit real Stripe in unit/integration             |
| Prisma DB        | **Real SQLite** in-memory for integration tests (reset per suite via `prisma migrate reset`) |
| NextAuth session | **Inject synthetic session** via test helper `withSession(role)`                             |
| External OAuth   | **Never called**; NextAuth adapter is mocked                                                 |
| Stripe webhooks  | **Reconstruct real signature** using `stripe.webhooks.generateTestHeaderString`              |
| Email delivery   | Out of scope for V1; no tests needed                                                         |

---

## 2. Pyramid Ratios & Tooling

### 2.1 Tooling Matrix

| Layer             | Tool                                                          | Config file                    |
| ----------------- | ------------------------------------------------------------- | ------------------------------ |
| Unit              | **Vitest**                                                    | `vitest.config.ts`             |
| Integration       | **Vitest** + `@vitest/coverage-v8` + **MSW** for Stripe calls | `vitest.integration.config.ts` |
| E2E               | **Playwright**                                                | `playwright.config.ts`         |
| Property-based    | **fast-check** (runs inside Vitest)                           | same as unit                   |
| Visual regression | **Playwright** screenshot assertions (smoke only)             | `playwright.config.ts`         |
| DB fixtures       | **prisma-test-environment** (custom)                          | `tests/setup/prisma.ts`        |

### 2.2 Scripts

```jsonc
// package.json additions
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:integration": "vitest run --config vitest.integration.config.ts",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:all": "npm run test:coverage && npm run test:integration && npm run test:e2e"
}
```

### 2.3 File Naming Conventions

```
src/
  lib/__tests__/api-keys.test.ts       ← unit
  lib/__tests__/stripe.test.ts         ← unit
  lib/validations/__tests__/server.test.ts
tests/
  integration/
    api/servers.test.ts                ← integration
    api/webhooks-stripe.test.ts
    api/subscriptions.test.ts
  e2e/
    flows/publish-server.spec.ts       ← E2E
    flows/subscribe.spec.ts
    pages/browse.spec.ts
  fixtures/
    users.ts
    servers.ts
  setup/
    prisma.ts
    msw-handlers.ts
```

---

## 3. Unit Tests

### 3.1 `src/lib/api-keys.ts`

**Functions:** `generateApiKey()`, `hashApiKey(key)`, `extractBearerToken(header)`

#### Test Cases

```typescript
// generateApiKey()
UT-KEY-001  returns object with { key, keyHash, keyPrefix }
UT-KEY-002  key always starts with "mcpm_"
UT-KEY-003  key length is deterministic (5 + 64 hex chars = 69)
UT-KEY-004  two sequential calls never return the same key (probabilistic, 5 runs)
UT-KEY-005  keyPrefix equals first 8 chars after "mcpm_" stripped
UT-KEY-006  keyHash is a valid 64-char hex string (SHA-256)

// hashApiKey(key)
UT-KEY-007  hashApiKey(key) === hashApiKey(key)  — deterministic
UT-KEY-008  hashApiKey("mcpm_abc") !== hashApiKey("mcpm_abd")
UT-KEY-009  hashApiKey returns 64-char lowercase hex
UT-KEY-010  hashApiKey(generateApiKey().key) === generateApiKey's own keyHash

// extractBearerToken(header)
UT-KEY-011  "Bearer mcpm_abc123" → "mcpm_abc123"
UT-KEY-012  "bearer mcpm_abc123" (lowercase) → null OR "mcpm_abc123" (document decision)
UT-KEY-013  undefined header → null
UT-KEY-014  "" → null
UT-KEY-015  "Basic abc123" → null
UT-KEY-016  "Bearer " (empty token after space) → null
UT-KEY-017  "Bearer  double-space" → null (or trimmed, document behavior)

// Security invariants
UT-KEY-018  plaintext key is NOT present in keyHash
UT-KEY-019  keyHash stored for a generated key validates the same plaintext key
```

**Edge Cases:** empty string inputs, non-string inputs (TypeScript guards), unicode in header values.

**Mock Boundaries:** `crypto.randomBytes` — stub to fixed bytes in UT-KEY-004 to make determinism testable.

---

### 3.2 `src/lib/validations/server.ts`

**Schema:** `serverCreateSchema`, `serverUpdateSchema`

#### Test Cases

```typescript
// Valid inputs
UT-VAL-SRV-001  minimal valid FREE server passes
UT-VAL-SRV-002  SUBSCRIPTION server with price passes
UT-VAL-SRV-003  USAGE server with pricePerCall + freeCallLimit passes
UT-VAL-SRV-004  managedHosting=true omits endpoint requirement
UT-VAL-SRV-005  all optional fields (tags, repoUrl, dockerImage) accepted when present

// Name validation
UT-VAL-SRV-006  name shorter than 2 chars → ZodError (too_small)
UT-VAL-SRV-007  name longer than 100 chars → ZodError (too_big)
UT-VAL-SRV-008  name = exactly 2 chars → passes
UT-VAL-SRV-009  name = exactly 100 chars → passes

// Description validation
UT-VAL-SRV-010  description shorter than 10 chars → ZodError
UT-VAL-SRV-011  description longer than 200 chars → ZodError

// Category validation
UT-VAL-SRV-012  invalid category string → ZodError (invalid_enum_value)
UT-VAL-SRV-013  each valid category value passes (7 categories)

// Pricing model cross-field rules
UT-VAL-SRV-014  SUBSCRIPTION without price → ZodError
UT-VAL-SRV-015  SUBSCRIPTION with price=0 → ZodError (price must be > 0)
UT-VAL-SRV-016  USAGE without pricePerCall → ZodError
UT-VAL-SRV-017  USAGE without freeCallLimit → ZodError
UT-VAL-SRV-018  FREE with price field → price field ignored or ZodError (document)
UT-VAL-SRV-019  SUBSCRIPTION price negative → ZodError

// Endpoint validation
UT-VAL-SRV-020  managedHosting=false without endpoint → ZodError
UT-VAL-SRV-021  managedHosting=false with invalid URL endpoint → ZodError
UT-VAL-SRV-022  managedHosting=true without endpoint → passes
```

---

### 3.3 `src/lib/validations/review.ts`

```typescript
UT-VAL-REV-001  rating=1 → passes
UT-VAL-REV-002  rating=5 → passes
UT-VAL-REV-003  rating=0 → ZodError (< 1)
UT-VAL-REV-004  rating=6 → ZodError (> 5)
UT-VAL-REV-005  rating=3.5 → ZodError (must be integer)
UT-VAL-REV-006  comment=undefined → passes (optional)
UT-VAL-REV-007  comment="" → passes (empty string allowed)
UT-VAL-REV-008  comment length 2001 chars → ZodError (too_big)
UT-VAL-REV-009  comment length 2000 chars → passes
```

---

### 3.4 `src/lib/validations/common.ts`

```typescript
UT-VAL-CMN-001  paginationSchema defaults: page=1, limit=20
UT-VAL-CMN-002  page=0 → ZodError (min 1)
UT-VAL-CMN-003  limit=0 → ZodError (min 1)
UT-VAL-CMN-004  limit=101 → ZodError (max 100)
UT-VAL-CMN-005  limit=100 → passes
UT-VAL-CMN-006  searchSchema: all filter combinations valid
UT-VAL-CMN-007  sort="invalid" → ZodError
UT-VAL-CMN-008  sort="popular"|"newest"|"rating" → each passes
UT-VAL-CMN-009  slugSchema: "valid-slug-123" → passes
UT-VAL-CMN-010  slugSchema: "UPPERCASE" → ZodError or normalized (document behavior)
UT-VAL-CMN-011  emailSchema: "user@example.com" → passes
UT-VAL-CMN-012  emailSchema: "notanemail" → ZodError
```

---

### 3.5 `src/lib/stripe.ts`

**Functions:** `createStripeProduct`, `createStripePrice`, `createCheckoutSession`, `createConnectOnboardingLink`, `calculatePlatformFee`, `calculateDeveloperShare`

#### Test Cases

```typescript
// Revenue split — CRITICAL financial logic
UT-STRIPE-001  calculatePlatformFee(1000) === 200      (20%)
UT-STRIPE-002  calculateDeveloperShare(1000) === 800   (80%)
UT-STRIPE-003  platformFee + developerShare === amount (no rounding leak)
UT-STRIPE-004  calculatePlatformFee(0) === 0
UT-STRIPE-005  calculatePlatformFee(1) === 0 or 1     (document rounding behavior — cents)
UT-STRIPE-006  calculatePlatformFee(999) + calculateDeveloperShare(999) === 999
UT-STRIPE-007  large amount: calculatePlatformFee(1_000_000) === 200_000

// createStripeProduct (mocked Stripe SDK)
UT-STRIPE-008  calls stripe.products.create with correct name
UT-STRIPE-009  passes metadata.serverId to product
UT-STRIPE-010  throws on Stripe API error → propagates error type

// createStripePrice (mocked)
UT-STRIPE-011  recurring.interval = "month" for SUBSCRIPTION pricing
UT-STRIPE-012  unit_amount matches the server price (in cents)
UT-STRIPE-013  currency = "usd"

// createCheckoutSession (mocked)
UT-STRIPE-014  mode = "subscription"
UT-STRIPE-015  application_fee_percent = 20
UT-STRIPE-016  transfer_data.destination = developer's connectAccountId
UT-STRIPE-017  metadata includes serverId and userId
UT-STRIPE-018  success_url and cancel_url present

// createConnectOnboardingLink (mocked)
UT-STRIPE-019  type = "account_onboarding"
UT-STRIPE-020  return_url and refresh_url present
```

**Mock Boundaries:** All `stripe.*` calls → `vi.mock('stripe')` with typed mocks.

---

### 3.6 `src/lib/auth.ts`

```typescript
// requireAuth()
UT-AUTH-001  no session → throws 401-equivalent error
UT-AUTH-002  valid session → returns session object

// requireRole()
UT-AUTH-003  USER requesting DEVELOPER route → throws 403-equivalent
UT-AUTH-004  DEVELOPER requesting DEVELOPER route → passes
UT-AUTH-005  ADMIN requesting DEVELOPER route → passes (ADMIN ⊇ DEVELOPER)
UT-AUTH-006  USER requesting ADMIN route → throws 403
UT-AUTH-007  DEVELOPER requesting ADMIN route → throws 403
UT-AUTH-008  ADMIN requesting ADMIN route → passes
UT-AUTH-009  null role → throws 403
```

---

### 3.7 `src/lib/utils.ts`

```typescript
UT-UTILS-001  formatPrice(0) → "$0.00"
UT-UTILS-002  formatPrice(1000) → "$10.00"
UT-UTILS-003  formatPrice(99) → "$0.99"
UT-UTILS-004  formatPrice(2900) → "$29.00"
UT-UTILS-005  formatDate(new Date("2024-01-15")) → locale-formatted string (snapshot)
UT-UTILS-006  cn("foo", "bar") → "foo bar"
UT-UTILS-007  cn("foo", undefined, "bar") → "foo bar" (falsy values dropped)
UT-UTILS-008  cn("foo", { bar: true, baz: false }) → "foo bar"
```

---

### 3.8 `src/lib/constants.ts`

```typescript
UT-CONST-001  PLATFORM_FEE_PERCENT === 20
UT-CONST-002  DEVELOPER_SHARE_PERCENT === 80
UT-CONST-003  PLATFORM_FEE_PERCENT + DEVELOPER_SHARE_PERCENT === 100
UT-CONST-004  MANAGED_HOSTING_PRICE_CENTS === 900
UT-CONST-005  FEATURED_LISTING_PRICE_CENTS === 2900
UT-CONST-006  MIN_PAYOUT_CENTS === 2500
UT-CONST-007  CATEGORIES array contains exactly 7 items
UT-CONST-008  PRICING_MODELS contains FREE, SUBSCRIPTION, USAGE
UT-CONST-009  SERVER_STATUSES contains PENDING, APPROVED, REJECTED, SUSPENDED
UT-CONST-010  SUBSCRIPTION_STATUSES contains ACTIVE, CANCELED, PAST_DUE
```

---

## 4. Integration Tests (API Routes)

Integration tests use:

- **Real SQLite** DB (Prisma, reset between suites)
- **MSW** to intercept outbound Stripe API calls
- **Synthetic session injection** via custom Next.js test wrapper
- **`stripe.webhooks.generateTestHeaderString`** to produce real webhook signatures

---

### 4.1 `GET /api/servers`

```typescript
IT-SRV-LST-001  returns 200 + paginated list (default page=1 limit=20)
IT-SRV-LST-002  returns only APPROVED servers
IT-SRV-LST-003  q= filter returns servers matching name/description
IT-SRV-LST-004  category= filter returns only matching category
IT-SRV-LST-005  pricing= filter (FREE/SUBSCRIPTION/USAGE) returns correct subset
IT-SRV-LST-006  sort=popular orders by installCount desc
IT-SRV-LST-007  sort=newest orders by createdAt desc
IT-SRV-LST-008  sort=rating orders by avgRating desc
IT-SRV-LST-009  page=2 returns second page, totalPages correct
IT-SRV-LST-010  limit=5 returns max 5 results
IT-SRV-LST-011  empty result → 200 + { data: [], total: 0 }
IT-SRV-LST-012  PENDING servers excluded from public listing
IT-SRV-LST-013  limit=101 → 400 (validation error)
IT-SRV-LST-014  page=0 → 400
```

---

### 4.2 `GET /api/servers/[slug]`

```typescript
IT-SRV-DTL-001  valid slug of APPROVED server → 200 + full server object
IT-SRV-DTL-002  unknown slug → 404
IT-SRV-DTL-003  PENDING server slug → 404 (not visible to public)
IT-SRV-DTL-004  REJECTED server slug → 404
IT-SRV-DTL-005  response includes owner.name but not owner.email
IT-SRV-DTL-006  viewCount is incremented on each GET
```

---

### 4.3 `POST /api/servers` (Create Listing)

```typescript
// Auth / RBAC
IT-SRV-CRT-001  unauthenticated → 401
IT-SRV-CRT-002  USER role → 403
IT-SRV-CRT-003  DEVELOPER role → can create
IT-SRV-CRT-004  ADMIN role → can create

// Happy path
IT-SRV-CRT-005  valid FREE server payload → 201, status=PENDING
IT-SRV-CRT-006  valid SUBSCRIPTION server → 201, Stripe product+price created (mocked)
IT-SRV-CRT-007  valid USAGE server → 201
IT-SRV-CRT-008  managedHosting=true server → 201, no endpoint required
IT-SRV-CRT-009  slug is auto-generated from name (lowercase, hyphenated)
IT-SRV-CRT-010  slug collisions produce unique slugs (e.g. "my-server-2")

// Validation errors
IT-SRV-CRT-011  missing name → 400
IT-SRV-CRT-012  name too short → 400
IT-SRV-CRT-013  SUBSCRIPTION without price → 400
IT-SRV-CRT-014  USAGE without pricePerCall → 400
IT-SRV-CRT-015  invalid category → 400
IT-SRV-CRT-016  non-URL endpoint → 400
IT-SRV-CRT-017  Stripe failure on product creation → 500 + no DB record created (transaction safety)
```

---

### 4.4 `PUT /api/servers/[slug]` (Update Listing)

```typescript
IT-SRV-UPD-001  unauthenticated → 401
IT-SRV-UPD-002  non-owner DEVELOPER → 403
IT-SRV-UPD-003  owner DEVELOPER → 200
IT-SRV-UPD-004  ADMIN (non-owner) → 200
IT-SRV-UPD-005  update name → reflected in response + DB
IT-SRV-UPD-006  update pricing type from FREE to SUBSCRIPTION → new Stripe price created
IT-SRV-UPD-007  unknown slug → 404
IT-SRV-UPD-008  invalid payload → 400
```

---

### 4.5 `DELETE /api/servers/[slug]`

```typescript
IT-SRV-DEL-001  unauthenticated → 401
IT-SRV-DEL-002  non-owner DEVELOPER → 403
IT-SRV-DEL-003  owner DEVELOPER → 204
IT-SRV-DEL-004  ADMIN (non-owner) → 204
IT-SRV-DEL-005  server with active subscriptions → behavior documented (soft-delete or block)
IT-SRV-DEL-006  unknown slug → 404
```

---

### 4.6 `GET /api/servers/featured`

```typescript
IT-SRV-FTR-001  returns only APPROVED servers with active FeaturedListing
IT-SRV-FTR-002  expired FeaturedListings are excluded
IT-SRV-FTR-003  returns 200 + array (empty OK)
```

---

### 4.7 `GET /api/servers/[slug]/reviews` & `POST /api/servers/[slug]/reviews`

```typescript
// GET
IT-REV-LST-001  returns 200 + list of reviews for APPROVED server
IT-REV-LST-002  unknown slug → 404
IT-REV-LST-003  reviews include reviewer name + avatar URL

// POST
IT-REV-CRT-001  unauthenticated → 401
IT-REV-CRT-002  user without active subscription → 403 (can only review if subscribed)
IT-REV-CRT-003  subscribed user → 201, review created
IT-REV-CRT-004  second review from same user on same server → 200, review updated (upsert)
IT-REV-CRT-005  rating=0 → 400
IT-REV-CRT-006  rating=6 → 400
IT-REV-CRT-007  comment > 2000 chars → 400
IT-REV-CRT-008  avgRating on McpServer updated after new review
```

---

### 4.8 `POST /api/subscriptions/checkout`

```typescript
IT-SUB-CHK-001  unauthenticated → 401
IT-SUB-CHK-002  FREE server → 400 (no checkout needed)
IT-SUB-CHK-003  already subscribed (ACTIVE) → 400 (no duplicate)
IT-SUB-CHK-004  valid SUBSCRIPTION server → 200 + { url: checkoutUrl }
IT-SUB-CHK-005  developer without Stripe Connect set up → 400 or 422 (cannot receive payments)
IT-SUB-CHK-006  Stripe checkout creation fails → 500
IT-SUB-CHK-007  metadata includes serverId and userId in session
```

---

### 4.9 `POST /api/subscriptions/[id]/cancel`

```typescript
IT-SUB-CAN-001  unauthenticated → 401
IT-SUB-CAN-002  subscription belonging to other user → 403
IT-SUB-CAN-003  own ACTIVE subscription → 200, cancel_at_period_end=true (not immediate)
IT-SUB-CAN-004  already CANCELED subscription → 400
IT-SUB-CAN-005  non-existent id → 404
IT-SUB-CAN-006  Stripe cancel_at_period_end called on stripeSubscriptionId (mocked)
```

---

### 4.10 `GET /api/subscriptions/[id]/config`

```typescript
IT-SUB-CFG-001  unauthenticated → 401
IT-SUB-CFG-002  subscription of other user → 403
IT-SUB-CFG-003  ACTIVE subscription → 200 + MCP config JSON snippet
IT-SUB-CFG-004  CANCELED subscription → 403 or 404 (no config access)
IT-SUB-CFG-005  config snippet contains endpoint URL + apiKey field
IT-SUB-CFG-006  config snippet is valid JSON (parse check)
```

---

### 4.11 `GET /api/subscriptions`

```typescript
IT-SUB-LST-001  unauthenticated → 401
IT-SUB-LST-002  returns only current user's subscriptions
IT-SUB-LST-003  includes server name, slug, status per subscription
IT-SUB-LST-004  returns empty array when none (not 404)
```

---

### 4.12 `POST /api/billing/portal`

```typescript
IT-BIL-PRT-001  unauthenticated → 401
IT-BIL-PRT-002  user without stripeCustomerId → 400 (no Stripe customer)
IT-BIL-PRT-003  valid user → 200 + { url: portalUrl } (mocked Stripe)
```

---

### 4.13 `POST /api/billing/connect/onboard`

```typescript
IT-BIL-CON-001  unauthenticated → 401
IT-BIL-CON-002  USER role (not DEVELOPER) → 403
IT-BIL-CON-003  DEVELOPER already onboarded → returns existing or refresh link
IT-BIL-CON-004  new DEVELOPER → creates Express account + returns onboarding URL (mocked)
IT-BIL-CON-005  saves connectAccountId to User record
```

---

### 4.14 `GET /api/billing/connect/status`

```typescript
IT-BIL-STS-001  unauthenticated → 401
IT-BIL-STS-002  no connect account → { onboarded: false }
IT-BIL-STS-003  account with charges_enabled=true → { onboarded: true }
IT-BIL-STS-004  account with charges_enabled=false → { onboarded: false, requiresAction: true }
```

---

### 4.15 `POST /api/keys` & `GET /api/keys`

```typescript
// POST
IT-KEY-CRT-001  unauthenticated → 401
IT-KEY-CRT-002  valid name → 201 + { key, keyPrefix, id } — plaintext key returned ONCE
IT-KEY-CRT-003  response does NOT contain keyHash
IT-KEY-CRT-004  DB stores keyHash, NOT plaintext key
IT-KEY-CRT-005  name > 100 chars → 400

// GET
IT-KEY-LST-001  unauthenticated → 401
IT-KEY-LST-002  returns list with keyPrefix, name, createdAt — no keyHash, no plaintext
IT-KEY-LST-003  only current user's keys returned
```

---

### 4.16 `DELETE /api/keys/[id]`

```typescript
IT-KEY-DEL-001  unauthenticated → 401
IT-KEY-DEL-002  key belonging to other user → 403
IT-KEY-DEL-003  own key → 204, isActive=false in DB
IT-KEY-DEL-004  verify-key with revoked key → 401 after deletion
IT-KEY-DEL-005  non-existent id → 404
```

---

### 4.17 `POST /api/verify-key`

```typescript
IT-VFY-001  missing Authorization header → 401
IT-VFY-002  non-Bearer scheme → 401
IT-VFY-003  valid active key → 200 + { userId, serverId?, scopes }
IT-VFY-004  revoked key (isActive=false) → 401
IT-VFY-005  expired key (expiresAt in past) → 401
IT-VFY-006  unknown key hash → 401
IT-VFY-007  lastUsed timestamp updated on successful verify
IT-VFY-008  response NEVER includes keyHash or plaintext key
```

---

### 4.18 `POST /api/webhooks/stripe` — CRITICAL

```typescript
// Signature verification
IT-WH-001  missing stripe-signature header → 400
IT-WH-002  invalid signature → 400
IT-WH-003  valid signature → 200

// checkout.session.completed
IT-WH-004  creates Subscription record with status=ACTIVE
IT-WH-005  increments McpServer.installCount
IT-WH-006  creates Transaction with correct platformFee (20%) and developerPayout (80%)
IT-WH-007  duplicate event (same paymentIntentId) → idempotent, no duplicate records
IT-WH-008  sets User.stripeCustomerId if not already set

// invoice.payment_succeeded
IT-WH-009  creates new Transaction for renewal
IT-WH-010  Subscription remains ACTIVE

// invoice.payment_failed
IT-WH-011  updates Subscription status to PAST_DUE

// customer.subscription.updated
IT-WH-012  cancel_at_period_end=true → Subscription status remains ACTIVE (cancelled at end)
IT-WH-013  status=canceled → Subscription status = CANCELED

// customer.subscription.deleted
IT-WH-014  Subscription status set to CANCELED
IT-WH-015  McpServer.installCount decremented (if applicable)

// account.updated (Connect)
IT-WH-016  charges_enabled=true → User.connectOnboarded=true
IT-WH-017  charges_enabled=false → User.connectOnboarded=false

// Platform fee calculation — CRITICAL
IT-WH-018  $10 subscription → $2.00 platform fee, $8.00 developer payout in Transaction
IT-WH-019  $29 featured listing → $5.80 platform fee, $23.20 developer payout
IT-WH-020  Transaction amounts sum to original amount
```

---

### 4.19 `POST /api/auth/upgrade-role`

```typescript
IT-AUTH-UPG-001  unauthenticated → 401
IT-AUTH-UPG-002  USER accepts terms → role updated to DEVELOPER
IT-AUTH-UPG-003  already DEVELOPER → 200 (no-op or idempotent)
IT-AUTH-UPG-004  ADMIN calling → role unchanged (stays ADMIN)
IT-AUTH-UPG-005  terms=false → 400 (must accept terms to upgrade)
```

---

### 4.20 Admin Routes

```typescript
// GET /api/admin/servers/pending
IT-ADM-001  non-ADMIN → 403
IT-ADM-002  ADMIN → 200 + list of PENDING servers

// POST /api/admin/servers/[id]/approve
IT-ADM-003  non-ADMIN → 403
IT-ADM-004  ADMIN + pending server → 200, status=APPROVED
IT-ADM-005  already APPROVED → 400 (or idempotent 200)
IT-ADM-006  Stripe product activated on approval (mocked)

// POST /api/admin/servers/[id]/reject
IT-ADM-007  non-ADMIN → 403
IT-ADM-008  ADMIN + reason → 200, status=REJECTED
IT-ADM-009  missing reason → 400
IT-ADM-010  REJECTED server not visible in public listing (cross-check IT-SRV-LST-012)

// GET /api/admin/stats
IT-ADM-011  non-ADMIN → 403
IT-ADM-012  ADMIN → 200 + { totalServers, totalUsers, totalRevenue, pendingApprovals }

// GET /api/admin/users
IT-ADM-013  non-ADMIN → 403
IT-ADM-014  ADMIN → 200 + paginated user list with roles
```

---

### 4.21 Developer Analytics Routes

```typescript
// GET /api/developer/stats
IT-DEV-001  unauthenticated → 401
IT-DEV-002  USER role → 403
IT-DEV-003  DEVELOPER → 200 + { totalRevenue, totalSubscribers, avgRating, serverCount }
IT-DEV-004  stats reflect only current developer's servers

// GET /api/developer/servers/[id]/analytics
IT-DEV-005  non-owner → 403
IT-DEV-006  own server → 200 + { dailySubscribers[], revenueByDay[], viewCount }
IT-DEV-007  date range filtering (start, end params)

// GET /api/developer/transactions
IT-DEV-008  DEVELOPER → 200 + transaction list with platformFee, developerPayout
IT-DEV-009  only shows transactions for developer's own servers
```

---

## 5. End-to-End Tests

All E2E tests run against the **full Next.js dev server** with a seeded test database.

### `data-testid` Attribute Requirements

The following `data-testid` attributes must be present in the implementation for E2E selectors:

```
// Auth
data-testid="signin-github-btn"
data-testid="signin-google-btn"
data-testid="user-menu"
data-testid="signout-btn"

// Browse / Search
data-testid="search-input"
data-testid="category-filter"
data-testid="pricing-filter"
data-testid="sort-select"
data-testid="server-card"
data-testid="server-card-name"
data-testid="server-card-price"
data-testid="server-card-category"
data-testid="pagination-next"
data-testid="pagination-prev"

// Server Detail
data-testid="server-name"
data-testid="server-description"
data-testid="server-pricing"
data-testid="subscribe-btn"
data-testid="review-list"
data-testid="review-form"
data-testid="star-rating-input"
data-testid="review-comment-input"
data-testid="submit-review-btn"

// Dashboard
data-testid="subscription-card"
data-testid="cancel-subscription-btn"
data-testid="view-config-btn"
data-testid="config-snippet"

// API Keys
data-testid="create-key-btn"
data-testid="key-name-input"
data-testid="key-display"        // shown once after creation
data-testid="revoke-key-btn"

// Developer
data-testid="create-server-btn"
data-testid="server-form"
data-testid="server-name-input"
data-testid="server-description-input"
data-testid="server-category-select"
data-testid="pricing-model-select"
data-testid="price-input"
data-testid="endpoint-input"
data-testid="submit-server-btn"
data-testid="connect-stripe-btn"
data-testid="analytics-revenue-chart"

// Admin
data-testid="pending-server-card"
data-testid="approve-btn"
data-testid="reject-btn"
data-testid="reject-reason-input"
```

---

### Page Object Models

```typescript
// tests/e2e/pages/BrowsePage.ts
class BrowsePage {
  goto(), search(q), filterByCategory(cat), filterByPricing(model),
  sortBy(option), getServerCards(), clickServer(name),
  getNextPage(), getPrevPage()
}

// tests/e2e/pages/ServerDetailPage.ts
class ServerDetailPage {
  goto(slug), getTitle(), getPricing(), clickSubscribe(),
  submitReview(rating, comment), getReviews()
}

// tests/e2e/pages/DashboardPage.ts
class DashboardPage {
  goto(), getSubscriptions(), cancelSubscription(name),
  viewConfig(name), getConfigSnippet()
}

// tests/e2e/pages/DeveloperPage.ts
class DeveloperPage {
  goto(), clickCreateServer(), fillServerForm(data),
  submitForm(), getAnalytics(), clickConnectStripe()
}

// tests/e2e/pages/AdminPage.ts
class AdminPage {
  goto(), getPendingServers(), approveServer(name),
  rejectServer(name, reason)
}

// tests/e2e/pages/ApiKeysPage.ts
class ApiKeysPage {
  goto(), createKey(name), getDisplayedKey(),
  getKeyList(), revokeKey(prefix)
}
```

---

### E2E Flow: F002 — Server Discovery & Browse (SPEC §F002)

```
E2E-BROWSE-001  Landing page has CTA "Browse Servers" → clicking navigates to /servers
E2E-BROWSE-002  /servers loads with server cards visible
E2E-BROWSE-003  Search "data" → cards update, all cards match "data" theme
E2E-BROWSE-004  Filter by category "developer-tools" → only developer-tools cards shown
E2E-BROWSE-005  Filter by pricing "FREE" → only free servers shown
E2E-BROWSE-006  Sort by "Newest" → order changes
E2E-BROWSE-007  Pagination: next page shows different results
E2E-BROWSE-008  Clear all filters → full list returns
E2E-BROWSE-009  Empty search "zzz_nonexistent" → empty state component visible
E2E-BROWSE-010  Server card shows name, pricing, category badge, rating
```

**AC Coverage:** F002-AC1 (search), F002-AC2 (filters), F002-AC3 (sorting), F002-AC4 (pagination)

---

### E2E Flow: F003 — Server Detail Page (SPEC §F003)

```
E2E-DETAIL-001  Clicking server card navigates to /servers/[slug]
E2E-DETAIL-002  Page shows name, full description, category, pricing, install count
E2E-DETAIL-003  "Subscribe" button visible for SUBSCRIPTION server
E2E-DETAIL-004  Unauthenticated user clicking "Subscribe" → redirected to sign in
E2E-DETAIL-005  FREE server shows "Install" / config snippet directly
E2E-DETAIL-006  Reviews section shows existing reviews with star ratings
E2E-DETAIL-007  Authenticated non-subscriber cannot see review form
E2E-DETAIL-008  MCP config snippet visible after subscribing (see E2E-SUB-007)
```

**AC Coverage:** F003-AC1 (details displayed), F003-AC2 (subscribe CTA), F003-AC3 (config)

---

### E2E Flow: F004 — Authentication (SPEC §F004)

```
E2E-AUTH-001  /auth/signin shows GitHub and Google buttons
E2E-AUTH-002  After mock OAuth sign-in → redirected to /dashboard
E2E-AUTH-003  Session persists on page reload
E2E-AUTH-004  Sign-out clears session, redirects to /
E2E-AUTH-005  Protected route /dashboard → unauthenticated redirected to /auth/signin
E2E-AUTH-006  Protected route /dashboard/developer → USER role redirected (403 page)
E2E-AUTH-007  /admin → USER/DEVELOPER role redirected (403 page)
```

**AC Coverage:** F004-AC1 (GitHub/Google OAuth), F004-AC2 (session persistence), F004-AC3 (protected routes)

---

### E2E Flow: F001 — Server Publishing (SPEC §F001)

```
E2E-PUB-001   Upgrade to Developer: /dashboard/settings shows "Become a Developer" CTA
E2E-PUB-002   Accepting terms → role updated, developer nav appears
E2E-PUB-003   /dashboard/developer/servers/new shows server creation form
E2E-PUB-004   Fill FREE server form → submit → success toast, redirect to server list
E2E-PUB-005   New server shows "Pending Review" status badge
E2E-PUB-006   SUBSCRIPTION form shows price input, validates > 0
E2E-PUB-007   USAGE form shows pricePerCall + freeCallLimit inputs
E2E-PUB-008   Form validation: empty name shows inline error
E2E-PUB-009   Form validation: invalid URL endpoint shows inline error
E2E-PUB-010   managedHosting toggle hides endpoint field
E2E-PUB-011   Submit with missing required fields → submit button disabled or errors shown
E2E-PUB-012   Edit existing server: /dashboard/developer/servers/[id]/edit pre-populates form
E2E-PUB-013   Edit → save → changes reflected on server detail page (after re-approve if needed)
```

**AC Coverage:** F001-AC1 (form fields), F001-AC2 (pricing models), F001-AC3 (pending status), F001-AC4 (edit)

---

### E2E Flow: F005 — Stripe Subscription Billing (SPEC §F005)

```
E2E-SUB-001   Subscribe button on SUBSCRIPTION server detail → Stripe Checkout redirect
              (use Stripe test mode; mock redirect in CI)
E2E-SUB-002   After successful checkout (webhook simulation) → subscription appears in /dashboard/subscriptions
E2E-SUB-003   Subscription card shows server name, price, renewal date, status
E2E-SUB-004   "Manage Billing" button → Stripe Customer Portal redirect (mocked)
E2E-SUB-005   Cancel subscription → confirmation dialog → cancel_at_period_end
E2E-SUB-006   Canceled subscription shows "Cancels on [date]" badge
E2E-SUB-007   /dashboard/subscriptions/[id]/config shows MCP config snippet
E2E-SUB-008   Config snippet is copyable (copy button present)
E2E-SUB-009   Already subscribed server detail page does not show subscribe button
```

**AC Coverage:** F005-AC1 (checkout), F005-AC2 (subscription dashboard), F005-AC3 (cancel), F005-AC4 (config)

---

### E2E Flow: F006 — Developer Dashboard & Analytics (SPEC §F006)

```
E2E-DEV-001   /dashboard/developer shows aggregate stats: revenue, subscribers, servers
E2E-DEV-002   Revenue chart renders (recharts SVG present)
E2E-DEV-003   Server list shows each server with subscriber count and revenue
E2E-DEV-004   Clicking server name → /dashboard/developer/servers/[id] per-server analytics
E2E-DEV-005   Per-server page shows subscriber history chart
E2E-DEV-006   Stripe Connect banner visible when not onboarded
E2E-DEV-007   "Set Up Payouts" button initiates Connect onboarding (mocked redirect)
E2E-DEV-008   After onboarding: banner replaced with payout summary
E2E-DEV-009   /dashboard/developer/payouts shows transaction list with amounts
```

**AC Coverage:** F006-AC1 (stats), F006-AC2 (charts), F006-AC3 (per-server), F006-AC4 (payouts)

---

### E2E Flow: F007 — User Subscription Management (SPEC §F007)

```
E2E-USR-001   /dashboard shows active subscription list
E2E-USR-002   Each subscription has: server name, price, next billing date, status
E2E-USR-003   "View Config" opens config snippet modal/page
E2E-USR-004   "Cancel" triggers confirmation, then cancel_at_period_end
E2E-USR-005   PAST_DUE subscription shows warning badge
E2E-USR-006   Empty state shown when no subscriptions
```

**AC Coverage:** F007-AC1 (list), F007-AC2 (config access), F007-AC3 (cancel)

---

### E2E Flow: F008 — API Key Management (SPEC §F008)

```
E2E-KEY-001   /dashboard/api-keys shows existing keys (prefix only, no plaintext)
E2E-KEY-002   "Create Key" button opens name input dialog
E2E-KEY-003   After creation → modal shows full plaintext key with copy button
E2E-KEY-004   Modal includes warning "This key will not be shown again"
E2E-KEY-005   Closing modal → key no longer retrievable from UI (only prefix shown)
E2E-KEY-006   Key appears in list with prefix, name, creation date
E2E-KEY-007   "Revoke" button → confirmation → key disappears from list
E2E-KEY-008   Revoked key: POST /api/verify-key with old key → 401
```

**AC Coverage:** F008-AC1 (generate), F008-AC2 (list), F008-AC3 (revoke), F008-AC4 (shown once)

---

### E2E Flow: F009 — Stripe Connect Payouts (SPEC §F009)

```
E2E-PAY-001   DEVELOPER without Connect sees "Set Up Payouts" prompt
E2E-PAY-002   Clicking prompt redirects to Stripe Connect onboarding (mocked)
E2E-PAY-003   After onboarding webhook: payout section shows account status
E2E-PAY-004   Transaction history shows 80% payout per transaction
E2E-PAY-005   Minimum $25 payout threshold info displayed
```

**AC Coverage:** F009-AC1 (Connect setup), F009-AC2 (80/20 split visibility), F009-AC3 (payout history)

---

### E2E Flow: F010 — Landing Page (SPEC §F010)

```
E2E-LND-001   / loads with hero section, headline, CTA buttons
E2E-LND-002   "Browse Servers" CTA → /servers
E2E-LND-003   "Become a Developer" CTA → /auth/signin (if unauthed) or /dashboard/developer
E2E-LND-004   Featured servers section shows up to N featured servers
E2E-LND-005   Page LCP < 2500ms (Playwright performance API)
E2E-LND-006   Pricing section visible with platform fee (20%) disclosed
```

**AC Coverage:** F010-AC1 (hero), F010-AC2 (featured), F010-AC3 (performance)

---

### E2E Flow: F011 — Reviews & Ratings (SPEC §F011, P1)

```
E2E-REV-001   Authenticated subscriber on server detail → review form visible
E2E-REV-002   Submit 5-star review with comment → review appears in list
E2E-REV-003   Star rating widget is interactive (hover + click)
E2E-REV-004   Server avgRating updates after review submission
E2E-REV-005   Editing own review → stars and comment pre-populated
E2E-REV-006   Non-subscriber → no review form, message "Subscribe to leave a review"
```

**AC Coverage:** F011-AC1 (submit), F011-AC2 (update), F011-AC3 (subscriber-only)

---

### E2E Flow: F012 — Admin Approval (SPEC §F012, P1)

```
E2E-ADM-001   /admin accessible only with ADMIN role
E2E-ADM-002   Pending server queue shows server name, developer, category
E2E-ADM-003   "Approve" button → server status = APPROVED, appears in /servers browse
E2E-ADM-004   "Reject" button → requires rejection reason → status = REJECTED
E2E-ADM-005   Rejected server does NOT appear in /servers browse
E2E-ADM-006   Admin sees platform stats: total servers, users, revenue
```

**AC Coverage:** F012-AC1 (queue), F012-AC2 (approve), F012-AC3 (reject with reason)

---

## 6. Property-Based Tests

Run via **fast-check** inside Vitest unit tests.

### 6.1 Serialization Roundtrips

```typescript
// PBT-SER-001: API response types round-trip through JSON
fc.property(
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 2, maxLength: 100 }),
    price: fc.integer({ min: 0, max: 1_000_000 }),
  }),
  (server) => {
    expect(JSON.parse(JSON.stringify(server))).toEqual(server);
  },
);

// PBT-SER-002: formatPrice(n) always produces a string starting with "$"
fc.property(fc.integer({ min: 0, max: 1_000_000 }), (cents) => {
  expect(formatPrice(cents)).toMatch(/^\$/);
});

// PBT-SER-003: formatPrice never loses cents precision
fc.property(fc.integer({ min: 0, max: 9_999_999 }), (cents) => {
  const formatted = formatPrice(cents);
  const reparsed = Math.round(parseFloat(formatted.replace("$", "")) * 100);
  expect(reparsed).toBe(cents);
});
```

### 6.2 Validator Invariants

```typescript
// PBT-VAL-001: hashApiKey is stable (deterministic, pure)
fc.property(fc.string({ minLength: 1 }), (key) => {
  expect(hashApiKey(key)).toBe(hashApiKey(key));
});

// PBT-VAL-002: hashApiKey always returns 64-char hex
fc.property(fc.string({ minLength: 1 }), (key) => {
  expect(hashApiKey(key)).toMatch(/^[0-9a-f]{64}$/);
});

// PBT-VAL-003: generateApiKey always passes its own keyHash verification
fc.property(fc.constant(null), () => {
  const { key, keyHash } = generateApiKey();
  expect(hashApiKey(key)).toBe(keyHash);
});

// PBT-VAL-004: Revenue split is always exact and loss-free
fc.property(fc.integer({ min: 0, max: 10_000_000 }), (amount) => {
  expect(calculatePlatformFee(amount) + calculateDeveloperShare(amount)).toBe(
    amount,
  );
});

// PBT-VAL-005: Platform fee is always ~20% (within rounding)
fc.property(fc.integer({ min: 100, max: 10_000_000 }), (amount) => {
  const fee = calculatePlatformFee(amount);
  expect(fee / amount).toBeCloseTo(0.2, 1);
});

// PBT-VAL-006: Pagination always returns non-negative page numbers
fc.property(
  fc.record({
    page: fc.integer({ min: 1, max: 1000 }),
    limit: fc.integer({ min: 1, max: 100 }),
  }),
  (params) => {
    const result = paginationSchema.safeParse(params);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBeGreaterThanOrEqual(1);
  },
);

// PBT-VAL-007: Slug generation is always URL-safe
fc.property(
  fc.string({ minLength: 2, maxLength: 100, unit: "grapheme-ascii" }),
  (name) => {
    const slug = generateSlug(name);
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  },
);
```

### 6.3 Security Properties

```typescript
// PBT-SEC-001: No two distinct inputs share the same hash (collision resistance sample)
fc.property(
  fc
    .tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))
    .filter(([a, b]) => a !== b),
  ([a, b]) => {
    expect(hashApiKey(a)).not.toBe(hashApiKey(b));
  },
);

// PBT-SEC-002: Platform fee is never zero for any positive amount > 4 cents
fc.property(fc.integer({ min: 5, max: 10_000_000 }), (amount) => {
  expect(calculatePlatformFee(amount)).toBeGreaterThan(0);
});
```

---

## 7. Acceptance Criteria Traceability Matrix

Every SPEC.md acceptance criterion maps to at least one test.

| Feature                 | Acceptance Criterion                                                          | Test ID(s)                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **F001** Server Listing | Developer can create server listing with name, description, category, pricing | IT-SRV-CRT-005..007, E2E-PUB-003..004                                        |
| F001                    | Server requires admin approval before visibility                              | IT-SRV-CRT-005 (status=PENDING), E2E-PUB-005, IT-ADM-003..004                |
| F001                    | Supported pricing: FREE, SUBSCRIPTION, USAGE                                  | IT-SRV-CRT-005..007, UT-VAL-SRV-001..003                                     |
| F001                    | SUBSCRIPTION requires price > 0                                               | UT-VAL-SRV-014..015, IT-SRV-CRT-013                                          |
| F001                    | USAGE requires pricePerCall + freeCallLimit                                   | UT-VAL-SRV-016..017, IT-SRV-CRT-014                                          |
| F001                    | Endpoint required unless managedHosting=true                                  | UT-VAL-SRV-020..022, IT-SRV-CRT-008                                          |
| F001                    | Developer can edit own listing                                                | IT-SRV-UPD-003, E2E-PUB-012..013                                             |
| F001                    | Only owner or ADMIN can edit/delete                                           | IT-SRV-UPD-002, IT-SRV-DEL-002..003                                          |
| **F002** Discovery      | Browse/search by keyword                                                      | IT-SRV-LST-003, E2E-BROWSE-003                                               |
| F002                    | Filter by category                                                            | IT-SRV-LST-004, E2E-BROWSE-004                                               |
| F002                    | Filter by pricing model                                                       | IT-SRV-LST-005, E2E-BROWSE-005                                               |
| F002                    | Sort by popular/newest/rating                                                 | IT-SRV-LST-006..008, E2E-BROWSE-006                                          |
| F002                    | Pagination                                                                    | IT-SRV-LST-009..010, E2E-BROWSE-007                                          |
| F002                    | Only APPROVED servers visible                                                 | IT-SRV-LST-002, IT-SRV-LST-012                                               |
| **F003** Server Detail  | Display full server info                                                      | IT-SRV-DTL-001, E2E-DETAIL-002                                               |
| F003                    | Subscribe CTA for paid servers                                                | E2E-DETAIL-003                                                               |
| F003                    | MCP config snippet after subscription                                         | IT-SUB-CFG-003..005, E2E-SUB-007                                             |
| F003                    | Unauthenticated subscribe → redirect to sign in                               | E2E-DETAIL-004                                                               |
| **F004** Auth           | GitHub OAuth sign in                                                          | E2E-AUTH-001..002                                                            |
| F004                    | Google OAuth sign in                                                          | E2E-AUTH-001..002                                                            |
| F004                    | Session persistence                                                           | E2E-AUTH-003                                                                 |
| F004                    | Protected routes enforce auth                                                 | E2E-AUTH-005                                                                 |
| F004                    | Role-based route protection                                                   | UT-AUTH-003..009, E2E-AUTH-006..007                                          |
| F004                    | Upgrade USER → DEVELOPER                                                      | IT-AUTH-UPG-001..004, E2E-PUB-001..002                                       |
| **F005** Billing        | Stripe Checkout for SUBSCRIPTION servers                                      | IT-SUB-CHK-003..004, E2E-SUB-001                                             |
| F005                    | FREE server has no checkout                                                   | IT-SUB-CHK-002                                                               |
| F005                    | Duplicate subscription blocked                                                | IT-SUB-CHK-003                                                               |
| F005                    | checkout.session.completed creates Subscription                               | IT-WH-004                                                                    |
| F005                    | Subscription visible in dashboard                                             | E2E-SUB-002..003                                                             |
| F005                    | Cancel at period end                                                          | IT-SUB-CAN-003, E2E-SUB-005..006                                             |
| F005                    | Stripe Customer Portal                                                        | IT-BIL-PRT-003, E2E-SUB-004                                                  |
| F005                    | invoice.payment_failed → PAST_DUE                                             | IT-WH-011                                                                    |
| F005                    | Config snippet access for ACTIVE subscribers only                             | IT-SUB-CFG-003..004, IT-VFY-004                                              |
| **F006** Dev Dashboard  | Aggregate stats (revenue, subscribers)                                        | IT-DEV-001..003, E2E-DEV-001                                                 |
| F006                    | Revenue charts                                                                | E2E-DEV-002                                                                  |
| F006                    | Per-server analytics                                                          | IT-DEV-005..006, E2E-DEV-004..005                                            |
| F006                    | Stripe Connect setup                                                          | IT-BIL-CON-003..005, E2E-DEV-006..008                                        |
| F006                    | Transaction history                                                           | IT-DEV-008..009, E2E-DEV-009                                                 |
| **F007** User Dashboard | Subscription list                                                             | IT-SUB-LST-001..003, E2E-USR-001..002                                        |
| F007                    | Config snippet access                                                         | IT-SUB-CFG-003, E2E-USR-003                                                  |
| F007                    | Cancel subscription                                                           | IT-SUB-CAN-003, E2E-USR-004                                                  |
| F007                    | PAST_DUE status visibility                                                    | IT-WH-011, E2E-USR-005                                                       |
| **F008** API Keys       | Generate key (shown once)                                                     | IT-KEY-CRT-001..004, E2E-KEY-003..005                                        |
| F008                    | Key stored as SHA-256 hash only                                               | IT-KEY-CRT-004, UT-KEY-019, PBT-VAL-001..002                                 |
| F008                    | List keys (prefix only)                                                       | IT-KEY-LST-002, E2E-KEY-006                                                  |
| F008                    | Revoke key                                                                    | IT-KEY-DEL-003..004, E2E-KEY-007..008                                        |
| F008                    | Verify key via Bearer token                                                   | IT-VFY-001..008                                                              |
| F008                    | Expired keys rejected                                                         | IT-VFY-005                                                                   |
| **F009** Payouts        | Stripe Connect Express onboarding                                             | IT-BIL-CON-003..005, E2E-PAY-001..003                                        |
| F009                    | 80/20 revenue split                                                           | IT-WH-006, IT-WH-018..020, UT-STRIPE-001..007, PBT-VAL-004..005, E2E-PAY-004 |
| F009                    | Platform fee correct in Transaction record                                    | IT-WH-006, IT-WH-018..020                                                    |
| F009                    | account.updated webhook updates onboarded status                              | IT-WH-016..017                                                               |
| **F010** Landing        | Hero section + CTAs                                                           | E2E-LND-001..003                                                             |
| F010                    | Featured servers section                                                      | IT-SRV-FTR-001..003, E2E-LND-004                                             |
| F010                    | LCP < 2500ms                                                                  | E2E-LND-005                                                                  |
| **F011** Reviews (P1)   | Subscriber can submit review                                                  | IT-REV-CRT-003, E2E-REV-002                                                  |
| F011                    | Non-subscriber blocked                                                        | IT-REV-CRT-002, E2E-REV-006                                                  |
| F011                    | Edit own review (upsert)                                                      | IT-REV-CRT-004, E2E-REV-005                                                  |
| F011                    | Rating 1-5 validation                                                         | UT-VAL-REV-001..005, IT-REV-CRT-005..006                                     |
| F011                    | avgRating updated on server                                                   | IT-REV-CRT-008, E2E-REV-004                                                  |
| **F012** Admin (P1)     | Pending approval queue                                                        | IT-ADM-001..002, E2E-ADM-002                                                 |
| F012                    | Approve listing                                                               | IT-ADM-003..006, E2E-ADM-003                                                 |
| F012                    | Reject with reason                                                            | IT-ADM-007..009, E2E-ADM-004..005                                            |
| F012                    | ADMIN-only access                                                             | IT-ADM-001, E2E-ADM-001                                                      |
| F012                    | Platform stats                                                                | IT-ADM-011..012, E2E-ADM-006                                                 |
| **NFR** Security        | OAuth-only auth (no passwords)                                                | E2E-AUTH-001                                                                 |
| NFR                     | API keys SHA-256 hashed only                                                  | UT-KEY-006..010, IT-KEY-CRT-004, PBT-VAL-001..003                            |
| NFR                     | Stripe webhook signature verified                                             | IT-WH-001..003                                                               |
| NFR                     | RBAC on all protected routes                                                  | UT-AUTH-001..009, IT-SRV-CRT-001..004                                        |
| NFR                     | No stack traces in error responses                                            | IT-SRV-CRT-017 (500 body check)                                              |
| NFR                     | Revenue split always sums to 100%                                             | UT-STRIPE-003, PBT-VAL-004                                                   |
| NFR                     | p95 API response < 200ms                                                      | Flag for k6 load tests (out of Vitest scope)                                 |

---

## 8. Per-Module Coverage Targets

Coverage is measured by **Vitest** (`@vitest/coverage-v8`), reported per-file.

| Module / File                          | Line %    | Branch %  | Rationale                                                      |
| -------------------------------------- | --------- | --------- | -------------------------------------------------------------- |
| `src/lib/api-keys.ts`                  | **100%**  | **100%**  | Security-critical; every path exercised                        |
| `src/lib/stripe.ts`                    | **95%**   | **90%**   | Financial logic; uncovered = documented Stripe SDK error paths |
| `src/lib/auth.ts`                      | **95%**   | **95%**   | RBAC; every role × route combination                           |
| `src/lib/constants.ts`                 | **100%**  | **100%**  | Trivial exports; snapshot-tested                               |
| `src/lib/validations/server.ts`        | **100%**  | **100%**  | All cross-field rules exercised                                |
| `src/lib/validations/review.ts`        | **100%**  | **100%**  | Small; fully coverable                                         |
| `src/lib/validations/common.ts`        | **100%**  | **100%**  | Used everywhere; all branches                                  |
| `src/lib/utils.ts`                     | **95%**   | **90%**   | Formatting helpers                                             |
| `src/lib/prisma.ts`                    | **60%**   | **60%**   | Singleton setup; DB connection not unit tested                 |
| `src/app/api/webhooks/stripe/route.ts` | **95%**   | **90%**   | All event types covered                                        |
| `src/app/api/servers/route.ts`         | **90%**   | **85%**   | All filter/sort/pagination branches                            |
| `src/app/api/servers/[slug]/route.ts`  | **90%**   | **85%**   | All CRUD + auth branches                                       |
| `src/app/api/subscriptions/**`         | **90%**   | **85%**   | All lifecycle states                                           |
| `src/app/api/keys/**`                  | **95%**   | **90%**   | Security-adjacent                                              |
| `src/app/api/verify-key/route.ts`      | **100%**  | **100%**  | Every auth failure path                                        |
| `src/app/api/billing/**`               | **85%**   | **80%**   | Stripe mocking covers happy paths                              |
| `src/app/api/developer/**`             | **85%**   | **80%**   | Analytics aggregation logic                                    |
| `src/app/api/admin/**`                 | **90%**   | **85%**   | Approval workflow branches                                     |
| `src/app/api/auth/**`                  | **85%**   | **80%**   | NextAuth wrapping                                              |
| `src/components/**` (React)            | **70%**   | **65%**   | Visual logic via E2E; unit-test hooks only                     |
| **Overall project target**             | **≥ 85%** | **≥ 80%** | Enforced as CI quality gate                                    |

### Coverage Enforcement (vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 85,
        branches: 80,
        functions: 85,
        statements: 85,
      },
      exclude: [
        "node_modules/**",
        "tests/**",
        "**/*.config.ts",
        "src/lib/prisma.ts", // DB singleton
      ],
    },
  },
});
```

---

## 9. Test Data & Fixtures

### 9.1 Seed Data (`tests/fixtures/`)

```typescript
// tests/fixtures/users.ts
export const userFixtures = {
  userBasic: { email: "user@test.com", role: "USER", name: "Test User" },
  userDev: {
    email: "dev@test.com",
    role: "DEVELOPER",
    name: "Dev Dana",
    connectAccountId: "acct_test123",
    connectOnboarded: true,
  },
  userAdmin: { email: "admin@test.com", role: "ADMIN", name: "Admin Alice" },
  userNoConnect: {
    email: "dev2@test.com",
    role: "DEVELOPER",
    name: "Dev Bob",
    connectAccountId: null,
    connectOnboarded: false,
  },
};

// tests/fixtures/servers.ts
export const serverFixtures = {
  freeServer: {
    name: "Free Tool",
    slug: "free-tool",
    status: "APPROVED",
    pricingModel: "FREE",
    category: "developer-tools",
    description: "A free developer tool for testing purposes",
    endpoint: "https://free-tool.example.com/mcp",
  },
  paidServer: {
    name: "Pro Tool",
    slug: "pro-tool",
    status: "APPROVED",
    pricingModel: "SUBSCRIPTION",
    priceAmount: 1000,
    stripeProductId: "prod_test123",
    stripePriceId: "price_test123",
    description: "A premium subscription tool for testing",
    endpoint: "https://pro-tool.example.com/mcp",
  },
  pendingServer: {
    name: "Pending Tool",
    slug: "pending-tool",
    status: "PENDING",
    pricingModel: "FREE",
    category: "productivity",
    description: "A pending tool awaiting admin approval",
    endpoint: "https://pending.example.com/mcp",
  },
  rejectedServer: {
    name: "Rejected Tool",
    slug: "rejected-tool",
    status: "REJECTED",
    pricingModel: "FREE",
    category: "general",
    description: "A tool that was rejected by an admin",
    endpoint: "https://rejected.example.com/mcp",
  },
  usageServer: {
    name: "Usage Tool",
    slug: "usage-tool",
    status: "APPROVED",
    pricingModel: "USAGE",
    pricePerCall: 1,
    freeCallLimit: 100,
    description: "A usage-based billing tool for testing",
    endpoint: "https://usage-tool.example.com/mcp",
  },
};
```

### 9.2 Stripe Test Helpers

```typescript
// tests/setup/stripe-helpers.ts

// Generate a real Stripe webhook signature for integration tests
export function buildStripeWebhookRequest(event: Stripe.Event) {
  const payload = JSON.stringify(event);
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_test_secret';
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return { payload, signature };
}

// Canonical Stripe event factories
export const stripeEvents = {
  checkoutSessionCompleted: (overrides: Partial<Stripe.Checkout.Session> = {}) =>
    ({
      id: 'evt_test_checkout_001',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          payment_intent: 'pi_test_123',
          amount_total: 1000,
          metadata: { serverId: serverFixtures.paidServer.id, userId: userFixtures.userBasic.id },
          ...overrides,
        },
      },
    } as Stripe.Event),

  invoicePaymentFailed: (subscriptionId: string) => ({ ... }),
  subscriptionDeleted: (subscriptionId: string) => ({ ... }),
  accountUpdated: (accountId: string, chargesEnabled: boolean) => ({ ... }),
}
```

### 9.3 Session Injection Helper

```typescript
// tests/setup/auth-helpers.ts
// Bypasses NextAuth OAuth; injects a fake session for route handler tests

import { vi } from "vitest";
import * as nextAuthModule from "next-auth";

export function mockSession(
  role: "USER" | "DEVELOPER" | "ADMIN",
  userId = "test-user-id",
) {
  vi.spyOn(nextAuthModule, "getServerSession").mockResolvedValue({
    user: {
      id: userId,
      role,
      email: `${role.toLowerCase()}@test.com`,
      name: "Test User",
    },
    expires: new Date(Date.now() + 3_600_000).toISOString(),
  });
}

export function mockNoSession() {
  vi.spyOn(nextAuthModule, "getServerSession").mockResolvedValue(null);
}
```

### 9.4 Database Reset Helper

```typescript
// tests/setup/prisma.ts
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

export const testDb = new PrismaClient({
  datasources: { db: { url: "file:./test.db" } },
});

export async function resetDb() {
  // Truncate all tables in dependency order
  await testDb.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`);
  const tables = [
    "Transaction",
    "Review",
    "ApiKey",
    "Subscription",
    "FeaturedListing",
    "UsageRecord",
    "McpServer",
    "Session",
    "Account",
    "User",
  ];
  for (const t of tables) {
    await testDb.$executeRawUnsafe(`DELETE FROM "${t}"`);
  }
  await testDb.$executeRawUnsafe(`PRAGMA foreign_keys = ON`);
}
```

---

## 10. CI/CD Integration

### 10.1 GitHub Actions Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit:
    name: Unit Tests + Coverage
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with: { name: coverage-report, path: coverage/ }

  integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: file:./test.db
      STRIPE_SECRET_KEY: sk_test_placeholder
      STRIPE_WEBHOOK_SECRET: whsec_test_placeholder
      NEXTAUTH_SECRET: test-secret-32chars-minimum!!xx
      NEXTAUTH_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test:integration

  e2e:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    needs: [unit, integration]
    env:
      DATABASE_URL: file:./e2e-test.db
      STRIPE_SECRET_KEY: sk_test_placeholder
      STRIPE_WEBHOOK_SECRET: whsec_test_placeholder
      NEXTAUTH_SECRET: test-secret-32chars-minimum!!xx
      NEXTAUTH_URL: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm" }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx prisma migrate deploy && npx prisma db seed
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### 10.2 Quality Gates

| Gate                                                 | Threshold | Blocks merge? |
| ---------------------------------------------------- | --------- | ------------- |
| Unit test pass rate                                  | 100%      | ✅ Yes        |
| Integration test pass rate                           | 100%      | ✅ Yes        |
| E2E test pass rate                                   | 100%      | ✅ Yes        |
| Overall line coverage                                | ≥ 85%     | ✅ Yes        |
| Overall branch coverage                              | ≥ 80%     | ✅ Yes        |
| `src/lib/api-keys.ts` line coverage                  | 100%      | ✅ Yes        |
| `src/app/api/verify-key/route.ts` line coverage      | 100%      | ✅ Yes        |
| `src/app/api/webhooks/stripe/route.ts` line coverage | ≥ 95%     | ✅ Yes        |

### 10.3 Execution Order & Timing Budget

```
┌─────────────────────┐   ~15s    Unit (Vitest, parallel workers)
├─────────────────────┤   ~60s    Integration (Vitest, SQLite, MSW)
│   (parallel)        │
└─────────────────────┘
          ↓ (only if both pass)
┌─────────────────────┐   ~4min   E2E (Playwright, Chromium, full app)
└─────────────────────┘
          ↓
     Coverage Upload + PR Comment
```

Total expected CI time per PR: **~6 minutes**

---

_Total test cases: ~230 across 19 unit suites · 21 integration suites · 12 E2E flows · 10 property-based suites_
_Every P0 and P1 acceptance criterion from SPEC.md has at least one mapped test ID._
