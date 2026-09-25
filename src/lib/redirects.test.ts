import { describe, expect, it } from "vitest";
import { legacyRedirects, redirectProblems } from "./redirects";

describe("legacy redirects", () => {
  it("are valid, unique, and chain-free", () => {
    expect(redirectProblems(legacyRedirects)).toEqual([]);
  });

  it("detects common mistakes", () => {
    expect(
      redirectProblems([
        { source: "old.html", destination: "/a" },
        { source: "/x", destination: "/x" },
        { source: "/a", destination: "/b" },
        { source: "/a", destination: "/c" },
      ]),
    ).toEqual([
      'Source must start with "/": old.html',
      "Redirects to itself: /x",
      "Duplicate source: /a",
      "Redirect chain: old.html -> /a",
    ]);
  });
});
