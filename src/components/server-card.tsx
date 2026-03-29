import Link from "next/link";
import Image from "next/image";
import { Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import type { McpServerWithOwner } from "@/types";

interface ServerCardProps {
  server: McpServerWithOwner;
}

function formatPrice(server: McpServerWithOwner): string {
  if (server.pricingModel === "FREE") return "Free";
  if (server.pricingModel === "SUBSCRIPTION") {
    const dollars = (server.price / 100).toFixed(0);
    return `$${dollars}/mo`;
  }
  if (server.pricingModel === "USAGE") {
    const cents = server.usagePrice;
    if (!cents) return "Usage-based";
    return `$${(cents / 100).toFixed(4)}/call`;
  }
  return "Free";
}

function ServerLogo({ server }: { server: McpServerWithOwner }) {
  if (server.logoUrl) {
    return (
      <Image
        src={server.logoUrl}
        alt={`${server.name} logo`}
        width={48}
        height={48}
        className="rounded-lg object-cover"
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
      {server.name.charAt(0).toUpperCase()}
    </div>
  );
}

export function ServerCard({ server }: ServerCardProps) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === server.category)?.label ?? server.category;
  const priceLabel = formatPrice(server);
  const isFree = server.pricingModel === "FREE";
  const installCount = server._count?.subscriptions ?? server.installCount;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col h-full p-4 gap-3">
        <div className="flex items-start gap-3">
          <ServerLogo server={server} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/servers/${server.slug}`}
                className="font-semibold text-sm hover:underline truncate"
              >
                {server.name}
              </Link>
              {server.featured && (
                <Badge variant="featured" className="shrink-0">Featured</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              by {server.owner.name ?? server.owner.email}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {server.description}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge variant="outline">{categoryLabel}</Badge>
          <span
            className={`text-xs font-semibold ${isFree ? "text-green-600" : "text-blue-600"}`}
          >
            {priceLabel}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {server.avgRating ? server.avgRating.toFixed(1) : "—"}
            {server._count?.reviews ? ` (${server._count.reviews})` : ""}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {installCount.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
