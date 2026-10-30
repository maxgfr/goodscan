/**
 * The official sources `bun run hazards` and `bun run alternatives` read
 * (run by hand: bun run e2e-live). Each still answers, in the shape the
 * scripts expect, so a change upstream shows here before it breaks a build.
 */
import { describe, expect, test } from "bun:test";
import { USER_AGENT } from "../src/data/off";

const UA = { "User-Agent": USER_AGENT };
const BROWSER = {
  "User-Agent": "Mozilla/5.0 (compatible; goodscan/1.0; +https://github.com/maxgfr/goodscan)",
};
const CAS = /\b\d{2,7}-\d{2}-\d\b/g;

describe("official sources, live", () => {
  test("IARC: the classification list ships with its page script", async () => {
    const js = await (
      await fetch("https://webapi.iarc.who.int/loc/loc.app.js", { headers: BROWSER })
    ).text();
    const groups = js.match(/group:"(1|2A|2B)",cas:\[/g) ?? [];
    expect(groups.length).toBeGreaterThan(300);
    expect(js).toContain('name:"Aspartame",group:"2B"');
  }, 30_000);

  test("PubChem relays the EU harmonised classification (CLP Annex VI)", async () => {
    const source = encodeURIComponent(
      "Regulation (EC) No 1272/2008 of the European Parliament and of the Council",
    );
    const res = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/annotations/heading/JSON?heading_type=Compound&heading=GHS%20Classification&source=${source}&page=1`,
      { headers: UA },
    );
    const body = (await res.json()) as {
      Annotations: { TotalPages: number; Annotation: unknown[] };
    };
    expect(body.Annotations.TotalPages).toBeGreaterThanOrEqual(3);
    expect(body.Annotations.Annotation.length).toBeGreaterThan(500);
  }, 30_000);

  test("edlists.org: the three EU endocrine-disruptor lists", async () => {
    for (const page of [
      "list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
      "list-ii-substances-under-eu-investigation-endocrine-disruption",
      "list-iii-substances-identified-as-endocrine-disruptors-by-participating-national-authorities",
    ]) {
      const html = await (
        await fetch(`https://edlists.org/the-ed-lists/${page}`, { headers: BROWSER })
      ).text();
      expect((html.match(CAS) ?? []).length, page).toBeGreaterThan(10);
      await Bun.sleep(500);
    }
  }, 60_000);

  test("Health Canada's Hotlist: the prohibited table first", async () => {
    const html = await (
      await fetch(
        "https://www.canada.ca/en/health-canada/services/consumer-product-safety/cosmetics/cosmetic-ingredient-hotlist-prohibited-restricted-ingredients/hotlist.html",
        { headers: BROWSER },
      )
    ).text();
    const [prohibited] = html.match(/<table[\s\S]*?<\/table>/g) ?? [];
    expect((prohibited?.match(CAS) ?? []).length).toBeGreaterThan(300);
    expect(html).toMatch(/Prohibited for Use in Cosmetic Products/);
  }, 30_000);

  test("the taxonomies carry what the scripts join on", async () => {
    const obf = (await (
      await fetch("https://static.openbeautyfacts.org/data/taxonomies/ingredients.json", {
        headers: UA,
      })
    ).json()) as Record<string, { cas?: { en?: string }; inci_restriction?: { en?: string } }>;
    expect(obf["en:linalool"]?.cas?.en).toBe("78-70-6");
    expect(obf["en:linalool"]?.inci_restriction?.en).toMatch(/^III\//);
  }, 60_000);

  test("the full exports answer, with the columns the better choices read", async () => {
    for (const url of [
      "https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz",
      "https://static.openbeautyfacts.org/data/en.openbeautyfacts.org.products.csv.gz",
    ]) {
      const res = await fetch(url, { headers: UA, redirect: "follow" });
      expect(res.ok, url).toBe(true);
      const reader = res.body
        ?.pipeThrough(new DecompressionStream("gzip"))
        .pipeThrough(new TextDecoderStream())
        .getReader();
      const first = (await reader?.read())?.value ?? "";
      await reader?.cancel();
      const header = first.split("\n")[0]?.split("\t") ?? [];
      for (const c of [
        "code",
        "product_name",
        "categories_tags",
        "countries_tags",
        "ingredients_tags",
        "unique_scans_n",
      ])
        expect(header, `${url} ${c}`).toContain(c);
    }
  }, 60_000);

  test("the deployed better-choice lists answer", async () => {
    const res = await fetch("https://maxgfr.github.io/goodscan/alternatives/fr/0.json");
    expect(res.ok).toBe(true);
    const shard = (await res.json()) as Record<
      string,
      { d: number; p: { code: string; score: number }[] }
    >;
    const lists = Object.values(shard);
    expect(lists.length).toBeGreaterThan(10);
    expect(lists.every((l) => l.p.every((a) => a.score >= 50))).toBe(true);
  }, 30_000);
});
