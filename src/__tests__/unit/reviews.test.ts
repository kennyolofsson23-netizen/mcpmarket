// F011: Server Reviews
describe("POST /api/servers/:slug/reviews", () => {
  it.todo("creates review for subscriber");
  it.todo("rejects review from non-subscriber");
  it.todo("rejects duplicate review from same user");
  it.todo("validates rating between 1 and 5");
});
describe("GET /api/servers/:slug/reviews", () => {
  it.todo("returns paginated reviews");
});
