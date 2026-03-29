// F008: API Key Management
describe("POST /api/keys", () => {
  it.todo("creates API key for authenticated user");
  it.todo("returns plaintext key only once");
  it.todo("stores hashed key in database");
});
describe("DELETE /api/keys/:id", () => {
  it.todo("deletes key owned by current user");
  it.todo("rejects deletion of another user's key");
});
describe("POST /api/verify-key", () => {
  it.todo("returns subscription info for valid key");
  it.todo("returns 401 for invalid or revoked key");
});
