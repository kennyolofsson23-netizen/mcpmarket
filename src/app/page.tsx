import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import {
  CheckCircle2,
  Zap,
  Shield,
  TrendingUp,
  Code2,
  Wallet,
} from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              The Marketplace for Paid MCP Servers
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
              MCPmarket is a free AI marketplace tool that connects MCP server
              developers with paying subscribers. Developers list a server, set
              a price, and keep 80% of all subscription revenue — while
              MCPmarket handles billing, hosting, and discovery in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" asChild>
                <Link href="/servers">Browse Servers</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">List Your Server</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold">11,000+</h3>
              <p className="text-gray-600 mt-2">MCP Servers Built</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">97M+</h3>
              <p className="text-gray-600 mt-2">Monthly MCP SDK Downloads</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">&lt;5%</h3>
              <p className="text-gray-600 mt-2">Currently Earning Revenue</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How MCPmarket Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">For Developers</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    List your MCP server, set a subscription or per-call price,
                    and earn 80% of revenue. We handle auth, billing, and
                    optional managed hosting.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">For Users</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Browse and subscribe to premium MCP tools in one place. One
                    account, one billing method, instant config snippets for
                    Claude Desktop, Cursor, and other AI clients.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Platform Fee</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    MCPmarket keeps 20% of transactions. Optional managed
                    hosting is $9/mo per server. Featured placement is $29/mo
                    per server.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm">
              <p className="text-gray-500 text-xs mb-4">
                ~/claude_desktop_config.json
              </p>
              <p className="text-blue-400">{`{`}</p>
              <p className="text-blue-400 pl-4">{`"mcpServers": {`}</p>
              <p className="text-green-400 pl-8">{`"code-review-pro": {`}</p>
              <p className="text-yellow-300 pl-12">
                {`"url": "https://api.mcpmarket.dev/s/code-review-pro",`}
              </p>
              <p className="text-yellow-300 pl-12">{`"headers": {`}</p>
              <p className="text-orange-300 pl-16">
                {`"Authorization": "Bearer mcp_sk_••••••••"`}
              </p>
              <p className="text-yellow-300 pl-12">{`}`}</p>
              <p className="text-green-400 pl-8">{`}`}</p>
              <p className="text-blue-400 pl-4">{`}`}</p>
              <p className="text-blue-400">{`}`}</p>
              <p className="text-gray-500 text-xs mt-4">
                ✓ Subscribe to a server and paste this into your MCP client
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Everything You Need to Monetize MCP
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Stripe-Powered Billing</h3>
              <p className="text-gray-600 text-sm">
                Subscriptions, usage-based billing, and one-click checkout —
                all PCI-compliant. You never touch payment infrastructure.
              </p>
            </div>
            <div className="space-y-4">
              <Zap className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Optional Managed Hosting</h3>
              <p className="text-gray-600 text-sm">
                Deploy from a Docker image or GitHub repo. We provision the
                endpoint, handle SSL, and monitor uptime — for $9/mo per
                server.
              </p>
            </div>
            <div className="space-y-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Revenue Analytics</h3>
              <p className="text-gray-600 text-sm">
                Live subscriber count, monthly revenue, and daily install
                charts. Track every server individually from your dashboard.
              </p>
            </div>
            <div className="space-y-4">
              <Code2 className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Instant Config Snippets</h3>
              <p className="text-gray-600 text-sm">
                Subscribers get a pre-filled JSON config to paste into their MCP
                client. Works with Claude Desktop, Cursor, and all
                MCP-compatible clients.
              </p>
            </div>
            <div className="space-y-4">
              <Wallet className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Monthly Payouts</h3>
              <p className="text-gray-600 text-sm">
                Stripe Connect sends 80% of gross revenue to your bank account
                on the 1st of each month. $25 minimum payout threshold.
              </p>
            </div>
            <div className="space-y-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">API Key Authentication</h3>
              <p className="text-gray-600 text-sm">
                Every subscriber gets a unique, revocable API key. Hashed at
                rest, shown once on creation, and verified on every request.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Developer Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            Free to list. Pay only when you earn — or add hosting and featured
            placement as optional upgrades.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="font-bold text-lg mb-1">Basic</h3>
              <p className="text-sm text-gray-500 mb-4">Free to list</p>
              <p className="text-3xl font-bold mb-6">
                $0<span className="text-sm text-gray-600">/month</span>
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  List your MCP server on the marketplace
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Set any price — subscription or per-call
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Subscriber analytics and revenue dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  20% platform fee on each transaction
                </li>
              </ul>
              <Button className="w-full mt-8" variant="outline" asChild>
                <Link href="/auth/signin">List Your Server Free</Link>
              </Button>
            </div>

            <div className="bg-white rounded-lg border-2 border-blue-600 p-8 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="font-bold text-lg mb-1">Managed Hosting</h3>
              <p className="text-sm text-gray-500 mb-4">Add-on for Basic</p>
              <p className="text-3xl font-bold mb-6">
                $9
                <span className="text-sm text-gray-600">/month per server</span>
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Everything in Basic
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  MCPmarket hosts your server endpoint
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Auto-scaling, SSL, and uptime monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Deploy from Docker image or GitHub repo
                </li>
              </ul>
              <Button className="w-full mt-8" asChild>
                <Link href="/auth/signin">Start with Managed Hosting</Link>
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="font-bold text-lg mb-1">Featured Listing</h3>
              <p className="text-sm text-gray-500 mb-4">Add-on for Basic</p>
              <p className="text-3xl font-bold mb-6">
                $29
                <span className="text-sm text-gray-600">/month per server</span>
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Everything in Basic
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Featured placement at top of browse page
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  &ldquo;Featured&rdquo; badge on your listing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Priority support response
                </li>
              </ul>
              <Button className="w-full mt-8" variant="outline" asChild>
                <Link href="/auth/signin">Get Featured Placement</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1" trigger="What is MCPmarket?">
              <p className="text-gray-600">
                MCPmarket is the paid marketplace for MCP (Model Context
                Protocol) servers. Developers list MCP tools with a subscription
                or usage-based price, users subscribe with one click, and the
                platform handles billing, hosting, authentication, and monthly
                payouts. It is the only MCP marketplace that combines discovery,
                managed hosting, and developer monetization in one platform.
              </p>
            </AccordionItem>
            <AccordionItem value="item-2" trigger="How do I list my MCP server on MCPmarket?">
              <p className="text-gray-600">
                Sign in with GitHub or Google, upgrade your account to Developer
                status, and submit your server listing with a name, description,
                category, pricing model, and endpoint URL. Listings are reviewed
                within 24 hours. The Basic listing tier is free with a 20%
                revenue share. Managed hosting ($9/mo per server) and Featured
                placement ($29/mo per server) are optional add-ons.
              </p>
            </AccordionItem>
            <AccordionItem value="item-3" trigger="What percentage does MCPmarket take from developer revenue?">
              <p className="text-gray-600">
                MCPmarket takes a 20% platform fee on all subscription and
                usage-based transactions. Developers keep 80% of gross revenue.
                Payouts are processed via Stripe Connect on the 1st of each
                month for the prior month&apos;s earnings, with a $25 minimum
                payout threshold.
              </p>
            </AccordionItem>
            <AccordionItem value="item-4" trigger="Which AI clients can connect to MCP servers listed on MCPmarket?">
              <p className="text-gray-600">
                Any client that supports the Model Context Protocol can connect,
                including Claude Desktop, Cursor, Windsurf, and other
                MCP-compatible AI assistants. After subscribing, users receive a
                ready-to-paste JSON configuration snippet for their MCP client
                settings file — no manual setup required.
              </p>
            </AccordionItem>
            <AccordionItem value="item-5" trigger="How does MCPmarket compare to free MCP directories like mcp.so?">
              <p className="text-gray-600">
                Free directories like mcp.so and mcpservers.org provide listings
                only — no billing infrastructure, no hosted endpoints, and no
                developer payouts. MCPmarket adds Stripe subscription billing,
                optional managed server hosting, API key authentication, usage
                metering, and monthly revenue payouts. Developers on MCPmarket
                earn revenue; developers on free directories do not.
              </p>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-12 md:py-24 bg-blue-600 text-white">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Your MCP Server Should Earn Revenue
          </h2>
          <p className="text-blue-50 mb-8 max-w-2xl mx-auto">
            Over 11,000 MCP servers exist and fewer than 5% earn revenue. List
            your server today and start receiving payouts within 30 days of your
            first subscriber.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signin">List Your Server — It&apos;s Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
