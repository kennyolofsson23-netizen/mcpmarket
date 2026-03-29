import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FEATURED_LISTING_PRICE_CENTS,
  MANAGED_HOSTING_PRICE_CENTS,
  DEVELOPER_SHARE_PERCENT,
} from "@/lib/constants";

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-4">
        Simple, Transparent Pricing
      </h1>
      <p className="text-center text-gray-600 mb-12">
        No upfront costs. We only earn when you do.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic tier */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Basic</h2>
          <p className="text-3xl font-bold mb-1">Free to list</p>
          <p className="text-gray-500 mb-4">
            20% revenue share per transaction
          </p>
          <ul className="space-y-2 mb-6 text-sm">
            <li>✓ Unlimited server listings</li>
            <li>✓ Payment processing included</li>
            <li>✓ {DEVELOPER_SHARE_PERCENT}% developer payout</li>
          </ul>
          <Button asChild className="w-full">
            <Link href="/auth/signin">Get Started Free</Link>
          </Button>
        </Card>

        {/* Managed Hosting tier */}
        <Card className="p-6 border-2 border-blue-500">
          <h2 className="text-xl font-semibold mb-2">Managed Hosting</h2>
          <p className="text-3xl font-bold mb-1">
            ${(MANAGED_HOSTING_PRICE_CENTS / 100).toFixed(0)}/mo
          </p>
          <p className="text-gray-500 mb-4">per server, plus 20% rev share</p>
          <ul className="space-y-2 mb-6 text-sm">
            <li>✓ Everything in Basic</li>
            <li>✓ Managed infrastructure</li>
            <li>✓ Auto-scaling &amp; uptime monitoring</li>
          </ul>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/signin">Start Hosting</Link>
          </Button>
        </Card>

        {/* Featured tier */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Featured</h2>
          <p className="text-3xl font-bold mb-1">
            ${(FEATURED_LISTING_PRICE_CENTS / 100).toFixed(0)}/mo
          </p>
          <p className="text-gray-500 mb-4">per server, plus 20% rev share</p>
          <ul className="space-y-2 mb-6 text-sm">
            <li>✓ Everything in Basic</li>
            <li>✓ Featured placement on browse page</li>
            <li>✓ Featured badge on server card</li>
          </ul>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/signin">Get Featured</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
