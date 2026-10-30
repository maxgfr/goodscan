/**
 * Against the real Open Food Facts and Open Beauty Facts (run by hand: bun
 * run e2e-live). Checks the sources still answer the way the app expects, for
 * one product per market, slowly enough for the API's rate limit.
 */
import { describe, expect, test } from "bun:test";
import { lookup, RateLimiter } from "../src/data/off";
import { SEARCH_URL, searchProducts } from "../src/data/search";
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

  test("name search answers, and says whether this site may call it yet", async () => {
    const page = await searchProducts("nutella", { lang: "fr", limiter: new RateLimiter() });
    expect(page.count).toBeGreaterThan(10);
    expect(page.hits[0]?.code).toMatch(/^\d{8,14}$/);
    const res = await fetch(`${SEARCH_URL}?q=nutella&page_size=1&fields=code`, {
      headers: { Origin: "https://maxgfr.github.io" },
    });
    const cors = res.headers.get("access-control-allow-origin");
    // Informational: name search shows in the app once this is open (search-a-licious#427).
    console.log(`search CORS for maxgfr.github.io: ${cors ?? "closed"}`);
  }, 30_000);
});
