import Link from "next/link";
import Image from "next/image";
import { Star, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import type { McpServerWithOwner } from "@/types";

interface ServerCardProps {
  server: McpServerWithOwner;
}

function formatPrice(server: McpServerWithOwner): string {
  if (server.pricingModel === "FREE") return "Free";
  if (server.pricingModel === "SUBSCRIPTION") {
    return `$${(server.price / 100).toFixed(0)}/mo`;
  }
  if (server.pricingModel === "USAGE") {
    if (!server.usagePrice) return "Usage-based";
    return `$${(server.usagePrice / 100).toFixed(4)}/call`;
  }
  return "Free";
}

function ServerLogo({ server }: { server: McpServerWithOwner }) {
  if (server.logoUrl) {
    return (
      <Image
        src={server.logoUrl}
        alt={`${server.name} logo`}
        width={40}
        height={40}
        className="rounded-md object-cover"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-md bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
      {server.name.charAt(0).toUpperCase()}
    </div>
  );
}

export function ServerCard({ server }: ServerCardProps) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === server.category)?.label ??
    server.category;
  const priceLabel = formatPrice(server);
  const isFree = server.pricingModel === "FREE";
  const installCount = server._count?.subscriptions ?? server.installCount;

  return (
    <Link
      href={`/servers/${server.slug}`}
      className="group block rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:border-cyan-400/20 hover:bg-zinc-900/60 transition-all p-4"
    >
      <div className="flex items-start gap-3 mb-3">
        <ServerLogo server={server} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-100 group-hover:text-cyan-400 transition-colors truncate">
              {server.name}
            </span>
            {server.featured && (
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-violet-400/10 text-violet-400 border border-violet-400/20 px-1.5 py-0.5 rounded">
                Featured
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-600 truncate">
            {server.owner.name ?? server.owner.email}
          </p>
        </div>
        <span
          className={`text-xs font-mono font-semibold shrink-0 ${isFree ? "text-emerald-400" : "text-cyan-400"}`}
        >
          {priceLabel}
        </span>
      </div>

      <p className="text-sm text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
        {server.description}
      </p>

      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className="text-[10px] text-zinc-600 border-zinc-800"
        >
          {categoryLabel}
        </Badge>
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            {server.avgRating ? server.avgRating.toFixed(1) : "—"}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {installCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
