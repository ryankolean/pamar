import { timingSafeEqual } from "node:crypto";

/**
 * Check an HTTP Basic Authorization header against the preview password.
 * Any username is accepted; only the password matters.
 */
export function isAuthorized(header: string | null, password: string): boolean {
  if (!header?.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const separator = decoded.indexOf(":");
  if (separator === -1) return false;
  const given = Buffer.from(decoded.slice(separator + 1));
  const expected = Buffer.from(password);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
