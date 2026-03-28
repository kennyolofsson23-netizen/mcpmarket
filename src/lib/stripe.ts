import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({ email, name });
}

export async function createStripeProduct(opts: {
  name: string;
  description: string;
}) {
  return stripe.products.create(opts);
}

export async function createStripePrice(opts: {
  productId: string;
  unitAmount: number;
  currency?: string;
  interval?: 'month' | 'year';
}) {
  return stripe.prices.create({
    product: opts.productId,
    unit_amount: opts.unitAmount,
    currency: opts.currency ?? 'usd',
    recurring: { interval: opts.interval ?? 'month' },
  });
}

export async function createCheckoutSession(opts: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  applicationFeePercent?: number;
  transferDataDestination?: string;
}) {
  const params: Stripe.Checkout.SessionCreateParams = {
    customer: opts.customerId,
    mode: 'subscription',
    line_items: [{ price: opts.priceId, quantity: 1 }],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: opts.metadata,
  };

  if (opts.applicationFeePercent && opts.transferDataDestination) {
    params.subscription_data = {
      application_fee_percent: opts.applicationFeePercent,
      transfer_data: { destination: opts.transferDataDestination },
    };
  }

  return stripe.checkout.sessions.create(params);
}

export async function createBillingPortalSession(opts: {
  customerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: opts.customerId,
    return_url: opts.returnUrl,
  });
}

export async function createConnectAccount(email: string) {
  return stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
}

export async function createConnectOnboardingLink(opts: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}) {
  return stripe.accountLinks.create({
    account: opts.accountId,
    refresh_url: opts.refreshUrl,
    return_url: opts.returnUrl,
    type: 'account_onboarding',
  });
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
