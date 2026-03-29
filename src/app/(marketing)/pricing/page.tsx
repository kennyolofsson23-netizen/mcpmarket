import Link from "next/link";
import {
  FEATURED_LISTING_PRICE_CENTS,
  MANAGED_HOSTING_PRICE_CENTS,
  DEVELOPER_SHARE_PERCENT,
} from "@/lib/constants";

export default function PricingPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-zinc-100 text-center mb-3">
        Developer pricing
      </h1>
      <p className="text-center text-zinc-500 mb-14 max-w-md mx-auto">
        No upfront costs. Free to list. We only earn when you do.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {/* Basic */}
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-6">
          <div className="font-mono text-xs text-zinc-600 mb-3">BASIC</div>
          <div className="text-3xl font-bold text-zinc-100 mb-1">Free</div>
          <div className="text-sm text-zinc-500 mb-6">20% revenue share</div>
          <ul className="space-y-3 text-sm text-zinc-400 mb-8">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#8250;</span>
              Unlimited server listings
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#8250;</span>
              Stripe billing included
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#8250;</span>
              {DEVELOPER_SHARE_PERCENT}% developer payout
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#8250;</span>
              API key auth for subscribers
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#8250;</span>
              Revenue analytics dashboard
            </li>
          </ul>
          <Link
            href="/auth/signin"
            className="block text-center text-sm font-medium border border-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg hover:border-zinc-600 hover:text-zinc-100 transition-all"
          >
            Get started free
          </Link>
        </div>

        {/* Managed Hosting */}
        <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/[0.03] p-6 relative">
          <div className="absolute -top-3 left-6">
            <span className="bg-cyan-400 text-[#0a0a0f] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
              Popular
            </span>
          </div>
          <div className="font-mono text-xs text-cyan-400/60 mb-3">MANAGED</div>
          <div className="text-3xl font-bold text-zinc-100 mb-1">
            ${(MANAGED_HOSTING_PRICE_CENTS / 100).toFixed(0)}
            <span className="text-lg text-zinc-500">/mo</span>
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
              <span className="text-cyan-400 mt-0.5">&#8250;</span>
              Hosted endpoint with SSL
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#8250;</span>
              Auto-scaling &amp; uptime monitoring
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#8250;</span>
              Deploy from Docker or GitHub
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">&#8250;</span>
              Custom endpoint URL
            </li>
          </ul>
          <Link
            href="/auth/signin"
            className="block text-center text-sm font-semibold bg-cyan-400 text-[#0a0a0f] px-4 py-2.5 rounded-lg hover:bg-cyan-300 transition-colors accent-glow"
          >
            Start hosting
          </Link>
        </div>

        {/* Featured */}
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-6">
          <div className="font-mono text-xs text-zinc-600 mb-3">FEATURED</div>
          <div className="text-3xl font-bold text-zinc-100 mb-1">
            ${(FEATURED_LISTING_PRICE_CENTS / 100).toFixed(0)}
            <span className="text-lg text-zinc-500">/mo</span>
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
              <span className="text-violet-400 mt-0.5">&#8250;</span>
              Top placement on browse page
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">&#8250;</span>
              Featured badge on listing
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">&#8250;</span>
              Priority review (24h)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">&#8250;</span>
              Priority support
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
  );
}
