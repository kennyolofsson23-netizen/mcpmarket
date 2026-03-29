// Set required env vars before any module import so the guards in stripe.ts don't throw.
process.env.STRIPE_SECRET_KEY = "sk_test_mock_key";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock_secret";

// Mock the stripe npm package so no real Stripe client is created.
const mockCustomersCreate = jest.fn();
const mockProductsCreate = jest.fn();
const mockPricesCreate = jest.fn();
const mockCheckoutSessionsCreate = jest.fn();
const mockBillingPortalSessionsCreate = jest.fn();
const mockAccountsCreate = jest.fn();
const mockAccountLinksCreate = jest.fn();
const mockWebhooksConstructEvent = jest.fn();

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    customers: { create: mockCustomersCreate },
    products: { create: mockProductsCreate },
    prices: { create: mockPricesCreate },
    checkout: { sessions: { create: mockCheckoutSessionsCreate } },
    billingPortal: { sessions: { create: mockBillingPortalSessionsCreate } },
    accounts: { create: mockAccountsCreate },
    accountLinks: { create: mockAccountLinksCreate },
    webhooks: { constructEvent: mockWebhooksConstructEvent },
  }));
});

import {
  createStripeCustomer,
  createStripeProduct,
  createStripePrice,
  createCheckoutSession,
  createBillingPortalSession,
  createConnectAccount,
  createConnectOnboardingLink,
  constructWebhookEvent,
} from "@/lib/stripe";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createStripeCustomer", () => {
  it("calls stripe.customers.create with email and name", async () => {
    const mockCustomer = { id: "cus_123", email: "user@example.com" };
    mockCustomersCreate.mockResolvedValue(mockCustomer);

    const result = await createStripeCustomer("user@example.com", "Jane Doe");

    expect(mockCustomersCreate).toHaveBeenCalledTimes(1);
    expect(mockCustomersCreate).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "Jane Doe",
    });
    expect(result).toBe(mockCustomer);
  });

  it("calls stripe.customers.create without name when name is omitted", async () => {
    mockCustomersCreate.mockResolvedValue({ id: "cus_456" });

    await createStripeCustomer("anon@example.com");

    expect(mockCustomersCreate).toHaveBeenCalledWith({
      email: "anon@example.com",
      name: undefined,
    });
  });
});

describe("createStripeProduct", () => {
  it("calls stripe.products.create with name and description", async () => {
    const mockProduct = { id: "prod_123", name: "Pro Plan" };
    mockProductsCreate.mockResolvedValue(mockProduct);

    const result = await createStripeProduct({
      name: "Pro Plan",
      description: "Access to all premium features",
    });

    expect(mockProductsCreate).toHaveBeenCalledTimes(1);
    expect(mockProductsCreate).toHaveBeenCalledWith({
      name: "Pro Plan",
      description: "Access to all premium features",
    });
    expect(result).toBe(mockProduct);
  });
});

describe("createStripePrice", () => {
  it("uses 'usd' and 'month' as defaults", async () => {
    mockPricesCreate.mockResolvedValue({ id: "price_123" });

    await createStripePrice({ productId: "prod_123", unitAmount: 999 });

    expect(mockPricesCreate).toHaveBeenCalledWith({
      product: "prod_123",
      unit_amount: 999,
      currency: "usd",
      recurring: { interval: "month" },
    });
  });

  it("respects currency and interval overrides", async () => {
    mockPricesCreate.mockResolvedValue({ id: "price_456" });

    await createStripePrice({
      productId: "prod_456",
      unitAmount: 9900,
      currency: "eur",
      interval: "year",
    });

    expect(mockPricesCreate).toHaveBeenCalledWith({
      product: "prod_456",
      unit_amount: 9900,
      currency: "eur",
      recurring: { interval: "year" },
    });
  });
});

describe("createCheckoutSession", () => {
  const baseOpts = {
    customerId: "cus_123",
    priceId: "price_123",
    successUrl: "https://example.com/success",
    cancelUrl: "https://example.com/cancel",
    metadata: { serverId: "srv_1" },
  };

  it("creates session with correct base params", async () => {
    mockCheckoutSessionsCreate.mockResolvedValue({ id: "cs_123" });

    await createCheckoutSession(baseOpts);

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
      customer: "cus_123",
      mode: "subscription",
      line_items: [{ price: "price_123", quantity: 1 }],
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
      metadata: { serverId: "srv_1" },
    });
  });

  it("omits subscription_data when applicationFeePercent is not provided", async () => {
    mockCheckoutSessionsCreate.mockResolvedValue({ id: "cs_124" });

    await createCheckoutSession(baseOpts);

    const call = mockCheckoutSessionsCreate.mock.calls[0][0];
    expect(call.subscription_data).toBeUndefined();
  });

  it("adds subscription_data when applicationFeePercent and transferDataDestination are provided", async () => {
    mockCheckoutSessionsCreate.mockResolvedValue({ id: "cs_125" });

    await createCheckoutSession({
      ...baseOpts,
      applicationFeePercent: 20,
      transferDataDestination: "acct_developer_123",
    });

    expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        subscription_data: {
          application_fee_percent: 20,
          transfer_data: { destination: "acct_developer_123" },
        },
      }),
    );
  });

  it("omits subscription_data when only applicationFeePercent is provided", async () => {
    mockCheckoutSessionsCreate.mockResolvedValue({ id: "cs_126" });

    await createCheckoutSession({
      ...baseOpts,
      applicationFeePercent: 20,
    });

    const call = mockCheckoutSessionsCreate.mock.calls[0][0];
    expect(call.subscription_data).toBeUndefined();
  });
});

describe("createBillingPortalSession", () => {
  it("calls billingPortal.sessions.create with correct params", async () => {
    const mockSession = { id: "bps_123", url: "https://billing.stripe.com" };
    mockBillingPortalSessionsCreate.mockResolvedValue(mockSession);

    const result = await createBillingPortalSession({
      customerId: "cus_123",
      returnUrl: "https://example.com/account",
    });

    expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "https://example.com/account",
    });
    expect(result).toBe(mockSession);
  });
});

describe("createConnectAccount", () => {
  it("creates an express account with correct capabilities", async () => {
    const mockAccount = { id: "acct_123" };
    mockAccountsCreate.mockResolvedValue(mockAccount);

    const result = await createConnectAccount("developer@example.com");

    expect(mockAccountsCreate).toHaveBeenCalledWith({
      type: "express",
      email: "developer@example.com",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    expect(result).toBe(mockAccount);
  });
});

describe("createConnectOnboardingLink", () => {
  it("calls accountLinks.create with type='account_onboarding'", async () => {
    const mockLink = { url: "https://connect.stripe.com/setup/..." };
    mockAccountLinksCreate.mockResolvedValue(mockLink);

    const result = await createConnectOnboardingLink({
      accountId: "acct_123",
      refreshUrl: "https://example.com/refresh",
      returnUrl: "https://example.com/return",
    });

    expect(mockAccountLinksCreate).toHaveBeenCalledWith({
      account: "acct_123",
      refresh_url: "https://example.com/refresh",
      return_url: "https://example.com/return",
      type: "account_onboarding",
    });
    expect(result).toBe(mockLink);
  });
});

describe("constructWebhookEvent", () => {
  it("delegates to stripe.webhooks.constructEvent", () => {
    const mockEvent = { id: "evt_123", type: "subscription.created" };
    mockWebhooksConstructEvent.mockReturnValue(mockEvent);

    const result = constructWebhookEvent(
      '{"id":"evt_123"}',
      "stripe_signature_header",
      "whsec_test_secret",
    );

    expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
      '{"id":"evt_123"}',
      "stripe_signature_header",
      "whsec_test_secret",
    );
    expect(result).toBe(mockEvent);
  });

  it("propagates errors from stripe.webhooks.constructEvent", () => {
    mockWebhooksConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    expect(() =>
      constructWebhookEvent(
        "bad_payload",
        "bad_signature",
        "whsec_test_secret",
      ),
    ).toThrow("No signatures found matching the expected signature");
  });
});
