"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TeamMemberUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface TeamMemberData {
  id: string;
  userId: string;
  role: string;
  user: TeamMemberUser;
}

interface TeamData {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMemberData[];
}

interface TeamCardProps {
  team: TeamData;
  currentUserId: string;
}

function InviteMemberForm({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Failed to invite member");
      }
      setEmail("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Invite Member
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start mt-2">
      <div className="flex-1 space-y-1">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="member@example.com"
          required
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Sending..." : "Send Invite"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </form>
  );
}

function RemoveMemberButton({ teamId, memberId }: { teamId: string; memberId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    setLoading(true);
    try {
      await fetch(`/api/teams/${teamId}/members/${memberId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleRemove} disabled={loading}>
      {loading ? "Removing..." : "Remove"}
    </Button>
  );
}

export function TeamCard({ team, currentUserId }: TeamCardProps) {
  const isOwner = team.ownerId === currentUserId;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{team.name}</h2>
            <p className="text-sm text-muted-foreground">
              {team.members.length} member{team.members.length !== 1 ? "s" : ""}
            </p>
          </div>
          <InviteMemberForm teamId={team.id} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {team.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {member.user.image ? (
                  <Image
                    src={member.user.image}
                    alt={member.user.name ?? ""}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {(member.user.name ?? member.user.email ?? "?")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{member.user.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                  {member.role}
                </Badge>
                {isOwner && member.userId !== currentUserId && (
                  <RemoveMemberButton teamId={team.id} memberId={member.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
