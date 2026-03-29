import { prisma } from "@/lib/prisma";
import { generateWebhookSecret } from "@/lib/api-keys";

export type WebhookEventType =
  | "subscription.created"
  | "subscription.canceled"
  | "subscription.payment_failed";

export async function deliverWebhook(opts: {
  userId: string;
  event: WebhookEventType;
  payload: object;
}): Promise<void> {
  const webhooks = await prisma.developerWebhook.findMany({
    where: { userId: opts.userId, isActive: true },
  });

  for (const webhook of webhooks) {
    await deliverToWebhook(webhook, opts.event, opts.payload);
  }
}

async function deliverToWebhook(
  webhook: { id: string; url: string },
  event: string,
  payload: object,
): Promise<void> {
  const body = JSON.stringify({
    event,
    payload,
    timestamp: new Date().toISOString(),
  });
  let statusCode = 0;
  let response = "";
  let success = false;

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    statusCode = res.status;
    response = await res.text();
    success = res.ok;
  } catch (err) {
    response = err instanceof Error ? err.message : "Unknown error";
  }

  await prisma.webhookLog.create({
    data: {
      webhookId: webhook.id,
      event,
      payload: body,
      statusCode,
      response,
      success,
      attempts: 1,
    },
  });
}

export { generateWebhookSecret };
