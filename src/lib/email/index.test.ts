import { describe, expect, it } from "vitest";
import { formatFields } from "./index";

describe("formatFields", () => {
  it("renders labeled values and skips empty ones", () => {
    expect(
      formatFields([
        ["Name", "Pat"],
        ["Phone", ""],
        ["Company", undefined],
        ["Message", "Hello"],
      ]),
    ).toBe("Name:\nPat\n\nMessage:\nHello");
  });
});
