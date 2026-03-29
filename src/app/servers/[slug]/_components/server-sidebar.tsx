import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigSnippet } from "@/components/config-snippet";
import type { McpServer, Subscription } from "@/types";

interface ServerSidebarProps {
  server: McpServer & { _count: { subscriptions: number } };
  userSubscription: Subscription | null;
  isSignedIn: boolean;
  apiKey: string | null;
}

function PricingInfo({ server }: { server: McpServer }) {
  if (server.pricingModel === "FREE") {
    return <p className="text-2xl font-bold text-green-600">Free</p>;
  }
  if (server.pricingModel === "SUBSCRIPTION") {
    const dollars = (server.price / 100).toFixed(2);
    return (
      <p className="text-2xl font-bold">
        ${dollars}
        <span className="text-sm font-normal text-muted-foreground">/mo</span>
      </p>
    );
  }
  const usageDollars = server.usagePrice ? (server.usagePrice / 100).toFixed(4) : "0";
  return (
    <div>
      <p className="text-2xl font-bold">${usageDollars}</p>
      <p className="text-xs text-muted-foreground">per API call</p>
      {server.freeCallLimit && (
        <p className="text-xs text-muted-foreground mt-1">
          First {server.freeCallLimit} calls free
        </p>
      )}
    </div>
  );
}

function SubscribeCta({
  server,
  isSignedIn,
  isSubscribed,
}: {
  server: McpServer;
  isSignedIn: boolean;
  isSubscribed: boolean;
}) {
  if (isSubscribed) {
    return (
      <Badge variant="success" className="w-full justify-center py-2 text-sm">
        Subscribed
      </Badge>
    );
  }
  if (!isSignedIn) {
    return (
      <Button asChild className="w-full">
        <Link href="/auth/signin">Sign in to Subscribe</Link>
      </Button>
    );
  }
  return (
    <Button asChild className="w-full">
      <Link href={`/api/billing/checkout?serverId=${server.id}`}>
        {server.pricingModel === "FREE" ? "Subscribe Free" : "Subscribe Now"}
      </Link>
    </Button>
  );
}

export function ServerSidebar({
  server,
  userSubscription,
  isSignedIn,
  apiKey,
}: ServerSidebarProps) {
  const isSubscribed = !!userSubscription;
  return (
    <aside className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <PricingInfo server={server} />
          <SubscribeCta
            server={server}
            isSignedIn={isSignedIn}
            isSubscribed={isSubscribed}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subscribers</span>
            <span className="font-medium">{server._count.subscriptions.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Views</span>
            <span className="font-medium">{server.viewCount.toLocaleString()}</span>
          </div>
          {server.avgRating != null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Rating</span>
              <span className="font-medium">{server.avgRating.toFixed(1)} / 5</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium capitalize">{server.category}</span>
          </div>
        </CardContent>
      </Card>

      {isSubscribed && apiKey && (
        <Card>
          <CardHeader>
            <CardTitle>MCP Config</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Paste this into your{" "}
              <code className="bg-muted px-1 rounded text-xs">
                claude_desktop_config.json
              </code>
            </p>
            <ConfigSnippet server={server} apiKey={apiKey} />
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
