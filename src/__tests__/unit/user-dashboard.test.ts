// F007: User Dashboard
describe("GET /api/subscriptions", () => {
  it.todo("returns user subscriptions");
  it.todo("rejects unauthenticated requests");
});
describe("GET /api/subscriptions/:id/config", () => {
  it.todo("returns MCP config snippet for subscriber");
  it.todo("rejects non-subscriber with 403");
});
describe("POST /api/billing/portal", () => {
  it.todo("creates Stripe billing portal session");
});
