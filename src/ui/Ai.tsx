/** The optional AI: explain, answer, read a label. Hidden behind "connect a model" until there is one. */
import { useState } from "react";
import { AiError, type Answer } from "../ai/call";
import { preparePhoto } from "../ai/image";
import {
  explainProduct,
  findOnline,
  productFacts,
  productFromCosmeticLabel,
  productFromLabel,
  productFromOnline,
  readCosmeticLabel,
  readLabel,
} from "../ai/product";
import { isCosmetic, type Product } from "../data/product";
import type { Match } from "../score/match";
import type { Score } from "../score/score";
import { Button, Icon, Notice } from "./kit";
import { href } from "./router";
import { useApp } from "./state";

function message(err: unknown): string {
  if (err instanceof AiError) return err.message;
  return err instanceof Error ? err.message : String(err);
}

/** A file input styled as a button, for the label photo. */
function PhotoButton({
  label,
  busy,
  onFile,
}: {
  label: string;
  busy: boolean;
  onFile: (f: File) => void;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-500 dark:bg-brand-500 dark:text-stone-950 ${busy ? "pointer-events-none opacity-60" : ""}`}
    >
      <Icon name="camera" className="size-4" />
      {label}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

export function LabelReader({
  code,
  base,
  onProduct,
  prompt,
}: {
  code: string;
  base?: Product;
  onProduct: (p: Product) => void;
  prompt: string;
}) {
  const { t, settings, lang } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A cosmetic's photo is its ingredient list, read into the same product.
  const cosmetic = base && isCosmetic(base) ? base : null;
  if (!settings) {
    return (
      <p className="text-sm text-soft">
        {t("aiConnectBody")}{" "}
        <a
          className="font-semibold text-brand-700 underline dark:text-brand-400"
          href={href({ name: "settings" })}
        >
          {t("aiConnect")}
        </a>
      </p>
    );
  }
  return (
    <div className="grid gap-2">
      <p className="text-sm text-soft">{prompt}</p>
      <div>
        <PhotoButton
          label={busy ? t("aiReading") : cosmetic ? t("aiInci") : t("aiLabel")}
          busy={busy}
          onFile={async (file) => {
            setBusy(true);
            setError(null);
            try {
              const image = await preparePhoto(file);
              onProduct(
                cosmetic
                  ? productFromCosmeticLabel(await readCosmeticLabel({ settings }, image), cosmetic)
                  : productFromLabel(await readLabel({ settings }, image, lang), code, base),
              );
            } catch (err) {
              setError(t("aiError", { message: message(err) }));
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}

/** The pages a web search read, as links. */
export function WebSources({ sources }: { sources: { url: string; title?: string }[] }) {
  const { t } = useApp();
  if (!sources.length) return null;
  return (
    <div className="mt-2 text-xs text-muted" data-testid="web-sources">
      <p className="font-semibold">{t("aiWebSources")}</p>
      <ul className="mt-1 grid gap-0.5">
        {sources.map((s) => (
          <li key={s.url} className="truncate">
            <a className="underline" href={s.url} target="_blank" rel="noreferrer">
              {s.title || new URL(s.url).host}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A product no database knows, looked up on the web by the connected model
 * (on a tap: it spends the user's tokens and searches).
 */
export function WebFinder({
  code = "",
  name,
  onProduct,
}: {
  code?: string;
  name?: string;
  onProduct: (p: Product) => void;
}) {
  const { t, settings, lang, webSearch } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  if (!settings || webSearch === null) return null;
  if (!webSearch) {
    return (
      <p className="text-sm text-soft">
        {t("aiWebUnavailable")}{" "}
        <a
          className="font-semibold text-brand-700 underline dark:text-brand-400"
          href={href({ name: "settings" })}
        >
          {t("navSettings")}
        </a>
      </p>
    );
  }
  return (
    <div className="grid gap-2">
      <p className="text-sm text-soft">{t("aiWebBody")}</p>
      <div>
        <Button
          icon="spark"
          busy={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            setMissing(false);
            try {
              const found = productFromOnline(
                await findOnline(
                  { settings },
                  { ...(code ? { code } : {}), ...(name ? { name } : {}) },
                  lang,
                ),
                code,
              );
              if (found) onProduct(found);
              else setMissing(true);
            } catch (err) {
              setError(t("aiError", { message: message(err) }));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? t("aiWebSearching") : t("aiWebSearch")}
        </Button>
      </div>
      {missing ? <Notice tone="warn">{t("aiWebNone")}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}

const WEB_KEY = "goodscan-ai-web-search";

export function AiPanel({
  product,
  score,
  match,
}: {
  product: Product;
  score: Score;
  match: Match | null;
}) {
  const { t, settings, lang, webSearch } = useApp();
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [web, setWeb] = useState(() => localStorage.getItem(WEB_KEY) === "1");
  const searchable = webSearch === true;

  async function ask(q?: string) {
    if (!settings) return;
    setBusy(true);
    setError(null);
    try {
      setAnswer(
        await explainProduct(
          { settings },
          productFacts(product, score, match),
          lang,
          q,
          isCosmetic(product),
          web && searchable,
        ),
      );
    } catch (err) {
      setError(t("aiError", { message: message(err) }));
    } finally {
      setBusy(false);
    }
  }

  if (!settings) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-soft">{t("aiConnectBody")}</p>
        <a
          href={href({ name: "settings" })}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          <Icon name="spark" className="size-4" />
          {t("aiConnect")}
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button icon="spark" busy={busy && !question} onClick={() => void ask()}>
          {t("aiExplain")}
        </Button>
        {searchable ? (
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-soft">
            <input
              type="checkbox"
              className="size-4 accent-brand-700"
              checked={web}
              onChange={(e) => {
                setWeb(e.target.checked);
                localStorage.setItem(WEB_KEY, e.target.checked ? "1" : "0");
              }}
            />
            {t("aiWebMode")}
          </label>
        ) : null}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) void ask(question);
        }}
      >
        <label className="sr-only" htmlFor="ask">
          {t("aiAsk")}
        </label>
        <input
          id="ask"
          className="input"
          placeholder={t("aiAskPlaceholder")}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button
          type="submit"
          variant="secondary"
          icon="send"
          busy={busy && Boolean(question)}
          disabled={!question.trim()}
        >
          {t("aiSend")}
        </Button>
      </form>
      {busy ? (
        <p className="text-sm text-muted" role="status">
          {t("aiThinking")}
        </p>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {answer ? (
        <div
          className="rounded-xl bg-stone-50 p-3 text-sm leading-relaxed dark:bg-stone-800/60"
          data-testid="ai-answer"
        >
          {answer.text
            .split("\n")
            .filter(Boolean)
            .map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: lines of one fixed answer
              <p key={i} className={line.startsWith("- ") ? "pl-3 -indent-3" : "mb-1"}>
                {line.startsWith("- ") ? `• ${line.slice(2)}` : line}
              </p>
            ))}
          <WebSources sources={answer.sources} />
          <p className="mt-2 text-xs text-muted">{t("aiDisclaimer")}</p>
        </div>
      ) : null}
    </div>
  );
}
