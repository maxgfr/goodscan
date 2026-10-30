/**
 * Builds public/alternatives/<market>/<shard>.json: for each taxonomy category
 * and market, the best products by goodscan's own score (50 and up), from the
 * full Open Food Facts and Open Beauty Facts exports, read as one stream.
 * Run at deploy time (the files are not committed); a few minutes, about
 * 1.5 GB downloaded. Data © Open Food Facts and Open Beauty Facts
 * contributors, ODbL.
 */
import { mkdir, rm } from "node:fs/promises";
import {
  type Alternative,
  MARKET_COUNTRY,
  MARKETS,
  type Market,
  SHARDS,
  type Shard,
  shardOf,
  TopK,
} from "../src/data/alternatives";
import { normalize, USER_AGENT } from "../src/data/off";
import type { Source } from "../src/data/product";
import { scoreProduct } from "../src/score/score";

const HEADERS = { "User-Agent": USER_AGENT };
const OUT = "public/alternatives";
/** Only products people actually scan, so suggestions are ones you can buy. */
const MIN_SCANS = Number(process.env.ALTERNATIVES_MIN_SCANS ?? 2);
const MIN_SCORE = 50;

/** Each category's depth in the taxonomy: 0 for a root. */
async function depths(url: string): Promise<Map<string, number>> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const taxonomy = (await res.json()) as Record<string, { parents?: string[] }>;
  const memo = new Map<string, number>();
  const depth = (tag: string, seen: Set<string>): number => {
    const known = memo.get(tag);
    if (known !== undefined) return known;
    const parents = (taxonomy[tag]?.parents ?? []).filter((p) => p in taxonomy && !seen.has(p));
    const d = parents.length
      ? 1 + Math.min(...parents.map((p) => depth(p, new Set([...seen, tag]))))
      : 0;
    memo.set(tag, d);
    return d;
  };
  for (const tag of Object.keys(taxonomy)) depth(tag, new Set());
  return memo;
}

const COLUMNS = [
  "code",
  "product_name",
  "brands",
  "categories_tags",
  "labels_tags",
  "countries_tags",
  "additives_tags",
  "ingredients_analysis_tags",
  "ingredients_text",
  "ingredients_tags",
  "nutriscore_grade",
  "nutriscore_score",
  "nova_group",
  "unique_scans_n",
  "image_small_url",
];

/** The lines of a gzipped, tab-separated export, with the columns used here. */
async function* rows(url: string): AsyncGenerator<Record<string, string>> {
  const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(`${url}: ${res.status}`);
  const text = res.body
    .pipeThrough(new DecompressionStream("gzip"))
    .pipeThrough(new TextDecoderStream());
  let header: [string, number][] | null = null;
  let rest = "";
  for await (const chunk of text) {
    const lines = (rest + chunk).split("\n");
    rest = lines.pop() ?? "";
    for (const line of lines) {
      const cells = line.split("\t");
      if (!header) {
        header = COLUMNS.map((c) => [c, cells.indexOf(c)]);
        continue;
      }
      const row: Record<string, string> = {};
      for (const [c, i] of header) if (i >= 0) row[c] = cells[i] ?? "";
      yield row;
    }
  }
}

const list = (s: string | undefined) => (s ? s.split(",").filter(Boolean) : []);

async function rank(
  source: Source,
  exportUrl: string,
  taxonomyUrl: string,
  top: TopK,
  depthOf: Map<string, number>,
): Promise<number> {
  const taxonomy = await depths(taxonomyUrl);
  for (const [k, v] of taxonomy) if (!depthOf.has(k)) depthOf.set(k, v);
  let seen = 0;
  let kept = 0;
  for await (const r of rows(exportUrl)) {
    seen++;
    if (seen % 500_000 === 0) console.log(`${source}: ${seen} read, ${kept} kept`);
    const name = r.product_name?.trim();
    if (!name || !r.code || Number(r.unique_scans_n || 0) < MIN_SCANS) continue;
    // Food needs its grade, its ingredients and its NOVA group: a product with none
    // analysed would score high on what is missing.
    if (
      source === "off" &&
      (!/^[a-e]$/.test(r.nutriscore_grade ?? "") ||
        !r.ingredients_text?.trim() ||
        !/^[1-4]$/.test(r.nova_group ?? ""))
    )
      continue;
    if (source === "obf" && !r.ingredients_text?.trim()) continue;
    // Most of the list must be recognised: one read in a language the parser knows
    // poorly misses its additives (a Norwegian Pepsi Max with only its caramel found).
    const parsed = list(r.ingredients_tags);
    if (!parsed.length || parsed.filter((t) => t.startsWith("en:")).length / parsed.length < 0.8)
      continue;
    const raw: Record<string, unknown> = {
      code: r.code,
      product_name: name,
      brands: r.brands,
      categories_tags: list(r.categories_tags),
      labels_tags: list(r.labels_tags),
      countries_tags: list(r.countries_tags),
      additives_tags: list(r.additives_tags),
      ingredients_analysis_tags: list(r.ingredients_analysis_tags),
      ingredients_text: r.ingredients_text,
      ingredients_tags: list(r.ingredients_tags),
      nutriscore_grade: r.nutriscore_grade,
      nutriscore_score: r.nutriscore_score,
      nova_group: r.nova_group,
    };
    const product = normalize(raw, source, "en");
    const score = scoreProduct(product).value;
    if (score === null || score < MIN_SCORE) continue;
    kept++;
    const brand = product.brands?.split(",")[0]?.trim().slice(0, 40);
    const item: Alternative & { scans: number } = {
      code: product.code,
      name: name.slice(0, 80),
      score,
      scans: Number(r.unique_scans_n || 0),
      ...(brand ? { brands: brand } : {}),
      ...(source === "obf" ? { source: "obf" as const } : {}),
      ...(r.image_small_url?.startsWith("https://images.open") ? { image: r.image_small_url } : {}),
    };
    const markets: Market[] = MARKETS.filter(
      (m) => m === "world" || product.countries.includes(MARKET_COUNTRY[m]),
    );
    for (const c of product.categories) {
      if (!taxonomy.has(c)) continue;
      for (const m of markets) top.add(`${m}|${c}`, item);
    }
  }
  console.log(`${source}: ${seen} read, ${kept} scored 50 or more`);
  return kept;
}

const top = new TopK();
const depthOf = new Map<string, number>();
await rank(
  "off",
  "https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz",
  "https://static.openfoodfacts.org/data/taxonomies/categories.json",
  top,
  depthOf,
);
await rank(
  "obf",
  "https://static.openbeautyfacts.org/data/en.openbeautyfacts.org.products.csv.gz",
  "https://static.openbeautyfacts.org/data/taxonomies/categories.json",
  top,
  depthOf,
);

await rm(OUT, { recursive: true, force: true });
let bytes = 0;
let categories = 0;
for (const market of MARKETS) {
  const shards: Shard[] = Array.from({ length: SHARDS }, () => ({}));
  for (const [key, items] of top.best) {
    const [m, category = ""] = key.split("|");
    if (m !== market) continue;
    categories++;
    (shards[shardOf(category)] as Shard)[category] = {
      d: depthOf.get(category) ?? 0,
      p: items.map(({ scans: _, ...a }) => a),
    };
  }
  await mkdir(`${OUT}/${market}`, { recursive: true });
  for (let n = 0; n < SHARDS; n++) {
    const json = JSON.stringify(shards[n]);
    bytes += json.length;
    await Bun.write(`${OUT}/${market}/${n}.json`, json);
  }
}
console.log(
  `${categories} category lists in ${MARKETS.length * SHARDS} files, ${(bytes / 1e6).toFixed(1)} MB`,
);
