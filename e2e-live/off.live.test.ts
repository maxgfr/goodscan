/**
 * Against the real Open Food Facts (run by hand: bun run e2e-live). Checks
 * the sources still answer the way the app expects, for one product per
 * market, slowly enough for the API's rate limit.
 */
import { describe, expect, test } from "bun:test";
import { lookup, RateLimiter } from "../src/data/off";
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
});
