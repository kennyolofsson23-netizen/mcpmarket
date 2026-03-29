"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ALL_EVENTS = [
  "subscription.created",
  "subscription.canceled",
  "subscription.payment_failed",
] as const;

export function AddWebhookForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [events, setEvents] = useState<string[]>([...ALL_EVENTS]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleEvent(event: string) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/developer/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, events, description }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? "Failed to add webhook",
        );
      }
      setUrl("");
      setDescription("");
      setEvents([...ALL_EVENTS]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add webhook");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="webhook-url" className="block text-sm font-medium mb-1">
          Endpoint URL
        </label>
        <Input
          id="webhook-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/webhook"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Events</label>
        <div className="space-y-2">
          {ALL_EVENTS.map((event) => (
            <label
              key={event}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={events.includes(event)}
                onChange={() => toggleEvent(event)}
                className="rounded"
              />
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                {event}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label
          htmlFor="webhook-desc"
          className="block text-sm font-medium mb-1"
        >
          Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          id="webhook-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Production billing webhook"
          rows={2}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={loading || !url.trim() || events.length === 0}
      >
        {loading ? "Adding..." : "Add Webhook"}
      </Button>
    </form>
  );
}
