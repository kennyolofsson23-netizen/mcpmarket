import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentRole = session.user.role ?? "USER";
  if (currentRole === "DEVELOPER" || currentRole === "ADMIN") {
    return NextResponse.json({ error: "Already a developer" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "DEVELOPER" },
  });

  return NextResponse.json({ success: true, role: "DEVELOPER" });
}
