import { describe, expect, test } from "bun:test";
import { href, parseRoute } from "./router";

describe("routes", () => {
  test("round trip", () => {
    for (const r of [
      { name: "scan" },
      { name: "product", code: "3017620422003" },
      { name: "history" },
      { name: "settings" },
      { name: "about" },
    ] as const) {
      expect(parseRoute(href(r))).toEqual(r);
    }
  });

  test("anything else is the scanner", () => {
    expect(parseRoute("#/p/abc")).toEqual({ name: "scan" });
    expect(parseRoute("")).toEqual({ name: "scan" });
    expect(parseRoute("#/nope")).toEqual({ name: "scan" });
  });
});
