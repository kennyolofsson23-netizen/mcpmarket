import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhooks = await prisma.developerWebhook.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const webhookIds = webhooks.map((w) => w.id);

    const logs = await prisma.webhookLog.findMany({
      where: { webhookId: { in: webhookIds } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
