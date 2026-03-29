"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { McpServer } from "@/types";

interface ConfigSnippetProps {
  server: McpServer;
  apiKey: string;
}

function buildConfig(server: McpServer, apiKey: string): string {
  const endpointUrl =
    server.endpointUrl ?? `https://hosted.mcpmarket.com/${server.id}`;
  const config = {
    mcpServers: {
      [server.slug]: {
        command: "npx",
        args: ["-y", "@mcpmarket/client"],
        env: {
          MCP_SERVER_URL: endpointUrl,
          MCP_API_KEY: apiKey,
        },
      },
    },
  };
  return JSON.stringify(config, null, 2);
}

export function ConfigSnippet({ server, apiKey }: ConfigSnippetProps) {
  const [copied, setCopied] = useState(false);
  const snippet = buildConfig(server, apiKey);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available — silently ignore
    }
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">
          claude_desktop_config.json
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy config"}
          className="h-7 gap-1.5 text-xs"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre
        className={cn(
          "text-xs font-mono p-4 overflow-x-auto bg-zinc-950 text-zinc-100 leading-relaxed",
        )}
      >
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
