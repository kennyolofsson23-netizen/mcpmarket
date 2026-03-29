import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { UserSearchBar } from "./user-search-bar";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  const users = await prisma.user.findMany({
    where: q ? { email: { contains: q } } : undefined,
    include: {
      _count: { select: { servers: true, subscriptions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="mb-6">
        <UserSearchBar defaultValue={q} />
      </div>

      {users.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">
          {q ? `No users found matching "${q}".` : "No users yet."}
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Servers</th>
                <th className="text-left p-3 font-medium">Subscriptions</th>
                <th className="text-left p-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="p-3 font-medium">
                    {user.name ?? (
                      <span className="text-muted-foreground italic">
                        No name
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">{user.email}</td>
                  <td className="p-3">
                    <RoleBadge role={(user as typeof user & { role?: string }).role ?? "USER"} />
                  </td>
                  <td className="p-3 text-center">{user._count.servers}</td>
                  <td className="p-3 text-center">
                    {user._count.subscriptions}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {users.length === 50 && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Showing first 50 results. Refine your search to see more.
        </p>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") return <Badge variant="destructive">Admin</Badge>;
  if (role === "DEVELOPER") return <Badge variant="info">Developer</Badge>;
  return <Badge variant="secondary">User</Badge>;
}
