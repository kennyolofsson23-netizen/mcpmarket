import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe';

async function getOrCreateCustomer(userId: string, email: string, name?: string | null) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }
  const customer = await createStripeCustomer(email, name ?? undefined);
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { serverId, priceId } = body as { serverId: string; priceId?: string };

  const server = await prisma.mcpServer.findUnique({ where: { id: serverId } });
  if (!server || server.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Server not found or not approved' }, { status: 404 });
  }

  const resolvedPriceId = priceId ?? server.priceId;
  if (!resolvedPriceId) {
    return NextResponse.json({ error: 'No price configured for this server' }, { status: 400 });
  }

  const customerId = await getOrCreateCustomer(
    session.user.id,
    session.user.email!,
    session.user.name,
  );

  const checkoutSession = await createCheckoutSession({
    customerId,
    priceId: resolvedPriceId,
    successUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard/subscriptions?success=1`,
    cancelUrl: `${process.env.NEXT_PUBLIC_URL}/servers/${server.slug}`,
    metadata: { serverId, userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
