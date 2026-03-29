"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SubscriptionWithServer } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type StatusVariant = "approved" | "secondary" | "warning";

const STATUS_VARIANT: Record<string, StatusVariant> = {
  ACTIVE: "approved",
  CANCELED: "secondary",
  PAST_DUE: "warning",
};

function formatPrice(cents: number): string {
  if (!cents) return "Free";
  return `$${(cents / 100).toFixed(2)}/mo`;
}

function ConfigModal({
  subscriptionId,
  open,
  onClose,
}: {
  subscriptionId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [config, setConfig] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchConfig() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/config`);
      if (!res.ok) throw new Error("Failed to fetch config");
      const data = await res.json();
      setConfig(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleOpen(isOpen: boolean) {
    if (isOpen && !config) fetchConfig();
    if (!isOpen) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>MCP Config Snippet</DialogTitle>
          <DialogDescription>
            Add this to your MCP client configuration.
          </DialogDescription>
        </DialogHeader>
        {loading && (
          <p className="text-sm text-muted-foreground">Loading config...</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {config && (
          <Textarea
            readOnly
            value={config}
            className="font-mono text-xs"
            rows={12}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {config && (
            <Button onClick={() => navigator.clipboard.writeText(config)}>
              Copy
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubscriptionCard({
  subscription,
}: {
  subscription: SubscriptionWithServer;
}) {
  const router = useRouter();
  const [configOpen, setConfigOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const { server } = subscription;
  const statusVariant = STATUS_VARIANT[subscription.status] ?? "secondary";

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    setCanceling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to cancel subscription");
      }
      router.refresh();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCanceling(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {server.logoUrl && (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={server.logoUrl}
                    alt={server.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                <CardTitle className="truncate text-base">
                  <Link
                    href={`/servers/${server.slug}`}
                    className="hover:underline"
                  >
                    {server.name}
                  </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(server.price)}
                </p>
              </div>
            </div>
            <Badge variant={statusVariant}>{subscription.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          {subscription.currentPeriodEnd && (
            <p className="text-xs text-muted-foreground">
              Next billing:{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          {cancelError && (
            <p className="mt-2 text-xs text-destructive">{cancelError}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setConfigOpen(true)}>
            Get Config
          </Button>
          {subscription.status === "ACTIVE" && (
            <Button
              size="sm"
              variant="outline"
              loading={canceling}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link href="/api/billing/portal">Manage Billing</Link>
          </Button>
        </CardFooter>
      </Card>

      <ConfigModal
        subscriptionId={subscription.id}
        open={configOpen}
        onClose={() => setConfigOpen(false)}
      />
    </>
  );
}
