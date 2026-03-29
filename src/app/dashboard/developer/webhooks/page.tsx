import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Webhook } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { WebhookItem } from "./webhook-item";
import { AddWebhookForm } from "./add-webhook-form";

export default async function WebhooksPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const role = (session.user as { role?: string }).role;
  if (role !== "DEVELOPER" && role !== "ADMIN") redirect("/dashboard");

  const webhooks = await prisma.developerWebhook.findMany({
    where: { userId: session.user.id },
    include: {
      logs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Webhook Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Receive POST notifications when subscription events occur.
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {webhooks.length === 0 ? (
          <EmptyState
            title="No webhooks configured"
            description="Add a webhook endpoint to receive real-time notifications about subscription events."
            icon={<Webhook className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          webhooks.map((webhook) => (
            <WebhookItem key={webhook.id} webhook={webhook} />
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Add Webhook Endpoint</h2>
        </CardHeader>
        <CardContent>
          <AddWebhookForm />
        </CardContent>
      </Card>
    </div>
  );
}
