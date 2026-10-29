/**
 * Search by product name, through Open Food Facts' search service
 * (search-a-licious, search.openfoodfacts.org): the legacy full-text search
 * and /api/v2/search answer 503 to anonymous visitors.
 *
 * The deployed service only allows localhost in its CORS policy for now
 * (openfoodfacts/search-a-licious#427), so the app asks once whether it
 * answers from this page and shows name search only then: it turns on by
 * itself the day the policy opens. VITE_SEARCH_ENDPOINT points elsewhere
 * (a proxy) at build time.
 */
import { RateLimiter } from "./off";
import { type Grade, isGrade } from "./product";

export const SEARCH_URL: string =
  import.meta.env.VITE_SEARCH_ENDPOINT || "https://search.openfoodfacts.org/search";

export const PAGE_SIZE = 20;

export interface SearchHit {
  code: string;
  name: string;
  brands?: string;
  quantity?: string;
  image?: string;
  nutriscore?: Grade;
  nova?: number;
}

export interface SearchPage {
  hits: SearchHit[];
  count: number;
  page: number;
  pageCount: number;
}

export class SearchError extends Error {
  constructor(readonly kind: "rate-limit" | "network" | "server") {
    super(kind);
  }
}

export const searchLimiter = new RateLimiter(10);

type Raw = Record<string, unknown>;
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

export function toHit(raw: Raw, lang: string): SearchHit | null {
  const code = str(raw.code);
  if (!code || !/^\d{8,14}$/.test(code)) return null;
  const brands = Array.isArray(raw.brands)
    ? raw.brands.filter((b): b is string => typeof b === "string").join(", ")
    : str(raw.brands);
  const hit: SearchHit = {
    code,
    name: str(raw[`product_name_${lang}`]) ?? str(raw.product_name) ?? code,
  };
  if (brands) hit.brands = brands;
  const quantity = str(raw.quantity);
  if (quantity) hit.quantity = quantity;
  const image = str(raw.image_front_small_url) ?? str(raw.image_front_url);
  if (image) hit.image = image;
  const grade = str(raw.nutriscore_grade);
  if (isGrade(grade)) hit.nutriscore = grade;
  if (typeof raw.nova_group === "number" && raw.nova_group >= 1 && raw.nova_group <= 4)
    hit.nova = raw.nova_group;
  return hit;
}

function url(q: string, lang: string, page: number, size: number): string {
  const params = new URLSearchParams({
    q,
    langs: lang === "en" ? "en" : `${lang},en`,
    page: String(page),
    page_size: String(size),
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
  return `${SEARCH_URL}?${params}`;
}

export interface SearchOptions {
  lang: string;
  page?: number;
  fetch?: typeof fetch;
  limiter?: RateLimiter;
  signal?: AbortSignal;
}

export async function searchProducts(q: string, opts: SearchOptions): Promise<SearchPage> {
  const { lang, page = 1, fetch: f = fetch, limiter = searchLimiter, signal } = opts;
  const terms = q.trim();
  if (!terms) return { hits: [], count: 0, page: 1, pageCount: 0 };
  if (limiter.take() > 0) throw new SearchError("rate-limit");
  let res: Response;
  try {
    res = await f(url(terms, lang, page, PAGE_SIZE), signal ? { signal } : {});
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new SearchError("network");
  }
  if (res.status === 429) throw new SearchError("rate-limit");
  if (!res.ok) throw new SearchError("server");
  const body = (await res.json()) as {
    hits?: Raw[];
    count?: number;
    page?: number;
    page_count?: number;
  };
  const hits = (body.hits ?? [])
    .map((h) => toHit(h, lang))
    .filter((h): h is SearchHit => h !== null);
  return {
    hits,
    count: body.count ?? hits.length,
    page: body.page ?? page,
    pageCount: body.page_count ?? 1,
  };
}

const PROBE_KEY = "goodscan-search-available";

/**
 * Whether name search answers from this page: one small request, remembered
 * for the session (a "no" is asked again next session).
 */
export async function searchAvailable(
  f: typeof fetch = fetch,
  storage: Pick<Storage, "getItem" | "setItem"> | undefined = globalThis.sessionStorage,
  timeoutMs = 4000,
): Promise<boolean> {
  const known = storage?.getItem(PROBE_KEY);
  if (known === "1" || known === "0") return known === "1";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let ok = false;
  try {
    const res = await f(`${SEARCH_URL}?q=nutella&page_size=1&fields=code`, { signal: ctrl.signal });
    ok = res.ok && Array.isArray(((await res.json()) as { hits?: unknown }).hits);
  } catch {
    ok = false;
  } finally {
    clearTimeout(timer);
  }
  storage?.setItem(PROBE_KEY, ok ? "1" : "0");
  return ok;
}
