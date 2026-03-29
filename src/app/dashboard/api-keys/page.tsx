import Link from "next/link";
import { Key } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ApiKeyRow } from "@/components/api-key-row";
import type { ApiKeyPublic } from "@/types";
import { redirect } from "next/navigation";

export default async function ApiKeysPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard/api-keys");
  }

  const rawKeys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const apiKeys: ApiKeyPublic[] = rawKeys.map((k) => ({
    id: k.id,
    userId: k.userId,
    serverId: k.serverId,
    name: k.name,
    keyPrefix: k.keyPrefix,
    isActive: k.isActive,
    lastUsed: k.lastUsed,
    expiresAt: k.expiresAt,
    permissions: k.permissions,
    createdAt: k.createdAt,
    updatedAt: k.updatedAt,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage API keys for authenticating with subscribed MCP servers.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/api-keys/new">Generate New Key</Link>
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <EmptyState
          title="No API keys yet"
          description="Generate an API key to start authenticating with your subscribed MCP servers."
          icon={<Key className="h-8 w-8 text-muted-foreground" />}
          action={{
            label: "Generate New Key",
            href: "/dashboard/api-keys/new",
          }}
        />
      ) : (
        <div className="border rounded-lg divide-y">
          {apiKeys.map((key) => (
            <ApiKeyRow key={key.id} apiKey={key} />
          ))}
        </div>
      )}
    </div>
  );
}
