import { afterEach, describe, expect, it, vi } from "vitest";
import { sendEmail } from "./index";

describe("sendEmail in preview mode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("never contacts the email provider", async () => {
    vi.stubEnv("SITE_MODE", "preview");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.spyOn(console, "info").mockImplementation(() => {});
    await expect(
      sendEmail({ to: "hr@example.com", subject: "Hi", text: "Body" }),
    ).resolves.toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
