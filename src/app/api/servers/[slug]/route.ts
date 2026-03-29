import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateServerSchema } from "@/lib/validations/server";

type RouteContext = { params: Promise<{ slug: string }> };

async function resolveSlug(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.slug;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const slug = await resolveSlug(context);
    const server = await prisma.mcpServer.findUnique({
      where: { slug, status: "APPROVED" },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { subscriptions: true, reviews: true } },
      },
    });

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    return NextResponse.json(server);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = await resolveSlug(context);
    const server = await prisma.mcpServer.findUnique({ where: { slug } });
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const role = session.user.role ?? "USER";
    const isOwner = session.user.id === server.ownerId;
    const isAdmin = role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.tags !== undefined) {
      updateData.tags = JSON.stringify(parsed.data.tags);
    }

    const updated = await prisma.mcpServer.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
