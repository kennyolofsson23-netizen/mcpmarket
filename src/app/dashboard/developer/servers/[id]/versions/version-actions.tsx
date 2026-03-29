"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface VersionActionsProps {
  versionId: string;
  serverId: string;
  isLatest: boolean;
  deprecated: boolean;
}

export function VersionActions({
  versionId,
  serverId,
  isLatest,
  deprecated,
}: VersionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    try {
      await fetch(`/api/developer/servers/${serverId}/versions/${versionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {!isLatest && !deprecated && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => patch({ isLatest: true })}
          disabled={loading}
        >
          Set as Latest
        </Button>
      )}
      {!deprecated && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => patch({ deprecated: true })}
          disabled={loading}
        >
          Deprecate
        </Button>
      )}
    </div>
  );
}
