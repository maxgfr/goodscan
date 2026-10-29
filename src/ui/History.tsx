/** Everything scanned on this device, newest first. */
import { clearHistory, type HistoryItem, removeHistory } from "../data/db";
import type { Verdict } from "../score/score";
import { Button, Icon, PageTitle, VERDICT_TONE } from "./kit";
import { href } from "./router";
import { useApp } from "./state";

export function HistoryList({
  items,
  editable = false,
}: {
  items: HistoryItem[];
  editable?: boolean;
}) {
  const { t, refreshHistory } = useApp();
  return (
    <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
      {items.map((item) => {
        const tone =
          VERDICT_TONE[
            (item.verdict as Verdict) in VERDICT_TONE ? (item.verdict as Verdict) : "unknown"
          ];
        return (
          <li key={item.code} className="flex items-center gap-3 px-3 py-2">
            <a
              href={href({ name: "product", code: item.code })}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="size-11 shrink-0 rounded-lg bg-stone-100 object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-stone-100 text-stone-400 dark:bg-stone-800">
                  <Icon name="scan" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.name || item.code}</span>
                <span className="block truncate text-xs text-stone-500">
                  {item.brands ?? item.code}
                </span>
              </span>
              <span className={`num flex items-center gap-1.5 text-sm font-semibold ${tone.text}`}>
                <span className={`size-2.5 rounded-full ${tone.bg}`} aria-hidden="true" />
                {item.score ?? "?"}
              </span>
            </a>
            {editable ? (
              <button
                type="button"
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-rose-600 dark:hover:bg-stone-800"
                aria-label={`${t("historyRemove")} ${item.name}`}
                onClick={async () => {
                  await removeHistory(item.code);
                  await refreshHistory();
                }}
              >
                <Icon name="trash" className="size-4" />
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function History() {
  const { t, history, refreshHistory } = useApp();
  return (
    <>
      <PageTitle title={t("historyTitle")} />
      {history.length ? (
        <>
          <HistoryList items={history} editable />
          <div className="mt-4">
            <Button
              variant="danger"
              icon="trash"
              onClick={async () => {
                await clearHistory();
                await refreshHistory();
              }}
            >
              {t("historyClear")}
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-stone-500">{t("historyEmpty")}</p>
      )}
    </>
  );
}
