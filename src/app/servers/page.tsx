import { Suspense } from "react";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilter } from "@/components/category-filter";
import { PricingToggle } from "@/components/pricing-toggle";
import { SortSelect } from "@/components/sort-select";
import { ServerGrid } from "@/components/server-grid";
import { prisma } from "@/lib/prisma";
import type { McpServerWithOwner } from "@/types";

interface BrowsePageProps {
  searchParams: Promise<{
    category?: string;
    pricingModel?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

async function fetchServers(params: {
  category?: string;
  pricingModel?: string;
  sort?: string;
  search?: string;
  page?: string;
}): Promise<{
  servers: McpServerWithOwner[];
  total: number;
  totalPages: number;
}> {
  try {
    const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const where: Record<string, unknown> = { status: "APPROVED" };
    if (params.category) where.category = params.category;
    if (params.pricingModel) where.pricingModel = params.pricingModel;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (params.sort === "popular") orderBy = { installCount: "desc" };
    if (params.sort === "rating") orderBy = { avgRating: "desc" };

    const [servers, total] = await Promise.all([
      prisma.mcpServer.findMany({
        where,
        orderBy,
        skip,
        take: PAGE_SIZE,
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          _count: { select: { subscriptions: true, reviews: true } },
        },
      }),
      prisma.mcpServer.count({ where }),
    ]);

    return {
      servers: servers as unknown as McpServerWithOwner[],
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  } catch {
    return { servers: [], total: 0, totalPages: 1 };
  }
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const { servers, total, totalPages } = await fetchServers(params);
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-zinc-100 mb-2">
        Browse MCP Servers
      </h1>
      <p className="text-zinc-500 mb-8">
        Discover and subscribe to premium MCP servers from independent
        developers.
      </p>

      <div className="space-y-4 mb-8">
        <Suspense>
          <SearchBar
            defaultValue={params.search}
            placeholder="Search servers..."
          />
        </Suspense>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Suspense>
            <CategoryFilter selected={params.category} />
          </Suspense>
          <div className="flex items-center gap-3">
            <Suspense>
              <PricingToggle selected={params.pricingModel} />
            </Suspense>
            <Suspense>
              <SortSelect selected={params.sort} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {total} server{total !== 1 ? "s" : ""} found
      </div>

      <ServerGrid servers={servers} />

      {totalPages > 1 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={params}
        />
      )}
    </div>
  );
}

function PaginationBar({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  function buildUrl(page: number) {
    const q = new URLSearchParams();
    if (searchParams.category) q.set("category", searchParams.category);
    if (searchParams.pricingModel)
      q.set("pricingModel", searchParams.pricingModel);
    if (searchParams.sort) q.set("sort", searchParams.sort);
    if (searchParams.search) q.set("search", searchParams.search);
    q.set("page", String(page));
    return `/servers?${q.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <a
          href={buildUrl(currentPage - 1)}
          className="px-4 py-2 rounded-md border border-border hover:bg-accent text-sm"
        >
          Previous
        </a>
      )}
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <a
          href={buildUrl(currentPage + 1)}
          className="px-4 py-2 rounded-md border border-border hover:bg-accent text-sm"
        >
          Next
        </a>
      )}
    </div>
  );
}
