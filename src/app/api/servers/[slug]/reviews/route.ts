import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

async function resolveSlug(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.slug;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const slug = await resolveSlug(context);
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
    const skip = (page - 1) * limit;

    const server = await prisma.mcpServer.findUnique({ where: { slug } });
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { serverId: server.id },
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { serverId: server.id } }),
    ]);

    return NextResponse.json({ reviews, total });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

async function validatePostBody(req: NextRequest) {
  const body = await req.json();
  const { rating, comment } = body as { rating: unknown; comment?: string };
  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5", body: null };
  }
  return { error: null, body: { rating, comment } };
}

async function updateServerRating(serverId: string) {
  const agg = await prisma.review.aggregate({
    where: { serverId },
    _avg: { rating: true },
  });
  await prisma.mcpServer.update({
    where: { id: serverId },
    data: { avgRating: agg._avg.rating ?? 0 },
  });
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error: bodyError, body } = await validatePostBody(req);
    if (bodyError || !body) {
      return NextResponse.json({ error: bodyError }, { status: 400 });
    }

    const slug = await resolveSlug(context);
    const server = await prisma.mcpServer.findUnique({ where: { slug } });
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id, serverId: server.id, status: "ACTIVE" },
    });
    if (!subscription) {
      return NextResponse.json(
        { error: "Subscribe to leave a review" },
        { status: 403 },
      );
    }

    const review = await prisma.review.upsert({
      where: {
        userId_serverId: { userId: session.user.id, serverId: server.id },
      },
      create: {
        userId: session.user.id,
        serverId: server.id,
        rating: body.rating,
        comment: body.comment,
      },
      update: { rating: body.rating, comment: body.comment },
    });

    await updateServerRating(server.id);

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
