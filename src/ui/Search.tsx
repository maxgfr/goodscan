/** Name search results, page by page, each one opening the product. */
import { useEffect, useState } from "react";
import { cacheProduct } from "../data/db";
import { DATABASES } from "../data/off";
import type { Product, Source } from "../data/product";
import { SearchError, type SearchHit, searchProducts, withMore } from "../data/search";
import { WebFinder } from "./Ai";
import { Button, Icon, Notice, PageTitle } from "./kit";
import { ProductView } from "./Product";
import { go, href } from "./router";
import { useApp } from "./state";

const KIND = { obf: "searchKindObf", opff: "searchKindOpff", opf: "searchKindOpf" } as const;

const GRADE_TONE: Record<string, string> = {
  a: "bg-emerald-700 text-white",
  b: "bg-lime-600 text-white",
  c: "bg-yellow-400 text-stone-900",
  d: "bg-orange-500 text-white",
  e: "bg-rose-600 text-white",
};

type State =
  | { status: "loading" }
  | {
      status: "done";
      hits: SearchHit[];
      count: number;
      counts: Partial<Record<Source, number>>;
      page: number;
      /** The databases with a next page. */
      next: Source[];
      /** The databases that did not answer. */
      failed: Source[];
      more: boolean;
    }
  | { status: "error"; kind: SearchError["kind"] };

const names = (sources: Source[]) =>
  DATABASES.filter((d) => sources.includes(d.source))
    .map((d) => d.name)
    .join(", ");

export function Search({ q }: { q: string }) {
  const { t, lang, settings } = useApp();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [fromWeb, setFromWeb] = useState<Product | null>(null);

  /** Found on the web: with a barcode it opens like any product (kept, so no new search). */
  async function webProduct(p: Product) {
    if (!p.code) return setFromWeb(p);
    await cacheProduct(p.code, lang, p).catch(() => undefined);
    go({ name: "product", code: p.code });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new attempt asks again
  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    searchProducts(q, { lang, signal: ctrl.signal })
      .then((r) =>
        setState({
          status: "done",
          hits: r.hits,
          count: r.count,
          counts: r.counts,
          page: r.page,
          next: withMore(r),
          failed: r.failed,
          more: false,
        }),
      )
      .catch((err) => {
        if (!ctrl.signal.aborted)
          setState({ status: "error", kind: err instanceof SearchError ? err.kind : "network" });
      });
    return () => ctrl.abort();
  }, [q, lang, attempt]);

  const retry = (
    <button
      type="button"
      className="ml-1 font-semibold underline"
      onClick={() => setAttempt((n) => n + 1)}
    >
      {t("aiRetry")}
    </button>
  );

  async function more() {
    if (state.status !== "done") return;
    setState({ ...state, more: true });
    try {
      const next = await searchProducts(q, {
        lang,
        page: state.page + 1,
        sources: state.next,
      });
      const seen = new Set(state.hits.map((h) => h.code));
      setState({
        ...state,
        hits: [...state.hits, ...next.hits.filter((h) => !seen.has(h.code))],
        page: next.page,
        next: withMore(next),
        more: false,
      });
    } catch {
      setState({ ...state, more: false });
    }
  }

  const fmt = new Intl.NumberFormat(lang);
  const web = (
    <section className="card mt-4 grid gap-2" aria-labelledby="web-search">
      <h2 id="web-search" className="text-sm font-semibold">
        {t("aiWebTitle")}
      </h2>
      <WebFinder name={q} onProduct={(p) => void webProduct(p)} />
    </section>
  );

  if (fromWeb) return <ProductView product={fromWeb} onLabel={setFromWeb} />;

  return (
    <>
      <a
        href={href({ name: "scan" })}
        className="mb-3 inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-stone-900 dark:hover:text-white"
      >
        <Icon name="left" className="size-4" />
        {t("back")}
      </a>
      <PageTitle
        title={t("searchTitle", { q })}
        subtitle={
          state.status === "done" && state.count
            ? t("searchCount", { count: fmt.format(state.count) })
            : undefined
        }
      />

      {state.status === "loading" ? (
        <ul className="grid gap-2" aria-busy="true" aria-label={t("lookupLoading")}>
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="card flex items-center gap-3 p-3" aria-hidden="true">
              <div className="skeleton size-12 shrink-0" />
              <div className="grid flex-1 gap-2">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      ) : state.status === "error" ? (
        <Notice tone="error">
          {state.kind === "rate-limit" ? t("searchRateLimit") : t("searchError")} {retry}
        </Notice>
      ) : state.hits.length === 0 && !state.failed.length ? (
        <>
          <Notice>{t("searchNone", { q })}</Notice>
          {settings ? web : null}
        </>
      ) : (
        <>
          {state.failed.length ? (
            <div className="mb-3">
              <Notice tone="warn">
                {t("searchPartial", { db: names(state.failed) })} {retry}
              </Notice>
            </div>
          ) : null}
          <ul
            hidden={!state.hits.length}
            className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900"
            data-testid="search-results"
          >
            {state.hits.map((h) => (
              <li key={h.code}>
                <a
                  href={href({ name: "product", code: h.code, db: h.source })}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-stone-50 dark:hover:bg-stone-800/60"
                >
                  {h.image ? (
                    <img
                      src={h.image}
                      crossOrigin="anonymous"
                      alt=""
                      loading="lazy"
                      className="size-12 shrink-0 rounded-lg bg-white object-contain ring-1 ring-stone-200 dark:ring-stone-800"
                    />
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-stone-100 text-muted dark:bg-stone-800">
                      <Icon name="scan" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{h.name}</span>
                      {h.source !== "off" && h.source !== "label" ? (
                        <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold tracking-wide text-muted uppercase dark:bg-stone-800">
                          {t(KIND[h.source])}
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {[h.brands, h.quantity].filter(Boolean).join(" · ") || h.code}
                    </span>
                  </span>
                  {h.nutriscore ? (
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-md text-sm font-bold uppercase ${GRADE_TONE[h.nutriscore]}`}
                      title={`Nutri-Score ${h.nutriscore.toUpperCase()}`}
                    >
                      {h.nutriscore}
                    </span>
                  ) : null}
                  <Icon name="right" className="size-4 shrink-0 text-muted" />
                </a>
              </li>
            ))}
          </ul>
          {state.next.length ? (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" busy={state.more} onClick={() => void more()}>
                {t("searchMore")}
              </Button>
            </div>
          ) : null}
          {settings ? web : null}
          <p className="mt-4 text-center text-xs text-muted">
            {t("dataFrom", {
              db: names(Object.keys(state.counts) as Source[]),
            })}
          </p>
        </>
      )}
    </>
  );
}
