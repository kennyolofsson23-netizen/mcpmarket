import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ServerSidebar } from "./_components/server-sidebar";
import { ReviewsSection } from "./_components/reviews-section";

type PageProps = { params: Promise<{ slug: string }> };

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mcpmarket.dev";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const server = await prisma.mcpServer.findUnique({ where: { slug } });
  if (!server) return { title: "Server Not Found" };
  return {
    title: server.name,
    description: server.description,
    openGraph: { title: server.name, description: server.description },
    alternates: { canonical: `${baseUrl}/servers/${slug}` },
  };
}

async function fetchServerData(slug: string) {
  return prisma.mcpServer.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { subscriptions: true } },
    },
  });
}

async function fetchApiKeyForUser(userId: string, serverId: string) {
  const key = await prisma.apiKey.findFirst({
    where: { userId, serverId, isActive: true },
    select: { keyPrefix: true },
  });
  return key ? `${key.keyPrefix}...` : null;
}

function buildJsonLd(server: Awaited<ReturnType<typeof fetchServerData>>) {
  if (!server) return null;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: server.name,
    description: server.description,
    url: `${baseUrl}/servers/${server.slug}`,
    applicationCategory: "DeveloperApplication",
    ...(server.logoUrl ? { image: server.logoUrl } : {}),
    ...(server.pricingModel === "FREE"
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }
      : server.pricingModel === "SUBSCRIPTION"
        ? {
            offers: {
              "@type": "Offer",
              price: (server.price / 100).toFixed(2),
              priceCurrency: "USD",
            },
          }
        : {}),
    ...(server.avgRating != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: server.avgRating.toFixed(1),
            bestRating: "5",
            ratingCount: server._count.subscriptions,
          },
        }
      : {}),
  };
}

function parseTags(raw: string): string[] {
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export default async function ServerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const server = await fetchServerData(slug);

  if (!server || server.status !== "APPROVED") {
    notFound();
  }

  // fire-and-forget view count increment
  prisma.mcpServer
    .update({ where: { id: server.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => undefined);

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [userSubscription, apiKey] = await Promise.all([
    userId
      ? prisma.subscription.findUnique({
          where: { userId_serverId: { userId, serverId: server.id } },
        })
      : Promise.resolve(null),
    userId ? fetchApiKeyForUser(userId, server.id) : Promise.resolve(null),
  ]);

  const existingReview =
    userId
      ? (server.reviews.find((r) => r.userId === userId) ?? null)
      : null;

  const tags = parseTags(server.tags);
  const jsonLd = buildJsonLd(server);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row gap-6 mb-8">
          {server.logoUrl && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border">
              <Image
                src={server.logoUrl}
                alt={`${server.name} logo`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-2 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">{server.name}</h1>
            <p className="text-muted-foreground leading-relaxed">{server.description}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {server.owner.name && (
                <span className="text-sm text-muted-foreground">
                  by{" "}
                  <Link
                    href={`/developers/${server.ownerId}`}
                    className="underline hover:text-foreground"
                  >
                    {server.owner.name}
                  </Link>
                </span>
              )}
              <Badge variant="outline" className="capitalize">
                {server.category}
              </Badge>
              {server.featured && <Badge variant="featured">Featured</Badge>}
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            {server.longDescription && (
              <section aria-labelledby="readme-heading">
                <h2 id="readme-heading" className="text-xl font-semibold mb-4">
                  README
                </h2>
                <MarkdownRenderer content={server.longDescription} />
              </section>
            )}

            <ReviewsSection
              reviews={server.reviews}
              serverId={server.id}
              serverSlug={server.slug}
              userSubscription={userSubscription}
              existingReview={existingReview}
              isSignedIn={!!userId}
            />
          </div>

          {/* Sidebar */}
          <ServerSidebar
            server={server}
            userSubscription={userSubscription}
            isSignedIn={!!userId}
            apiKey={apiKey}
          />
        </div>
      </div>
    </>
  );
}
