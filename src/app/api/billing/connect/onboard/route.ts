import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createConnectAccount,
  createConnectOnboardingLink,
} from "@/lib/stripe";

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "DEVELOPER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.stripeConnectId && user.connectOnboarded) {
    return NextResponse.json({ error: "Already onboarded" }, { status: 400 });
  }

  const account = await createConnectAccount(
    session.user.email ?? user.email ?? "",
  );

  await prisma.user.update({
    where: { id: session.user.id },
    data: { stripeConnectId: account.id },
  });

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const onboardingLink = await createConnectOnboardingLink({
    accountId: account.id,
    refreshUrl: `${baseUrl}/dashboard/developer/payouts?refresh=1`,
    returnUrl: `${baseUrl}/dashboard/developer/payouts?onboarded=1`,
  });

  return NextResponse.json({ url: onboardingLink.url });
}
