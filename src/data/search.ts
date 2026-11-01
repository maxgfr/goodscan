/**
 * Search by product name, in the four databases the barcode lookup reads
 * (food, beauty, pet food, other products), through each one's full-text
 * search (/cgi/search.pl?json=1): CORS is open, no key. Search-a-licious
 * (search.openfoodfacts.org) only allows localhost in its CORS policy
 * (openfoodfacts/search-a-licious#427), and /api/v2/search has no full text.
 *
 * Each search asks every database at once and interleaves their answers, food
 * first; a database that fails leaves the others' results standing. Open Food
 * Facts sheds load with a quick 503 about half the time, without CORS headers
 * (so a failed request, to the page): it is asked again, twice at most, within
 * the 10 searches a minute it allows.
 */
import { DATABASES, RateLimiter } from "./off";
import { type Grade, isGrade, type Source } from "./product";

/** Per database and per page. */
export const PAGE_SIZE = 20;

export interface SearchHit {
  code: string;
  source: Source;
  name: string;
  brands?: string;
  quantity?: string;
  image?: string;
  nutriscore?: Grade;
  nova?: number;
}

export interface SearchPage {
  hits: SearchHit[];
  /** Matches in all the databases that answered. */
  count: number;
  page: number;
  /** Some database has a next page. */
  more: boolean;
  /** Matches per database that answered. */
  counts: Partial<Record<Source, number>>;
  /** The databases asked that did not answer. */
  failed: Source[];
}

export class SearchError extends Error {
  constructor(readonly kind: "rate-limit" | "network" | "server") {
    super(kind);
  }
}

/** Each database's own brake, under the 10 searches a minute allowed, retries counted. */
export type Limiters = Partial<Record<Source, RateLimiter>>;
export const searchLimiters = (): Limiters =>
  Object.fromEntries(DATABASES.map((d) => [d.source, new RateLimiter(10)]));
const LIMITERS = searchLimiters();

/** The waits before asking a shedding database again. */
export const RETRY_DELAYS = [600, 1500];

type Raw = Record<string, unknown>;
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

export function toHit(raw: Raw, lang: string, source: Source = "off"): SearchHit | null {
  const code = str(raw.code);
  if (!code || !/^\d{8,14}$/.test(code)) return null;
  const brands = Array.isArray(raw.brands)
    ? raw.brands.filter((b): b is string => typeof b === "string").join(", ")
    : str(raw.brands);
  const hit: SearchHit = {
    code,
    source,
    name: str(raw[`product_name_${lang}`]) ?? str(raw.product_name) ?? code,
  };
  if (brands) hit.brands = brands;
  const quantity = str(raw.quantity);
  if (quantity) hit.quantity = quantity;
  const image = str(raw.image_front_small_url) ?? str(raw.image_front_url);
  if (image) hit.image = image;
  // The other databases carry leftover food grades on cosmetics and the like.
  if (source === "off") {
    const grade = str(raw.nutriscore_grade);
    if (isGrade(grade)) hit.nutriscore = grade;
    if (typeof raw.nova_group === "number" && raw.nova_group >= 1 && raw.nova_group <= 4)
      hit.nova = raw.nova_group;
  }
  return hit;
}

export function searchUrl(host: string, q: string, lang: string, page: number): string {
  const params = new URLSearchParams({
    search_terms: q,
    json: "1",
    page: String(page),
    page_size: String(PAGE_SIZE),
    lc: lang,
    fields: [
      "code",
      "product_name",
      `product_name_${lang}`,
      "brands",
      "quantity",
      "image_front_small_url",
      "nutriscore_grade",
      "nova_group",
    ].join(","),
  });
  return `${host}/cgi/search.pl?${params}`;
}

export interface SearchOptions {
  lang: string;
  page?: number;
  /** The databases to ask: all by default, the ones with a next page for "more". */
  sources?: Source[];
  fetch?: typeof fetch;
  limiters?: Limiters;
  retryDelays?: number[];
  signal?: AbortSignal;
}

interface DbPage {
  source: Source;
  hits: SearchHit[];
  count: number;
  more: boolean;
}

const pause = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (!ms) return resolve();
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });

async function searchOne(
  { host, source }: { host: string; source: Source },
  q: string,
  page: number,
  opts: SearchOptions,
): Promise<DbPage> {
  const { lang, fetch: f = fetch, limiters = LIMITERS, retryDelays = RETRY_DELAYS, signal } = opts;
  const limiter = limiters[source];
  let res: Response | undefined;
  for (let attempt = 0; ; attempt++) {
    if (limiter && limiter.take() > 0) throw new SearchError("rate-limit");
    const delay = retryDelays[attempt];
    let failed = false;
    try {
      // No X-User-Agent here: a plain GET needs no preflight, and Open Food
      // Facts' shed responses (preflights included) carry no CORS headers.
      res = await f(searchUrl(host, q, lang, page), signal ? { signal } : {});
      failed = res.status === 503;
    } catch (err) {
      if (signal?.aborted) throw err;
      // A shed 503 without CORS headers reaches the page as a failed request.
      if (delay === undefined) throw new SearchError("network");
      failed = true;
    }
    if (!failed || delay === undefined) break;
    await pause(delay, signal);
    if (signal?.aborted) throw signal.reason;
  }
  if (!res) throw new SearchError("network");
  if (res.status === 429) throw new SearchError("rate-limit");
  if (!res.ok) throw new SearchError("server");
  let body: { products?: Raw[]; count?: number | string };
  try {
    body = (await res.json()) as typeof body;
  } catch {
    throw new SearchError("server");
  }
  const hits = (body.products ?? [])
    .map((p) => toHit(p, lang, source))
    .filter((h): h is SearchHit => h !== null);
  const count = Number(body.count) || hits.length;
  // page_count here is the products on this page, not the number of pages.
  return { source, hits, count, more: page * PAGE_SIZE < count };
}

/** One from each database in turn, food first, each product once. */
export function interleave(lists: SearchHit[][]): SearchHit[] {
  const out: SearchHit[] = [];
  const seen = new Set<string>();
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++)
    for (const list of lists) {
      const hit = list[i];
      if (hit && !seen.has(hit.code)) {
        seen.add(hit.code);
        out.push(hit);
      }
    }
  return out;
}

export async function searchProducts(q: string, opts: SearchOptions): Promise<SearchPage> {
  const { page = 1, sources, signal } = opts;
  const terms = q.trim();
  const empty: SearchPage = { hits: [], count: 0, page, more: false, counts: {}, failed: [] };
  const dbs = sources ? DATABASES.filter((d) => sources.includes(d.source)) : DATABASES;
  if (!terms || !dbs.length) return empty;
  const settled = await Promise.allSettled(dbs.map((db) => searchOne(db, terms, page, opts)));
  if (signal?.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");
  const pages = settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
  if (!pages.length) {
    const kinds = settled.map((s) =>
      s.status === "rejected" && s.reason instanceof SearchError ? s.reason.kind : "network",
    );
    throw new SearchError(
      kinds.includes("rate-limit") ? "rate-limit" : kinds.includes("server") ? "server" : "network",
    );
  }
  const counts: Partial<Record<Source, number>> = {};
  for (const p of pages) counts[p.source] = p.count;
  return {
    hits: interleave(pages.map((p) => p.hits)),
    count: pages.reduce((n, p) => n + p.count, 0),
    page,
    more: pages.some((p) => p.more),
    counts,
    failed: dbs.filter((_, i) => settled[i]?.status === "rejected").map((d) => d.source),
  };
}

/** The databases worth asking for the next page. */
export function withMore(page: SearchPage): Source[] {
  return (Object.entries(page.counts) as [Source, number][])
    .filter(([, count]) => page.page * PAGE_SIZE < count)
    .map(([source]) => source);
}
