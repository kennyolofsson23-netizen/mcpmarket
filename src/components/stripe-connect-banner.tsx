"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function StripeConnectBanner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/connect/onboard", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to start onboarding");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-800 dark:bg-violet-950/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                <path
                  fillRule="evenodd"
                  d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-violet-900 dark:text-violet-100">
              Set Up Payouts to Start Earning
            </h2>
          </div>
          <p className="mt-2 text-sm text-violet-700 dark:text-violet-300">
            Connect your Stripe account to receive payouts for your MCP server
            subscriptions. MCPmarket uses an{" "}
            <strong>80/20 revenue split</strong> — you keep 80% of all revenue,
            and we retain 20% as a platform fee to cover infrastructure and
            payment processing.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-violet-700 dark:text-violet-300">
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0 text-violet-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Instant payouts via Stripe Connect
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0 text-violet-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              You keep 80% of every subscription payment
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0 text-violet-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Secure onboarding via Stripe — we never store your banking details
            </li>
          </ul>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <Button
            onClick={handleConnect}
            disabled={loading}
            className="bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Connecting...
              </span>
            ) : (
              "Connect with Stripe"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
