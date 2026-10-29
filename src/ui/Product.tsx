/** One product: the score and why, the US or EU view first, "for you", then the details. */
import { useCallback, useMemo, useState } from "react";
import { ADD_PRODUCT_URL, DATABASES, productUrl } from "../data/off";
import { isFood, type Nutriments, type Product as P } from "../data/product";
import type { MessageKey } from "../i18n";
import { type Match, matchProduct } from "../score/match";
import { type Reason, type Score, scoreProduct } from "../score/score";
import { fopBox } from "../score/us";
import { AiPanel, LabelReader } from "./Ai";
import {
  GradeBadge,
  Icon,
  Notice,
  NovaBadge,
  ScoreDial,
  Section,
  Spinner,
  VERDICT_TONE,
} from "./kit";
import { href } from "./router";
import { useApp } from "./state";
import { remember, useProduct } from "./useProduct";

const VERDICT_KEY = {
  excellent: "verdictExcellent",
  good: "verdictGood",
  poor: "verdictPoor",
  bad: "verdictBad",
  unknown: "verdictUnknown",
  "not-food": "verdictNotFood",
} as const;

export function ProductPage({ code }: { code: string }) {
  const { t, lang, refreshHistory } = useApp();
  const onSaved = useCallback(() => void refreshHistory(), [refreshHistory]);
  const state = useProduct(code, lang, onSaved);
  const [fromLabel, setFromLabel] = useState<P | null>(null);

  const applyLabel = (p: P) => {
    setFromLabel(p);
    void remember(code, p).then(onSaved);
  };

  if (fromLabel) return <ProductView product={fromLabel} onLabel={applyLabel} />;

  switch (state.status) {
    case "loading":
      return (
        <div className="grid place-items-center gap-3 py-24 text-stone-500" role="status">
          <Spinner className="size-6" />
          {t("lookupLoading")}
        </div>
      );
    case "error": {
      const text =
        state.kind === "rate-limit"
          ? state.wait
            ? t("lookupWait", { s: state.wait })
            : t("lookupRateLimit")
          : state.kind === "server"
            ? t("lookupServer")
            : t("lookupNetwork");
      return (
        <div className="grid gap-4">
          <BackLink />
          <Notice tone="error">{text}</Notice>
        </div>
      );
    }
    case "missing":
      return (
        <div className="grid gap-4">
          <BackLink />
          <Section title={t("notFoundTitle")}>
            <p className="mb-4 text-sm text-stone-600 dark:text-stone-300">
              {t("notFoundBody", { code })}
            </p>
            <LabelReader code={code} onProduct={applyLabel} prompt={t("aiLabelBody")} />
            <a
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 underline dark:text-brand-400"
              href={`${ADD_PRODUCT_URL}?type=search_or_add&code=${code}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("notFoundAdd")}
              <Icon name="external" className="size-3.5" />
            </a>
          </Section>
        </div>
      );
    case "found":
      return <ProductView product={state.product} offline={state.offline} onLabel={applyLabel} />;
  }
}

function BackLink() {
  const { t } = useApp();
  return (
    <a
      href={href({ name: "scan" })}
      className="inline-flex w-fit items-center gap-1 text-sm text-stone-500 hover:text-stone-900 dark:hover:text-white"
    >
      <Icon name="left" className="size-4" />
      {t("back")}
    </a>
  );
}

function ProductView({
  product,
  offline = false,
  onLabel,
}: {
  product: P;
  offline?: boolean;
  onLabel: (p: P) => void;
}) {
  const { t, region, preferences } = useApp();
  const score = useMemo(() => scoreProduct(product), [product]);
  const match = useMemo(
    () => (product.attributes.length ? matchProduct(product, preferences) : null),
    [product, preferences],
  );
  const db = DATABASES.find((d) => d.source === product.source);
  const food = isFood(product);
  const needsLabel = food && !product.estimated && (score.value === null || !score.nutri);

  const us = food ? <UsBox product={product} /> : null;
  const badges = food ? <Badges product={product} score={score} /> : null;

  return (
    <div className="grid gap-4">
      <BackLink />
      {offline ? <Notice tone="warn">{t("lookupOffline")}</Notice> : null}

      <section className="card">
        <div className="flex gap-4">
          {product.image ? (
            <img
              src={product.image}
              alt=""
              className="size-24 shrink-0 rounded-xl bg-white object-contain ring-1 ring-stone-200 dark:ring-stone-800"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight" data-testid="product-name">
              {product.name || product.code}
            </h1>
            <p className="text-sm text-stone-500">
              {[product.brands, product.quantity].filter(Boolean).join(" · ")}
            </p>
            <p className="num mt-1 text-xs text-stone-400">{product.code}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-5">
          <ScoreDial
            value={score.value}
            verdict={score.verdict}
            label={t(VERDICT_KEY[score.verdict])}
          />
          <div className="min-w-0">
            <p
              className={`text-2xl font-bold ${VERDICT_TONE[score.verdict].text}`}
              data-testid="verdict"
            >
              {t(VERDICT_KEY[score.verdict])}
            </p>
            {product.estimated ? (
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                <Icon name="spark" className="size-3" />
                {t("scoreEstimated")}
              </p>
            ) : null}
            {!food ? (
              <p className="mt-1 text-sm text-stone-500">
                {t("notFoodBody", { db: db?.name ?? "" })}
              </p>
            ) : null}
          </div>
        </div>

        {score.reasons.length ? (
          <div className="mt-4">
            <h2 className="mb-2 text-sm font-semibold">{t("whyTitle")}</h2>
            <ul className="grid gap-1.5" data-testid="reasons">
              {score.reasons.map((r, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: reasons of one fixed score
                <ReasonLine key={i} reason={r} score={score} />
              ))}
            </ul>
          </div>
        ) : null}

        {needsLabel ? (
          <div className="mt-4 border-t border-stone-200 pt-4 dark:border-stone-800">
            <LabelReader
              code={product.code}
              base={product}
              onProduct={onLabel}
              prompt={t("aiLabelMissing")}
            />
          </div>
        ) : null}
      </section>

      {region === "us" ? (
        <>
          {us}
          {badges}
        </>
      ) : (
        <>
          {badges}
          {us}
        </>
      )}

      {match ? <MatchCard match={match} /> : null}

      <Section title={t("aiTitle")}>
        <p className="-mt-2 mb-3 text-xs text-stone-500">{t("aiSubtitle")}</p>
        <AiPanel product={product} score={score} match={match} />
      </Section>

      {food ? <NutritionTable n={product.nutriments} drink={product.isBeverage} /> : null}
      <Additives score={score} />
      <Allergens product={product} />
      {product.ingredients ? (
        <Section title={t("ingredientsTitle")}>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            {product.ingredients}
          </p>
        </Section>
      ) : null}

      {product.source !== "label" ? (
        <p className="text-center text-xs text-stone-500">
          {t("dataFrom", { db: db?.name ?? "Open Food Facts" })} ·{" "}
          <a className="underline" href={productUrl(product)} target="_blank" rel="noreferrer">
            {t("viewOn", { db: db?.name ?? "Open Food Facts" })}
          </a>
        </p>
      ) : null}
    </div>
  );
}

function ReasonLine({ reason, score }: { reason: Reason; score: Score }) {
  const { t, lang } = useApp();
  const a = reason.additive ? score.additives.find((x) => x.tag === reason.additive) : undefined;
  const text = t(`reason_${reason.key}` as MessageKey, {
    grade: reason.grade?.toUpperCase() ?? "",
    additive: a ? (a.names[lang] ?? a.names.en ?? a.code) : "",
  });
  const delta = reason.delta;
  return (
    <li className="flex items-start justify-between gap-3 text-sm">
      <span>
        {text}
        {reason.cap !== undefined && reason.key !== "alcohol" ? (
          <span className="text-stone-500"> — {t("reasonCap", { cap: reason.cap })}</span>
        ) : null}
      </span>
      {delta ? (
        <span
          className={`num shrink-0 font-semibold ${delta > 0 ? "text-emerald-600" : "text-rose-600"}`}
        >
          {delta > 0 ? `+${delta}` : `−${-delta}`}
        </span>
      ) : null}
    </li>
  );
}

function Badges({ product, score }: { product: P; score: Score }) {
  const { t } = useApp();
  return (
    <Section title={t("badgesTitle")}>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <GradeBadge
          grade={score.nutri?.grade ?? null}
          label={t("badgeNutri")}
          {...(score.nutri?.computed ? { note: t("badgeComputed") } : {})}
        />
        <NovaBadge group={product.nova} label={t("badgeNova")} />
        <GradeBadge grade={product.ecoscore ?? null} label={t("badgeGreen")} />
      </div>
    </Section>
  );
}

const LEVEL_TONE = {
  low: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  med: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  high: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
};

function UsBox({ product }: { product: P }) {
  const { t } = useApp();
  const box = fopBox(product);
  if (!box) return null;
  return (
    <Section
      title={t("usTitle")}
      aside={
        <span className="text-xs text-stone-500">
          {box.per === "serving" ? t("usServing", { g: Math.round(box.grams) }) : t("usPer100")}
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-2" data-testid="fop">
        {box.chips.map((c) => (
          <div key={c.nutrient} className={`rounded-xl p-2 text-center ${LEVEL_TONE[c.level]}`}>
            <div className="text-xs font-medium">{t(`nutrient_${c.nutrient}` as MessageKey)}</div>
            <div className="text-lg font-bold">{t(`level_${c.level}` as MessageKey)}</div>
            <div className="num text-xs">{c.dv} % DV</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-500">{t("usNote")}</p>
    </Section>
  );
}

const MATCH_TONE: Record<Match["status"], string> = {
  very_good_match: "text-emerald-700 dark:text-emerald-400",
  good_match: "text-lime-700 dark:text-lime-400",
  poor_match: "text-amber-700 dark:text-amber-400",
  may_not_match: "text-amber-700 dark:text-amber-400",
  does_not_match: "text-rose-700 dark:text-rose-400",
  unknown_match: "text-stone-500",
};

function MatchCard({ match }: { match: Match }) {
  const { t } = useApp();
  return (
    <Section
      title={t("matchTitle")}
      aside={
        <a
          className="text-xs font-semibold text-brand-700 underline dark:text-brand-400"
          href={href({ name: "settings" })}
        >
          {t("matchEdit")}
        </a>
      }
    >
      <p className={`text-lg font-bold ${MATCH_TONE[match.status]}`} data-testid="match">
        {t(`match_${match.status}` as MessageKey)}
        {match.score !== null &&
        match.status !== "does_not_match" &&
        match.status !== "unknown_match" ? (
          <span className="num ml-2 text-sm font-medium text-stone-500">{match.score} %</span>
        ) : null}
      </p>
      <p className="mb-2 text-xs text-stone-500">{t("matchSubtitle")}</p>
      {[
        ["matchFailed", match.failed, "text-rose-700 dark:text-rose-400"],
        ["matchDoubtful", match.doubtful, "text-amber-700 dark:text-amber-400"],
      ].map(([key, list, tone]) =>
        (list as Match["failed"]).length ? (
          <div key={key as string} className="mt-2">
            <p className={`text-xs font-semibold uppercase ${tone}`}>{t(key as MessageKey)}</p>
            <ul className="text-sm">
              {(list as Match["failed"]).map((a) => (
                <li key={a.id}>{a.title}</li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
    </Section>
  );
}

const ROWS: (keyof Nutriments)[] = [
  "energyKcal",
  "fat",
  "saturatedFat",
  "sugars",
  "addedSugars",
  "salt",
  "fiber",
  "proteins",
  "fruitsVeg",
];

function NutritionTable({ n, drink }: { n: Nutriments; drink: boolean }) {
  const { t, lang } = useApp();
  const rows = ROWS.filter((k) => n[k] !== undefined);
  if (!rows.length) return null;
  const fmt = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });
  return (
    <Section title={drink ? t("nutritionPer100ml") : t("nutritionTitle")}>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((k) => (
            <tr key={k} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
              <th
                scope="row"
                className="py-1.5 text-left font-normal text-stone-600 dark:text-stone-300"
              >
                {t(`n_${k}` as MessageKey)}
              </th>
              <td className="num py-1.5 text-right font-medium">
                {fmt.format(n[k] ?? 0)}{" "}
                {k === "energyKcal" ? "kcal" : k === "fruitsVeg" ? "%" : "g"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

const RISK_TONE = {
  high: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  moderate: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  none: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  unknown: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
};

function Additives({ score }: { score: Score }) {
  const { t, lang } = useApp();
  return (
    <Section title={t("additivesTitle")}>
      {score.additives.length ? (
        <ul className="grid gap-2" data-testid="additives">
          {score.additives.map((a) => {
            const risk = a.euNotAuthorised ? "high" : (a.risk ?? "unknown");
            return (
              <li key={a.tag} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{a.names[lang] ?? a.names.en ?? a.code}</span>
                <span className="flex flex-wrap gap-1">
                  {a.anses ? (
                    <span className="rounded-full px-2 py-0.5 text-xs text-stone-500 ring-1 ring-stone-300 dark:ring-stone-700">
                      {t("anses")}
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_TONE[risk]}`}
                  >
                    {a.euNotAuthorised ? t("euNotAuthorised") : t(`risk_${risk}` as MessageKey)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-stone-500">{t("additivesNone")}</p>
      )}
    </Section>
  );
}

const tagName = (tag: string) => tag.replace(/^\w\w:/, "").replace(/-/g, " ");

function Allergens({ product }: { product: P }) {
  const { t } = useApp();
  const fromAttributes = (prefix: string) =>
    product.attributes.filter(
      (a) =>
        a.id.startsWith("allergens_no_") &&
        a.status === "known" &&
        a.match !== undefined &&
        (prefix === "contains" ? a.match <= 10 : a.match > 10 && a.match <= 50),
    );
  // Open Food Facts' attribute titles are already in the user's language.
  const contains = fromAttributes("contains").map((a) => a.title);
  const traces = fromAttributes("traces").map((a) => a.title);
  const list = contains.length ? contains : product.allergens.map(tagName);
  const traceList = traces.length ? traces : product.traces.map(tagName);
  return (
    <Section title={t("allergensTitle")}>
      {list.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {list.map((a) => (
            <li
              key={a}
              className="rounded-full bg-rose-50 px-2.5 py-0.5 text-sm text-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
            >
              {a}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-stone-500">{t("allergensNone")}</p>
      )}
      {traceList.length ? (
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          <span className="font-medium">{t("traces")}: </span>
          {traceList.join(", ")}
        </p>
      ) : null}
    </Section>
  );
}
