"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RefreshCw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ApiKeyPublic } from "@/types";

interface ApiKeyRowProps {
  apiKey: ApiKeyPublic;
  onRevoke?: () => void;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ApiKeyRow({ apiKey, onRevoke }: ApiKeyRowProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRevoke() {
    setRevoking(true);
    setError(null);
    try {
      const res = await fetch(`/api/keys/${apiKey.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke key");
      setShowConfirm(false);
      onRevoke?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRevoking(false);
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    setError(null);
    try {
      const body: Record<string, string | undefined> = {
        name: apiKey.name ?? undefined,
      };
      if (apiKey.serverId) body.serverId = apiKey.serverId;
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to regenerate key");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
              {apiKey.keyPrefix}...
            </code>
            {apiKey.name && (
              <span className="text-sm font-medium truncate">
                {apiKey.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {apiKey.serverName && (
              <span className="flex items-center gap-1">
                <Server className="h-3 w-3" />
                {apiKey.serverName}
              </span>
            )}
            <span>Created {formatDate(apiKey.createdAt)}</span>
            <span>Last used {formatDate(apiKey.lastUsed)}</span>
          </div>
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            loading={regenerating}
            title="Regenerate key"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirm(true)}
            title="Revoke key"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Revoke
          </Button>
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent onClose={() => setShowConfirm(false)}>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the key{" "}
              <code className="font-mono">{apiKey.keyPrefix}...</code>? This
              action cannot be undone and any applications using this key will
              lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              loading={revoking}
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
