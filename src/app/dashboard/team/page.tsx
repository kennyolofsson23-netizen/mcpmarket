import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { TeamCard } from "./team-card";
import { CreateTeamForm } from "./create-team-form";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard/team");

  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground mt-1">
            Manage your teams and collaborate with others.
          </p>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        {teamMemberships.length === 0 ? (
          <EmptyState
            title="No teams yet"
            description="Create a team to collaborate with others on MCP server subscriptions."
            icon={<Users className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          teamMemberships.map((membership) => (
            <TeamCard
              key={membership.teamId}
              team={membership.team}
              currentUserId={session.user.id}
            />
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Create a New Team</h2>
        </CardHeader>
        <CardContent>
          <CreateTeamForm />
        </CardContent>
      </Card>
    </div>
  );
}
