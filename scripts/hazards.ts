/**
 * Builds src/data/hazards.json: what official lists say about every food
 * additive and every cosmetic ingredient, joined by CAS number.
 *
 * - IARC Monographs classifications (groups 1, 2A, 2B), from the list the
 *   IARC site ships with its classification table.
 * - The EU harmonised classification (CLP, Regulation (EC) No 1272/2008,
 *   Annex VI) as relayed by PubChem, CC BY 4.0: carcinogenic, mutagenic or
 *   toxic for reproduction, and sensitisers.
 * - The EU endocrine-disruptor lists of edlists.org (lists I, II and III).
 * - Additives: the Open Food Facts taxonomy, CAS numbers through Wikidata.
 * - Cosmetics: the Open Beauty Facts ingredients taxonomy (CosIng data, ODbL),
 *   with each ingredient's CAS numbers and the annex of Regulation (EC)
 *   No 1223/2009 that restricts it; the prohibited ingredients of Health
 *   Canada's Cosmetic Ingredient Hotlist; the FDA's prohibited and
 *   restricted cosmetic ingredients.
 *
 * California's Proposition 65 list is not here: OEHHA serves it behind an
 * anti-bot wall, and no open mirror carries it.
 *
 * Only ingredients with at least one finding are kept.
 */

const UA = { "User-Agent": "goodscan/1.0 (https://github.com/maxgfr/goodscan)" };
const BROWSER = {
  "User-Agent": "Mozilla/5.0 (compatible; goodscan/1.0; +https://github.com/maxgfr/goodscan)",
};

async function get(url: string, init: RequestInit = {}): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: UA, ...init });
    if (res.ok) return res;
    if (attempt < 3 && (res.status === 429 || res.status >= 500)) {
      await Bun.sleep(2000 * (attempt + 1));
      continue;
    }
    throw new Error(`${url}: ${res.status}`);
  }
}

const CAS = /^\d{2,7}-\d{2}-\d$/;
/** A CAS number is only real when its check digit is right. */
export function validCas(cas: string): boolean {
  if (!CAS.test(cas)) return false;
  const digits = cas.replace(/-/g, "");
  const check = Number(digits.at(-1));
  const body = digits.slice(0, -1).split("").reverse();
  const sum = body.reduce((s, d, i) => s + Number(d) * (i + 1), 0);
  return sum % 10 === check;
}
const casList = (s: string | undefined) =>
  (s ?? "")
    .split(/[,;/\s]+/)
    .map((c) => c.trim())
    .filter(validCas);

// ---------------------------------------------------------------- IARC

type IarcGroup = "1" | "2A" | "2B";
interface Iarc {
  group: IarcGroup;
  agent: string;
  year?: number;
}

async function iarc(): Promise<Map<string, Iarc>> {
  const js = await (
    await get("https://webapi.iarc.who.int/loc/loc.app.js", { headers: BROWSER })
  ).text();
  const out = new Map<string, Iarc>();
  const re = /\{name:"((?:[^"\\]|\\.)*)",group:"(1|2A|2B|3)",cas:\[([^\]]*)\]([^{}]*)\}/g;
  for (const m of js.matchAll(re)) {
    const [, name = "", group, cas = "", rest = ""] = m;
    if (group === "3") continue;
    // Classifications tied to drinking, breathing dust at work or a drug regimen
    // say nothing about the substance in food additives or cosmetics.
    if (CONTEXT.test(name)) continue;
    const year = Number(/yeareval:(\d{4})/.exec(rest)?.[1]) || undefined;
    const agent = name.replace(/\\"/g, '"').replace(/<[^>]+>/g, "");
    for (const c of [...cas.matchAll(/"([^"]+)"/g)].map((x) => x[1] ?? "")) {
      if (!validCas(c)) continue;
      const prev = out.get(c);
      // The strongest classification wins when one CAS sits under several agents.
      if (!prev || rank(group as IarcGroup) > rank(prev.group))
        out.set(c, { group: group as IarcGroup, agent, ...(year ? { year } : {}) });
    }
  }
  if (out.size < 300) throw new Error(`IARC: only ${out.size} CAS numbers, the page changed`);
  return out;
}
const CONTEXT =
  /alcoholic beverages|occupational exposure|\bdust\b|plus ultraviolet|in combination with/i;
const rank = (g: IarcGroup) => ({ "1": 3, "2A": 2, "2B": 1 })[g];

// ---------------------------------------------------------------- CLP (Annex VI)

/** The hazard codes kept: CMR and sensitisers. */
const KEPT = /^H(3[45][01]|350i|36[012][FfDd]{0,2}|317|334)$/;
interface Clp {
  /** Annex VI index number. */
  index: string;
  codes: string[];
}

async function clp(): Promise<Map<string, Clp>> {
  const source = encodeURIComponent(
    "Regulation (EC) No 1272/2008 of the European Parliament and of the Council",
  );
  const byCid = new Map<number, Clp>();
  for (let page = 1; ; page++) {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/annotations/heading/JSON?heading_type=Compound&heading=GHS%20Classification&source=${source}&page=${page}`;
    const body = (await (await get(url)).json()) as {
      Annotations: {
        TotalPages: number;
        Annotation: {
          SourceID: string;
          LinkedRecords?: { CID?: number[] };
          Data: { Name: string; Value: { StringWithMarkup?: { String: string }[] } }[];
        }[];
      };
    };
    for (const a of body.Annotations.Annotation) {
      const statements = a.Data.find((d) => d.Name === "GHS Hazard Statements");
      const codes = [
        ...new Set(
          (statements?.Value.StringWithMarkup ?? [])
            .map((s) => /^(H\d{3}[A-Za-z]{0,2})/.exec(s.String)?.[1] ?? "")
            .filter((c) => KEPT.test(c)),
        ),
      ];
      if (!codes.length) continue;
      for (const cid of a.LinkedRecords?.CID ?? []) {
        const prev = byCid.get(cid);
        byCid.set(cid, {
          index: prev?.index ?? a.SourceID,
          codes: [...new Set([...(prev?.codes ?? []), ...codes])].sort(),
        });
      }
    }
    await Bun.sleep(400);
    if (page >= body.Annotations.TotalPages) break;
  }
  // CIDs to CAS numbers, through PubChem's synonyms, a few hundred at a time.
  const out = new Map<string, Clp>();
  const cids = [...byCid.keys()];
  for (let i = 0; i < cids.length; i += 300) {
    const batch = cids.slice(i, i + 300);
    const res = await get("https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/synonyms/JSON", {
      method: "POST",
      headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: `cid=${batch.join(",")}`,
    });
    const body = (await res.json()) as {
      InformationList: { Information: { CID: number; Synonym?: string[] }[] };
    };
    for (const info of body.InformationList.Information) {
      const entry = byCid.get(info.CID);
      if (!entry) continue;
      // Only the first CAS number, the compound's own: later synonyms can carry a
      // polymer's or a mixture's (N-vinylpyrrolidone lists polyvinylpolypyrrolidone).
      const cas = (info.Synonym ?? []).find(validCas);
      if (cas && !out.has(cas)) out.set(cas, entry);
    }
    await Bun.sleep(400);
  }
  if (out.size < 300) throw new Error(`CLP: only ${out.size} CAS numbers, the source changed`);
  return out;
}

// ---------------------------------------------------------------- EU endocrine-disruptor lists

type EdList = "I" | "II" | "III";
const ED_PAGES: Record<EdList, string> = {
  I: "list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
  II: "list-ii-substances-under-eu-investigation-endocrine-disruption",
  III: "list-iii-substances-identified-as-endocrine-disruptors-by-participating-national-authorities",
};

async function edLists(): Promise<Map<string, EdList>> {
  const out = new Map<string, EdList>();
  for (const list of ["I", "II", "III"] as const) {
    const html = await (
      await get(`https://edlists.org/the-ed-lists/${ED_PAGES[list]}`, { headers: BROWSER })
    ).text();
    let n = 0;
    for (const row of html.split(/<tr[\s>]/).slice(1)) {
      for (const c of row.match(/\b\d{2,7}-\d{2}-\d\b/g) ?? []) {
        if (!validCas(c)) continue;
        n++;
        // List I outranks the others.
        if (!out.has(c) || list === "I") out.set(c, list);
      }
    }
    if (n < 10) throw new Error(`ED list ${list}: only ${n} CAS numbers, the page changed`);
    await Bun.sleep(500);
  }
  return out;
}

// ---------------------------------------------------------------- Health Canada, Cosmetic Ingredient Hotlist

type Listed = "P" | "R";
const HOTLIST =
  "https://www.canada.ca/en/health-canada/services/consumer-product-safety/cosmetics/cosmetic-ingredient-hotlist-prohibited-restricted-ingredients/hotlist.html";

/**
 * Prohibited in Canadian cosmetics, by CAS number: the CAS column of the
 * prohibited table only. The restricted table is left out: its conditions are
 * mostly concentrations, labels and impurities (glycerin is there for its
 * diethylene glycol), which would flag ordinary ingredients.
 */
async function hotlist(): Promise<Map<string, Listed>> {
  const html = await (await get(HOTLIST, { headers: BROWSER })).text();
  const [prohibited] = html.match(/<table[\s\S]*?<\/table>/g) ?? [];
  if (!prohibited) throw new Error("Hotlist: the page changed");
  const out = new Map<string, Listed>();
  for (const row of prohibited.split(/<tr[\s>]/).slice(1)) {
    const casCell = /<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/.exec(row)?.[1] ?? "";
    for (const c of casCell.match(/\b\d{2,7}-\d{2}-\d\b/g) ?? []) if (validCas(c)) out.set(c, "P");
  }
  if (out.size < 300) throw new Error(`Hotlist: only ${out.size} prohibited CAS numbers`);
  return out;
}

// ---------------------------------------------------------------- FDA, prohibited and restricted cosmetic ingredients

/**
 * 21 CFR 700 and 250.250, as the FDA lists them ("Prohibited & Restricted
 * Ingredients in Cosmetics", content current as of 2022-02-25); only those with
 * a CAS number (zirconium complexes and cattle materials have none).
 */
const FDA: Record<string, [Listed, string]> = {
  "97-18-7": ["P", "700.11"], // bithionol
  "75-69-4": ["P", "700.23"], // chlorofluorocarbon propellants: CFC-11,
  "75-71-8": ["P", "700.23"], // CFC-12,
  "76-13-1": ["P", "700.23"], // CFC-113,
  "76-14-2": ["P", "700.23"], // CFC-114
  "67-66-3": ["P", "700.18"], // chloroform
  "87-12-7": ["P", "700.15"], // halogenated salicylanilides: dibromsalan,
  "87-10-5": ["P", "700.15"], // tribromsalan,
  "2577-72-2": ["P", "700.15"], // metabromsalan,
  "1154-59-2": ["P", "700.15"], // tetrachlorosalicylanilide
  "75-09-2": ["P", "700.19"], // methylene chloride
  "75-01-4": ["P", "700.14"], // vinyl chloride
  "70-30-4": ["R", "250.250"], // hexachlorophene
  "7439-97-6": ["R", "700.13"], // mercury and its compounds: mercury,
  "54-64-8": ["R", "700.13"], // thimerosal,
  "62-38-4": ["R", "700.13"], // phenylmercuric acetate,
  "55-68-5": ["R", "700.13"], // phenylmercuric nitrate
};

// ---------------------------------------------------------------- additives (CAS through Wikidata)

interface TaxonomyEntry {
  name?: Record<string, string>;
  wikidata?: { en?: string };
  cas?: { en?: string };
  cosing?: { en?: string };
  inci_restriction?: { en?: string };
}

/** Colour index names CosIng gives no CAS number for. */
const CI_CAS: Record<string, string> = { "en:ci-77891": "13463-67-7" };

async function additiveCas(
  taxonomy: Record<string, TaxonomyEntry>,
): Promise<Map<string, string[]>> {
  const byQ = new Map<string, string>();
  for (const [tag, e] of Object.entries(taxonomy)) {
    const q = e.wikidata?.en;
    if (/^en:e\d/.test(tag) && q && /^Q\d+$/.test(q)) byQ.set(q, tag);
  }
  const out = new Map<string, string[]>();
  const qs = [...byQ.keys()];
  for (let i = 0; i < qs.length; i += 200) {
    const values = qs
      .slice(i, i + 200)
      .map((q) => `wd:${q}`)
      .join(" ");
    const query = `SELECT ?item ?cas WHERE { VALUES ?item { ${values} } ?item wdt:P231 ?cas }`;
    const res = await get(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`,
      { headers: { ...UA, Accept: "application/sparql-results+json" } },
    );
    const body = (await res.json()) as {
      results: { bindings: { item: { value: string }; cas: { value: string } }[] };
    };
    for (const b of body.results.bindings) {
      const tag = byQ.get(b.item.value.split("/").at(-1) ?? "");
      if (!tag || !validCas(b.cas.value)) continue;
      out.set(tag, [...(out.get(tag) ?? []), b.cas.value]);
    }
    await Bun.sleep(1000);
  }
  return out;
}

// ---------------------------------------------------------------- build

/** One ingredient's findings, compact. */
export interface HazardRecord {
  /** IARC group and the year it was evaluated. */
  i?: [IarcGroup, number?];
  /** CLP Annex VI: index number and the hazard codes kept. */
  c?: [string, string[]];
  /** EU endocrine-disruptor list. */
  e?: EdList;
  /** Cosmetics Regulation annex and entry, e.g. "III/107". */
  a?: string;
  /** The INCI name, for matching a list read as text (cosmetics). */
  n?: string;
  /** CosIng id, for the link. */
  k?: string;
  /** Health Canada's Hotlist: prohibited or restricted. */
  h?: Listed;
  /** FDA: prohibited or restricted, and the CFR section. */
  f?: [Listed, string];
}

function findings(
  cas: string[],
  sources: { iarc: Map<string, Iarc>; clp: Map<string, Clp>; ed: Map<string, EdList> },
): HazardRecord {
  const r: HazardRecord = {};
  for (const c of cas) {
    const i = sources.iarc.get(c);
    if (i && (!r.i || rank(i.group) > rank(r.i[0]))) r.i = i.year ? [i.group, i.year] : [i.group];
    const l = sources.clp.get(c);
    if (l) r.c = r.c ? [r.c[0], [...new Set([...r.c[1], ...l.codes])].sort()] : [l.index, l.codes];
    const e = sources.ed.get(c);
    if (e && (!r.e || e === "I")) r.e = e;
  }
  return r;
}

const [iarcMap, clpMap, edMap] = [await iarc(), await clp(), await edLists()];
console.log(`IARC ${iarcMap.size} CAS · CLP ${clpMap.size} CAS · ED lists ${edMap.size} CAS`);
const sources = { iarc: iarcMap, clp: clpMap, ed: edMap };
const hotlistMap = await hotlist();
console.log(`Health Canada Hotlist ${hotlistMap.size} CAS · FDA ${Object.keys(FDA).length} CAS`);

const offTaxonomy = (await (
  await get("https://static.openfoodfacts.org/data/taxonomies/additives.json")
).json()) as Record<string, TaxonomyEntry>;
const additiveCasMap = await additiveCas(offTaxonomy);
const additives: Record<string, HazardRecord> = {};
for (const [tag, cas] of additiveCasMap) {
  const r = findings(cas, sources);
  if (Object.keys(r).length) additives[tag] = r;
}

const obfTaxonomy = (await (
  await get("https://static.openbeautyfacts.org/data/taxonomies/ingredients.json")
).json()) as Record<string, TaxonomyEntry>;
const cosmetics: Record<string, HazardRecord> = {};
for (const [tag, e] of Object.entries(obfTaxonomy)) {
  const cas = casList(e.cas?.en);
  const alias = CI_CAS[tag];
  if (alias) cas.push(alias);
  const r = findings(cas, sources);
  for (const c of cas) {
    const h = hotlistMap.get(c);
    if (h && r.h !== "P") r.h = h;
    const f = FDA[c];
    if (f && r.f?.[0] !== "P") r.f = f;
  }
  // Annexes II (prohibited), III (restricted), V (preservatives) and VI (UV filters);
  // IV only lists the colourants allowed.
  const annex = /^(II|III|V|VI)\/\S+/.exec(e.inci_restriction?.en ?? "")?.[0];
  if (annex) r.a = annex;
  if (!Object.keys(r).length) continue;
  // Only the INCI name: the taxonomy's translations hold the odd non-name.
  const inci = e.name?.en?.trim();
  if (inci) r.n = inci;
  const cosing = e.cosing?.en;
  if (cosing && /^\d+$/.test(cosing)) r.k = cosing;
  cosmetics[tag] = r;
}

const sort = <T>(o: Record<string, T>) =>
  Object.fromEntries(
    Object.entries(o).sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true })),
  );
await Bun.write(
  "src/data/hazards.json",
  `${JSON.stringify({ date: new Date().toISOString().slice(0, 10), additives: sort(additives), cosmetics: sort(cosmetics) })}\n`,
);
const count = (o: Record<string, HazardRecord>, k: keyof HazardRecord) =>
  Object.values(o).filter((r) => r[k] !== undefined).length;
console.log(
  `additives: ${Object.keys(additives).length} with findings (${additiveCasMap.size} with a CAS) — IARC ${count(additives, "i")}, CLP ${count(additives, "c")}, ED ${count(additives, "e")}`,
);
console.log(
  `cosmetics: ${Object.keys(cosmetics).length} with findings — IARC ${count(cosmetics, "i")}, CLP ${count(cosmetics, "c")}, ED ${count(cosmetics, "e")}, annexes ${count(cosmetics, "a")}, Canada ${count(cosmetics, "h")}, FDA ${count(cosmetics, "f")}`,
);
