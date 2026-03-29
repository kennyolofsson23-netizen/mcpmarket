// Mock next-auth and its providers before any import so the module-level
// NextAuth(...) call in auth.ts doesn't execute real initialization.
const mockAuth = jest.fn();

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: {},
    auth: mockAuth,
    signIn: jest.fn(),
    signOut: jest.fn(),
  })),
}));

jest.mock("next-auth/providers/github", () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: "github" })),
}));

jest.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: "google" })),
}));

jest.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: jest.fn(() => ({})),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {},
}));

// Import AFTER all mocks are in place.
import { requireAuth, requireRole } from "@/lib/auth";

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Helper — build a minimal session object
// ---------------------------------------------------------------------------
function makeSession(role = "USER") {
  return {
    user: { id: "user_1", email: "user@example.com", role },
    expires: "2099-01-01",
  };
}

// ---------------------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------------------
describe("requireAuth", () => {
  it("returns the session when the user is authenticated", async () => {
    const session = makeSession();
    mockAuth.mockResolvedValue(session);

    const result = await requireAuth();
    expect(result).toBe(session);
  });

  it("throws 'Unauthorized' when auth() returns null", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow("Unauthorized");
  });

  it("throws 'Unauthorized' when auth() returns a session without a user", async () => {
    mockAuth.mockResolvedValue({ expires: "2099-01-01" });
    await expect(requireAuth()).rejects.toThrow("Unauthorized");
  });

  it("throws 'Unauthorized' when auth() returns undefined", async () => {
    mockAuth.mockResolvedValue(undefined);
    await expect(requireAuth()).rejects.toThrow("Unauthorized");
  });
});

// ---------------------------------------------------------------------------
// requireRole
// ---------------------------------------------------------------------------
describe("requireRole", () => {
  it("returns the session when the user role matches the required role", async () => {
    const session = makeSession("DEVELOPER");
    mockAuth.mockResolvedValue(session);

    const result = await requireRole("DEVELOPER");
    expect(result).toBe(session);
  });

  it("allows ADMIN to pass a DEVELOPER role check", async () => {
    const session = makeSession("ADMIN");
    mockAuth.mockResolvedValue(session);

    const result = await requireRole("DEVELOPER");
    expect(result).toBe(session);
  });

  it("allows ADMIN to pass an ADMIN role check", async () => {
    const session = makeSession("ADMIN");
    mockAuth.mockResolvedValue(session);

    const result = await requireRole("ADMIN");
    expect(result).toBe(session);
  });

  it("allows USER to pass a USER role check", async () => {
    const session = makeSession("USER");
    mockAuth.mockResolvedValue(session);

    const result = await requireRole("USER");
    expect(result).toBe(session);
  });

  it("throws 'Unauthorized' when auth() returns null", async () => {
    mockAuth.mockResolvedValue(null);
    await expect(requireRole("USER")).rejects.toThrow("Unauthorized");
  });

  it("throws 'Unauthorized' when auth() returns a session without a user", async () => {
    mockAuth.mockResolvedValue({ expires: "2099-01-01" });
    await expect(requireRole("ADMIN")).rejects.toThrow("Unauthorized");
  });

  it("throws 'Forbidden' when USER tries to access a DEVELOPER route", async () => {
    mockAuth.mockResolvedValue(makeSession("USER"));
    await expect(requireRole("DEVELOPER")).rejects.toThrow("Forbidden");
  });

  it("throws 'Forbidden' when USER tries to access an ADMIN route", async () => {
    mockAuth.mockResolvedValue(makeSession("USER"));
    await expect(requireRole("ADMIN")).rejects.toThrow("Forbidden");
  });

  it("throws 'Forbidden' when DEVELOPER tries to access an ADMIN route", async () => {
    mockAuth.mockResolvedValue(makeSession("DEVELOPER"));
    await expect(requireRole("ADMIN")).rejects.toThrow("Forbidden");
  });

  it("defaults to USER role when session.user has no role property", async () => {
    // role is not set, so userRole defaults to "USER"
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "x@x.com" } });

    // USER role check should pass
    const result = await requireRole("USER");
    expect(result).toBeDefined();
  });

  it("throws 'Forbidden' when role-less user tries to access DEVELOPER", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", email: "x@x.com" } });
    await expect(requireRole("DEVELOPER")).rejects.toThrow("Forbidden");
  });
});
