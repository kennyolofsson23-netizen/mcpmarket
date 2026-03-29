"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WebhookLog {
  id: string;
  event: string;
  statusCode: number | null;
  success: boolean;
  createdAt: Date;
}

interface WebhookData {
  id: string;
  url: string;
  events: string;
  isActive: boolean;
  description: string | null;
  secretPrefix: string;
  logs: WebhookLog[];
}

interface WebhookItemProps {
  webhook: WebhookData;
}

function parseEvents(raw: string): string[] {
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function WebhookItem({ webhook }: WebhookItemProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const events = parseEvents(webhook.events);

  async function handleToggle() {
    setLoading(true);
    try {
      await fetch(`/api/developer/webhooks/${webhook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !webhook.isActive }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this webhook endpoint?")) return;
    setLoading(true);
    try {
      await fetch(`/api/developer/webhooks/${webhook.id}`, {
        method: "DELETE",
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleTest() {
    setTestLoading(true);
    try {
      await fetch(`/api/developer/webhooks/${webhook.id}/test`, {
        method: "POST",
      });
      router.refresh();
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm truncate">{webhook.url}</span>
              <Badge variant={webhook.isActive ? "default" : "secondary"}>
                {webhook.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {webhook.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {webhook.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Secret prefix:{" "}
              <span className="font-mono">{webhook.secretPrefix}…</span>
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testLoading}
            >
              {testLoading ? "Testing..." : "Test"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggle}
              disabled={loading}
            >
              {webhook.isActive ? "Disable" : "Enable"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Events
          </p>
          <div className="flex flex-wrap gap-1">
            {events.map((event) => (
              <span
                key={event}
                className="font-mono text-xs bg-muted px-2 py-0.5 rounded"
              >
                {event}
              </span>
            ))}
          </div>
        </div>
        {webhook.logs.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              Recent Deliveries
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left pb-2">Event</th>
                  <th className="text-left pb-2">Status</th>
                  <th className="text-left pb-2">Time</th>
                  <th className="text-left pb-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {webhook.logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{log.event}</td>
                    <td className="py-2">{log.statusCode ?? "—"}</td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={log.success ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {log.success ? "Success" : "Failed"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
