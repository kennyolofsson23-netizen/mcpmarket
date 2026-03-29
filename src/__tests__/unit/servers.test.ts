// F001: Server Listing & Publishing
describe("POST /api/servers", () => {
  it.todo("creates a server for authenticated developer");
  it.todo("rejects unauthenticated requests with 401");
  it.todo("validates required fields");
  it.todo("rejects duplicate slugs");
});
describe("GET /api/servers/:slug", () => {
  it.todo("returns server details for approved server");
  it.todo("returns 404 for unknown slug");
});
describe("PUT /api/servers/:slug", () => {
  it.todo("updates server for owner");
  it.todo("rejects update from non-owner with 403");
});
