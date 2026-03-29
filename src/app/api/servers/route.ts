import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServerSchema } from "@/lib/validations/server";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function buildOrderBy(sort: string | null) {
  if (sort === "popular") return { installCount: "desc" as const };
  if (sort === "rating") return { avgRating: "desc" as const };
  return { createdAt: "desc" as const };
}

function buildWhere(
  search: string | null,
  category: string | null,
  pricingModel: string | null,
) {
  const where: Record<string, unknown> = { status: "APPROVED" };
  if (category) where.category = category;
  if (pricingModel) where.pricingModel = pricingModel;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  return where;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const pricingModel = searchParams.get("pricingModel");
    const sort = searchParams.get("sort");
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") ?? "1", 10) || DEFAULT_PAGE,
    );
    const limit = Math.max(
      1,
      parseInt(searchParams.get("limit") ?? "20", 10) || DEFAULT_LIMIT,
    );
    const skip = (page - 1) * limit;

    const where = buildWhere(search, category, pricingModel);
    const orderBy = buildOrderBy(sort);

    const [servers, total] = await Promise.all([
      prisma.mcpServer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          _count: { select: { subscriptions: true, reviews: true } },
        },
      }),
      prisma.mcpServer.count({ where }),
    ]);

    return NextResponse.json({
      servers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role ?? "USER";
    if (role !== "DEVELOPER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createServerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const slug = generateSlug(parsed.data.name);
    const existing = await prisma.mcpServer.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 },
      );
    }

    const server = await prisma.mcpServer.create({
      data: {
        ...parsed.data,
        tags: JSON.stringify(parsed.data.tags ?? []),
        slug,
        status: "PENDING",
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(server, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
