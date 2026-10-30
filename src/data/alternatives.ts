/**
 * Better choices in the same category, as Yuka suggests them. The Open Food
 * Facts search cannot be relied on from a page (it sheds load with a 503 most
 * of the time), so `bun run alternatives` ranks the whole database once, with
 * goodscan's own score, and the site serves the best products of each
 * category and market as static files: 64 shards per market, a category's
 * shard picked by a hash of its tag.
 */
import type { Lang, Region } from "../i18n";

export type Market = "fr" | "de" | "us" | "world";
export const MARKETS: Market[] = ["fr", "de", "us", "world"];
/** The country tag a market's products carry; the world takes them all. */
export const MARKET_COUNTRY: Record<Exclude<Market, "world">, string> = {
  fr: "en:france",
  de: "en:germany",
  us: "en:united-states",
};
export const SHARDS = 64;
/** Products kept per category: enough left once the one on screen and worse ones are set aside. */
export const PER_CATEGORY = 8;
const MIN_LIST = 3;

export interface Alternative {
  code: string;
  name: string;
  brands?: string;
  score: number;
  /** "obf" for a cosmetic. */
  source?: "obf";
  image?: string;
}

/** One category of a shard: its depth in the taxonomy (0 = a root) and its best products. */
export interface ShardEntry {
  d: number;
  p: Alternative[];
}
export type Shard = Record<string, ShardEntry>;

/** FNV-1a, so the script and the page agree on a category's shard. */
export function shardOf(category: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < category.length; i++) {
    h ^= category.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % SHARDS;
}

export function marketOf(lang: Lang, region: Region): Market {
  if (region === "us") return "us";
  return lang === "fr" ? "fr" : lang === "de" ? "de" : "world";
}

/** Keeps, for each key, the `limit` best items: highest score, then most scanned. */
export class TopK {
  readonly best = new Map<string, (Alternative & { scans: number })[]>();
  constructor(private readonly limit = PER_CATEGORY) {}

  add(key: string, item: Alternative & { scans: number }): void {
    const list = this.best.get(key) ?? [];
    // The same product under another barcode is no alternative to itself.
    if (list.some((x) => x.code === item.code || sameProduct(x, item))) return;
    list.push(item);
    list.sort((a, b) => b.score - a.score || b.scans - a.scans);
    if (list.length > this.limit) list.length = this.limit;
    this.best.set(key, list);
  }
}

const ident = (a: { name: string; brands?: string | undefined }) =>
  `${a.name}|${a.brands ?? ""}`.toLowerCase().replace(/[^a-z0-9|]+/g, "");
export const sameProduct = (
  a: { name: string; brands?: string | undefined },
  b: { name: string; brands?: string | undefined },
) => ident(a) === ident(b);

/**
 * The categories worth looking into for a product: its taxonomy categories,
 * most specific first, roots left out (they would suggest water for a spread).
 */
export function candidateCategories(categories: string[]): string[] {
  return [...categories].reverse().filter((c) => /^en:[a-z0-9-]+$/.test(c));
}

const cache = new Map<string, Promise<Shard | null>>();

async function shard(
  base: string,
  market: Market,
  n: number,
  f: typeof fetch,
): Promise<Shard | null> {
  const url = `${base}alternatives/${market}/${n}.json`;
  let p = cache.get(url);
  if (!p) {
    p = f(url)
      .then((r) => (r.ok ? (r.json() as Promise<Shard>) : null))
      .catch(() => null);
    cache.set(url, p);
  }
  return p;
}

/**
 * Better products than this one, from its most specific category that has
 * some (never a root); empty when there are none or the files are missing.
 */
export async function findAlternatives(
  product: { code: string; name: string; brands?: string | undefined; categories: string[] },
  score: number,
  market: Market,
  { base = import.meta.env.BASE_URL, fetch: f = fetch, max = 4 } = {},
): Promise<{ category: string; items: Alternative[] } | null> {
  const wanted = candidateCategories(product.categories).slice(0, 8);
  const markets: Market[] = market === "world" ? ["world"] : [market, "world"];
  const shards = new Map<string, Shard | null>();
  await Promise.all(
    markets.flatMap((m) =>
      [...new Set(wanted.map(shardOf))].map(async (n) => {
        shards.set(`${m}/${n}`, await shard(base, m, n, f));
      }),
    ),
  );
  // In the product's own order, most specific first: its depth alone would follow a
  // contributor's stray tag (Nutella filed under cocoa powders) too far. In each
  // category, the user's market first, then the world before a broader category.
  for (const category of wanted) {
    for (const m of markets) {
      const entry = shards.get(`${m}/${shardOf(category)}`)?.[category];
      // A category with fewer than three good products is where misfiled ones
      // (a hot sauce among spreads) would lead.
      if (!entry || entry.d === 0 || entry.p.length < MIN_LIST) continue;
      const items = entry.p
        .filter((a) => a.code !== product.code && a.score > score && !sameProduct(a, product))
        .slice(0, max);
      if (items.length) return { category, items };
    }
  }
  return null;
}
