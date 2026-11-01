/**
 * The official sources `bun run hazards`, `alternatives` and `attributes` read
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

  test("PubChem's synonyms turn a CID into its CAS number", async () => {
    const res = await fetch(
      "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/synonyms/JSON",
      {
        method: "POST",
        headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded" },
        body: "cid=6549",
      },
    );
    const body = (await res.json()) as {
      InformationList: { Information: { CID: number; Synonym?: string[] }[] };
    };
    const [linalool] = body.InformationList.Information;
    expect(linalool?.CID).toBe(6549);
    expect(linalool?.Synonym).toContain("78-70-6");
  }, 30_000);

  test("Wikidata gives the additives' CAS numbers, from the taxonomy's links", async () => {
    const taxonomy = (await (
      await fetch("https://static.openfoodfacts.org/data/taxonomies/additives.json", {
        headers: UA,
      })
    ).json()) as Record<string, { wikidata?: { en?: string } }>;
    const q = taxonomy["en:e951"]?.wikidata?.en;
    expect(q).toMatch(/^Q\d+$/);
    const query = `SELECT ?item ?cas WHERE { VALUES ?item { wd:${q} } ?item wdt:P231 ?cas }`;
    const res = await fetch(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`,
      { headers: { ...UA, Accept: "application/sparql-results+json" } },
    );
    const body = (await res.json()) as { results: { bindings: { cas: { value: string } }[] } };
    expect(body.results.bindings.map((b) => b.cas.value)).toContain("22839-47-0");
  }, 60_000);

  test("Open Food Facts' preference attributes and importance levels", async () => {
    const get = async (path: string) =>
      (await (
        await fetch(`https://world.openfoodfacts.org/api/v2/${path}?lc=fr`, { headers: UA })
      ).json()) as { id: string; name: string; attributes?: { id: string; name: string }[] }[];
    const groups = await get("attribute_groups");
    const ids = groups.flatMap((g) => (g.attributes ?? []).map((a) => a.id));
    for (const id of ["nutriscore", "nova", "additives", "allergens_no_gluten"])
      expect(ids).toContain(id);
    await Bun.sleep(5000);
    const levels = (await get("preferences")).map((p) => p.id);
    expect(levels).toEqual(["not_important", "important", "very_important", "mandatory"]);
  }, 60_000);

  test("the category taxonomies the better choices rank by carry their parents", async () => {
    for (const [url, tag, parent] of [
      [
        "https://static.openfoodfacts.org/data/taxonomies/categories.json",
        "en:breakfast-cereals",
        "en:breakfasts",
      ],
      [
        "https://static.openbeautyfacts.org/data/taxonomies/categories.json",
        "en:shampoos",
        "en:hair",
      ],
    ] as const) {
      const t = (await (await fetch(url, { headers: UA })).json()) as Record<
        string,
        { parents?: string[] }
      >;
      expect(t[tag]?.parents, url).toContain(parent);
      expect(Object.values(t).filter((e) => e.parents?.length).length, url).toBeGreaterThan(100);
    }
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
