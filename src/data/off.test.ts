import { describe, expect, test } from "bun:test";
import { RAW } from "./fixtures";
import { LookupError, lookup, RateLimiter, USER_AGENT } from "./off";

type Call = { url: string; headers: Record<string, string> };

function fakeFetch(answers: Record<string, () => Response>) {
  const calls: Call[] = [];
  const f = (async (input: string, init?: RequestInit) => {
    calls.push({ url: input, headers: (init?.headers ?? {}) as Record<string, string> });
    for (const [part, answer] of Object.entries(answers)) if (input.includes(part)) return answer();
    return new Response(
      JSON.stringify({ status: "failure", result: { id: "product_not_found" } }),
      { status: 404 },
    );
  }) as unknown as typeof fetch;
  return { f, calls };
}

const found = (product: unknown) => () =>
  new Response(JSON.stringify({ status: "success", product }), { status: 200 });

describe("lookup", () => {
  test("asks Open Food Facts v3 in the user's language, says who it is", async () => {
    const { f, calls } = fakeFetch({
      "openfoodfacts.org/api/v3/product/3017620422003": found(RAW.nutellaFr),
    });
    const p = await lookup("3017620422003", { lang: "fr", fetch: f, limiter: new RateLimiter() });
    expect(p?.name).toBe("Nutella");
    expect(p?.source).toBe("off");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toContain("lc=fr");
    expect(calls[0]?.url).toContain("product_name_fr");
    expect(calls[0]?.headers["X-User-Agent"]).toBe(USER_AGENT);
  });

  test("a UPC-A is found under its EAN-13", async () => {
    const { f, calls } = fakeFetch({
      "openfoodfacts.org/api/v3/product/0049000028911": found(RAW.dietCoke),
    });
    const p = await lookup("049000028911", { lang: "en", fetch: f, limiter: new RateLimiter() });
    expect(p?.name).toBe("Diet Coke Soft Drink");
    expect(calls.map((c) => c.url.split("?")[0])).toEqual([
      "https://world.openfoodfacts.org/api/v3/product/049000028911",
      "https://world.openfoodfacts.org/api/v3/product/0049000028911",
    ]);
  });

  test("then the beauty, pet food and products databases", async () => {
    const { f, calls } = fakeFetch({
      openpetfoodfacts: found({ code: "3182550402170", product_name: "Mini Adult" }),
    });
    const p = await lookup("3182550402170", { lang: "en", fetch: f, limiter: new RateLimiter() });
    expect(p?.source).toBe("opff");
    expect(calls.map((c) => new URL(c.url).host)).toEqual([
      "world.openfoodfacts.org",
      "world.openbeautyfacts.org",
      "world.openpetfoodfacts.org",
    ]);
  });

  test("nowhere: null", async () => {
    const { f } = fakeFetch({});
    expect(
      await lookup("3017620422003", { lang: "en", fetch: f, limiter: new RateLimiter() }),
    ).toBeNull();
    expect(await lookup("abc", { lang: "en", fetch: f })).toBeNull();
  });

  test("429 and network failures are told apart from not found", async () => {
    const limited = fakeFetch({ "": () => new Response("<html>429</html>", { status: 429 }) });
    await expect(
      lookup("3017620422003", { lang: "en", fetch: limited.f, limiter: new RateLimiter() }),
    ).rejects.toMatchObject({ kind: "rate-limit" });
    const down = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    const err = await lookup("3017620422003", {
      lang: "en",
      fetch: down,
      limiter: new RateLimiter(),
    }).catch((e) => e);
    expect(err).toBeInstanceOf(LookupError);
    expect(err.kind).toBe("network");
  });

  test("the client brakes before the API does", async () => {
    let t = 0;
    const l = new RateLimiter(2, 60_000, () => t);
    expect(l.take()).toBe(0);
    expect(l.take()).toBe(0);
    t = 15_000;
    expect(l.take()).toBe(45);
    t = 60_001;
    expect(l.take()).toBe(0);
    const { f } = fakeFetch({});
    const full = new RateLimiter(0);
    await expect(
      lookup("3017620422003", { lang: "en", fetch: f, limiter: full }),
    ).rejects.toMatchObject({ kind: "rate-limit" });
  });
});
