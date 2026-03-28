import { createHash, randomBytes } from "crypto";

const KEY_PREFIX = "mcpm_";
const PREFIX_DISPLAY_LENGTH = 8;

export function generateApiKey(): {
  key: string;
  keyHash: string;
  keyPrefix: string;
} {
  const raw = KEY_PREFIX + randomBytes(32).toString("hex");
  const keyHash = hashApiKey(raw);
  const keyPrefix = raw.slice(0, KEY_PREFIX.length + PREFIX_DISPLAY_LENGTH);
  return { key: raw, keyHash, keyPrefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
