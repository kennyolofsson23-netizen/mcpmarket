// F005: Stripe Subscription Billing
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  handlers: { GET: jest.fn(), POST: jest.fn() },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { update: jest.fn(), findUnique: jest.fn() },
    subscription: { create: jest.fn(), update: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn() },
    mcpServer: { findUnique: jest.fn(), findFirst: jest.fn() },
  },
}));

jest.mock('@/lib/stripe', () => ({
  stripe: {},
  createCheckoutSession: jest.fn(),
  createBillingPortalSession: jest.fn(),
  constructWebhookEvent: jest.fn(),
  createStripeCustomer: jest.fn(),
}));

import { POST as checkoutPost } from '@/app/api/subscriptions/checkout/route';
import { POST as cancelPost } from '@/app/api/subscriptions/[id]/cancel/route';
import { POST as webhookPost } from '@/app/api/webhooks/stripe/route';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCheckoutSession, constructWebhookEvent, createStripeCustomer } from '@/lib/stripe';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCreateCheckoutSession = createCheckoutSession as jest.MockedFunction<typeof createCheckoutSession>;
const mockConstructWebhookEvent = constructWebhookEvent as jest.MockedFunction<typeof constructWebhookEvent>;
const mockCreateStripeCustomer = createStripeCustomer as jest.MockedFunction<typeof createStripeCustomer>;
const mockUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockUserUpdate = prisma.user.update as jest.MockedFunction<typeof prisma.user.update>;
const mockServerFindUnique = prisma.mcpServer.findUnique as jest.MockedFunction<typeof prisma.mcpServer.findUnique>;
const mockSubFindUnique = prisma.subscription.findUnique as jest.MockedFunction<typeof prisma.subscription.findUnique>;
const mockSubUpdate = prisma.subscription.update as jest.MockedFunction<typeof prisma.subscription.update>;
const mockSubCreate = prisma.subscription.create as jest.MockedFunction<typeof prisma.subscription.create>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/subscriptions/checkout', () => {
  it('creates Stripe checkout session for authenticated user', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'test@example.com', name: 'Test User', role: 'USER' },
      expires: '2099-01-01',
    } as never);
    mockServerFindUnique.mockResolvedValueOnce({
      id: 'server-1', slug: 'my-server', status: 'APPROVED', priceId: 'price_123',
    } as never);
    mockUserFindUnique.mockResolvedValueOnce({
      id: 'user-1', stripeCustomerId: 'cus_existing',
    } as never);
    mockCreateCheckoutSession.mockResolvedValueOnce({
      url: 'https://checkout.stripe.com/session123',
    } as never);

    const req = new Request('http://localhost/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId: 'server-1' }),
    }) as never;

    const res = await checkoutPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe('https://checkout.stripe.com/session123');
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({
      customerId: 'cus_existing',
      priceId: 'price_123',
      metadata: { serverId: 'server-1', userId: 'user-1' },
    }));
  });

  it('creates new Stripe customer when user has none', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-2', email: 'new@example.com', name: 'New User', role: 'USER' },
      expires: '2099-01-01',
    } as never);
    mockServerFindUnique.mockResolvedValueOnce({
      id: 'server-1', slug: 'my-server', status: 'APPROVED', priceId: 'price_456',
    } as never);
    mockUserFindUnique.mockResolvedValueOnce({ id: 'user-2', stripeCustomerId: null } as never);
    mockCreateStripeCustomer.mockResolvedValueOnce({ id: 'cus_new' } as never);
    mockUserUpdate.mockResolvedValueOnce({ id: 'user-2', stripeCustomerId: 'cus_new' } as never);
    mockCreateCheckoutSession.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/newsession' } as never);

    const req = new Request('http://localhost/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId: 'server-1' }),
    }) as never;

    const res = await checkoutPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockCreateStripeCustomer).toHaveBeenCalledWith('new@example.com', 'New User');
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { stripeCustomerId: 'cus_new' },
    });
    expect(body.url).toBe('https://checkout.stripe.com/newsession');
  });

  it('rejects unauthenticated requests with 401', async () => {
    mockAuth.mockResolvedValueOnce(null as never);

    const req = new Request('http://localhost/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId: 'server-1' }),
    }) as never;

    const res = await checkoutPost(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });
});

describe('POST /api/subscriptions/:id/cancel', () => {
  it('cancels subscription at period end', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
      expires: '2099-01-01',
    } as never);
    mockSubFindUnique.mockResolvedValueOnce({
      id: 'sub-1', userId: 'user-1', status: 'ACTIVE',
    } as never);
    mockSubUpdate.mockResolvedValueOnce({ id: 'sub-1', status: 'CANCELED', cancelAtPeriodEnd: true } as never);

    const req = new Request('http://localhost/api/subscriptions/sub-1/cancel', {
      method: 'POST',
    }) as never;

    const res = await cancelPost(req, { params: { id: 'sub-1' } });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mockSubUpdate).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { cancelAtPeriodEnd: true, status: 'CANCELED' },
    });
  });

  it('rejects cancellation from non-owner with 403', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-2', email: 'other@example.com', role: 'USER' },
      expires: '2099-01-01',
    } as never);
    mockSubFindUnique.mockResolvedValueOnce({
      id: 'sub-1', userId: 'user-1', status: 'ACTIVE',
    } as never);

    const req = new Request('http://localhost/api/subscriptions/sub-1/cancel', {
      method: 'POST',
    }) as never;

    const res = await cancelPost(req, { params: { id: 'sub-1' } });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe('Forbidden');
    expect(mockSubUpdate).not.toHaveBeenCalled();
  });
});

describe('POST /api/webhooks/stripe', () => {
  it('rejects invalid webhook signatures with 400', async () => {
    mockConstructWebhookEvent.mockImplementation(() => { throw new Error('Invalid signature'); });

    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'bad_sig' },
      body: 'bad_payload',
    }) as never;

    const res = await webhookPost(req);
    expect(res.status).toBe(400);
  });

  it('verifies Stripe webhook signature on valid request', async () => {
    mockConstructWebhookEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: { object: { metadata: { serverId: 's-1', userId: 'u-1' }, subscription: 'sub_stripe_1' } },
    } as never);
    mockSubCreate.mockResolvedValueOnce({ id: 'sub-db-1' } as never);

    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'valid_sig', 'Content-Type': 'application/json' },
      body: '{}',
    }) as never;

    const res = await webhookPost(req);
    expect(res.status).toBe(200);
    expect(mockConstructWebhookEvent).toHaveBeenCalled();
  });

  it('handles checkout.session.completed event', async () => {
    mockConstructWebhookEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { serverId: 'server-1', userId: 'user-1' },
          subscription: 'sub_stripe_abc',
        },
      },
    } as never);
    mockSubCreate.mockResolvedValueOnce({ id: 'sub-new' } as never);

    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'sig' },
      body: '{}',
    }) as never;

    const res = await webhookPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockSubCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: 'user-1',
        serverId: 'server-1',
        status: 'ACTIVE',
        stripeSubscriptionId: 'sub_stripe_abc',
      }),
    }));
  });

  it('handles customer.subscription.deleted event', async () => {
    mockConstructWebhookEvent.mockReturnValueOnce({
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_to_delete' } },
    } as never);
    mockSubUpdate.mockResolvedValueOnce({ id: 'sub-1', status: 'CANCELED' } as never);

    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'sig' },
      body: '{}',
    }) as never;

    const res = await webhookPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockSubUpdate).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_to_delete' },
      data: { status: 'CANCELED' },
    });
  });

  it('handles invoice.payment_failed event', async () => {
    mockConstructWebhookEvent.mockReturnValueOnce({
      type: 'invoice.payment_failed',
      data: { object: { subscription: 'sub_past_due' } },
    } as never);
    mockSubUpdate.mockResolvedValueOnce({ id: 'sub-1', status: 'PAST_DUE' } as never);

    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'sig' },
      body: '{}',
    }) as never;

    const res = await webhookPost(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(mockSubUpdate).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_past_due' },
      data: { status: 'PAST_DUE' },
    });
  });
});
