import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { provisionHosting } from "@/lib/hosting";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const role = session.user.role ?? "USER";
    if (server.ownerId !== session.user.id && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!server.managedHosting) {
      return NextResponse.json(
        { error: "Managed hosting not enabled for this server" },
        { status: 400 },
      );
    }

    const { endpointUrl } = await provisionHosting(serverId);

    return NextResponse.json({ success: true, endpointUrl });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
