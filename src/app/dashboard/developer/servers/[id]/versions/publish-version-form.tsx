"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PublishVersionFormProps {
  serverId: string;
}

export function PublishVersionForm({ serverId }: PublishVersionFormProps) {
  const router = useRouter();
  const [version, setVersion] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [changelog, setChangelog] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/developer/servers/${serverId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          endpointUrl: endpointUrl || undefined,
          changelog,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? "Failed to publish version",
        );
      }
      setVersion("");
      setEndpointUrl("");
      setChangelog("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to publish version",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="version-string"
          className="block text-sm font-medium mb-1"
        >
          Version
        </label>
        <Input
          id="version-string"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="e.g. 1.2.0"
          required
        />
      </div>
      <div>
        <label
          htmlFor="version-endpoint"
          className="block text-sm font-medium mb-1"
        >
          Endpoint URL{" "}
          <span className="text-muted-foreground font-normal">
            (optional — overrides server default)
          </span>
        </label>
        <Input
          id="version-endpoint"
          type="url"
          value={endpointUrl}
          onChange={(e) => setEndpointUrl(e.target.value)}
          placeholder="https://api.example.com/v2/mcp"
        />
      </div>
      <div>
        <label
          htmlFor="version-changelog"
          className="block text-sm font-medium mb-1"
        >
          Changelog{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Textarea
          id="version-changelog"
          value={changelog}
          onChange={(e) => setChangelog(e.target.value)}
          placeholder="Describe what changed in this version..."
          rows={4}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading || !version.trim()}>
        {loading ? "Publishing..." : "Publish Version"}
      </Button>
    </form>
  );
}
