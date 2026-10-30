import { describe, expect, test } from "bun:test";
import {
  type Alternative,
  findAlternatives,
  marketOf,
  SHARDS,
  type Shard,
  sameProduct,
  shardOf,
  TopK,
} from "./alternatives";

const item = (code: string, score: number, name = `P${code}`): Alternative => ({
  code,
  name,
  score,
});

/** Shards served from a map of market → category → entry. */
function server(data: Record<string, Shard>) {
  const asked: string[] = [];
  const f = (async (url: string) => {
    asked.push(url);
    const [, market = "", n = ""] = /alternatives\/(\w+)\/(\d+)\.json$/.exec(url) ?? [];
    const shard: Shard = {};
    for (const [c, e] of Object.entries(data[market] ?? {}))
      if (String(shardOf(c)) === n) shard[c] = e;
    return Object.keys(shard).length ? Response.json(shard) : new Response("", { status: 404 });
  }) as unknown as typeof fetch;
  return { f, asked };
}

const spread = {
  code: "1",
  name: "Spread",
  categories: ["en:spreads", "en:sweet-spreads", "en:hazelnut-spreads"],
};

describe("better choices", () => {
  test("a category's shard is stable and in range", () => {
    expect(shardOf("en:sweet-spreads")).toBe(shardOf("en:sweet-spreads"));
    for (const c of ["en:sodas", "en:hams", "fr:x", ""]) {
      expect(shardOf(c)).toBeGreaterThanOrEqual(0);
      expect(shardOf(c)).toBeLessThan(SHARDS);
    }
  });

  test("the market follows the region, then the language", () => {
    expect(marketOf("en", "us")).toBe("us");
    expect(marketOf("fr", "eu")).toBe("fr");
    expect(marketOf("de", "eu")).toBe("de");
    expect(marketOf("en", "eu")).toBe("world");
  });

  test("the best of each category, best score then most scanned, one per product", () => {
    const top = new TopK(2);
    top.add("k", { ...item("a", 60), scans: 5 });
    top.add("k", { ...item("b", 80), scans: 1 });
    top.add("k", { ...item("c", 80), scans: 9 });
    top.add("k", { ...item("d", 80, "Pc"), scans: 99 });
    expect(top.best.get("k")?.map((x) => x.code)).toEqual(["c", "b"]);
    expect(
      sameProduct(
        { name: "Coca-Cola Zero", brands: "Coca Cola" },
        { name: "coca cola zero", brands: "Coca-Cola" },
      ),
    ).toBe(true);
  });

  test("the most specific category with better products, never the product itself", async () => {
    const { f } = server({
      fr: {
        "en:hazelnut-spreads": {
          d: 2,
          p: [item("1", 90), item("2", 70), item("3", 60), item("4", 20)],
        },
        "en:sweet-spreads": { d: 1, p: [item("5", 95), item("6", 90), item("7", 85)] },
      },
    });
    const r = await findAlternatives(spread, 30, "fr", { base: "/t1/", fetch: f });
    expect(r?.category).toBe("en:hazelnut-spreads");
    expect(r?.items.map((a) => a.code)).toEqual(["2", "3"]);
  });

  test("the world before a broader category; never a root; never a list of one", async () => {
    const { f } = server({
      fr: {
        "en:hazelnut-spreads": { d: 2, p: [item("9", 99)] },
        "en:spreads": { d: 0, p: [item("5", 95), item("6", 90), item("7", 85)] },
      },
      world: { "en:hazelnut-spreads": { d: 2, p: [item("2", 70), item("3", 60), item("4", 50)] } },
    });
    const r = await findAlternatives(spread, 30, "fr", { base: "/t2/", fetch: f });
    expect(r).toEqual({
      category: "en:hazelnut-spreads",
      items: [item("2", 70), item("3", 60), item("4", 50)],
    });
    const none = server({
      fr: { "en:spreads": { d: 0, p: [item("5", 95), item("6", 90), item("7", 85)] } },
    });
    expect(await findAlternatives(spread, 30, "fr", { base: "/t3/", fetch: none.f })).toBeNull();
  });

  test("nothing better, or no files: nothing shown", async () => {
    const { f } = server({
      world: { "en:hazelnut-spreads": { d: 2, p: [item("2", 40), item("3", 30), item("4", 20)] } },
    });
    expect(await findAlternatives(spread, 50, "world", { base: "/t4/", fetch: f })).toBeNull();
    const failing = (async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    expect(
      await findAlternatives({ ...spread, code: "x" }, 50, "de", { base: "/z/", fetch: failing }),
    ).toBeNull();
  });
});
