// F005: Stripe Subscription Billing
describe("POST /api/subscriptions/checkout", () => {
  it.todo("creates Stripe checkout session for authenticated user");
  it.todo("rejects unauthenticated requests");
});
describe("POST /api/subscriptions/:id/cancel", () => {
  it.todo("cancels subscription at period end");
  it.todo("rejects cancellation from non-owner");
});
describe("POST /api/webhooks/stripe", () => {
  it.todo("verifies Stripe webhook signature");
  it.todo("handles checkout.session.completed event");
  it.todo("handles customer.subscription.deleted event");
  it.todo("handles invoice.payment_failed event");
  it.todo("rejects invalid webhook signatures with 400");
});
