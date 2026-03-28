import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Zap,
  Shield,
  TrendingUp,
  Code2,
  Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "MCPmarket | MCP Server Marketplace with Billing",
  description:
    "MCPmarket is a free AI tool that lets developers monetize MCP servers and users discover paid tools. The Shopify for MCP servers with 20% revenue share.",
  openGraph: {
    title: "MCPmarket | MCP Server Marketplace with Billing",
    description:
      "The Shopify for MCP servers. Developers list paid MCP tools, users subscribe, we handle hosting and billing.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-slate-50 to-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              The Marketplace for Paid MCP Servers
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
              MCPmarket is a free AI tool that enables developers to monetize
              MCP servers and helps users discover and subscribe to premium
              tools. Built-in billing, hosting, and discovery — all with a 20%
              revenue share for creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" asChild>
                <Link href="/servers">Explore Servers</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/developer-signup">List Your MCP Server</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold">11K+</h3>
              <p className="text-gray-600 mt-2">MCP Servers Exist</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">97M</h3>
              <p className="text-gray-600 mt-2">Monthly SDK Downloads</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">&lt;5%</h3>
              <p className="text-gray-600 mt-2">Currently Monetized</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How MCPmarket Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">For Developers</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    List your MCP server, set your price, and earn 80% of
                    subscriptions. We handle auth, billing, and hosting.
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
                    Discover premium MCP tools in one place. One account, one
                    billing method, instant access to all tools.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">For the Platform</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    We take 20% of transaction fees. Managed hosting add-on at
                    $9/mo. Featured placement at $29/mo.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <p className="text-gray-500">Platform Demo Video</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Secure Billing</h3>
              <p className="text-gray-600 text-sm">
                Stripe-powered payment processing with PCI compliance. Automatic
                invoicing and tax handling.
              </p>
            </div>
            <div className="space-y-4">
              <Zap className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Instant Hosting</h3>
              <p className="text-gray-600 text-sm">
                Deploy your MCP server on our infrastructure. Zero downtime
                deployments and automatic scaling.
              </p>
            </div>
            <div className="space-y-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Analytics Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Real-time insights into revenue, subscribers, and usage metrics.
                Export reports anytime.
              </p>
            </div>
            <div className="space-y-4">
              <Code2 className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Developer API</h3>
              <p className="text-gray-600 text-sm">
                REST + WebSocket APIs for custom integrations. Full webhooks
                support for real-time events.
              </p>
            </div>
            <div className="space-y-4">
              <Wallet className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Revenue Payouts</h3>
              <p className="text-gray-600 text-sm">
                Monthly payouts to your bank account. 80% commission, real-time
                balance tracking.
              </p>
            </div>
            <div className="space-y-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-lg">Auth & API Keys</h3>
              <p className="text-gray-600 text-sm">
                OAuth2 integrations, API key management, and role-based access
                control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="font-bold text-lg mb-4">Basic (Free)</h3>
              <p className="text-3xl font-bold mb-6">
                $0<span className="text-sm text-gray-600">/month</span>
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  List your MCP server
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Set custom pricing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Basic analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  20% platform fee
                </li>
              </ul>
              <Button className="w-full mt-8" variant="outline">
                Get Started
              </Button>
            </div>

            <div className="bg-white rounded-lg border-2 border-blue-600 p-8 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Popular
                </span>
              </div>
              <h3 className="font-bold text-lg mb-4">Managed Hosting</h3>
              <p className="text-3xl font-bold mb-6">
                $9
                <span className="text-sm text-gray-600">/month per server</span>
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Everything in Basic
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Managed server hosting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Auto-scaling & uptime
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  SSL certificates
                </li>
              </ul>
              <Button className="w-full mt-8">Choose Plan</Button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="font-bold text-lg mb-4">Featured Listing</h3>
              <p className="text-3xl font-bold mb-6">
                $29<span className="text-sm text-gray-600">/month</span>
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Everything in Hosting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Featured placement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Email marketing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full mt-8" variant="outline">
                Choose Plan
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-lg mb-2">
                How do I get my MCP server on MCPmarket?
              </h3>
              <p className="text-gray-600">
                Sign up as a developer, verify your GitHub account, and submit
                your MCP server details. We validate and deploy within 24 hours.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">
                What percentage does MCPmarket take?
              </h3>
              <p className="text-gray-600">
                We take 20% of subscription revenue. You keep 80%. Additional
                charges apply for managed hosting ($9/mo) and featured placement
                ($29/mo).
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">
                How are payouts handled?
              </h3>
              <p className="text-gray-600">
                Monthly payouts via Stripe Connect to your bank account. Payouts
                happen on the 1st of each month for the previous month&apos;s
                revenue.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">
                Can I use my own payment processor?
              </h3>
              <p className="text-gray-600">
                No. All payments go through our Stripe integration to ensure
                secure, compliant, and consistent billing across the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-blue-600 text-white">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Monetize Your MCP Server?
          </h2>
          <p className="text-blue-50 mb-8 max-w-2xl mx-auto">
            Join 100+ developers building the future of MCP. Get featured,
            handle billing, and scale your server—all with MCPmarket.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/developer-signup">List Your MCP Server Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
