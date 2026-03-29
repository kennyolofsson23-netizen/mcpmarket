import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ServerActions } from "./server-actions";

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

function statusVariant(status: string) {
  if (status === "APPROVED") return "approved" as const;
  if (status === "REJECTED") return "rejected" as const;
  return "pending" as const;
}

export default async function AdminServersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "PENDING" } = await searchParams;
  const filter = STATUS_OPTIONS.includes(status as StatusFilter)
    ? (status as StatusFilter)
    : "PENDING";

  const servers = await prisma.mcpServer.findMany({
    where: filter === "ALL" ? undefined : { status: filter },
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Server Management</h1>

      <div className="flex gap-2 mb-6 border-b">
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/servers?status=${s}`}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              filter === s
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {servers.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">
          No servers with status{" "}
          <span className="font-medium">{filter.toLowerCase()}</span>.
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Server Name</th>
                <th className="text-left p-3 font-medium">Developer</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Submitted</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {servers.map((server) => (
                <tr key={server.id} className="hover:bg-muted/50">
                  <td className="p-3 font-medium">
                    <Link
                      href={`/servers/${server.slug}`}
                      className="hover:underline"
                      target="_blank"
                    >
                      {server.name}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {server.owner.name ?? server.owner.email}
                  </td>
                  <td className="p-3 text-muted-foreground capitalize">
                    {server.category}
                  </td>
                  <td className="p-3">
                    <Badge variant={statusVariant(server.status)}>
                      {server.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(server.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <ServerActions
                      serverId={server.id}
                      status={server.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
