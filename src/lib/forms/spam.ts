/**
 * Spam protection shared by all public forms:
 * 1. A honeypot field that real users never see or fill in.
 * 2. Cloudflare Turnstile verification, enabled when TURNSTILE_SECRET_KEY is set.
 */
export const HONEYPOT_FIELD = "website_url";

export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === "string" && value.trim().length > 0;
}

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  formData: FormData,
  secret = process.env.TURNSTILE_SECRET_KEY,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!secret) return true; // Not configured: honeypot only.

  const token = formData.get("cf-turnstile-response");
  if (typeof token !== "string" || token.length === 0) return false;

  try {
    const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification failed", error);
    return false;
  }
}
