import { describe, expect, test } from "bun:test";
import { href, parseRoute } from "./router";

describe("routes", () => {
  test("round trip", () => {
    for (const r of [
      { name: "scan" },
      { name: "product", code: "3017620422003" },
      { name: "product", code: "4005900964441", db: "obf" },
      { name: "search", q: "pâte à tartiner & co" },
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
    expect(parseRoute("#/search?q=%20")).toEqual({ name: "scan" });
    expect(parseRoute("#/p/3017620422003?db=nope")).toEqual({
      name: "product",
      code: "3017620422003",
    });
  });
});
