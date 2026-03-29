"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ServerActionsProps {
  serverId: string;
  status: string;
}

export function ServerActions({ serverId, status }: ServerActionsProps) {
  const router = useRouter();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setApproving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/servers/${serverId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve server");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    setRejecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/servers/${serverId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (!res.ok) throw new Error("Failed to reject server");
      setShowRejectDialog(false);
      setRejectionReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRejecting(false);
    }
  }

  if (status === "APPROVED") {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowRejectDialog(true)}
      >
        Reject
      </Button>
    );
  }

  if (status === "REJECTED") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleApprove}
        loading={approving}
      >
        Re-approve
      </Button>
    );
  }

  return (
    <>
      {error && <p className="text-xs text-destructive mb-1">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleApprove} loading={approving}>
          Approve
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setError(null);
            setShowRejectDialog(true);
          }}
        >
          Reject
        </Button>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent onClose={() => setShowRejectDialog(false)}>
          <DialogHeader>
            <DialogTitle>Reject Server</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this server. This will be
              shared with the developer.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="mt-2"
          />
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              loading={rejecting}
            >
              Reject Server
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
