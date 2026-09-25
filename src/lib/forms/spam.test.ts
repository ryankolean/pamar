import { describe, expect, it, vi } from "vitest";
import { HONEYPOT_FIELD, isHoneypotFilled, verifyTurnstile } from "./spam";

function form(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe("isHoneypotFilled", () => {
  it("flags submissions that fill the hidden field", () => {
    expect(isHoneypotFilled(form({ [HONEYPOT_FIELD]: "http://spam.example" }))).toBe(true);
    expect(isHoneypotFilled(form({ [HONEYPOT_FIELD]: "  " }))).toBe(false);
    expect(isHoneypotFilled(form({}))).toBe(false);
  });
});

describe("verifyTurnstile", () => {
  it("passes when Turnstile is not configured", async () => {
    expect(await verifyTurnstile(form({}), undefined)).toBe(true);
  });

  it("fails without a token when configured", async () => {
    const fetchImpl = vi.fn();
    expect(await verifyTurnstile(form({}), "secret", fetchImpl)).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns Cloudflare's verdict", async () => {
    const ok = vi.fn(async () => Response.json({ success: true }));
    const bad = vi.fn(async () => Response.json({ success: false }));
    const data = form({ "cf-turnstile-response": "token" });
    expect(await verifyTurnstile(data, "secret", ok)).toBe(true);
    expect(await verifyTurnstile(data, "secret", bad)).toBe(false);
  });

  it("fails closed when the verification request errors", async () => {
    const boom = vi.fn(async () => {
      throw new Error("network");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await verifyTurnstile(form({ "cf-turnstile-response": "t" }), "secret", boom)).toBe(
      false,
    );
  });
});
