import { describe, expect, test } from "bun:test";
import recorded from "./fixtures/search-nutella.json";
import { RateLimiter } from "./off";
import {
  interleave,
  type Limiters,
  PAGE_SIZE,
  searchLimiters,
  searchProducts,
  toHit,
  withMore,
} from "./search";

type Answers = Partial<Record<"off" | "obf" | "opff" | "opf", () => Response | Promise<Response>>>;

const HOSTS = {
  off: "world.openfoodfacts.org",
  obf: "world.openbeautyfacts.org",
  opff: "world.openpetfoodfacts.org",
  opf: "world.openproductsfacts.org",
} as const;

/** Each database answers what `answers` says, an empty page when it says nothing. */
function databases(answers: Answers) {
  const asked: { url: URL; headers: Record<string, string> }[] = [];
  const f = (async (u: string, init?: RequestInit) => {
    const url = new URL(u);
    asked.push({ url, headers: (init?.headers ?? {}) as Record<string, string> });
    const db = (Object.keys(HOSTS) as (keyof typeof HOSTS)[]).find((k) => HOSTS[k] === url.host);
    const answer = db ? answers[db] : undefined;
    return answer ? answer() : json({ count: 0, products: [] });
  }) as unknown as typeof fetch;
  return { f, asked };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const products =
  (prefix: string, n: number, count = n) =>
  () =>
    json({
      count,
      products: Array.from({ length: n }, (_, i) => ({
        code: `${prefix}${String(i).padStart(13 - prefix.length, "0")}`,
        product_name: `${prefix} ${i}`,
      })),
    });
const fresh = () => ({ limiters: searchLimiters(), retryDelays: [0, 0] });

describe("name search", () => {
  test("maps a real answer (recorded from Open Food Facts' /cgi/search.pl)", async () => {
    const { f } = databases({ off: () => json(recorded) });
    const page = await searchProducts("nutella", { lang: "en", fetch: f, ...fresh() });
    expect(page.count).toBe(recorded.count);
    expect(page.counts.off).toBe(recorded.count);
    expect(page.hits).toHaveLength(recorded.products.length);
    expect(page.hits[0]?.code).toBe(recorded.products[0]?.code as string);
    expect(page.hits.every((h) => h.source === "off" && h.name.length > 0)).toBe(true);
    expect(page.more).toBe(true);
  });

  test("asks all four databases, in the user's language, with no preflight", async () => {
    const { f, asked } = databases({});
    await searchProducts("  pâte à tartiner ", { lang: "fr", page: 2, fetch: f, ...fresh() });
    expect(asked.map((a) => a.url.host).sort()).toEqual(Object.values(HOSTS).sort());
    for (const { url, headers } of asked) {
      expect(url.pathname).toBe("/cgi/search.pl");
      expect(url.searchParams.get("search_terms")).toBe("pâte à tartiner");
      expect(url.searchParams.get("json")).toBe("1");
      expect(url.searchParams.get("lc")).toBe("fr");
      expect(url.searchParams.get("page")).toBe("2");
      expect(url.searchParams.get("page_size")).toBe(String(PAGE_SIZE));
      expect(url.searchParams.get("fields")).toContain("product_name_fr");
      // A custom header would cost a preflight, which Open Food Facts sheds too.
      expect(headers).toEqual({});
    }
  });

  test("interleaves the databases, food first, each product once", async () => {
    const { f } = databases({
      off: products("1", 3),
      obf: () =>
        json({
          count: 2,
          products: [
            { code: "1000000000000", product_name: "same as food" },
            { code: "2000000000001", product_name: "Soft" },
          ],
        }),
      opff: products("3", 1),
    });
    const page = await searchProducts("x", { lang: "en", fetch: f, ...fresh() });
    expect(page.hits.map((h) => `${h.source}:${h.code}`)).toEqual([
      "off:1000000000000",
      "opff:3000000000000",
      "off:1000000000001",
      "obf:2000000000001",
      "off:1000000000002",
    ]);
    expect(page.count).toBe(6);
    expect(page.counts).toEqual({ off: 3, obf: 2, opff: 1, opf: 0 });
    expect(interleave([])).toEqual([]);
  });

  test("next pages: only the databases that have one", async () => {
    const { f, asked } = databases({
      off: products("1", PAGE_SIZE, PAGE_SIZE * 3),
      obf: products("2", 4),
    });
    const first = await searchProducts("x", { lang: "en", fetch: f, ...fresh() });
    expect(first.more).toBe(true);
    expect(withMore(first)).toEqual(["off"]);
    asked.length = 0;
    await searchProducts("x", {
      lang: "en",
      page: 2,
      sources: withMore(first),
      fetch: f,
      ...fresh(),
    });
    expect(asked.map((a) => a.url.host)).toEqual([HOSTS.off]);
    const last = await searchProducts("x", { lang: "en", page: 3, fetch: f, ...fresh() });
    expect(last.more).toBe(false);
    expect(withMore(last)).toEqual([]);
  });

  test("a hit: localized name, brands joined, food grades only from food, junk dropped", () => {
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
      source: "off",
      name: "Marzipan",
      brands: "Ritter Sport",
      nutriscore: "e",
      nova: 4,
    });
    // Open Beauty Facts carries leftover grades on cosmetics.
    expect(
      toHit(
        { code: "4005808890576", product_name: "Nivea soft", nova_group: 4, nutriscore_grade: "a" },
        "fr",
        "obf",
      ),
    ).toEqual({ code: "4005808890576", source: "obf", name: "Nivea soft" });
    expect(toHit({ code: "abc" }, "en")).toBeNull();
    expect(toHit({ code: "3017620422003", nutriscore_grade: "unknown" }, "en")).toEqual({
      code: "3017620422003",
      source: "off",
      name: "3017620422003",
    });
  });

  test("a database down: the others still answer", async () => {
    const { f } = databases({
      off: () => json({}, 503),
      obf: products("2", 2),
      opff: () => {
        throw new TypeError("Failed to fetch");
      },
      opf: () => new Response("<html>", { status: 200 }),
    });
    const page = await searchProducts("x", { lang: "en", fetch: f, ...fresh() });
    expect(page.hits.map((h) => h.source)).toEqual(["obf", "obf"]);
    expect(page.counts).toEqual({ obf: 2 });
    expect(page.failed).toEqual(["off", "opff", "opf"]);
  });

  test("a shedding database is asked again, twice at most, within its brake", async () => {
    let tries = 0;
    const shedOnce = databases({
      off: () => (++tries === 1 ? json({}, 503) : products("1", 2)()),
    });
    const page = await searchProducts("x", { lang: "en", fetch: shedOnce.f, ...fresh() });
    expect(tries).toBe(2);
    expect(page.counts.off).toBe(2);
    expect(page.failed).toEqual([]);

    // A shed answer without CORS headers: the page only sees a failed request.
    let blocked = 0;
    const corsless = databases({
      off: () => {
        if (++blocked < 3) throw new TypeError("Failed to fetch");
        return products("1", 1)();
      },
    });
    const third = await searchProducts("x", { lang: "en", fetch: corsless.f, ...fresh() });
    expect(blocked).toBe(3);
    expect(third.counts.off).toBe(1);

    const always = databases({ off: () => json({}, 503) });
    const shed = await searchProducts("x", { lang: "en", fetch: always.f, ...fresh() });
    expect(always.asked.filter((a) => a.url.host === HOSTS.off)).toHaveLength(3);
    expect(shed.failed).toEqual(["off"]);

    // A brake with room for two: the third try is not sent.
    const tight = databases({ off: () => json({}, 503) });
    await searchProducts("x", {
      lang: "en",
      fetch: tight.f,
      limiters: { off: new RateLimiter(2) },
      retryDelays: [0, 0],
    });
    expect(tight.asked.filter((a) => a.url.host === HOSTS.off)).toHaveLength(2);
  });

  test("empty terms ask nothing; when all fail, failures are told apart", async () => {
    const never = (async () => {
      throw new Error("asked");
    }) as unknown as typeof fetch;
    expect((await searchProducts("   ", { lang: "en", fetch: never })).hits).toEqual([]);
    await expect(
      searchProducts("x", { lang: "en", fetch: never, ...fresh() }),
    ).rejects.toMatchObject({ kind: "network" });
    const all = (r: () => Response) => databases({ off: r, obf: r, opff: r, opf: r }).f;
    await expect(
      searchProducts("x", { lang: "en", fetch: all(() => json({}, 503)), ...fresh() }),
    ).rejects.toMatchObject({ kind: "server" });
    const oneLimited = databases({
      off: () => json({}, 429),
      obf: () => json({}, 503),
      opff: () => json({}, 503),
      opf: () => json({}, 503),
    }).f;
    await expect(
      searchProducts("x", { lang: "en", fetch: oneLimited, ...fresh() }),
    ).rejects.toMatchObject({ kind: "rate-limit" });
    const spent = Object.fromEntries(
      Object.keys(HOSTS).map((k) => [k, new RateLimiter(0)]),
    ) as Limiters;
    await expect(
      searchProducts("x", { lang: "en", fetch: databases({}).f, limiters: spent }),
    ).rejects.toMatchObject({ kind: "rate-limit" });
  });
});
