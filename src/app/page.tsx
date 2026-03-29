import Link from "next/link";
import {
  ArrowRight,
  Plug,
  DollarSign,
  Server,
  Zap,
  Lock,
  BarChart3,
} from "lucide-react";

function TerminalWindow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="terminal-glow rounded-lg overflow-hidden bg-[#0d0d14] border border-zinc-800/60">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800/60">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        </div>
        <span className="text-[11px] font-mono text-zinc-500 ml-2">
          {title}
        </span>
      </div>
      <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

function FeatureBlock({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-5 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:border-cyan-400/20 hover:bg-zinc-900/50 transition-all">
      <div className="w-9 h-9 rounded-md bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-4 group-hover:border-cyan-400/30 transition-colors">
        <Icon className="w-4 h-4 text-cyan-400" />
      </div>
      <h3 className="font-semibold text-zinc-100 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="hero-mesh noise-bg relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — copy */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                97M+ MCP SDK downloads/month
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-zinc-50 tracking-tight leading-[1.1] mb-6">
                Your MCP server
                <br />
                <span className="text-cyan-400">deserves revenue</span>
              </h1>
              <p className="text-lg text-zinc-400 leading-relaxed max-w-lg mb-8">
                MCPmarket is the paid marketplace for MCP servers. List your
                tool, set a price, and earn 80% of every subscription. We handle
                Stripe billing, API key auth, and optional managed hosting.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 bg-cyan-400 text-[#0a0a0f] font-semibold px-6 py-3 rounded-lg hover:bg-cyan-300 transition-colors accent-glow"
                >
                  List your server
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/servers"
                  className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-lg hover:border-zinc-600 hover:text-zinc-100 transition-all"
                >
                  Browse marketplace
                </Link>
              </div>
            </div>

            {/* Right — config snippet */}
            <div className="animate-fade-in-up delay-200">
              <TerminalWindow title="claude_desktop_config.json">
                <div className="text-zinc-500">{"{"}</div>
                <div className="text-zinc-500 pl-4">
                  {'"mcpServers"'}: {"{"}
                </div>
                <div className="pl-8">
                  <span className="text-cyan-400">{'"code-review-pro"'}</span>
                  <span className="text-zinc-500">: {"{"}</span>
                </div>
                <div className="pl-12">
                  <span className="text-zinc-500">{'"url"'}: </span>
                  <span className="text-emerald-400">
                    {'"https://api.mcpmarket.dev/s/code-review-pro"'}
                  </span>
                  <span className="text-zinc-600">,</span>
                </div>
                <div className="pl-12">
                  <span className="text-zinc-500">
                    {'"headers"'}: {"{"}
                  </span>
                </div>
                <div className="pl-16">
                  <span className="text-zinc-500">{'"Authorization"'}: </span>
                  <span className="text-amber-400">{'"Bearer mcp_sk_'}</span>
                  <span className="text-amber-400/50">{"••••••••"}</span>
                  <span className="text-amber-400">{'"'}</span>
                </div>
                <div className="pl-12 text-zinc-500">{"}"}</div>
                <div className="pl-8 text-zinc-500">{"}"}</div>
                <div className="text-zinc-500 pl-4">{"}"}</div>
                <div className="text-zinc-500">{"}"}</div>
                <div className="mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-600 flex items-center gap-2">
                  <span className="text-emerald-500">&#10003;</span> Subscribe
                  &rarr; paste config &rarr; done
                </div>
              </TerminalWindow>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — asymmetric */}
      <section className="border-t border-zinc-800/50 grid-bg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">
                How it works
              </h2>
              <p className="text-zinc-500 leading-relaxed mb-8">
                No complicated onboarding. List a server, set a price, start
                earning.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center font-mono text-xs text-cyan-400 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200 mb-1">
                      List your server
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Connect GitHub, describe your MCP server, set a monthly
                      price or per-call rate.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded bg-violet-400/10 border border-violet-400/20 flex items-center justify-center font-mono text-xs text-violet-400 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200 mb-1">
                      Users subscribe
                    </h3>
                    <p className="text-sm text-zinc-500">
                      One-click Stripe checkout. Subscribers get an API key and
                      a config snippet.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center font-mono text-xs text-emerald-400 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200 mb-1">
                      Get paid monthly
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Stripe Connect deposits 80% to your bank on the 1st of
                      each month.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <TerminalWindow title="terminal — developer earnings">
                <div className="text-zinc-500 text-xs mb-4">
                  $ mcpmarket earnings --month 2026-03
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">code-review-pro</span>
                    <span className="text-emerald-400">$2,340.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">sql-optimizer</span>
                    <span className="text-emerald-400">$890.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">design-tokens-mcp</span>
                    <span className="text-emerald-400">$445.00</span>
                  </div>
                  <div className="border-t border-zinc-800/60 mt-3 pt-3 flex justify-between font-medium">
                    <span className="text-zinc-300">Total payout</span>
                    <span className="text-cyan-400">$3,675.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">Platform fee (20%)</span>
                    <span className="text-zinc-600">$918.75</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 text-xs text-zinc-600">
                  <span className="text-emerald-500">&#10003;</span> Payout
                  scheduled for Apr 1, 2026 via Stripe Connect
                </div>
              </TerminalWindow>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800/50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 text-center">
            Everything to monetize MCP
          </h2>
          <p className="text-zinc-500 text-center mb-12 max-w-xl mx-auto">
            Built for the MCP ecosystem. No boilerplate billing code, no auth
            headaches.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureBlock
              icon={DollarSign}
              title="Stripe-powered billing"
              description="Subscriptions and usage-based pricing. PCI-compliant checkout. You never touch payment infrastructure."
            />
            <FeatureBlock
              icon={Server}
              title="Managed hosting"
              description="Deploy from Docker or GitHub. Auto-scaling, SSL, uptime monitoring. $9/mo per server."
            />
            <FeatureBlock
              icon={BarChart3}
              title="Revenue analytics"
              description="Live subscriber count, MRR tracking, daily install charts. Per-server breakdowns."
            />
            <FeatureBlock
              icon={Plug}
              title="Instant config snippets"
              description="Subscribers get a JSON config to paste into Claude Desktop, Cursor, or any MCP client."
            />
            <FeatureBlock
              icon={Lock}
              title="API key authentication"
              description="Unique, revocable keys per subscriber. Hashed at rest, shown once on creation."
            />
            <FeatureBlock
              icon={Zap}
              title="Usage metering"
              description="Track per-call usage. Bill by the request for high-volume tools. Real-time dashboards."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-zinc-800/50 noise-bg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 text-center">
            Developer pricing
          </h2>
          <p className="text-zinc-500 text-center mb-12">
            Free to list. You only pay when you earn.
          </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-6">
              <div className="font-mono text-xs text-zinc-600 mb-3">BASIC</div>
              <div className="text-3xl font-bold text-zinc-100 mb-1">Free</div>
              <div className="text-sm text-zinc-500 mb-6">20% rev share</div>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">&#8250;</span>Unlimited
                  server listings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">&#8250;</span>Stripe
                  billing included
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">&#8250;</span>80%
                  developer payout
                </li>
              </ul>
              <Link
                href="/auth/signin"
                className="block text-center text-sm font-medium border border-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg hover:border-zinc-600 hover:text-zinc-100 transition-all"
              >
                Get started free
              </Link>
            </div>
            <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/[0.03] p-6 relative">
              <div className="absolute -top-3 left-6">
                <span className="bg-cyan-400 text-[#0a0a0f] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  Popular
                </span>
              </div>
              <div className="font-mono text-xs text-cyan-400/60 mb-3">
                MANAGED
              </div>
              <div className="text-3xl font-bold text-zinc-100 mb-1">
                $9<span className="text-lg text-zinc-500">/mo</span>
              </div>
              <div className="text-sm text-zinc-500 mb-6">
                per server + 20% rev share
              </div>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">&#8250;</span>
                  Everything in Basic
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">&#8250;</span>Hosted
                  endpoint with SSL
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">&#8250;</span>
                  Auto-scaling &amp; monitoring
                </li>
              </ul>
              <Link
                href="/auth/signin"
                className="block text-center text-sm font-semibold bg-cyan-400 text-[#0a0a0f] px-4 py-2.5 rounded-lg hover:bg-cyan-300 transition-colors accent-glow"
              >
                Start hosting
              </Link>
            </div>
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-6">
              <div className="font-mono text-xs text-zinc-600 mb-3">
                FEATURED
              </div>
              <div className="text-3xl font-bold text-zinc-100 mb-1">
                $29<span className="text-lg text-zinc-500">/mo</span>
              </div>
              <div className="text-sm text-zinc-500 mb-6">
                per server + 20% rev share
              </div>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">&#8250;</span>
                  Everything in Basic
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">&#8250;</span>Top
                  placement on browse
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">&#8250;</span>
                  Featured badge on listing
                </li>
              </ul>
              <Link
                href="/auth/signin"
                className="block text-center text-sm font-medium border border-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg hover:border-zinc-600 hover:text-zinc-100 transition-all"
              >
                Get featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-20 lg:py-24 text-center">
          <h2 className="text-3xl font-bold text-zinc-100 mb-4">
            11,000+ servers. &lt;5% earning revenue.
          </h2>
          <p className="text-zinc-500 mb-8 max-w-lg mx-auto">
            The MCP ecosystem is exploding. Developers are building — they just
            have no way to charge. MCPmarket fixes that.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-cyan-400 text-[#0a0a0f] font-semibold px-8 py-3.5 rounded-lg hover:bg-cyan-300 transition-colors accent-glow text-lg"
          >
            List your server &mdash; it&apos;s free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
