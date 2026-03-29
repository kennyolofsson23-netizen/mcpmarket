import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getHostingStatus } from "@/lib/hosting";

type RouteContext = { params: Promise<{ serverId: string }> };

async function resolveServerId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.serverId;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serverId = await resolveServerId(context);
    const server = await prisma.mcpServer.findUnique({
      where: { id: serverId },
    });
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const role = session.user.role ?? "USER";
    if (server.ownerId !== session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, endpointUrl } = await getHostingStatus(serverId);

    return NextResponse.json({ status, endpointUrl });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
