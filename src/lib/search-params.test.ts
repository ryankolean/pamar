import { describe, expect, it } from "vitest";
import { firstParam, pickParam, toSearchParams } from "./search-params";

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

  it("converts URLSearchParams to a record, arrays for repeated keys", () => {
    expect(toSearchParams(new URLSearchParams("a=1&b=2&b=3"))).toEqual({ a: "1", b: ["2", "3"] });
    expect(toSearchParams(new URLSearchParams(""))).toEqual({});
  });
});
