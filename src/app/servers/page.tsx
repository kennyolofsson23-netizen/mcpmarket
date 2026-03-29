import { Suspense } from "react";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilter } from "@/components/category-filter";
import { PricingToggle } from "@/components/pricing-toggle";
import { SortSelect } from "@/components/sort-select";
import { ServerGrid } from "@/components/server-grid";
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
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.pricingModel) query.set("pricingModel", params.pricingModel);
  if (params.sort) query.set("sort", params.sort);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", params.page);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/servers?${query.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return { servers: [], total: 0, totalPages: 1 };
  return res.json();
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
