# MCPmarket — Product Specification

## 1. Product Overview

### Problem
11,000+ MCP servers exist, fewer than 5% are monetized. Every developer who wants to charge for their MCP server must independently build auth, billing, metering, and distribution — resulting in 95%+ of servers remaining free despite delivering real value. There is no "App Store" for MCP servers.

### Solution
MCPmarket is the paid marketplace and billing infrastructure for MCP servers. Developers list their tools with a price, users subscribe with one click, and the platform handles hosting, authentication, metering, and payouts. MCPmarket takes a 20% revenue share.

### Target Users
- **MCP server developers** who want to monetize their tools without building billing infrastructure
- **AI power users** (developers, data scientists, product teams) who want to discover and subscribe to premium MCP tools
- **Enterprise teams** who need managed, authenticated access to curated MCP tooling

### Differentiators vs. Competitors
| Competitor | Gap MCPmarket Fills |
|---|---|
| **mcp.so / mcpservers.org** | Free directories with zero billing, hosting, or monetization |
| **Smithery.ai** | Hosting + observability focus, unclear creator monetization |
| **Glama.ai** | Strong discovery but no end-user billing or developer payouts |
| **MCPize** | Closest competitor (85% rev share) but small catalog (~500), no managed hosting |
| **Apify MCP** | Scraping/automation niche only, complex pricing, retiring rental model |

MCPmarket wins by combining **discovery + managed hosting + flexible billing + developer payouts** in one platform — the full Shopify-for-MCP-servers stack.

---

## 2. User Personas

### Persona 1: Dev Dana — MCP Server Developer
- **Role:** Independent developer / small team
- **Goal:** Monetize an MCP server she built (e.g., a code review tool) without spending weeks on billing/auth
- **Frustration:** Built a useful MCP server with 2K GitHub stars but earns $0. Tried adding Stripe manually — spent 3 weeks on auth, metering, and webhook handling. Gave up.
- **Success:** Lists her server on MCPmarket in under 30 minutes, sets a $12/mo price, and starts receiving payouts within 2 weeks.

### Persona 2: User Umar — AI Power User
- **Role:** Senior software engineer using Claude/Cursor daily
- **Goal:** Find and subscribe to high-quality MCP tools that save him time (database query tools, code analysis, deployment helpers)
- **Frustration:** Finds interesting MCP servers on GitHub but they have no install instructions, no auth, no reliability guarantees. Each one requires different setup.
- **Success:** Browses MCPmarket, subscribes to 3 servers with one-click, and gets instant `mcp.json` config snippets to paste into his client.

### Persona 3: Enterprise Erin — Engineering Manager
- **Role:** Leads a 20-person dev team at a Series B startup
- **Goal:** Provide her team with approved, managed MCP tools with centralized billing and access control
- **Frustration:** Developers are installing random MCP servers with no security review, no centralized billing, and credentials scattered across laptops.
- **Success:** Sets up an MCPmarket team account, approves 5 servers, team members get instant access with org-managed API keys.

---

## 3. Core Features

### P0 — Must Ship (MVP)

#### F001: Server Listing & Publishing
Developers can publish MCP servers to the marketplace with metadata, pricing, and documentation.

**User Stories:**
- As Dev Dana, I want to list my MCP server with a description, pricing model, and README so users can discover and subscribe.
- As Dev Dana, I want to choose between free, subscription ($X/mo), or usage-based ($X per Y calls) pricing.

**Acceptance Criteria:**
- Given a logged-in developer, when they submit the server listing form with name, description, category, pricing model, price, and endpoint URL, then the server appears in their dashboard with "Pending Review" status
- Given a server listing, when the developer uploads a logo (PNG/JPG, max 2MB) and README (markdown), then both render correctly on the server detail page
- Given a developer choosing usage-based pricing, when they set a per-call price and free tier limit, then the listing displays both the price and free tier allowance
- Given a listing submission, when required fields (name, description, endpoint, pricing) are missing, then validation errors appear inline and submission is blocked

#### F002: Server Discovery & Browse
Users can browse, search, and filter MCP servers by category, pricing, and popularity.

**User Stories:**
- As User Umar, I want to browse servers by category and sort by popularity so I find the best tools quickly.
- As User Umar, I want to search for servers by keyword so I can find specific functionality.

**Acceptance Criteria:**
- Given the browse page, when a user visits /servers, then servers display in a card grid showing name, logo, short description, price, rating, and install count
- Given the search bar, when a user types a query and presses enter, then results filter in <500ms to show matching servers by name, description, and tags
- Given filter controls, when a user selects a category (e.g., "Developer Tools", "Data", "Productivity") and/or pricing type (Free, Paid), then the grid updates to show only matching servers
- Given the browse page, when sorting by "Popular", "Newest", or "Top Rated", then servers reorder accordingly

#### F003: Server Detail Page
Each server has a dedicated page with full description, pricing, reviews, and install instructions.

**User Stories:**
- As User Umar, I want to see full documentation, reviews, and install instructions before subscribing.

**Acceptance Criteria:**
- Given a server detail page at /servers/[slug], when a user visits, then they see: name, logo, developer name, full README (rendered markdown), pricing, rating (average + count), install count, and category tags
- Given a server with reviews, when viewing the detail page, then reviews display with rating, comment, author, and date, sorted newest-first
- Given a server the user is not subscribed to, when viewing the detail page, then a "Subscribe" CTA button is prominently displayed with the price
- Given a subscribed server, when viewing the detail page, then the user sees their MCP config snippet (JSON) for copy-paste into claude_desktop_config.json or mcp.json

#### F004: Auth (Sign Up / Sign In)
Users and developers authenticate via OAuth (GitHub, Google) with role-based access.

**User Stories:**
- As any user, I want to sign in with GitHub or Google so I don't need another password.
- As a developer, I want to upgrade my account to a developer role so I can publish servers.

**Acceptance Criteria:**
- Given an unauthenticated user, when they click "Sign In" and choose GitHub or Google, then they are authenticated and redirected to their dashboard
- Given a new user signing in for the first time, when auth completes, then a User record is created with role=USER
- Given a USER-role account, when they click "Become a Developer" and accept the developer terms, then their role upgrades to DEVELOPER and they gain access to the publisher dashboard
- Given an authenticated user, when their session expires, then they are redirected to sign in on protected page access

#### F005: Stripe Subscription Billing
Users subscribe to paid servers via Stripe Checkout, with recurring billing managed automatically.

**User Stories:**
- As User Umar, I want to subscribe to a paid server with one click and manage my subscriptions from my dashboard.
- As Dev Dana, I want Stripe to handle all billing so I never touch payment processing.

**Acceptance Criteria:**
- Given a logged-in user on a paid server's detail page, when they click "Subscribe", then they are redirected to a Stripe Checkout session pre-filled with the server's price and subscription interval
- Given a successful Stripe Checkout, when the user completes payment, then a Subscription record is created with status=ACTIVE and the user gains access to the server
- Given an active subscription, when the user visits /dashboard/subscriptions, then they see all active subscriptions with server name, price, next billing date, and a "Cancel" button
- Given a subscription cancellation, when the user clicks "Cancel", then the subscription remains active until the current period ends, after which status changes to CANCELED
- Given a failed payment (Stripe webhook `invoice.payment_failed`), when received, then the subscription status updates to PAST_DUE and the user receives an email notification

#### F006: Developer Dashboard & Analytics
Developers see installs, revenue, and subscriber analytics for their published servers.

**User Stories:**
- As Dev Dana, I want to see how many subscribers I have, my monthly revenue, and usage trends.

**Acceptance Criteria:**
- Given a developer visiting /dashboard/developer, when the page loads, then they see: total subscribers, total revenue (all-time and this month), total installs, and a revenue chart (last 12 months)
- Given a developer with multiple servers, when viewing the dashboard, then each server shows individual subscriber count, revenue, and status
- Given the analytics view, when a developer selects a specific server, then they see daily install and revenue data for the last 30 days in a line chart

#### F007: User Dashboard & Subscription Management
Users manage their subscriptions, API keys, and billing from a central dashboard.

**User Stories:**
- As User Umar, I want to see all my subscriptions and manage billing in one place.

**Acceptance Criteria:**
- Given a user visiting /dashboard, when the page loads, then they see all active and past subscriptions with server name, status, price, and renewal date
- Given an active subscription, when the user clicks "Get Config", then a modal shows the MCP client configuration JSON snippet with their API key pre-filled
- Given the dashboard, when the user clicks "Billing", then they are redirected to the Stripe Customer Portal to manage payment methods and invoices

#### F008: API Key Management
Users receive API keys for authenticating with subscribed MCP servers.

**User Stories:**
- As User Umar, I want to generate and revoke API keys for my subscribed servers.

**Acceptance Criteria:**
- Given a new subscription, when created, then an API key is automatically generated for that server and displayed once to the user
- Given the API keys page at /dashboard/api-keys, when the user visits, then they see all active keys with server name, created date, last used date, and a "Revoke" button
- Given a revoked API key, when used to call an MCP server, then the request returns 401 Unauthorized
- Given a user, when they click "Generate New Key" for a subscribed server, then the old key is revoked and a new one is created and displayed once

#### F009: Stripe Connect Developer Payouts
Developers receive automated payouts via Stripe Connect with 80/20 revenue split.

**User Stories:**
- As Dev Dana, I want to receive payouts automatically to my bank account.

**Acceptance Criteria:**
- Given a developer clicking "Set Up Payouts" on the developer dashboard, when they click it, then they are redirected to Stripe Connect onboarding
- Given a completed Stripe Connect onboarding, when a subscription payment is received, then 80% is transferred to the developer's Stripe Connect account and 20% is retained as platform fee
- Given the developer dashboard, when viewing payouts, then the developer sees a transaction history with amount, fee, net payout, and status for each payment
- Given a refund, when processed, then the corresponding payout is adjusted and the developer sees the updated amount

#### F010: Landing Page
Marketing landing page with value proposition, pricing, and CTAs.

**User Stories:**
- As a visitor, I want to understand what MCPmarket offers and how pricing works.

**Acceptance Criteria:**
- Given a visitor at /, when the page loads, then they see: hero section with tagline and CTA, stats section, how-it-works section, feature cards, pricing tiers, FAQ, and footer
- Given the pricing section, when displayed, then it shows three tiers: Basic (free to list, 20% rev share), Managed Hosting ($9/mo per server), and Featured ($29/mo)
- Given the page, when loaded on mobile (viewport <768px), then all sections are responsive and readable without horizontal scrolling

### P1 — Fast Follow

#### F011: Server Reviews & Ratings
Users rate and review subscribed servers to help others make decisions.

**User Stories:**
- As User Umar, I want to leave a review after using a server so others benefit from my experience.

**Acceptance Criteria:**
- Given a user with an active subscription to a server, when they visit the server detail page and click "Write Review", then a form appears with a 1-5 star rating and text comment field
- Given a submitted review, when saved, then the server's average rating and review count update immediately
- Given a user who has already reviewed a server, when they visit the review form, then their existing review is pre-filled for editing
- Given a user without a subscription to a server, when they try to review, then the review form is hidden and a message says "Subscribe to leave a review"

#### F012: Admin Dashboard
Platform admins review, approve, and manage server listings and users.

**User Stories:**
- As an admin, I want to review and approve/reject new server listings to maintain marketplace quality.

**Acceptance Criteria:**
- Given an admin visiting /admin, when the page loads, then they see: pending server count, total users, total revenue, and platform fee earned
- Given pending server listings, when an admin clicks "Approve", then the server status changes to APPROVED and it appears in the public browse page
- Given a server listing, when an admin clicks "Reject" and provides a reason, then the server status changes to REJECTED and the developer receives the rejection reason via email
- Given the admin user list, when an admin searches for a user by email, then the user's profile, role, subscriptions, and servers are displayed

#### F013: Usage-Based Metering
Track per-call usage for usage-based pricing models and bill accordingly.

**User Stories:**
- As Dev Dana, I want to offer my server at $0.01 per call with 100 free calls so users can try before they buy.

**Acceptance Criteria:**
- Given a usage-based server, when an API call is made with a valid API key, then the call is logged with timestamp, endpoint, and response status
- Given a user with a usage-based subscription, when they visit their dashboard, then they see current period usage (calls made vs. free tier limit) and estimated cost
- Given the end of a billing period, when usage exceeds the free tier, then a Stripe invoice is generated for (total calls - free tier) × per-call price
- Given usage approaching the free tier limit, when 80% of free calls are consumed, then the user receives an email notification

#### F014: Featured Listings
Developers can pay $29/mo to feature their server with premium placement.

**User Stories:**
- As Dev Dana, I want to boost my server's visibility by paying for featured placement.

**Acceptance Criteria:**
- Given the browse page, when loading, then featured servers appear in a highlighted "Featured" section at the top
- Given a developer clicking "Get Featured" on their server, when they complete payment ($29/mo via Stripe), then a FeaturedListing record is created and the server shows a "Featured" badge
- Given a featured listing expiration, when the subscription lapses, then the server is removed from the featured section and the badge is removed

#### F015: Managed Hosting
Optional managed hosting for developers who want MCPmarket to run their server.

**User Stories:**
- As Dev Dana, I want MCPmarket to host my MCP server so I don't manage infrastructure.

**Acceptance Criteria:**
- Given a developer choosing managed hosting during listing, when they provide a Docker image URL or GitHub repo URL, then the platform provisions hosting and assigns a managed endpoint
- Given a managed server, when the developer visits their server settings, then they see uptime status, request count, and error rate for the last 24 hours
- Given a managed hosting subscription, when the developer is billed, then $9/mo is charged via Stripe separately from marketplace revenue share

### P2 — Future

#### F016: Team/Org Accounts
Organizations manage centralized billing and access for team members.

**User Stories:**
- As Enterprise Erin, I want to manage my team's MCP subscriptions from one account with centralized billing.

**Acceptance Criteria:**
- Given an org admin, when they create a team at /dashboard/team, then they can invite members by email
- Given a team subscription, when a member is added, then they automatically get API keys for all team-subscribed servers
- Given the org billing page, when viewed, then all team subscriptions are consolidated into a single invoice

#### F017: Webhook Notifications
Developers receive webhooks for subscription events (new subscriber, churn, payment).

**User Stories:**
- As Dev Dana, I want to receive webhooks when users subscribe or cancel so I can trigger onboarding flows.

**Acceptance Criteria:**
- Given a developer's webhook settings, when they provide a URL, then the platform sends POST requests for events: subscription.created, subscription.canceled, subscription.payment_failed
- Given a webhook delivery, when it fails (non-2xx response), then the platform retries 3 times with exponential backoff
- Given the developer dashboard, when viewing webhooks, then a log of recent deliveries shows event type, timestamp, response status, and payload

#### F018: Server Version Management
Developers publish and manage multiple versions of their MCP servers.

**User Stories:**
- As Dev Dana, I want to publish a new version of my server without breaking existing subscribers.

**Acceptance Criteria:**
- Given a developer publishing an update, when they submit a new version, then the previous version remains available for 30 days
- Given a server with multiple versions, when a subscriber views the config, then they see the latest version by default with an option to pin to a specific version

---

## 4. Non-Functional Requirements

### Performance
- Page load (LCP): <2.5s on 4G connections
- API response time: <200ms p95 for browse/search, <500ms p95 for billing operations
- Search results: <500ms for full-text search across 10K+ servers
- Dashboard charts: render in <1s with 12 months of data

### Security
- All API routes require authentication (except public browse/detail/landing)
- API keys are hashed (SHA-256) before storage; plaintext shown only once on creation
- Stripe webhook signatures are verified on every incoming webhook
- CSRF protection on all mutating endpoints
- Rate limiting: 100 req/min per IP on public routes, 1000 req/min per API key on authenticated routes
- Content Security Policy headers on all pages
- Input sanitization on all user-provided content (markdown XSS prevention)

### Reliability
- 99.9% uptime target for marketplace web app
- Stripe webhook processing with idempotency keys to prevent duplicate charges
- Database transactions for all billing-related operations

### Browser Support
- Chrome, Firefox, Safari, Edge — latest 2 versions
- Mobile responsive (iOS Safari, Chrome Android)

---

## 5. Monetization Model

| Revenue Stream | Price | Description |
|---|---|---|
| **Revenue Share** | 20% of transaction value | Applied to every subscription and usage-based payment |
| **Managed Hosting** | $9/mo per server | Optional — developers who want MCPmarket to host their server |
| **Featured Listing** | $29/mo per server | Premium placement in browse page and search results |

**Payout schedule:** Developers receive 80% of revenue via Stripe Connect. Payouts are processed on the 1st of each month for the prior month's earnings, with a $25 minimum payout threshold.

---

## 6. Success Metrics

| Metric | 3-Month Target | 6-Month Target |
|---|---|---|
| Listed servers | 200 | 1,000 |
| Paying subscribers | 500 | 5,000 |
| Monthly GMV (gross merchandise value) | $15,000 | $100,000 |
| Platform revenue (20% rev share) | $3,000/mo | $20,000/mo |
| Developer payout rate | >95% on-time | >99% on-time |
| Server approval turnaround | <48 hours | <24 hours |
| NPS (developer) | >40 | >50 |
| NPS (subscriber) | >40 | >50 |

---

## 7. Out of Scope for V1

- **MCP server runtime/execution proxy** — V1 routes users directly to developer-hosted endpoints. No request proxying.
- **Built-in CI/CD for server deployments** — Developers manage their own deployments (except managed hosting).
- **Multi-currency support** — USD only for V1.
- **Mobile native apps** — Web-only, responsive design.
- **AI-powered server recommendations** — Simple category/popularity sorting only.
- **Marketplace for free-only servers** — Free servers can be listed but the focus is on paid monetization.
- **SOC 2 / HIPAA compliance** — Enterprise compliance certifications are post-V1.
- **Server composition / chaining** — A2A protocol integration is future work.
- **White-label marketplace** — No embeddable marketplace widget for third parties.
