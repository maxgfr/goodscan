/**
 * The Open Food Facts family of databases (food, beauty, pet food, other
 * products), read straight from the browser: CORS is open, no key. Their rules
 * ask apps to say who they are (X-User-Agent, since a page cannot set
 * User-Agent) and to stay under 15 product reads a minute per IP.
 */
import { lookupCodes } from "./barcode";
import {
  type Attribute,
  type Grade,
  isGrade,
  type Nutriments,
  type Product,
  type Source,
} from "./product";

export const DATABASES: { source: Source; host: string; name: string }[] = [
  { source: "off", host: "https://world.openfoodfacts.org", name: "Open Food Facts" },
  { source: "obf", host: "https://world.openbeautyfacts.org", name: "Open Beauty Facts" },
  { source: "opff", host: "https://world.openpetfoodfacts.org", name: "Open Pet Food Facts" },
  { source: "opf", host: "https://world.openproductsfacts.org", name: "Open Products Facts" },
];

export const USER_AGENT = "goodscan/1.0 (https://github.com/maxgfr/goodscan)";

const FIELDS = [
  "code",
  "product_name",
  "generic_name",
  "brands",
  "quantity",
  "image_front_url",
  "image_url",
  "countries_tags",
  "categories_tags",
  "labels_tags",
  "additives_tags",
  "allergens_tags",
  "traces_tags",
  "ingredients_analysis_tags",
  "ingredients_text",
  "nutriments",
  "serving_quantity",
  "serving_size",
  "nutriscore_grade",
  "nutriscore_score",
  "nutriscore_data",
  "nova_group",
  "ecoscore_grade",
  "environmental_score_grade",
  "misc_tags",
  "lang",
  "attribute_groups",
];

/** The product's name and ingredients in the user's language come as their own fields. */
export function fieldsFor(lang: string): string {
  return [...FIELDS, `product_name_${lang}`, `ingredients_text_${lang}`].join(",");
}

export class LookupError extends Error {
  constructor(
    readonly kind: "rate-limit" | "network" | "server",
    message: string,
  ) {
    super(message);
  }
}

/** The client-side brake: a little under the 15 a minute the API allows. */
export class RateLimiter {
  private times: number[] = [];
  constructor(
    private readonly max = 12,
    private readonly windowMs = 60_000,
    private readonly now: () => number = Date.now,
  ) {}

  /** Seconds to wait before the next request, 0 if it can go now (and is counted). */
  take(): number {
    const t = this.now();
    this.times = this.times.filter((x) => t - x < this.windowMs);
    if (this.times.length >= this.max) {
      const oldest = this.times[0] ?? t;
      return Math.ceil((this.windowMs - (t - oldest)) / 1000);
    }
    this.times.push(t);
    return 0;
  }
}

export const limiter = new RateLimiter();

type Raw = Record<string, unknown>;

const num = (v: unknown): number | undefined => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
};
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;
const tags = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((t): t is string => typeof t === "string") : [];

function nutriments(raw: unknown): Nutriments {
  const n = (raw ?? {}) as Raw;
  const g = (k: string) => num(n[`${k}_100g`]);
  const kcal = g("energy-kcal");
  const kj = g("energy-kj") ?? g("energy") ?? (kcal !== undefined ? kcal * 4.184 : undefined);
  const salt = g("salt") ?? (g("sodium") !== undefined ? (g("sodium") ?? 0) * 2.5 : undefined);
  const all: Record<keyof Nutriments, number | undefined> = {
    energyKj: kj,
    energyKcal: kcal ?? (kj !== undefined ? kj / 4.184 : undefined),
    fat: g("fat"),
    saturatedFat: g("saturated-fat"),
    sugars: g("sugars"),
    addedSugars: g("added-sugars"),
    salt,
    fiber: g("fiber"),
    proteins: g("proteins"),
    fruitsVeg:
      g("fruits-vegetables-legumes-estimate-from-ingredients") ??
      g("fruits-vegetables-nuts-estimate-from-ingredients") ??
      g("fruits-vegetables-nuts"),
  };
  const out: Nutriments = {};
  for (const [k, v] of Object.entries(all) as [keyof Nutriments, number | undefined][]) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export const SWEETENERS = new Set([
  "en:e950",
  "en:e951",
  "en:e952",
  "en:e954",
  "en:e955",
  "en:e957",
  "en:e959",
  "en:e960",
  "en:e960a",
  "en:e961",
  "en:e962",
  "en:e969",
]);

/**
 * Open Food Facts' own attributes (the ones its apps match against your
 * preferences), computed server-side and titled in the language asked for.
 */
function attributes(raw: unknown): Attribute[] {
  if (!Array.isArray(raw)) return [];
  const out: Attribute[] = [];
  for (const group of raw as Raw[]) {
    if (!Array.isArray(group.attributes)) continue;
    for (const a of group.attributes as Raw[]) {
      const id = str(a.id);
      if (!id) continue;
      const attr: Attribute = {
        id,
        group: str(group.id) ?? "",
        status: a.status === "known" ? "known" : "unknown",
        title: str(a.title) ?? str(a.name) ?? id,
      };
      const match = num(a.match);
      if (match !== undefined) attr.match = match;
      const short = str(a.description_short);
      if (short) attr.description = short;
      out.push(attr);
    }
  }
  return out;
}

/** The API's product object, made into ours. */
export function normalize(raw: Raw, source: Source, lang: string): Product {
  const grade = str(raw.nutriscore_grade);
  const data = (raw.nutriscore_data ?? {}) as Raw;
  const categories = tags(raw.categories_tags);
  const additives = tags(raw.additives_tags);
  const misc = tags(raw.misc_tags);
  const nova = num(raw.nova_group);
  const eco = str(raw.environmental_score_grade) ?? str(raw.ecoscore_grade);
  const isWater =
    data.is_water === 1 ||
    categories.some((c) => /^en:(.*-)?waters?$/.test(c) && !/flavou?red/.test(c));
  const isBeverage =
    data.is_beverage === 1 ||
    (data.is_beverage === undefined && categories.includes("en:beverages"));
  const image = str(raw.image_front_url) ?? str(raw.image_url);
  const serving = num(raw.serving_quantity);
  const product: Product = {
    code: String(raw.code ?? ""),
    source,
    name: str(raw[`product_name_${lang}`]) ?? str(raw.product_name) ?? str(raw.generic_name) ?? "",
    countries: tags(raw.countries_tags),
    categories,
    labels: tags(raw.labels_tags),
    additives,
    allergens: tags(raw.allergens_tags),
    traces: tags(raw.traces_tags),
    analysis: tags(raw.ingredients_analysis_tags),
    nutriments: nutriments(raw.nutriments),
    isBeverage,
    isWater,
    nutriscoreNotApplicable:
      grade === "not-applicable" || misc.includes("en:nutriscore-not-applicable"),
    sweeteners: additives.some((a) => SWEETENERS.has(a)),
    attributes: attributes(raw.attribute_groups),
  };
  const brands = str(raw.brands);
  if (brands) product.brands = brands;
  const quantity = str(raw.quantity);
  if (quantity) product.quantity = quantity;
  if (image) product.image = image;
  const ingredients = str(raw[`ingredients_text_${lang}`]) ?? str(raw.ingredients_text);
  if (ingredients) product.ingredients = ingredients;
  if (serving && serving > 0) product.servingGrams = serving;
  const servingSize = str(raw.serving_size);
  if (servingSize) product.servingSize = servingSize;
  if (isGrade(grade)) {
    const score = num(raw.nutriscore_score);
    product.nutriscore = score === undefined ? { grade } : { grade, score };
  }
  if (nova === 1 || nova === 2 || nova === 3 || nova === 4) product.nova = nova;
  if (isGrade(eco)) product.ecoscore = eco as Grade;
  return product;
}

export interface LookupOptions {
  lang: string;
  fetch?: typeof fetch;
  limiter?: RateLimiter;
  signal?: AbortSignal;
}

/** One product read: the product, null if this database does not know it. */
async function read(
  host: string,
  code: string,
  { lang, fetch: f = fetch, limiter: l = limiter, signal }: LookupOptions,
): Promise<Raw | null> {
  const wait = l.take();
  if (wait > 0) {
    throw new LookupError("rate-limit", `Too many lookups: wait ${wait} s.`);
  }
  let res: Response;
  try {
    res = await f(`${host}/api/v3/product/${code}?fields=${fieldsFor(lang)}&lc=${lang}`, {
      headers: { "X-User-Agent": USER_AGENT },
      ...(signal ? { signal } : {}),
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    // A 429 page comes without CORS headers: the browser only says the request failed.
    throw new LookupError("network", "The database could not be reached.");
  }
  if (res.status === 429) throw new LookupError("rate-limit", "The database asks to slow down.");
  if (res.status === 404) return null;
  if (!res.ok) throw new LookupError("server", `The database answered ${res.status}.`);
  const body = (await res.json()) as { status?: string; product?: Raw };
  return body.status === "success" || body.status === "success_with_warnings"
    ? (body.product ?? null)
    : null;
}

/**
 * Finds a barcode: in Open Food Facts first (every code form), then in the
 * other databases with the code as scanned. Null when none knows it.
 */
export async function lookup(rawCode: string, opts: LookupOptions): Promise<Product | null> {
  const codes = lookupCodes(rawCode);
  const [first] = codes;
  if (!first) return null;
  const [off, ...others] = DATABASES;
  if (!off) return null;
  for (const code of codes) {
    const raw = await read(off.host, code, opts);
    if (raw) return normalize(raw, off.source, opts.lang);
  }
  for (const db of others) {
    const raw = await read(db.host, first, opts);
    if (raw) return normalize(raw, db.source, opts.lang);
  }
  return null;
}

export function productUrl(p: Pick<Product, "code" | "source">): string {
  const db = DATABASES.find((d) => d.source === p.source) ?? DATABASES[0];
  return `${db?.host}/product/${p.code}`;
}

export const ADD_PRODUCT_URL = "https://world.openfoodfacts.org/cgi/product.pl";
