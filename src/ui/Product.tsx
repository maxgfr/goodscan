/** One product: the score and why, the US or EU view first, "for you", then the details. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Alternative, findAlternatives, marketOf } from "../data/alternatives";
import type { CosmeticCategory } from "../data/cosmetics";
import { cacheProduct } from "../data/db";
import { ADD_PRODUCT_URL, DATABASES, productUrl } from "../data/off";
import {
  isCosmetic,
  isFood,
  type Nutriments,
  type Product as P,
  type Source,
} from "../data/product";
import type { MessageKey } from "../i18n";
import { rateIngredients } from "../score/cosmetic";
import { type Match, matchProduct } from "../score/match";
import { type Reason, type Score, scoreProduct, verdictOf } from "../score/score";
import { fopBox } from "../score/us";
import { Additives, nameOf } from "./Additives";
import { AiPanel, LabelReader, WebFinder, WebSources } from "./Ai";
import {
  GradeBadge,
  Icon,
  LEVEL_DOT,
  Notice,
  NovaBadge,
  RISK_TONE,
  ScoreDial,
  Section,
  VERDICT_TONE,
} from "./kit";
import { canGoBack, href } from "./router";
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

export function ProductPage({ code, db }: { code: string; db?: Source }) {
  const { t, lang, refreshHistory } = useApp();
  const onSaved = useCallback(() => void refreshHistory(), [refreshHistory]);
  const state = useProduct(code, lang, onSaved, db);
  const [fromLabel, setFromLabel] = useState<P | null>(null);

  const applyLabel = (p: P) => {
    setFromLabel(p);
    void remember(code, p).then(onSaved);
  };
  // Found on the web: kept like a database answer, so coming back costs no new search.
  const applyWeb = (p: P) => {
    applyLabel(p);
    void cacheProduct(code, lang, p).catch(() => undefined);
  };

  if (fromLabel) return <ProductView product={fromLabel} onLabel={applyLabel} />;

  switch (state.status) {
    case "loading":
      return (
        <div className="grid gap-4" role="status" aria-busy="true">
          <span className="sr-only">{t("lookupLoading")}</span>
          <div className="card grid gap-4" aria-hidden="true">
            <div className="flex gap-4">
              <div className="skeleton size-24 shrink-0 rounded-xl" />
              <div className="grid flex-1 content-start gap-2 pt-1">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="skeleton size-[132px] rounded-full" />
              <div className="skeleton h-7 w-28" />
            </div>
          </div>
          <div className="card skeleton h-24" aria-hidden="true" />
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
            <p className="mb-4 text-sm text-soft">{t("notFoundBody", { code })}</p>
            <div className="mb-4">
              <WebFinder code={code} onProduct={applyWeb} />
            </div>
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

/** Products of the same category that score better, from the precomputed lists. */
function BetterChoices({ product, score }: { product: P; score: number }) {
  const { t, lang, region } = useApp();
  const [found, setFound] = useState<{ category: string; items: Alternative[] } | null>(null);
  useEffect(() => {
    let live = true;
    setFound(null);
    void findAlternatives(product, score, marketOf(lang, region)).then((f) => {
      if (live) setFound(f);
    });
    return () => {
      live = false;
    };
  }, [product, score, lang, region]);
  if (!found) return null;
  const category = found.category.replace(/^\w\w:/, "").replace(/-/g, " ");
  return (
    <Section title={t("altTitle")}>
      <p className="-mt-2 mb-3 text-xs text-muted">{t("altSubtitle", { category })}</p>
      <ul className="grid gap-2" data-testid="alternatives">
        {found.items.map((a) => (
          <li key={a.code}>
            <a
              className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800"
              href={href({ name: "product", code: a.code })}
            >
              {a.image ? (
                <img
                  src={a.image}
                  crossOrigin="anonymous"
                  alt=""
                  loading="lazy"
                  className="size-11 shrink-0 rounded-lg bg-white object-contain ring-1 ring-stone-200 dark:ring-stone-800"
                />
              ) : (
                <span className="size-11 shrink-0 rounded-lg bg-stone-100 dark:bg-stone-800" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{a.name}</span>
                {a.brands ? (
                  <span className="block truncate text-xs text-muted">{a.brands}</span>
                ) : null}
              </span>
              <span
                className={`num shrink-0 rounded-full px-2 py-0.5 text-sm font-bold ${VERDICT_TONE[verdictOf(a.score)].text}`}
              >
                {a.score}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function BackLink() {
  const { t } = useApp();
  return (
    <a
      href={href({ name: "scan" })}
      // Back to the search results or the history the product was opened from.
      onClick={(e) => {
        if (!canGoBack()) return;
        e.preventDefault();
        history.back();
      }}
      className="-my-2 inline-flex w-fit items-center gap-1 py-2 text-sm text-muted hover:text-stone-900 dark:hover:text-white"
    >
      <Icon name="left" className="size-4" />
      {t("back")}
    </a>
  );
}

export function ProductView({
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
  // Food preferences say nothing about a cosmetic.
  const match = useMemo(
    () =>
      product.attributes.length && !isCosmetic(product) ? matchProduct(product, preferences) : null,
    [product, preferences],
  );
  const db = DATABASES.find((d) => d.source === product.source);
  const food = isFood(product);
  const cosmetic = isCosmetic(product);
  const needsLabel =
    !product.estimated &&
    ((food && (score.value === null || !score.nutri)) || (cosmetic && score.value === null));

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
              crossOrigin="anonymous"
              alt=""
              className="size-24 shrink-0 rounded-xl bg-white object-contain ring-1 ring-stone-200 dark:ring-stone-800"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight" data-testid="product-name">
              {product.name || product.code}
            </h1>
            <p className="text-sm text-muted">
              {[product.brands, product.quantity].filter(Boolean).join(" · ")}
            </p>
            <p className="num mt-1 text-xs text-muted">{product.code}</p>
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
                {product.webSources ? t("scoreFromWeb") : t("scoreEstimated")}
              </p>
            ) : null}
            {product.webSources ? <WebSources sources={product.webSources} /> : null}
            {cosmetic ? <p className="mt-1 text-sm text-muted">{t("cosmeticScore")}</p> : null}
            {!food && !cosmetic ? (
              <p className="mt-1 text-sm text-muted">{t("notFoodBody", { db: db?.name ?? "" })}</p>
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

        {!cosmetic ? <Allergens product={product} /> : null}

        {needsLabel ? (
          <div className="mt-4 border-t border-stone-200 pt-4 dark:border-stone-800">
            <LabelReader
              code={product.code}
              base={product}
              onProduct={onLabel}
              prompt={cosmetic ? t("aiInciMissing") : t("aiLabelMissing")}
            />
          </div>
        ) : null}
      </section>

      {score.value !== null && score.value < 75 && product.source !== "label" ? (
        <BetterChoices product={product} score={score.value} />
      ) : null}

      {/* What moves the score comes first, then the grades and the figures behind it. */}
      {cosmetic ? <Concerns score={score} /> : <Additives score={score} product={product} />}

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

      {food ? <NutritionTable n={product.nutriments} drink={product.isBeverage} /> : null}
      {cosmetic && product.ingredients ? (
        <IngredientLevels product={product} />
      ) : product.ingredients ? (
        <Section title={t("ingredientsTitle")}>
          <p className="text-sm leading-relaxed text-soft">{product.ingredients}</p>
        </Section>
      ) : null}

      <Section title={t("aiTitle")}>
        <p className="-mt-2 mb-3 text-xs text-muted">{t("aiSubtitle")}</p>
        <AiPanel product={product} score={score} match={match} />
      </Section>

      {product.source !== "label" && !product.webSources ? (
        <p className="text-center text-xs text-muted">
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
  const ingredient = reason.ingredient
    ? score.cosmetic?.find((f) => f.ingredient.id === reason.ingredient)?.ingredient
    : undefined;
  const text = t(`reason_${reason.key}` as MessageKey, {
    grade: reason.grade?.toUpperCase() ?? "",
    additive: a ? `${nameOf(a, lang)} (${a.code})` : "",
    ingredient: ingredient ? inciName(ingredient.inci) : "",
    count: reason.count ?? 0,
  });
  const delta = reason.delta;
  return (
    <li className="flex items-start justify-between gap-3 text-sm">
      <span>
        {text}
        {reason.cap !== undefined && reason.key !== "alcohol" ? (
          <span className="text-muted"> — {t("reasonCap", { cap: reason.cap })}</span>
        ) : null}
        {reason.source ? (
          <a
            className="-my-1 ml-0.5 inline-flex items-center p-1 align-middle text-muted"
            href={reason.source}
            target="_blank"
            rel="noreferrer"
            aria-label={t("reasonSource")}
          >
            <Icon name="external" className="size-3.5" />
          </a>
        ) : null}
      </span>
      {reason.base !== undefined ? (
        <span className="num shrink-0 font-semibold" data-testid="reason-base">
          {reason.base}
        </span>
      ) : delta ? (
        <span
          className={`num shrink-0 font-semibold ${delta > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}
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
      <div className="grid grid-cols-3 gap-3">
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

// Only what is high or medium takes a colour: a green "Low" under a "Bad" verdict reads as praise.
const LEVEL_TONE = {
  low: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-100",
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
        <span className="text-xs text-muted">
          {box.per === "serving"
            ? t(product.isBeverage ? "usServingMl" : "usServing", { g: Math.round(box.grams) })
            : t(product.isBeverage ? "usPer100Ml" : "usPer100")}
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
      <p className="mt-2 text-xs text-muted">{t("usNote")}</p>
    </Section>
  );
}

const MATCH_TONE: Record<Match["status"], string> = {
  very_good_match: "text-emerald-700 dark:text-emerald-400",
  good_match: "text-lime-700 dark:text-lime-400",
  poor_match: "text-amber-700 dark:text-amber-400",
  may_not_match: "text-amber-700 dark:text-amber-400",
  does_not_match: "text-rose-700 dark:text-rose-400",
  unknown_match: "text-muted",
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
          <span className="num ml-2 text-sm font-medium text-muted">{match.score} %</span>
        ) : null}
      </p>
      <p className="mb-2 text-xs text-muted">{t("matchSubtitle")}</p>
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
              <th scope="row" className="py-1.5 text-left font-normal text-soft">
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

const CATEGORY_KEY: Record<CosmeticCategory, MessageKey> = {
  "eu-prohibited": "cat_euProhibited",
  "eu-restricted": "cat_euRestricted",
  cmr: "cat_cmr",
  endocrine: "cat_endocrine",
  "fragrance-allergen": "cat_fragranceAllergen",
  pfas: "cat_pfas",
  "us-state-ban": "cat_usStateBan",
  suspected: "cat_suspected",
  sensitiser: "cat_sensitiser",
  "eu-listed": "cat_euListed",
  "under-review": "cat_underReview",
  "non-eu-ban": "cat_nonEuBan",
  "restricted-abroad": "cat_restrictedAbroad",
  "eu-annex-ii": "cat_euAnnexIi",
};
const CATEGORY_TONE: Record<CosmeticCategory, string> = {
  "eu-prohibited": RISK_TONE.high,
  cmr: RISK_TONE.high,
  endocrine: RISK_TONE.high,
  pfas: RISK_TONE.high,
  "us-state-ban": RISK_TONE.moderate,
  "eu-restricted": RISK_TONE.moderate,
  "fragrance-allergen": RISK_TONE.unknown,
  suspected: RISK_TONE.moderate,
  sensitiser: RISK_TONE.unknown,
  "eu-listed": RISK_TONE.unknown,
  "under-review": RISK_TONE.unknown,
  "non-eu-ban": RISK_TONE.high,
  "restricted-abroad": RISK_TONE.unknown,
  "eu-annex-ii": RISK_TONE.unknown,
};

// Same words and colours as the food additives: not being on a list is grey, not green.
const INCI_DOT = { ...LEVEL_DOT, none: "bg-stone-300 dark:bg-stone-600" };
const LEVEL_KEY = {
  high: "concern_high",
  moderate: "concern_moderate",
  low: "concern_low",
  none: "riskNotListed",
} as const;

/** The whole INCI list, each ingredient with the level of what is said about it. */
function IngredientLevels({ product }: { product: P }) {
  const { t } = useApp();
  const items = useMemo(() => rateIngredients(product), [product]);
  return (
    <Section title={t("ingredientsInci")}>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm" data-testid="inci">
        {items.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: items of one fixed list
          <li key={i} className="inline-flex items-center gap-1.5" title={t(LEVEL_KEY[item.level])}>
            <span
              className={`size-2 shrink-0 rounded-full ${INCI_DOT[item.level]}`}
              aria-hidden="true"
            />
            <span className={item.level === "none" ? "text-soft" : "font-medium"}>
              {item.label}
            </span>
            <span className="sr-only">({t(LEVEL_KEY[item.level])})</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
        {(["high", "moderate", "low", "none"] as const).map((l) => (
          <span key={l} className="inline-flex items-center gap-1">
            <span className={`size-2 rounded-full ${INCI_DOT[l]}`} aria-hidden="true" />
            {t(LEVEL_KEY[l])}
          </span>
        ))}
      </p>
    </Section>
  );
}

/** "BUTYLPHENYL METHYLPROPIONAL" as "Butylphenyl Methylpropional". */
const inciName = (inci: string) =>
  inci === inci.toUpperCase()
    ? inci
        .toLowerCase()
        .replace(/(^|[\s/(-])(\p{L})/gu, (_, sep: string, c: string) => sep + c.toUpperCase())
    : inci;

/** A cosmetic's ingredients of concern, each with its categories and sources. */
function Concerns({ score }: { score: Score }) {
  const { t, lang } = useApp();
  const l = lang === "fr" || lang === "de" ? lang : "en";
  const flags = score.cosmetic ?? [];
  if (score.value === null) return null;
  return (
    <Section title={t("concernTitle")}>
      {flags.length ? (
        // One folded row per ingredient, like the food additives: the categories say the
        // level at a glance, the explanation and its sources open on a tap.
        <ul className="divide-y divide-stone-100 dark:divide-stone-800" data-testid="concerns">
          {flags.map(({ ingredient: i }) => (
            <li key={i.id} className="text-sm">
              <details className="group py-2.5">
                <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{inciName(i.inci)}</span>
                    <span className="flex flex-wrap gap-1">
                      {i.categories.map((c) => (
                        <span
                          key={c}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_TONE[c]}`}
                        >
                          {t(CATEGORY_KEY[c])}
                        </span>
                      ))}
                    </span>
                  </span>
                  <Icon
                    name="right"
                    className="mt-0.5 size-4 shrink-0 text-muted transition-transform group-open:rotate-90 motion-reduce:transition-none"
                  />
                </summary>
                <div className="mt-2 grid gap-1">
                  <p className="text-soft">{i.summary[l]}</p>
                  <span className="flex flex-wrap gap-x-3 gap-y-1">
                    {i.sources.map((src) => (
                      <a
                        key={src.url}
                        className="inline-flex items-center gap-1 py-1 text-xs text-muted underline"
                        href={
                          src.doi
                            ? `https://doi.org/${src.doi}`
                            : src.pmid
                              ? `https://pubmed.ncbi.nlm.nih.gov/${src.pmid}/`
                              : src.url
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        {src.org}, {src.year}
                        <Icon name="external" className="size-3" />
                      </a>
                    ))}
                  </span>
                </div>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t("concernNone")}</p>
      )}
      <p className="mt-3 text-xs text-muted">{t("concernNote")}</p>
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
  // Open Food Facts' attribute titles are in the user's language, and say
  // "Contains: milk" or "May contain: nuts": the label is ours, the allergen theirs.
  const bare = (title: string) => title.replace(/^[^:：]{1,40}\s?[:：]\s*/, "");
  const contains = fromAttributes("contains").map((a) => bare(a.title));
  const traces = fromAttributes("traces").map((a) => bare(a.title));
  const list = contains.length ? contains : product.allergens.map(tagName);
  const traceList = traces.length ? traces : product.traces.map(tagName);
  return (
    <div
      className="mt-4 grid gap-1.5 border-t border-stone-200 pt-3 text-sm dark:border-stone-800"
      data-testid="allergens"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <h2 className="font-semibold">{t("allergensTitle")}</h2>
        {list.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {list.map((a) => (
              <li
                key={a}
                className="rounded-full bg-rose-50 px-2.5 py-0.5 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
              >
                {a}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-muted">{t("allergensNone")}</span>
        )}
      </div>
      {traceList.length ? (
        <p className="text-soft">
          <span className="font-medium">{t("traces")}: </span>
          {traceList.join(", ")}
        </p>
      ) : null}
    </div>
  );
}
