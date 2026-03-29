import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role ?? "USER";
    if (role !== "DEVELOPER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { serverId } = body as { serverId: string };

    if (!serverId) {
      return NextResponse.json(
        { error: "serverId is required" },
        { status: 400 },
      );
    }

    const server = await prisma.mcpServer.findUnique({
      where: { id: serverId },
    });
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    if (server.ownerId !== session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
      customerId: user?.stripeCustomerId ?? "",
      priceId: process.env.STRIPE_FEATURED_PRICE_ID ?? "price_featured",
      successUrl: `${baseUrl}/dashboard?featured=success`,
      cancelUrl: `${baseUrl}/dashboard?featured=cancel`,
      metadata: { serverId, type: "featured" },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
