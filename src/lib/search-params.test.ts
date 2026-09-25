import { describe, expect, it } from "vitest";
import { firstParam, pickParam } from "./search-params";

describe("search param helpers", () => {
  it("takes the first of repeated values", () => {
    expect(firstParam(["a", "b"])).toBe("a");
    expect(firstParam("a")).toBe("a");
    expect(firstParam(undefined)).toBeUndefined();
  });

  it("only picks allowed values", () => {
    const allowed = ["x", "y"] as const;
    expect(pickParam({ k: "y" }, "k", allowed)).toBe("y");
    expect(pickParam({ k: "z" }, "k", allowed)).toBeUndefined();
    expect(pickParam({}, "k", allowed)).toBeUndefined();
  });
});
