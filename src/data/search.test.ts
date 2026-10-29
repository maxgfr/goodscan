import { describe, expect, test } from "bun:test";
import recorded from "./fixtures/search-nutella.json";
import { RateLimiter } from "./off";
import { SearchError, searchAvailable, searchProducts, toHit } from "./search";

const answer = (body: unknown, status = 200) =>
  (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

function memory() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    m,
  };
}

describe("name search", () => {
  test("maps a real answer (recorded from search.openfoodfacts.org)", async () => {
    const page = await searchProducts("nutella", {
      lang: "en",
      fetch: answer(recorded),
      limiter: new RateLimiter(),
    });
    expect(page.count).toBe(recorded.count);
    expect(page.hits).toHaveLength(recorded.hits.length);
    const first = page.hits[0];
    expect(first?.code).toBe(recorded.hits[0]?.code as string);
    expect(first?.name.length).toBeGreaterThan(0);
  });

  test("asks in the user's language, with English as a fallback", async () => {
    let asked = "";
    const f = (async (u: string) => {
      asked = u;
      return new Response(JSON.stringify({ hits: [], count: 0 }));
    }) as unknown as typeof fetch;
    await searchProducts("  pâte à tartiner ", {
      lang: "fr",
      page: 2,
      fetch: f,
      limiter: new RateLimiter(),
    });
    const url = new URL(asked);
    expect(url.searchParams.get("q")).toBe("pâte à tartiner");
    expect(url.searchParams.get("langs")).toBe("fr,en");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("fields")).toContain("product_name_fr");
  });

  test("a hit: localized name, brands joined, junk dropped", () => {
    expect(
      toHit(
        {
          code: "4000417025005",
          product_name: "Marsepein",
          product_name_de: "Marzipan",
          brands: ["Ritter Sport"],
          nutriscore_grade: "e",
          nova_group: 4,
        },
        "de",
      ),
    ).toEqual({
      code: "4000417025005",
      name: "Marzipan",
      brands: "Ritter Sport",
      nutriscore: "e",
      nova: 4,
    });
    expect(toHit({ code: "abc" }, "en")).toBeNull();
    expect(toHit({ code: "3017620422003", nutriscore_grade: "unknown" }, "en")).toEqual({
      code: "3017620422003",
      name: "3017620422003",
    });
  });

  test("empty terms ask nothing; failures are told apart", async () => {
    const never = (async () => {
      throw new Error("asked");
    }) as unknown as typeof fetch;
    expect((await searchProducts("   ", { lang: "en", fetch: never })).hits).toEqual([]);
    await expect(
      searchProducts("x", { lang: "en", fetch: never, limiter: new RateLimiter() }),
    ).rejects.toMatchObject({ kind: "network" });
    await expect(
      searchProducts("x", { lang: "en", fetch: answer({}, 429), limiter: new RateLimiter() }),
    ).rejects.toMatchObject({ kind: "rate-limit" });
    await expect(
      searchProducts("x", { lang: "en", fetch: answer({}, 503), limiter: new RateLimiter() }),
    ).rejects.toBeInstanceOf(SearchError);
    await expect(
      searchProducts("x", { lang: "en", fetch: answer({}), limiter: new RateLimiter(0) }),
    ).rejects.toMatchObject({ kind: "rate-limit" });
  });

  test("availability: probed once per session, a CORS failure means no", async () => {
    const s = memory();
    let calls = 0;
    const ok = (async () => {
      calls++;
      return new Response(JSON.stringify({ hits: [] }));
    }) as unknown as typeof fetch;
    expect(await searchAvailable(ok, s)).toBe(true);
    expect(await searchAvailable(ok, s)).toBe(true);
    expect(calls).toBe(1);
    const blocked = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    expect(await searchAvailable(blocked, memory())).toBe(false);
    const hanging = ((_: string, init?: RequestInit) =>
      new Promise((_r, reject) =>
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))),
      )) as unknown as typeof fetch;
    expect(await searchAvailable(hanging, memory(), 20)).toBe(false);
  });
});
