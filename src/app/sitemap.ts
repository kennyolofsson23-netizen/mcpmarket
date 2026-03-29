import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mcpmarket.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all APPROVED servers for dynamic routes
  let servers: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    servers = await prisma.mcpServer.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    // DB unavailable during build — return static routes only
  }

  const serverEntries = servers.map((server) => ({
    url: `${baseUrl}/servers/${server.slug}`,
    lastModified: server.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/servers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...serverEntries,
  ];
}
