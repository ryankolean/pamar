import { describe, expect, it } from "vitest";
import { isAuthorized } from "./preview-auth";

const basic = (user: string, pass: string) =>
  `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;

describe("isAuthorized", () => {
  it("accepts the right password with any username", () => {
    expect(isAuthorized(basic("rick", "s3cret"), "s3cret")).toBe(true);
    expect(isAuthorized(basic("", "s3cret"), "s3cret")).toBe(true);
  });

  it("allows colons inside the password", () => {
    expect(isAuthorized(basic("rick", "a:b:c"), "a:b:c")).toBe(true);
  });

  it("rejects wrong, missing, or malformed credentials", () => {
    expect(isAuthorized(basic("rick", "wrong"), "s3cret")).toBe(false);
    expect(isAuthorized(basic("rick", "s3cret-longer"), "s3cret")).toBe(false);
    expect(isAuthorized(null, "s3cret")).toBe(false);
    expect(isAuthorized("Bearer abc", "s3cret")).toBe(false);
    expect(isAuthorized(`Basic ${Buffer.from("nocolon").toString("base64")}`, "s3cret")).toBe(
      false,
    );
  });
});
