# MCPmarket — UI/UX Design Specification

> **Version**: 1.0 · **Date**: 2026-03-29
> **Stack**: Next.js 15, Tailwind CSS v3, shadcn/ui (Radix UI), Lucide React, Recharts
> **Theme system**: CSS custom properties via `globals.css`, extended in `tailwind.config.js`

---

## Table of Contents

1. [Design Principles & Visual Style](#1-design-principles--visual-style)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing & Layout System](#4-spacing--layout-system)
5. [User Flows](#5-user-flows)
6. [Page Layouts](#6-page-layouts)
7. [Component Specifications](#7-component-specifications)
8. [Accessibility (WCAG AA)](#8-accessibility-wcag-aa)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [Loading, Empty & Error States](#10-loading-empty--error-states)

---

## 1. Design Principles & Visual Style

### Principles

| Principle | Rationale |
|-----------|-----------|
| **Developer-first clarity** | Primary users are technical. UI should be information-dense yet scannable. Avoid decorative elements that obscure data. |
| **Trust through transparency** | Pricing, revenue split (80/20), and platform fees must be immediately visible. Never hide costs. |
| **Progressive disclosure** | Show essential actions first; advanced settings (webhooks, usage billing) are revealed after onboarding. |
| **Speed over polish** | Perceived performance > animations. Skeleton loaders, optimistic UI, prefetch on hover for server cards. |
| **Accessible by default** | Every interactive element must be keyboard navigable and screen-reader annotated. No color-only communication. |

### Visual Style

- **Aesthetic**: Clean SaaS marketplace — similar to Vercel's marketplace or npm registry. Monochrome base with a single brand blue for CTAs and key metrics.
- **Tone**: Professional, efficient, slightly terse (developer audience).
- **Borders & Surfaces**: Thin `1px` borders (`border-border`), subtle shadows only on elevated surfaces (modals, dropdowns). No heavy card shadows on flat surfaces.
- **Iconography**: Lucide React exclusively. 16 px (`w-4 h-4`) in-line with text; 20 px (`w-5 h-5`) in nav; 24 px (`w-6 h-6`) in feature sections; 32 px (`w-8 h-8`) in hero/marketing.
- **Motion**: Utility-first via `tailwindcss-animate`. Transitions max 200 ms. No looping animations in production UI. `prefers-reduced-motion` must suppress all transitions.
- **Radius**: `--radius: 0.5rem` (8 px) for cards, inputs, badges. `rounded-full` for pills/avatars only.

---

## 2. Color Palette

### CSS Custom Properties → Hex Mapping

All tokens are defined in `globals.css` and extended in `tailwind.config.js` as semantic aliases. Hex values below are the rendered equivalents.

#### Light Mode

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| `background` | `--background: 0 0% 100%` | `#FFFFFF` | Page background |
| `foreground` | `--foreground: 0 0% 3.6%` | `#090909` | Body text |
| `card` | `--card: 0 0% 100%` | `#FFFFFF` | Card surfaces |
| `card-foreground` | `--card-foreground: 0 0% 3.6%` | `#090909` | Card text |
| `muted` | `--muted: 0 0% 96.1%` | `#F5F5F5` | Muted backgrounds (alternate rows, code blocks) |
| `muted-foreground` | `--muted-foreground: 0 0% 45.1%` | `#737373` | Secondary/helper text |
| `border` | `--border: 0 0% 89.8%` | `#E5E5E5` | All borders |
| `input` | `--input: 0 0% 89.8%` | `#E5E5E5` | Input borders |
| `primary` | `--primary: 0 0% 9%` | `#171717` | Primary button bg, heading emphasis |
| `primary-foreground` | `--primary-foreground: 0 0% 100%` | `#FFFFFF` | Text on primary button |
| `secondary` | `--secondary: 0 0% 96.1%` | `#F5F5F5` | Ghost/secondary button bg |
| `secondary-foreground` | `--secondary-foreground: 0 0% 9%` | `#171717` | Text on secondary button |
| `accent` | `--accent: 0 84.2% 60.2%` | `#EF4444` | Destructive actions, alerts |
| `destructive` | `--destructive: 0 84.2% 60.2%` | `#EF4444` | Errors, delete states |
| `ring` | `--ring: 0 0% 3.6%` | `#090909` | Focus rings |

#### Extended Brand Colors (Tailwind utilities — use directly in JSX)

These are not in CSS variables; use Tailwind utility classes directly.

| Color | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| Brand Blue | `blue-600` | `#2563EB` | Primary CTAs, feature icons, active states, links |
| Brand Blue Light | `blue-50` | `#EFF6FF` | CTA section background, selected filter pill bg |
| Brand Blue Dark | `blue-700` | `#1D4ED8` | Hover state on blue CTAs |
| Success Green | `green-600` | `#16A34A` | Checkmarks, active subscription badges, success toasts |
| Success Green Light | `green-50` | `#F0FDF4` | Success banner backgrounds |
| Warning Amber | `amber-600` | `#D97706` | PENDING status badges, warnings |
| Warning Amber Light | `amber-50` | `#FFFBEB` | Warning banner backgrounds |
| Info Slate | `slate-50` | `#F8FAFC` | Hero gradient start, alternate section backgrounds |
| Stripe Purple | `violet-600` | `#7C3AED` | Stripe Connect branding touchpoints |

#### Dark Mode

| Token | Hex | Notes |
|-------|-----|-------|
| `background` | `#090909` | Near-black |
| `foreground` | `#FAFAFA` | Near-white |
| `muted` | `#242424` | Dark muted surface |
| `muted-foreground` | `#A3A3A3` | Dimmed text |
| `border` | `#242424` | Subtle dark border |
| `primary` | `#FAFAFA` | Inverted — white buttons |
| `ring` | `#EF4444` | Red focus ring in dark mode |

### Contrast Ratios (WCAG AA — minimum 4.5:1 text, 3:1 UI)

| Pair | Ratio | Pass |
|------|-------|------|
| `foreground` (#090909) on `background` (#FFFFFF) | 20.5:1 | ✅ AAA |
| `muted-foreground` (#737373) on `background` (#FFFFFF) | 4.6:1 | ✅ AA |
| `primary-foreground` (#FFFFFF) on `primary` (#171717) | 18.1:1 | ✅ AAA |
| White on `blue-600` (#2563EB) | 5.9:1 | ✅ AA |
| White on `green-600` (#16A34A) | 5.2:1 | ✅ AA |
| `foreground` on `muted` (#F5F5F5) | 18.3:1 | ✅ AAA |
| `muted-foreground` on `muted` (#F5F5F5) | 3.97:1 | ✅ AA (large text) — use only for 18px+ or bold 14px+ |

---

## 3. Typography

### Font Family

```
--font-sans: 'Inter', system-ui, sans-serif
```

Loaded via `next/font/google` with `subsets: ['latin']`. Variable font (`woff2`) — single network request. Applied as `font-family: var(--font-sans)` on `<body>`.

### Type Scale

| Role | Tailwind Class | Size / Line Height | Weight | Usage |
|------|---------------|-------------------|--------|-------|
| Display | `text-6xl font-bold leading-none` | 60 px / 60 px | 700 | Hero headline (desktop) |
| H1 | `text-4xl md:text-5xl font-bold tracking-tighter` | 36→48 px | 700 | Page H1 |
| H2 | `text-2xl md:text-3xl font-bold` | 24→30 px | 700 | Section headings |
| H3 | `text-xl font-semibold` | 20 px | 600 | Card titles, subsections |
| H4 | `text-lg font-semibold` | 18 px | 600 | Feature titles, modal headings |
| Body Large | `text-xl text-muted-foreground` | 20 px | 400 | Hero subheadline |
| Body | `text-base` | 16 px / 1.5 | 400 | Default prose |
| Body Small | `text-sm` | 14 px / 1.5 | 400 | Card descriptions, list items |
| Caption | `text-xs text-muted-foreground` | 12 px | 400 | Meta info, timestamps |
| Code | `font-mono text-sm` | 14 px | 400 | Inline code, API keys, endpoint URLs |
| Label | `text-sm font-medium` | 14 px | 500 | Form labels |
| Badge | `text-xs font-semibold uppercase tracking-wide` | 12 px | 600 | Status badges |

### Numeric Formatting

Stats and currency use `font-bold text-3xl` (30 px). Use `tabular-nums` for tables and dashboards to prevent layout shift on updates.

---

## 4. Spacing & Layout System

### Base Unit

All spacing uses Tailwind's default 4 px base unit (`1 = 4px`).

### Container

```html
<div class="container mx-auto max-w-6xl px-4 md:px-6">
```

- Max width: `1152px` (`max-w-6xl`)
- Horizontal padding: `16px` mobile → `24px` md+
- Centered with `mx-auto`

### Section Vertical Rhythm

| Context | Tailwind | Pixels |
|---------|----------|--------|
| Section padding (min) | `py-12` | 48 px top + bottom |
| Section padding (mid) | `py-12 md:py-24` | 48 → 96 px |
| Section padding (tall) | `py-12 md:py-24 lg:py-32 xl:py-48` | 48 → 192 px |
| Between heading and content | `mb-12` | 48 px |
| Between sibling cards | `gap-8` | 32 px |
| Between list items | `space-y-3` | 12 px |
| Intra-card padding | `p-6` or `p-8` | 24 or 32 px |

### Grid System

| Layout | Tailwind | Usage |
|--------|----------|-------|
| 1 column | `grid grid-cols-1` | Mobile default |
| 2 columns | `grid md:grid-cols-2 gap-8` | How It Works, two-panel layouts |
| 3 columns | `grid md:grid-cols-3 gap-8` | Stats, features, pricing cards |
| 4 columns | `grid grid-cols-2 md:grid-cols-4 gap-6` | Server browse sidebar + list |
| Sidebar + main | `grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8` | Dashboard layouts |
| 12-col flex | Flex with `flex-1` and fixed sidebar | Developer analytics |

### Z-Index Stack

| Layer | Value | Usage |
|-------|-------|-------|
| Sticky nav | `z-40` | Navbar |
| Dropdowns | `z-50` | Command menus, select popups |
| Modals | `z-50` | shadcn Dialog |
| Toast | `z-[100]` | Sonner/shadcn Toaster |
| Tooltip | `z-[110]` | Radix Tooltip |

---

## 5. User Flows

### 5.1 User: Discover & Subscribe to a Server

```
[Landing /]
  → Click "Explore Servers"
  → [/servers] Browse directory
    → Filter by category / pricing model / search
    → Click server card
  → [/servers/[slug]] Server detail page
    → Read description, reviews, pricing
    → Click "Subscribe" (if paid) or "Get API Key" (if free)
    → [Auth check] → if not logged in:
      → [/login] Sign in (GitHub OAuth or email)
        → OAuth consent → redirect back to /servers/[slug]
    → [/servers/[slug]] Stripe Checkout modal/redirect
      → Enter payment method
      → Confirm subscription
    → [/dashboard] User dashboard
      → See active subscription
      → Copy API key / endpoint URL
      → Configure in MCP client (Claude, etc.)
```

**Steps: 7-9 (with auth) or 5-6 (already signed in)**

---

### 5.2 Developer: List a New MCP Server

```
[Landing /] or [/developer-signup]
  → Click "List Your MCP Server"
  → [/developer-signup] Developer registration form
    → GitHub OAuth (required — verifies developer identity)
    → Fill: name, email, bio (optional)
    → Role = DEVELOPER set on account
  → [/developer/servers/new] Server submission form (multi-step)
    Step 1 — Basic Info:
      → Server name, slug (auto-generated, editable)
      → Short description (140 chars)
      → Long description (Markdown)
      → Category selector
      → Tags input
      → Logo upload (optional)
      → Repo URL, website URL
    Step 2 — Pricing:
      → Pricing model: FREE / SUBSCRIPTION / USAGE
      → If SUBSCRIPTION: set monthly price (min $1)
      → If USAGE: set per-call price + free tier
    Step 3 — Hosting:
      → Self-hosted (provide endpoint URL) OR
      → Managed hosting ($9/mo add-on) — triggers Stripe subscription
    Step 4 — Review & Submit
      → Preview card
      → Accept developer terms
      → Submit → status = PENDING
  → Email confirmation sent
  → [/developer/servers] Pending approval shown
  → Admin approves → status = APPROVED → email notification
  → Server live on /servers
```

**Steps: 10-14**

---

### 5.3 Developer: Set Up Featured Listing

```
[/developer/servers] → Click server → "Boost" button
  → [Modal] Featured Listing info
    → $29/month, placement in homepage featured section + top of /servers
    → Click "Activate Featured"
  → Stripe Checkout (featured subscription)
  → Success → server.featured = true, featuredUntil set
  → [/developer/servers] Badge "Featured" shown on server
  → Server appears in /servers featured carousel
```

---

### 5.4 User: Manage Subscriptions & API Keys

```
[/dashboard]
  → "Active Subscriptions" tab
    → See all subscribed servers
    → Click "Manage" on a subscription
      → Cancel subscription (cancel_at_period_end)
      → See next billing date
  → "API Keys" tab
    → See all keys (name, last used, expiry)
    → Click "Create New Key"
      → Name the key
      → Optionally scope to a server
      → Copy the generated key (shown once)
    → Revoke a key (confirm dialog)
  → "Billing" tab → [/dashboard/billing]
    → Payment method management (Stripe Customer Portal)
    → Invoice history
```

---

### 5.5 Admin: Moderate Server Submissions

```
[/admin] → "Pending Servers" section
  → Click server row → [/admin/servers/[id]]
    → View full submission: description, repo URL, pricing
    → Click "Approve" → status = APPROVED → developer notified
    → Click "Reject" → fill reason → status = REJECTED → developer notified
    → Click "Suspend" (existing server) → status = SUSPENDED
  → [/admin/users] → View/search users, change roles
  → [/admin/transactions] → View all Stripe transactions, refund flow
```

---

### 5.6 Developer: View Analytics & Request Payout

```
[/developer] → Analytics dashboard
  → Revenue chart (Recharts LineChart) — MTD, last 30d, all time
  → Subscriber count by server
  → Top-performing servers table
  → Click server row → per-server analytics
[/developer/payouts]
  → Current balance (total earned - fees - paid out)
  → Payout history table (date, amount, status)
  → "Connect Stripe Account" banner (if not connected)
    → Stripe Connect onboarding OAuth
  → Payouts automatic on 1st of each month
```

---

## 6. Page Layouts

> **Legend**: `[M]` mobile (<640 px) · `[T]` tablet (640–1023 px) · `[D]` desktop (≥1024 px)

---

### 6.1 `/` — Landing Page

**Structure**:

```
<Navbar>                              — sticky, full width
<main>
  §1 Hero                            — bg-gradient-to-b from-slate-50 to-white
  §2 Stats Bar                       — bg-white
  §3 How It Works                    — bg-gray-50
  §4 Platform Features               — bg-white
  §5 Pricing                         — bg-gray-50
  §6 FAQ                             — bg-white
  §7 CTA Banner                      — bg-blue-600 text-white
</main>
<Footer>
```

**§1 Hero**
`[M]` Single column, text centered. Heading: `text-3xl`. CTA buttons: `flex-col gap-4 w-full`.
`[T]` Same column, heading: `text-4xl md:text-5xl`. Buttons: `flex-row gap-4`.
`[D]` Same column max-w-3xl, heading: `text-6xl/none`. Padding: `py-48`.

**§2 Stats Bar**
`[M]` 1 column `grid-cols-1 gap-6` · `[T/D]` `grid-cols-3 gap-8`
Each cell: centered, `text-3xl font-bold` metric + `text-gray-600` label.

**§3 How It Works**
`[M]` Stack vertically: checklist then video placeholder below.
`[T/D]` `grid md:grid-cols-2 gap-12 items-center`. Checklist left, video placeholder right (`aspect-video bg-gray-200 rounded-lg`).

**§4 Platform Features**
`[M]` `grid-cols-1 gap-8` · `[T]` `grid-cols-2 gap-8` · `[D]` `grid-cols-3 gap-8`
Each: Icon (`w-8 h-8 text-blue-600`), `font-bold text-lg` title, `text-sm text-gray-600` body.

**§5 Pricing**
`[M]` Stack: `grid-cols-1 gap-8`. Popular card highlighted with `border-2 border-blue-600` and "Popular" pill.
`[T/D]` `grid-cols-3 gap-8`. Middle card elevated with `relative` and negative-margin pill.

**§6 FAQ**
`[M/T/D]` Single column `max-w-4xl`. Use shadcn `Accordion` with `type="single" collapsible`. Question as `AccordionTrigger`, answer as `AccordionContent`.

**§7 CTA Banner**
Full-width `bg-blue-600`. Content centered `max-w-4xl`. Heading white, body `text-blue-50`. Button: `variant="secondary"` (white bg with dark text).

---

### 6.2 `/servers` — Browse Directory

**Structure**:

```
<Navbar>
<main class="container mx-auto max-w-6xl px-4 py-8">
  <header>               — Page title + search bar
  <div class="grid lg:grid-cols-[240px_1fr] gap-8">
    <aside>              — Filter sidebar
    <section>            — Server grid + pagination
  </div>
</main>
<Footer>
```

**Header**
`[M]` Title `text-2xl font-bold` + full-width `Input` search bar + "Filters" toggle button (reveals sidebar as bottom sheet).
`[T/D]` Title + `max-w-xl` search bar inline. Filter sidebar always visible.

**Filter Sidebar** (`240px` fixed width on desktop)
Uses shadcn `Accordion` for collapsible filter groups:
- **Category**: Checkbox list (general, ai, data, productivity, developer-tools, integrations)
- **Pricing Model**: Radio group (All / Free / Subscription / Usage-based)
- **Status**: Checkbox (Featured, New, Top Rated)
- **Sort By**: Select (Relevance, Stars, Price ↑, Price ↓, Newest)
- "Clear Filters" link: `text-sm text-blue-600 hover:underline`

`[M]` Sidebar rendered as shadcn `Sheet` (slides up from bottom) triggered by filter button.

**Server Grid**
`[M]` `grid-cols-1 gap-4` · `[T]` `grid-cols-2 gap-6` · `[D]` `grid-cols-3 gap-6`
Each item: `<ServerCard>` component (see §7.3).

**Featured Row** (when featured servers exist)
Before the main grid: `<h2 class="text-lg font-semibold mb-4">Featured</h2>` + horizontal scroll container with `<ServerCard featured />`.
`[M/T]` `flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory`
`[D]` `grid grid-cols-3 gap-6`

**Pagination**
shadcn `Pagination` component. 24 servers per page. `[M]` Previous/Next buttons only. `[D]` Full numeric pagination.

---

### 6.3 `/servers/[slug]` — Server Detail Page

**Structure**:

```
<Navbar>
<main class="container mx-auto max-w-6xl px-4 py-8">
  <Breadcrumb>                         — Home / Servers / {name}
  <div class="grid lg:grid-cols-[1fr_360px] gap-12">
    <article>                          — Left: full info
      <ServerHero>                     — Logo, name, category badge, stats
      <Tabs>                           — Overview | Installation | Reviews
    </article>
    <aside>                            — Right: sticky action panel
      <PricingCard>                    — Price, Subscribe/Get Key button
      <ServerMeta>                     — Owner, dates, links
  </div>
</main>
<Footer>
```

**Left Column**

*ServerHero*:
`flex items-start gap-6`. Logo: `w-16 h-16 rounded-lg border` (fallback: colored initial avatar). Name: `text-3xl font-bold`. Category badge. Tags row: `flex flex-wrap gap-2`.
Stats row: `flex gap-6 text-sm text-muted-foreground` — install count, view count, average rating (⭐ x.x).

*Tabs* (shadcn `Tabs`):
- **Overview**: Long description (Markdown rendered). Feature list. Screenshots carousel if provided.
- **Installation**: Code block with MCP config JSON. Step-by-step guide. Copy button on code block.
- **Reviews**: `ReviewList` component + `AddReview` form (authenticated users only).

`[M]` Tabs become full-width. Sticky action panel moves to bottom of page above `<Footer>`.

**Right Column — Sticky Action Panel** (`position: sticky top-4`)

```
<Card class="p-6 space-y-4">
  <PricingDisplay />         — "$X/mo" or "Free"
  <SubscribeButton />        — primary or outline based on state
  <Separator />
  <ServerMetaList />         — Developer, Category, Repo, Website
  <Separator />
  <div>                      — Safety info
    Stripe badge, privacy note
  </div>
</Card>
```

`[M]` Sticky panel not used; subscribe button is fixed `bottom-0 left-0 right-0` bar with blurred backdrop.

---

### 6.4 `/login` — Sign In

**Structure**:

```
<Navbar>
<main class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
  <Card class="w-full max-w-sm p-8">
    <h1>Sign in to MCPmarket</h1>
    <div class="space-y-3">
      <GitHubOAuthButton />
      <GoogleOAuthButton />
      <Separator label="or" />
      <EmailForm />           — email magic link
    </div>
  </Card>
</main>
```

Card `w-full max-w-sm` centered vertically and horizontally.
`[M]` Card fills `w-full` with `rounded-none` or `mx-4` with standard radius.
`[D]` Card `max-w-sm` floats centered.

OAuth buttons: full-width, icon + label (`w-5 h-5 mr-2`). GitHub button: `bg-[#24292F] text-white hover:bg-[#1b1f23]`. Google button: `variant="outline"`.

---

### 6.5 `/developer-signup` — Developer Registration

**Structure** (multi-step `<Stepper>`):

```
<Navbar>
<main class="container max-w-2xl py-12 px-4 mx-auto">
  <h1>List Your MCP Server</h1>
  <Stepper steps={["Account", "Server Info", "Pricing", "Hosting", "Review"]} />
  <StepContent />
  <StepNavigation>          — Back + Next/Submit buttons
</main>
```

Each step renders a `<Card class="p-8">` with form fields. Progress indicator: `<Stepper>` at top (see §7.8).

---

### 6.6 `/developer/servers/new` — Server Submission Form

Same multi-step layout as `/developer-signup` step 2 onward (if already a developer). See §6.5 for layout; this is the form-only version for existing developer accounts.

---

### 6.7 `/dashboard` — User Dashboard

**Structure**:

```
<Navbar>
<main class="container max-w-6xl py-8 px-4 mx-auto">
  <header class="mb-8">    — "My Dashboard" + avatar + email
  <Tabs defaultValue="subscriptions">
    <TabsList>             — Subscriptions | API Keys | Billing
    <TabsContent>
  </Tabs>
</main>
```

**Subscriptions Tab**
`[M]` Stacked cards · `[D]` Data table (shadcn `Table`).
Columns: Server name (logo + link) | Plan | Status badge | Next billing | Actions (Manage).
"Manage" → opens shadcn `Dialog` with cancel option.

**API Keys Tab**
Table: Name | Scoped Server | Last Used | Expires | Status | Actions.
"Create New Key" button → `Dialog` with name input + server scope `Select`. On submit: generated key displayed in a `code` block inside the dialog (shown once, copyable).

**Billing Tab**
Iframe or redirect to Stripe Customer Portal. Below portal link: invoice table (date, amount, status).

`[M]` Tabs become full-width scroll. Tables become stacked `<dl>` key-value cards.

---

### 6.8 `/developer` — Developer Dashboard

**Structure**:

```
<Navbar>
<main class="container max-w-6xl py-8 px-4 mx-auto">
  <header>                  — "Developer Dashboard" + "Add Server" button
  <div class="grid lg:grid-cols-[200px_1fr] gap-8">
    <nav>                   — Sidebar: Overview | Servers | Analytics | Payouts
    <section>               — Content area
  </div>
</main>
```

`[M]` Sidebar becomes horizontal `<nav>` scroll at top of content area.

**Overview Section**
KPI cards row: `grid grid-cols-2 md:grid-cols-4 gap-4`.
Cards: Total Revenue | Active Subscribers | Servers Live | Avg Rating.
Each card: `<Card class="p-4">` with metric `text-2xl font-bold` + label `text-sm text-muted-foreground` + trend arrow (`TrendingUp` / `TrendingDown` with color).

Revenue chart below: `<RevenueChart>` using Recharts `<AreaChart>`. Period selector buttons: 7d / 30d / 90d / All.

**Servers Section**
Table: Name | Status badge | Subscribers | Revenue | Hosting | Actions (Edit / Boost / View).
"Add Server" → `/developer/servers/new`.

**Analytics Section**
Per-server analytics. Server picker `<Select>` at top. Charts: Subscribers over time, Revenue per day, API calls per day (if usage pricing).

**Payouts Section**
Balance card: `text-4xl font-bold text-green-600` amount. "Connected to Stripe" badge or "Connect Stripe" CTA.
Table: Date | Amount | Status | Stripe reference.

---

### 6.9 `/admin` — Admin Panel

**Structure**:

```
<Navbar>                          — shows "Admin" badge on user avatar
<main class="container max-w-6xl py-8 px-4 mx-auto">
  <div class="grid lg:grid-cols-[200px_1fr] gap-8">
    <nav>                         — Sidebar: Overview | Servers | Users | Transactions
    <section>
  </div>
</main>
```

**Overview**: KPI cards (total users, servers, MRR, pending reviews). Activity feed.

**Servers Section**: Tabs — All | Pending | Approved | Rejected | Suspended.
Table: Name | Owner | Category | Pricing | Submitted | Status | Actions.
Row action: Approve (green) / Reject (red) / Suspend (amber). Reject opens `Dialog` for reason.

**Users Section**: Searchable table. Columns: Name | Email | Role | Servers | Joined | Actions.
Action: Change role `Select` inline.

**Transactions Section**: Stripe transaction log. Filter by date, status, server. Export CSV button.

---

### 6.10 `/pricing` — Platform Pricing

Reuses the §1 Pricing grid from the landing page but as a standalone page with additional comparison table.

**Structure**:

```
<Navbar>
<main>
  <section>                        — Hero: "Simple, transparent pricing"
  <section>                        — 3-column pricing cards (same as landing)
  <section>                        — Feature comparison table
  <section>                        — FAQ (Accordion)
  <section>                        — CTA banner
</main>
<Footer>
```

Feature comparison table: `<Table>` with features as rows, plan columns. Checkmark (`CheckCircle2 text-green-600`) or dash for each cell.

---

### 6.11 `/docs` & `/api-docs` — Documentation Pages

**Structure**:

```
<Navbar>
<main class="container max-w-6xl py-8 px-4 mx-auto">
  <div class="grid lg:grid-cols-[240px_1fr] gap-8">
    <nav class="sticky top-20">   — Docs sidebar (tree nav)
    <article class="prose max-w-none">
  </div>
</main>
```

Sidebar: collapsible sections with `<Accordion>`. Active item: `bg-blue-50 text-blue-700 font-medium rounded`.

Prose content: standard Tailwind Typography plugin styles (or custom equivalents without the plugin):
- `h2`: `text-2xl font-bold mt-8 mb-4`
- Code blocks: `bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto`
- Inline code: `bg-muted px-1 py-0.5 rounded text-sm font-mono`

`[M]` Sidebar becomes `<Sheet>` triggered by "Menu" button.

---

## 7. Component Specifications

### 7.1 `<Button>` (shadcn/ui)

Extended from `@radix-ui/slot` via `class-variance-authority`.

**Variants**:

| Variant | Classes | Usage |
|---------|---------|-------|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` | Primary CTA |
| `outline` | `border border-input bg-background hover:bg-accent/10` | Secondary actions |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | On dark backgrounds (CTA section) |
| `ghost` | `hover:bg-accent/10` | Inline/icon actions |
| `destructive` | `bg-destructive text-destructive-foreground hover:bg-destructive/90` | Delete, cancel |
| `link` | `text-primary underline-offset-4 hover:underline` | In-text navigation |

**Sizes**:

| Size | Classes |
|------|---------|
| `sm` | `h-9 px-3 text-sm` |
| `default` | `h-10 px-4 py-2` |
| `lg` | `h-11 px-8 text-base` |
| `icon` | `h-10 w-10 p-0` |

**States**:
- `hover`: Opacity 90% or bg shift (per variant)
- `focus-visible`: `outline-none ring-2 ring-ring ring-offset-2`
- `disabled`: `pointer-events-none opacity-50`
- `loading`: Replace children with `<Loader2 class="animate-spin mr-2 h-4 w-4" />` + "Loading…" text. `disabled` attribute set.

**Accessibility**: `role="button"` (native). `aria-disabled` when disabled. `aria-busy` when loading. Min touch target: `44px` — achieved by `h-10` (40px) + padding; add `min-h-[44px]` on mobile if needed.

---

### 7.2 `<Badge>`

```tsx
// Variants driven by server/subscription status
<Badge variant="default">  // dark bg
<Badge variant="secondary">  // muted bg
<Badge variant="outline">  // border only
<Badge variant="destructive">  // red bg
```

**Custom semantic variants** (extend CVA):

| Semantic | Classes | Usage |
|----------|---------|-------|
| `success` | `bg-green-100 text-green-800 border border-green-200` | APPROVED, ACTIVE |
| `warning` | `bg-amber-100 text-amber-800 border border-amber-200` | PENDING, PAST_DUE |
| `danger` | `bg-red-100 text-red-800 border border-red-200` | REJECTED, SUSPENDED, CANCELED |
| `info` | `bg-blue-100 text-blue-800 border border-blue-200` | USAGE pricing, featured |
| `featured` | `bg-blue-600 text-white` | Featured server pill |

Base: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold`

---

### 7.3 `<ServerCard>`

Used in `/servers` grid and featured carousels.

```
<article class="group relative flex flex-col rounded-lg border border-border bg-card
                hover:border-blue-300 hover:shadow-sm transition-all duration-150 overflow-hidden">
  [Featured ribbon — absolute top-right, if featured]
  <div class="p-5 flex-1">
    <div class="flex items-start gap-3 mb-3">
      <ServerLogo />                           — 40×40 rounded-lg
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-base truncate">Server Name</h3>
        <CategoryBadge />
      </div>
      <PricingBadge />                         — "Free" or "$X/mo"
    </div>
    <p class="text-sm text-muted-foreground line-clamp-2 mb-4">
      Short description
    </p>
    <TagList />                                — flex-wrap gap-1, max 3 tags + "+N" overflow
  </div>
  <div class="border-t border-border px-5 py-3 flex items-center justify-between bg-muted/50">
    <StatsRow />                               — ★ rating, install count
    <OwnerAvatar />                            — small avatar + name truncated
  </div>
</article>
```

**Variants**:
- `featured`: adds `ring-2 ring-blue-500` and `FeaturedBadge` ribbon
- `compact`: removes `TagList` and `StatsRow`, used in related servers sidebar
- `horizontal`: logo left, text right — used in admin tables and search results

**States**:
- Default: `border-border`
- Hover: `border-blue-300 shadow-sm` (via `group-hover` or direct hover)
- Active (subscribed): `ring-2 ring-green-500` inner glow
- Skeleton loading: all text replaced with `<Skeleton>` bars (see §10)

---

### 7.4 `<ServerLogo>`

```tsx
// Renders server logo or colored initial fallback
<div class="w-10 h-10 rounded-lg border border-border overflow-hidden flex-shrink-0
            flex items-center justify-center text-white font-bold text-lg"
     style={{ backgroundColor: hashColor(server.name) }}>
  {server.logoUrl ? <img src={server.logoUrl} alt={server.name} /> : initial}
</div>
```

Logo: `object-cover w-full h-full`. Fallback: first character of server name, background derived from `hashColor(name)` using HSL from the name hash — ensures consistent, visually distinct colors.

---

### 7.5 `<PricingCard>` (action panel on server detail)

```
<Card class="p-6">
  <div class="mb-4">
    <span class="text-3xl font-bold">{price}</span>
    {subscription && <span class="text-muted-foreground">/month</span>}
    {free && <span class="text-green-600 font-semibold">Free</span>}
  </div>

  {/* Subscribe / Get Key button */}
  <Button class="w-full" size="lg">
    {isSubscribed ? "Manage Subscription" : "Subscribe Now"}
  </Button>

  {/* If free: */}
  <Button class="w-full" size="lg" variant="outline">
    Get API Key
  </Button>

  <Separator class="my-4" />

  {/* Feature list */}
  <ul class="space-y-2 text-sm">
    <li class="flex items-center gap-2">
      <CheckCircle2 class="w-4 h-4 text-green-600" />
      Instant API access
    </li>
    ...
  </ul>

  <Separator class="my-4" />

  {/* Trust signals */}
  <p class="text-xs text-muted-foreground text-center">
    Secured by Stripe · Cancel anytime
  </p>
</Card>
```

**States**:
- Not authenticated: button shows "Sign In to Subscribe" → links to `/login?next=/servers/[slug]`
- Subscribed: button shows "Manage Subscription" (outline variant)
- Loading checkout: button in `loading` state
- Server PENDING/REJECTED: button replaced with `<Badge>` and info text

---

### 7.6 `<ReviewCard>` & `<ReviewList>`

```
<div class="space-y-4">
  {reviews.map(r =>
    <div class="border-b border-border pb-4">
      <div class="flex items-center gap-3 mb-2">
        <Avatar class="w-8 h-8" />
        <span class="font-medium text-sm">{r.user.name}</span>
        <StarRating rating={r.rating} />
        <time class="text-xs text-muted-foreground ml-auto">{r.createdAt}</time>
      </div>
      <p class="text-sm text-muted-foreground">{r.comment}</p>
    </div>
  )}
</div>
```

`<StarRating>`: 5 `<Star>` SVG icons (`w-4 h-4`). Filled: `text-amber-400 fill-amber-400`. Empty: `text-muted-foreground`.

`<AddReview>` form:
- Accessible star picker (5 `<button>` elements, keyboard navigable, `aria-label="Rate X stars"`)
- `<Textarea>` for comment (optional)
- Submit button

---

### 7.7 `<KPICard>`

Used in developer and admin dashboards.

```
<Card class="p-4">
  <div class="flex items-center justify-between mb-2">
    <p class="text-sm font-medium text-muted-foreground">{label}</p>
    <Icon class="w-4 h-4 text-muted-foreground" />
  </div>
  <div class="flex items-end gap-2">
    <p class="text-2xl font-bold tabular-nums">{value}</p>
    <TrendBadge change={change} />               — "+12.5% vs last month"
  </div>
</Card>
```

`<TrendBadge>`:
- Positive: `text-green-600 text-xs` with `TrendingUp w-3 h-3 mr-1`
- Negative: `text-red-600 text-xs` with `TrendingDown w-3 h-3 mr-1`
- Neutral: `text-muted-foreground text-xs`

---

### 7.8 `<Stepper>`

Multi-step form progress indicator used in `/developer-signup` and `/developer/servers/new`.

```
<nav aria-label="Form progress">
  <ol class="flex items-center">
    {steps.map((step, i) =>
      <li class="flex-1 flex items-center">
        <div class={cn("step-circle", {
          "bg-blue-600 text-white": i < current,  // completed
          "bg-blue-600 text-white ring-4 ring-blue-200": i === current, // active
          "bg-muted text-muted-foreground": i > current  // upcoming
        })}>
          {i < current ? <Check w-4 h-4 /> : i + 1}
        </div>
        <span class="ml-2 text-sm font-medium hidden sm:block">{step}</span>
        {i < steps.length - 1 && <div class="flex-1 h-px bg-border mx-3" />}
      </li>
    )}
  </ol>
</nav>
```

Step circle: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold`

**Accessibility**: `aria-label="Form progress"`, current step: `aria-current="step"`, completed: `aria-label="{step} - completed"`.

---

### 7.9 `<Navbar>`

```
<header class="sticky top-0 z-40 w-full border-b border-border
               bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="container flex h-14 max-w-6xl items-center mx-auto px-4">

    {/* Logo */}
    <Link href="/" class="mr-8 flex items-center space-x-2">
      <ServerIcon class="w-5 h-5 text-blue-600" />
      <span class="font-bold text-xl">MCPmarket</span>
    </Link>

    {/* Desktop nav */}
    <nav class="hidden md:flex flex-1 gap-6 text-sm">
      <NavLink href="/servers">Browse Servers</NavLink>
      <NavLink href="/pricing">Pricing</NavLink>
      <NavLink href="/docs">Docs</NavLink>
    </nav>

    {/* Auth actions */}
    <div class="flex gap-2 items-center">
      {authenticated ? <UserMenu /> : <>
        <Button variant="ghost" size="sm" asChild><Link href="/login">Sign In</Link></Button>
        <Button size="sm" asChild><Link href="/developer-signup">List Server</Link></Button>
      </>}
    </div>

    {/* Mobile hamburger */}
    <Button variant="ghost" size="icon" class="md:hidden ml-auto" aria-label="Open menu">
      <Menu class="w-5 h-5" />
    </Button>

  </div>
</header>
```

`<NavLink>`: active state `text-foreground font-medium`, default `text-muted-foreground hover:text-foreground transition-colors`.

`<UserMenu>`: shadcn `<DropdownMenu>` triggered by `<Avatar>`. Items: Dashboard, Developer (if role=DEVELOPER), Admin (if role=ADMIN), Settings, Sign Out.

`[M]`: Desktop nav hidden. Hamburger opens shadcn `<Sheet side="left">` with full nav + auth links.

---

### 7.10 `<Footer>`

Three-column desktop layout collapses to 2-column on tablet and stacked on mobile.

```
<footer class="border-t border-border bg-background">
  <div class="container max-w-6xl mx-auto px-4 py-12">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      ...column links...
    </div>
    <div class="border-t border-border pt-8 flex flex-col sm:flex-row
                items-center justify-between gap-4">
      <p class="text-sm text-muted-foreground">© 2026 MCPmarket</p>
      <SocialLinks />
    </div>
  </div>
</footer>
```

`[M]` Grid: `grid-cols-2`. Bottom row: `flex-col items-center`.

---

### 7.11 `<RevenueChart>`

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
           tickFormatter={(v) => `$${v}`} />
    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
    <Area type="monotone" dataKey="revenue"
          stroke="#2563EB" strokeWidth={2}
          fill="url(#revenueGradient)" />
  </AreaChart>
</ResponsiveContainer>
```

Tooltip: custom dark card style matching design system. Values formatted as USD.

---

### 7.12 `<ApiKeyRow>`

Table row for API key management.

```
<TableRow>
  <TableCell class="font-mono text-sm">{key.name}</TableCell>
  <TableCell>
    <code class="bg-muted px-2 py-1 rounded text-xs font-mono">
      mcp_•••••••{key.key.slice(-4)}
    </code>
  </TableCell>
  <TableCell class="text-sm text-muted-foreground">{lastUsed}</TableCell>
  <TableCell><StatusBadge active={key.isActive} /></TableCell>
  <TableCell>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Copy Key</DropdownMenuItem>
        <DropdownMenuItem class="text-destructive">Revoke</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </TableCell>
</TableRow>
```

Key is always masked except during creation (shown once in creation dialog).

---

### 7.13 `<SearchBar>`

Used in `/servers` page header.

```tsx
<div class="relative w-full max-w-xl">
  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input class="pl-9 pr-4" placeholder="Search MCP servers…"
         role="searchbox" aria-label="Search servers" />
  {query && (
    <Button variant="ghost" size="icon"
            class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            aria-label="Clear search" onClick={clear}>
      <X class="w-4 h-4" />
    </Button>
  )}
</div>
```

Debounce: 300 ms. On submit/Enter: updates URL search param `?q=`.

---

### 7.14 `<Toast>` / Notification System

Uses shadcn `Sonner` integration. Positioned `bottom-right` on desktop, `bottom-center` on mobile.

| Type | Icon | Background |
|------|------|-----------|
| Success | `CheckCircle2 text-green-600` | White card |
| Error | `XCircle text-destructive` | White card |
| Info | `Info text-blue-600` | White card |
| Loading | `Loader2 animate-spin` | White card |

Duration: 4 s default, 8 s for errors. Always include actionable label (`aria-live="polite"`).

---

### 7.15 `<ConfirmDialog>`

Reusable destructive-action confirmation modal.

```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{title}</AlertDialogTitle>
      <AlertDialogDescription>{description}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction class="bg-destructive text-destructive-foreground
                                hover:bg-destructive/90">
        {confirmLabel}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Used for: cancel subscription, revoke API key, reject server (admin), delete account.

---

## 8. Accessibility (WCAG AA)

### 8.1 Contrast Ratios

All text/background pairs meet WCAG AA (4.5:1 for normal text, 3:1 for large text ≥18px or bold ≥14px). See §2 for full table. Critical pairs:
- Body text on white: 20.5:1 ✅
- Muted text on white: 4.6:1 ✅
- White on blue CTA (`blue-600`): 5.9:1 ✅
- Status badge text on tinted bg: all ≥ 4.5:1 ✅

Dark mode: all tokens maintain equivalent ratios (foreground/background inverted).

### 8.2 Keyboard Navigation

- **Tab order**: Logical DOM order. No `tabindex > 0`. Skip-nav link as first focusable element: `<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded">Skip to main content</a>`
- **Focus styles**: All interactive elements use `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. Never `outline: none` without replacement.
- **Dropdown menus**: shadcn DropdownMenu uses Radix UI with full keyboard support (Enter to open, Arrow keys to navigate, Escape to close).
- **Modals/Dialogs**: Focus trap via shadcn `Dialog` (Radix). Focus returns to trigger on close.
- **Tabs**: Arrow keys navigate tab list. `role="tablist"`, `role="tab"`, `role="tabpanel"`.
- **Accordion**: Enter/Space toggles. Arrow keys navigate between items.

### 8.3 ARIA Labels & Roles

| Element | ARIA |
|---------|------|
| Navbar | `<header role="banner">`, `<nav aria-label="Main navigation">` |
| Search | `role="searchbox"`, `aria-label="Search servers"` |
| Filters sidebar | `<aside aria-label="Server filters">` |
| Server grid | `<section aria-label="MCP servers">`, each card is `<article>` |
| Star rating (interactive) | Each star: `role="radio"`, `aria-label="Rate X out of 5 stars"`, group: `role="radiogroup" aria-label="Rating"` |
| Star rating (display) | `role="img" aria-label="{n} out of 5 stars"` |
| Status badges | `aria-label="Status: {value}"` |
| Loading spinners | `role="status" aria-label="Loading"`, spinner: `aria-hidden="true"` |
| Progress stepper | `role="list"`, each step: `role="listitem"`, current: `aria-current="step"` |
| Chart | Wrapped in `<figure>`, `<figcaption>` with text summary of key data |
| API key (masked) | `aria-label="API key ending in {last4}"` |
| Icon-only buttons | `aria-label` required, e.g. `aria-label="Copy API key"` |

### 8.4 Touch Targets

Minimum 44×44 px touch target for all interactive elements on mobile:
- Buttons: `h-10` (40px) + vertical padding ensures ≥44px; use `min-h-[44px]` on critical actions
- Table action buttons: wrapped in 44px clickable area, use `p-2` on icon buttons (`h-8 w-8` icon + `p-2` padding = 48px total area)
- Checkbox / Radio inputs: custom UI backed by native input with `peer` pattern, hit area `w-[44px] h-[44px]` minimum

### 8.5 Semantic HTML

- Section headings follow strict h1→h2→h3 hierarchy (one `<h1>` per page)
- Lists use `<ul>/<ol>` not `<div>` chains
- Data tables: `<table>` with `<th scope="col/row">` and `<caption>`
- Forms: `<label>` associated via `htmlFor`, or wrapping the input
- Errors: `aria-describedby` on invalid inputs pointing to error message `id`
- Images: meaningful `alt` text; decorative images: `alt=""`

### 8.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All `tailwindcss-animate` animations respect this via `motion-safe:` variant prefix where applicable.

### 8.7 Screen Reader Announcements

- Route changes (SPA): `aria-live="polite"` region updated with page title on navigation
- Form submission: success/error announced via `aria-live="assertive"` for errors, `aria-live="polite"` for success
- Async data loads: `aria-busy="true"` on container while loading, removed when data arrives

---

## 9. Responsive Breakpoints

Tailwind's default breakpoints used throughout:

| Breakpoint | Prefix | Width | What Changes |
|-----------|--------|-------|--------------|
| Mobile | (none) | 0–639 px | Single column layouts, bottom-sheet sidebars, compact nav, stacked cards |
| Small | `sm:` | 640 px+ | Multi-column buttons in hero, footer 2-col grid |
| Medium | `md:` | 768 px+ | 2-3 column grids, desktop nav visible, server grid 2-col |
| Large | `lg:` | 1024 px+ | Sidebar layouts (dashboard, docs), server grid 3-col, sticky detail panel |
| XL | `xl:` | 1280 px+ | Hero max padding (py-48), wider containers if needed |

### Specific Changes Per Breakpoint

#### `< 640px` (Mobile)

- Navbar: Logo + hamburger menu only. Sheet drawer for nav.
- Hero: `text-3xl`, buttons `flex-col w-full`
- Pricing cards: stacked `grid-cols-1`
- Footer: `grid-cols-2`
- Server detail: `grid-cols-1`, action panel becomes fixed bottom bar
- Dashboard: Tabs scroll horizontally; tables become card lists (`<dl>`)
- Developer dashboard: Sidebar nav becomes horizontal scroll tabs at top
- Filter sidebar: Bottom sheet (shadcn `Sheet side="bottom"`)
- Modals: `w-full mx-4` or `w-screen h-screen` full-screen on smallest devices

#### `640px–767px` (Small tablet)

- Hero buttons: `flex-row gap-4`
- Footer: `grid-cols-2` maintained
- Server cards: still single column
- CTA bottom bar on detail page moves inline

#### `768px–1023px` (Tablet)

- Desktop nav links visible (or hamburger retained — designer choice; spec uses `md:flex` for nav)
- Server grid: `grid-cols-2`
- Features section: `grid-cols-2`
- Pricing: `grid-cols-3` (scales down gracefully)
- How It Works: `grid-cols-2` layout
- Dashboard: Sidebar still bottom-tabs; content full-width

#### `≥ 1024px` (Desktop)

- Dashboard sidebar: `240px` fixed left column
- Server detail: sticky right action panel `360px`
- Server grid: `grid-cols-3`
- Docs: sidebar `240px` + article column
- All modals: standard centered dialog (not full-screen)

---

## 10. Loading, Empty & Error States

### 10.1 Loading States

#### Server Grid (`/servers`)

```tsx
// Skeleton grid — same layout as live cards
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {Array(9).fill(0).map((_, i) => (
    <div key={i} class="rounded-lg border border-border p-5 space-y-3">
      <div class="flex items-start gap-3">
        <Skeleton class="w-10 h-10 rounded-lg" />
        <div class="flex-1 space-y-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton class="h-3 w-full" />
      <Skeleton class="h-3 w-5/6" />
      <div class="flex gap-2 pt-1">
        <Skeleton class="h-5 w-16 rounded-full" />
        <Skeleton class="h-5 w-12 rounded-full" />
      </div>
    </div>
  ))}
</div>
```

`<Skeleton>`: `animate-pulse bg-muted rounded-md` (shadcn Skeleton component).

#### Server Detail Page

- Hero: Skeleton for logo, name, tags
- Tabs content: `h-64` skeleton block
- Action panel: skeleton for price and button

#### Dashboard (KPI Cards)

```tsx
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  {Array(4).fill(0).map((_, i) => (
    <Card key={i} class="p-4">
      <Skeleton class="h-3 w-24 mb-3" />
      <Skeleton class="h-8 w-16" />
    </Card>
  ))}
</div>
```

#### Revenue Chart

Loading: `h-[300px] bg-muted rounded-lg animate-pulse`

#### Tables (Subscriptions, API Keys, Transactions)

Five skeleton rows with appropriate column widths.

#### Page-level / Route transitions

`<Progress>` bar at top of page (NProgress-style) via Next.js router events. `h-1 bg-blue-600 fixed top-0 left-0 z-50`.

#### Inline / Button loading

Button loading state: replace label with `<Loader2 class="animate-spin mr-2 h-4 w-4" />Loading…` and set `disabled`. Use optimistic UI where possible.

---

### 10.2 Empty States

#### No Servers Found (`/servers` with filters/search)

```tsx
<div class="flex flex-col items-center py-24 text-center">
  <SearchX class="w-12 h-12 text-muted-foreground mb-4" />
  <h3 class="text-lg font-semibold mb-2">No servers found</h3>
  <p class="text-sm text-muted-foreground max-w-sm mb-6">
    Try adjusting your filters or search query.
  </p>
  <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
</div>
```

#### No Subscriptions (User Dashboard)

```tsx
<div class="flex flex-col items-center py-16 text-center">
  <Package class="w-12 h-12 text-muted-foreground mb-4" />
  <h3 class="text-lg font-semibold mb-2">No active subscriptions</h3>
  <p class="text-sm text-muted-foreground mb-6">
    Discover and subscribe to MCP servers to get started.
  </p>
  <Button asChild><Link href="/servers">Browse Servers</Link></Button>
</div>
```

#### No API Keys

```tsx
<div class="flex flex-col items-center py-16 text-center">
  <Key class="w-12 h-12 text-muted-foreground mb-4" />
  <h3 class="text-lg font-semibold mb-2">No API keys yet</h3>
  <p class="text-sm text-muted-foreground mb-6">
    Create your first API key to start using MCP servers programmatically.
  </p>
  <Button onClick={openCreateDialog}>Create API Key</Button>
</div>
```

#### No Developer Servers

```tsx
<div class="flex flex-col items-center py-16 text-center">
  <Server class="w-12 h-12 text-muted-foreground mb-4" />
  <h3 class="text-lg font-semibold mb-2">No servers listed yet</h3>
  <p class="text-sm text-muted-foreground mb-6">
    List your first MCP server and start earning today.
  </p>
  <Button asChild><Link href="/developer/servers/new">List a Server</Link></Button>
</div>
```

#### No Reviews

```tsx
<div class="py-8 text-center text-sm text-muted-foreground">
  <Star class="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
  No reviews yet. Be the first to leave a review.
</div>
```

#### Empty Payout History

```tsx
<div class="flex flex-col items-center py-16 text-center">
  <Wallet class="w-12 h-12 text-muted-foreground mb-4" />
  <h3 class="text-lg font-semibold mb-2">No payouts yet</h3>
  <p class="text-sm text-muted-foreground">
    Your first payout processes on the 1st of next month.
  </p>
</div>
```

#### Admin — No Pending Servers

```tsx
<div class="py-12 text-center text-sm text-muted-foreground">
  <CheckCircle2 class="w-8 h-8 mx-auto mb-2 text-green-600" />
  All caught up! No servers pending review.
</div>
```

---

### 10.3 Error States

#### General Page Error (Error Boundary)

```tsx
<div class="flex flex-col items-center py-24 text-center px-4">
  <AlertTriangle class="w-12 h-12 text-destructive mb-4" />
  <h1 class="text-2xl font-bold mb-2">Something went wrong</h1>
  <p class="text-sm text-muted-foreground max-w-sm mb-8">
    We encountered an unexpected error. Please try again.
  </p>
  <div class="flex gap-4">
    <Button onClick={retry}>Try Again</Button>
    <Button variant="outline" asChild><Link href="/">Go Home</Link></Button>
  </div>
</div>
```

#### 404 — Server Not Found (`/servers/[slug]`)

```tsx
<div class="flex flex-col items-center py-24 text-center">
  <Server class="w-12 h-12 text-muted-foreground mb-4" />
  <h1 class="text-2xl font-bold mb-2">Server not found</h1>
  <p class="text-sm text-muted-foreground mb-8">
    This MCP server doesn't exist or has been removed.
  </p>
  <Button asChild><Link href="/servers">Browse Servers</Link></Button>
</div>
```

#### 401 — Unauthenticated Access

Redirect to `/login?next={currentPath}`. On arrival at login page: `<Alert variant="info">` banner: "Sign in to continue."

#### 403 — Unauthorized (e.g., non-developer accessing `/developer`)

```tsx
<div class="flex flex-col items-center py-24 text-center">
  <ShieldOff class="w-12 h-12 text-destructive mb-4" />
  <h1 class="text-2xl font-bold mb-2">Access denied</h1>
  <p class="text-sm text-muted-foreground mb-8">
    You need a developer account to access this page.
  </p>
  <Button asChild><Link href="/developer-signup">Become a Developer</Link></Button>
</div>
```

#### Form Validation Errors

Inline below each field:
```tsx
<p class="text-sm text-destructive mt-1" id={`${fieldId}-error`} role="alert">
  {error.message}
</p>
```

Input in error state: `border-destructive focus-visible:ring-destructive`

#### API / Fetch Errors (inline in data sections)

```tsx
<div class="rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex gap-3">
  <AlertCircle class="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
  <div>
    <p class="text-sm font-medium text-destructive">Failed to load servers</p>
    <p class="text-sm text-muted-foreground mt-1">
      {error.message || "Please check your connection and try again."}
    </p>
    <Button variant="link" size="sm" class="h-auto p-0 mt-2" onClick={refetch}>
      Retry
    </Button>
  </div>
</div>
```

#### Stripe Payment Failure

After failed checkout redirect, shown as `variant="destructive"` `<Alert>` on the server detail page:
```tsx
<Alert variant="destructive">
  <AlertCircle class="h-4 w-4" />
  <AlertTitle>Payment failed</AlertTitle>
  <AlertDescription>
    {stripeError || "Your payment could not be processed. Please try a different card."}
  </AlertDescription>
</Alert>
```

#### Server PENDING / REJECTED State (on server detail page)

```tsx
// PENDING
<Alert class="mb-6">
  <Clock class="h-4 w-4" />
  <AlertTitle>Under Review</AlertTitle>
  <AlertDescription>
    This server is pending approval from the MCPmarket team. Subscribe functionality is unavailable until approved.
  </AlertDescription>
</Alert>

// REJECTED
<Alert variant="destructive" class="mb-6">
  <XCircle class="h-4 w-4" />
  <AlertTitle>Not Available</AlertTitle>
  <AlertDescription>
    This server listing has been rejected and is unavailable.
  </AlertDescription>
</Alert>
```

---

## Appendix A: shadcn/ui Component Inventory

| Component | Used In |
|-----------|---------|
| `Button` | Throughout |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | Server cards, pricing, dashboard panels |
| `Badge` | Status, pricing model, category, featured |
| `Input`, `Textarea` | All forms |
| `Label` | All forms |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | Filters, pricing model, role selector |
| `Checkbox` | Filter sidebar |
| `RadioGroup`, `RadioGroupItem` | Pricing filter, star rating |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Server detail, dashboard |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | FAQ, filter sidebar, docs nav |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` | Create API key, subscription management |
| `AlertDialog` | Destructive confirmations |
| `Alert`, `AlertTitle`, `AlertDescription` | Inline banners |
| `Sheet`, `SheetContent`, `SheetHeader` | Mobile nav, mobile filters |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` | User nav, table row actions |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | Subscriptions, API keys, admin tables |
| `Separator` | Dividers in cards, forms |
| `Avatar`, `AvatarImage`, `AvatarFallback` | User menu, review cards |
| `Skeleton` | All loading states |
| `Progress` | Page loading bar |
| `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` | Icon-only buttons, truncated data |
| `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationNext`, `PaginationPrevious` | Server list, admin tables |
| `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator` | Server detail, admin pages |

---

## Appendix B: Animation Reference

| Animation | Class | Usage |
|-----------|-------|-------|
| Fade in | `animate-in fade-in duration-200` | Route transitions, modal open |
| Slide up | `animate-in slide-in-from-bottom-4 duration-200` | Toast, mobile sheets |
| Slide down | `animate-in slide-in-from-top-2 duration-150` | Dropdowns |
| Spin | `animate-spin` | Loading indicators |
| Pulse | `animate-pulse` | Skeleton components |
| Bounce (rare) | `motion-safe:animate-bounce` | New badge, celebration state after first server listing |

---

*End of MCPmarket Design Specification — DESIGN.md*
