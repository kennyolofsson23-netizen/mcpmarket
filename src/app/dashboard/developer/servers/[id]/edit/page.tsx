"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ServerForm } from "@/components/server-form";
import { useToast } from "@/components/ui/toast";
import type { CreateServerInput } from "@/lib/validations/server";
import type { McpServer } from "@/types";

interface EditServerPageProps {
  params: Promise<{ id: string }>;
}

function parseTagsField(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags as string[];
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    }
  }
  return [];
}

export default function EditServerPage({ params }: EditServerPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const [server, setServer] = useState<McpServer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServer() {
      try {
        const res = await fetch(`/api/developer/servers/${id}`);
        if (!res.ok) {
          setFetchError("Server not found or you do not have permission.");
          return;
        }
        const data = await res.json() as McpServer;
        setServer(data);
      } catch {
        setFetchError("Failed to load server data.");
      } finally {
        setIsFetching(false);
      }
    }
    fetchServer();
  }, [id]);

  async function handleSubmit(data: CreateServerInput) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/developer/servers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = (body as { error?: string }).error ?? "Failed to update server";
        addToast(message, "error");
        throw new Error(message);
      }

      addToast("Server updated successfully!", "success");
      router.push("/dashboard/developer");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return <p className="text-muted-foreground">Loading server...</p>;
  }

  if (fetchError || !server) {
    return <p className="text-destructive">{fetchError ?? "Server not found."}</p>;
  }

  const defaultValues: Partial<CreateServerInput> = {
    name: server.name,
    description: server.description,
    longDescription: server.longDescription ?? undefined,
    category: server.category,
    tags: parseTagsField(server.tags),
    pricingModel: server.pricingModel as CreateServerInput["pricingModel"],
    price: server.price ?? undefined,
    usagePrice: server.usagePrice ?? undefined,
    freeCallLimit: server.freeCallLimit ?? undefined,
    endpointUrl: server.endpointUrl ?? "",
    logoUrl: server.logoUrl ?? "",
    repoUrl: server.repoUrl ?? "",
    websiteUrl: server.websiteUrl ?? "",
    managedHosting: server.managedHosting,
    dockerImage: server.dockerImage ?? undefined,
    githubRepoUrl: server.githubRepoUrl ?? "",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Server</h1>
      <ServerForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        isLoading={isLoading}
      />
    </div>
  );
}
