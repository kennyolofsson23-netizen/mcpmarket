// F009: Stripe Connect Payouts
describe("POST /api/billing/connect/onboard", () => {
  it.todo("creates Stripe Connect account and returns onboarding URL");
  it.todo("rejects non-developer with 403");
});
describe("GET /api/billing/connect/status", () => {
  it.todo("returns connect account status for developer");
});
describe("GET /api/developer/transactions", () => {
  it.todo("returns transaction history for developer");
});
