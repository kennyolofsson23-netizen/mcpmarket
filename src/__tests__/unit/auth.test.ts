// F004: Auth
describe("GET /api/auth/[...nextauth]", () => {
  it.todo("handles GitHub OAuth callback");
  it.todo("handles Google OAuth callback");
  it.todo("creates user on first sign-in");
});
describe("POST /api/auth/upgrade-role", () => {
  it.todo("upgrades USER to DEVELOPER role");
  it.todo("rejects unauthenticated requests");
});
