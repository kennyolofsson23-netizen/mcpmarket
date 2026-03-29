import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { PublishVersionForm } from "./publish-version-form";
import { VersionActions } from "./version-actions";

export default async function VersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const role = (session.user as { role?: string }).role;
  if (role !== "DEVELOPER" && role !== "ADMIN") redirect("/dashboard");

  const server = await prisma.mcpServer.findFirst({
    where: { id, ownerId: session.user.id },
    select: { id: true, name: true, endpointUrl: true },
  });

  if (!server) redirect("/dashboard/developer");

  const versions = await prisma.serverVersion.findMany({
    where: { serverId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Version Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage published versions of{" "}
          <span className="font-medium text-foreground">{server.name}</span>.
        </p>
      </div>

      <div className="mb-8">
        {versions.length === 0 ? (
          <EmptyState
            title="No versions published"
            description="Publish your first version to make this server available to subscribers."
            icon={<GitBranch className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left px-4 py-3">Version</th>
                    <th className="text-left px-4 py-3">Endpoint URL</th>
                    <th className="text-left px-4 py-3">Created</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((version) => (
                    <tr key={version.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono font-medium">
                        {version.version}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                        {version.endpointUrl ?? server.endpointUrl ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {version.isLatest && (
                            <Badge variant="default" className="text-xs">
                              Latest
                            </Badge>
                          )}
                          {version.deprecated && (
                            <Badge variant="destructive" className="text-xs">
                              Deprecated
                            </Badge>
                          )}
                          {!version.isLatest && !version.deprecated && (
                            <Badge variant="secondary" className="text-xs">
                              Published
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <VersionActions
                          versionId={version.id}
                          serverId={id}
                          isLatest={version.isLatest}
                          deprecated={version.deprecated}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Publish New Version</h2>
        </CardHeader>
        <CardContent>
          <PublishVersionForm serverId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
