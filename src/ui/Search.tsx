/** Name search results, page by page, each one opening the product. */
import { useEffect, useState } from "react";
import { SearchError, type SearchHit, searchProducts } from "../data/search";
import { Button, Icon, Notice, PageTitle } from "./kit";
import { href } from "./router";
import { useApp } from "./state";

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
      page: number;
      pageCount: number;
      more: boolean;
    }
  | { status: "error"; kind: SearchError["kind"] };

export function Search({ q }: { q: string }) {
  const { t, lang } = useApp();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    searchProducts(q, { lang, signal: ctrl.signal })
      .then((r) => setState({ status: "done", ...r, more: false }))
      .catch((err) => {
        if (!ctrl.signal.aborted)
          setState({ status: "error", kind: err instanceof SearchError ? err.kind : "network" });
      });
    return () => ctrl.abort();
  }, [q, lang]);

  async function more() {
    if (state.status !== "done") return;
    setState({ ...state, more: true });
    try {
      const next = await searchProducts(q, { lang, page: state.page + 1 });
      const seen = new Set(state.hits.map((h) => h.code));
      setState({
        status: "done",
        hits: [...state.hits, ...next.hits.filter((h) => !seen.has(h.code))],
        count: next.count,
        page: next.page,
        pageCount: next.pageCount,
        more: false,
      });
    } catch {
      setState({ ...state, more: false });
    }
  }

  const fmt = new Intl.NumberFormat(lang);

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
          {state.kind === "rate-limit" ? t("searchRateLimit") : t("searchError")}
        </Notice>
      ) : state.hits.length === 0 ? (
        <Notice>{t("searchNone", { q })}</Notice>
      ) : (
        <>
          <ul
            className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900"
            data-testid="search-results"
          >
            {state.hits.map((h) => (
              <li key={h.code}>
                <a
                  href={href({ name: "product", code: h.code })}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-stone-50 dark:hover:bg-stone-800/60"
                >
                  {h.image ? (
                    <img
                      src={h.image}
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
                    <span className="block truncate text-sm font-medium">{h.name}</span>
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
          {state.page < state.pageCount ? (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" busy={state.more} onClick={() => void more()}>
                {t("searchMore")}
              </Button>
            </div>
          ) : null}
          <p className="mt-4 text-center text-xs text-muted">
            {t("dataFrom", { db: "Open Food Facts" })}
          </p>
        </>
      )}
    </>
  );
}
