import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./analytics";

describe("trackEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing on the server or when GA isn't loaded", () => {
    expect(() => trackEvent("contact_submitted")).not.toThrow();
    vi.stubGlobal("window", {});
    expect(() => trackEvent("contact_submitted")).not.toThrow();
  });

  it("sends events through gtag when present", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });
    trackEvent("bid_submitted", { package: "x" });
    expect(gtag).toHaveBeenCalledWith("event", "bid_submitted", { package: "x" });
  });
});
