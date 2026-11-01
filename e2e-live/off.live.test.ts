/**
 * Against the real Open Food, Beauty, Pet Food and Products Facts (run by
 * hand: bun run e2e-live). Checks the sources still answer the way the app
 * expects, for one product per market, slowly enough for the API's rate limit.
 */
import { describe, expect, test } from "bun:test";
import { DATABASES, lookup, RateLimiter } from "../src/data/off";
import { searchProducts, searchUrl } from "../src/data/search";
import { scoreProduct } from "../src/score/score";

const CASES = [
  { code: "049000028911", lang: "en", market: "US, UPC-A", name: /coke/i },
  { code: "0016000275287", lang: "en", market: "US", brand: /cheerios/i },
  { code: "3017620422003", lang: "fr", market: "France", name: /nutella/i },
  { code: "4008400402222", lang: "de", market: "Germany", name: /nutella/i },
  { code: "4000417025005", lang: "de", market: "Germany", name: /marzipan/i },
];

const limiter = new RateLimiter(10);

describe("Open Food Facts, live", () => {
  for (const c of CASES) {
    test(`${c.market}: ${c.code}`, async () => {
      const p = await lookup(c.code, { lang: c.lang, limiter });
      expect(p).not.toBeNull();
      if (!p) return;
      if (c.name) expect(p.name).toMatch(c.name);
      if (c.brand) expect(p.brands ?? "").toMatch(c.brand);
      expect(p.attributes.length).toBeGreaterThan(5);
      const score = scoreProduct(p);
      expect(score.verdict).not.toBe("not-food");
      console.log(`${c.market} ${c.code} ${p.name}: ${score.value} ${score.verdict}`);
      await Bun.sleep(4500);
    }, 30_000);
  }

  const COSMETICS = [
    { code: "3600540539397", lang: "fr", market: "France", brand: /garnier/i },
    { code: "4005900964441", lang: "de", market: "Germany", brand: /nivea/i },
    { code: "0037000123439", lang: "en", market: "US", name: /secret/i },
  ];
  // Each one is read in Open Food Facts first, then Open Beauty Facts: two or three reads.
  const cosmeticLimiter = new RateLimiter(10);
  for (const c of COSMETICS) {
    test(`Open Beauty Facts, ${c.market}: ${c.code}`, async () => {
      const p = await lookup(c.code, { lang: c.lang, limiter: cosmeticLimiter });
      expect(p?.source).toBe("obf");
      if (!p) return;
      if (c.name) expect(p.name).toMatch(c.name);
      if (c.brand) expect(p.brands ?? "").toMatch(c.brand);
      expect(p.ingredients?.length).toBeGreaterThan(50);
      expect(p.ingredientTags?.length).toBeGreaterThan(5);
      const score = scoreProduct(p);
      expect(score.value).toBeGreaterThan(0);
      expect(score.cosmetic?.length).toBeGreaterThan(0);
      console.log(`${c.market} ${c.code} ${p.name}: ${score.value} ${score.verdict}`);
      await Bun.sleep(20_000);
    }, 60_000);
  }

  test("an unknown barcode is null, not an error", async () => {
    expect(await lookup("8899999999998", { lang: "en", limiter })).toBeNull();
  }, 60_000);

  test("the additives taxonomy still carries EFSA risks", async () => {
    const res = await fetch("https://static.openfoodfacts.org/data/taxonomies/additives.json");
    const t = (await res.json()) as Record<
      string,
      { efsa_evaluation_overexposure_risk?: { en: string } }
    >;
    expect(t["en:e250"]?.efsa_evaluation_overexposure_risk?.en).toBe("en:high");
  }, 30_000);

  test("Open Pet Food Facts and Open Products Facts answer by barcode", async () => {
    const pet = await lookup("3065890153707", { lang: "fr", prefer: "opff", limiter });
    expect(pet?.source).toBe("opff");
    expect(pet?.brands ?? "").toMatch(/whiskas/i);
    const thing = await lookup("0190199222984", { lang: "en", prefer: "opf", limiter });
    expect(thing?.source).toBe("opf");
    expect(thing?.name).toMatch(/iphone/i);
  }, 30_000);

  test("name search: every database answers, and lets this site call it", async () => {
    for (const [db, q] of [
      ["off", "nutella"],
      ["obf", "nivea"],
      ["opff", "whiskas"],
      ["opf", "iphone"],
    ] as const) {
      const page = await searchProducts(q, {
        lang: "fr",
        sources: [db],
      });
      expect(page.counts[db], db).toBeGreaterThan(10);
      expect(page.hits[0]?.source).toBe(db);
      const host = DATABASES.find((d) => d.source === db)?.host ?? "";
      const res = await fetch(searchUrl(host, q, "en", 1), {
        headers: { Origin: "https://maxgfr.github.io" },
      });
      expect(res.headers.get("access-control-allow-origin"), db).toBe("*");
      await Bun.sleep(1000);
    }
  }, 90_000);
});
