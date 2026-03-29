"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ServerForm } from "@/components/server-form";
import { useToast } from "@/components/ui/toast";
import type { CreateServerInput } from "@/lib/validations/server";

export default function NewServerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  if (status === "loading") {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  const role = (session?.user as { role?: string } | undefined)?.role ?? "USER";
  if (!session?.user || (role !== "DEVELOPER" && role !== "ADMIN")) {
    return (
      <p className="text-destructive">
        You must be a developer to list a server.
      </p>
    );
  }

  async function handleSubmit(data: CreateServerInput) {
    const res = await fetch("/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        (body as { error?: string }).error ?? "Failed to create server";
      addToast(message, "error");
      throw new Error(message);
    }

    addToast("Server submitted for review!", "success");
    router.push("/dashboard/developer");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">List Your MCP Server</h1>
      <ServerForm onSubmit={handleSubmit} submitLabel="Submit for Review" />
    </div>
  );
}
