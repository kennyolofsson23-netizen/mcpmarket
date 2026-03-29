import { generateApiKey, hashApiKey, extractBearerToken } from "@/lib/api-keys";

describe("generateApiKey", () => {
  it("returns an object with key, keyHash, and keyPrefix", () => {
    const result = generateApiKey();
    expect(result).toHaveProperty("key");
    expect(result).toHaveProperty("keyHash");
    expect(result).toHaveProperty("keyPrefix");
  });

  it("key starts with 'mcpm_'", () => {
    const { key } = generateApiKey();
    expect(key.startsWith("mcpm_")).toBe(true);
  });

  it("keyHash is a 64-character hex string", () => {
    const { keyHash } = generateApiKey();
    expect(keyHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keyPrefix has the correct length (mcpm_ prefix + 8 chars = 13)", () => {
    const { keyPrefix } = generateApiKey();
    // KEY_PREFIX="mcpm_" (5 chars) + PREFIX_DISPLAY_LENGTH=8 = 13
    expect(keyPrefix.length).toBe(13);
  });

  it("keyPrefix starts with 'mcpm_'", () => {
    const { keyPrefix } = generateApiKey();
    expect(keyPrefix.startsWith("mcpm_")).toBe(true);
  });

  it("each call returns a different key", () => {
    const { key: key1 } = generateApiKey();
    const { key: key2 } = generateApiKey();
    expect(key1).not.toBe(key2);
  });

  it("keyHash matches hashApiKey(key)", () => {
    const { key, keyHash } = generateApiKey();
    expect(keyHash).toBe(hashApiKey(key));
  });

  it("keyPrefix matches the start of the key", () => {
    const { key, keyPrefix } = generateApiKey();
    expect(key.startsWith(keyPrefix)).toBe(true);
  });
});

describe("hashApiKey", () => {
  it("returns a 64-character hex string", () => {
    const hash = hashApiKey("some-api-key");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic — same input always produces same output", () => {
    const key = "mcpm_testkey12345";
    expect(hashApiKey(key)).toBe(hashApiKey(key));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashApiKey("key-one")).not.toBe(hashApiKey("key-two"));
  });

  it("hashes an empty string without error", () => {
    const hash = hashApiKey("");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces the known SHA-256 hash of 'hello'", () => {
    // SHA-256("hello") is well-known
    expect(hashApiKey("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });
});

describe("extractBearerToken", () => {
  it("extracts the token from a valid Bearer header", () => {
    expect(extractBearerToken("Bearer mytoken123")).toBe("mytoken123");
  });

  it("returns null for a null auth header", () => {
    expect(extractBearerToken(null)).toBeNull();
  });

  it("returns null for a non-Bearer scheme like 'Token xxx'", () => {
    expect(extractBearerToken("Token mytoken123")).toBeNull();
  });

  it("returns null for 'Bearer' with no trailing space or token", () => {
    expect(extractBearerToken("Bearer")).toBeNull();
  });

  it("returns null for lowercase 'bearer xxx'", () => {
    expect(extractBearerToken("bearer mytoken123")).toBeNull();
  });

  it("returns the full token including any special characters", () => {
    expect(extractBearerToken("Bearer abc.def_ghi-123")).toBe("abc.def_ghi-123");
  });

  it("returns an empty string when 'Bearer ' has nothing after the space", () => {
    // slice(7) on "Bearer " (7 chars) gives ""
    expect(extractBearerToken("Bearer ")).toBe("");
  });
});
