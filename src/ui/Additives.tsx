/**
 * A food's additives, worst first: each with what it does, how worrying it is
 * and why in plain words, then the cited science and, on a tap, the AI.
 */
import classDescriptions from "../data/additiveClasses.json";
import { type Evidence, evidenceUrl } from "../data/evidence";
import type { Product } from "../data/product";
import { lawsShown } from "../data/usFoodLaws";
import type { MessageKey } from "../i18n";
import { asEvidence } from "../score/hazard";
import {
  type AdditiveInfo,
  type AdditiveLevel,
  additiveLevel,
  LEVEL_RANK,
  type Score,
  type Why,
} from "../score/score";
import { AdditiveAi } from "./Ai";
import { Icon, LEVEL_DOT, RISK_TONE, Section } from "./kit";
import { useApp } from "./state";

type L = "en" | "fr" | "de";
const DESCRIPTIONS = classDescriptions as Record<string, Partial<Record<L, string>>>;

/** Each level's pill and dot. "banned" is the one solid pill: it is the one hard fact. */
const PILL: Record<AdditiveLevel, string> = {
  banned: "bg-rose-700 text-white dark:bg-rose-500 dark:text-stone-950",
  high: RISK_TONE.high,
  moderate: RISK_TONE.moderate,
  low: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100",
  none: RISK_TONE.none,
  unknown: RISK_TONE.unknown,
};
const DOT: Record<AdditiveLevel, string> = {
  banned: "bg-rose-700 dark:bg-rose-500",
  high: LEVEL_DOT.high,
  moderate: LEVEL_DOT.moderate,
  low: LEVEL_DOT.low,
  none: LEVEL_DOT.none,
  unknown: "bg-stone-300 dark:bg-stone-600",
};

/** "E951 - Aspartame" as its name, "Aspartame"; the code is shown on its own. */
export function nameOf(a: AdditiveInfo, lang: string): string {
  const full = a.names[lang] ?? a.names.en ?? a.code;
  const name = full.replace(/^E\s?\d+[a-z]*\s*[-–]\s*/i, "").trim();
  return name && name.toUpperCase() !== a.code ? name : a.code;
}

/** The E-number range an additive sits in, when no class says what it does. */
function familyKey(code: string): MessageKey | undefined {
  const n = Number(code.match(/^E(\d+)/)?.[1]);
  if (!n) return undefined;
  const range = n >= 1000 ? 10 : Math.floor(n / 100);
  return [1, 2, 3, 4, 5, 6, 9, 10].includes(range) ? (`family_${range}` as MessageKey) : undefined;
}

function WhyText({ why }: { why: Why }) {
  const { t, lang } = useApp();
  const l: L = lang === "fr" || lang === "de" ? lang : "en";
  return <>{why.text ? why.text[l] : t(why.key as MessageKey, why.vars)}</>;
}

export function Additives({ score, product }: { score: Score; product: Product }) {
  const { t } = useApp();
  const rated = score.additives
    .map((a) => ({ a, ...additiveLevel(a) }))
    .sort((x, y) => LEVEL_RANK[x.level] - LEVEL_RANK[y.level]);
  const counts = new Map<AdditiveLevel, number>();
  for (const r of rated) counts.set(r.level, (counts.get(r.level) ?? 0) + 1);

  return (
    <Section
      title={t("additivesTitle")}
      aside={rated.length ? <span className="num text-xs text-muted">{rated.length}</span> : null}
    >
      {rated.length ? (
        <>
          <p className="-mt-1 mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-soft">
            {[...counts].map(([level, n]) => (
              <span key={level} className="inline-flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${DOT[level]}`} aria-hidden="true" />
                <span className="num font-semibold">{n}</span> {t(`concern_${level}` as MessageKey)}
              </span>
            ))}
          </p>
          <ul className="divide-y divide-stone-100 dark:divide-stone-800" data-testid="additives">
            {rated.map(({ a, level, why }) => (
              <li key={a.tag}>
                <AdditiveRow a={a} level={level} why={why} product={product} />
              </li>
            ))}
          </ul>
          {counts.has("low") || counts.has("unknown") ? (
            <p className="mt-2 text-xs text-muted">{t("levelNote")}</p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-muted">{t("additivesNone")}</p>
      )}
    </Section>
  );
}

function AdditiveRow({
  a,
  level,
  why,
  product,
}: {
  a: AdditiveInfo;
  level: AdditiveLevel;
  why: Why[];
  product: Product;
}) {
  const { t, lang } = useApp();
  const l: L = lang === "fr" || lang === "de" ? lang : "en";
  const roles = (a.classes ?? []).map((c) => t(`role_${c}` as MessageKey));
  const family = roles.length ? undefined : familyKey(a.code);
  const role = roles.length
    ? roles.join(" · ")
    : family
      ? t("additiveFamily", { family: t(family) })
      : "";
  const descriptions = (a.classes ?? [])
    .map((c) => DESCRIPTIONS[c]?.[l] ?? DESCRIPTIONS[c]?.en)
    .filter((d): d is string => Boolean(d))
    .slice(0, 2);
  const science = scienceOf(a);
  const first = why[0];

  return (
    <details className="group py-3" data-testid="additive" data-level={level}>
      <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
        <span
          className={`mt-1.5 size-2.5 shrink-0 rounded-full ${DOT[level]}`}
          aria-hidden="true"
        />
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-sm">
              <span className="font-semibold">{nameOf(a, lang)}</span>
              <span className="num ml-1.5 text-xs text-muted">{a.code}</span>
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${PILL[level]}`}
              data-testid="additive-level"
            >
              {t(`concern_${level}` as MessageKey)}
            </span>
          </span>
          {role ? <span className="text-xs text-muted">{role}</span> : null}
          {first && level !== "unknown" ? (
            <span className="text-sm text-soft group-open:hidden" data-testid="additive-why">
              <WhyText why={first} />
            </span>
          ) : null}
        </span>
        <Icon
          name="right"
          className="mt-1 size-4 shrink-0 text-muted transition-transform group-open:rotate-90 motion-reduce:transition-none"
        />
      </summary>

      <div className="mt-3 grid gap-4 pl-5.5 text-sm">
        {descriptions.length ? (
          <div className="grid gap-1">
            <h3 className="text-xs font-semibold text-muted">{t("additiveRole")}</h3>
            {descriptions.map((d) => (
              <p key={d} className="text-soft">
                {d}
              </p>
            ))}
          </div>
        ) : null}

        <div className="grid gap-1.5">
          <h3 className="text-xs font-semibold text-muted">{t("additiveWhy")}</h3>
          <ul className="grid gap-1.5">
            {why.map((w) => (
              <li key={`${w.key}${w.text?.en ?? ""}`} className="flex items-start gap-2 text-soft">
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${LEVEL_DOT[w.tone]}`}
                  aria-hidden="true"
                />
                <span>
                  <WhyText why={w} />
                </span>
              </li>
            ))}
          </ul>
          {a.efsa ? (
            <a
              className="inline-flex w-fit items-center gap-1 py-1 text-xs text-muted underline"
              href={a.efsa.url}
              target="_blank"
              rel="noreferrer"
            >
              {t("additiveEfsaLink")}
              {a.efsa.year ? `, ${a.efsa.year}` : ""}
              <Icon name="external" className="size-3" />
            </a>
          ) : null}
        </div>

        {science.length ? <Science evidence={science} /> : null}
        <AdditiveAi additive={a} product={product} />
      </div>
    </details>
  );
}

/** The cited findings, then what official lists say that they do not already. */
function scienceOf(a: AdditiveInfo): Evidence[] {
  const cited = a.evidence ?? [];
  const orgs = new Set(cited.filter((e) => e.kind === "official").map((e) => e.source.org));
  const official = (a.hazard?.findings ?? [])
    .filter((f) => !orgs.has(f.source.org))
    .map(asEvidence);
  const laws = lawsShown(a.usLaws ?? []).map(
    (l): Evidence => ({ summary: l.summary, kind: "official", source: l.source, concern: true }),
  );
  return [...cited, ...official, ...laws];
}

/** The cited findings on one additive, folded under it. */
function Science({ evidence }: { evidence: Evidence[] }) {
  const { t, lang } = useApp();
  const l: L = lang === "fr" || lang === "de" ? lang : "en";
  return (
    <details
      className="rounded-xl bg-stone-50 px-3 py-2 dark:bg-stone-800/60"
      data-testid="science"
    >
      <summary className="-my-1 cursor-pointer py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400">
        {t("scienceTitle")} ({evidence.length})
      </summary>
      <ul className="mt-2 grid gap-3">
        {evidence.map((e) => (
          <li key={`${e.source.url}${e.summary.en}`} className="grid gap-1">
            <span className="flex flex-wrap gap-1">
              <span className="rounded-full px-2 py-0.5 text-xs text-muted ring-1 ring-stone-300 dark:ring-stone-700">
                {t(`evidence_${e.kind}` as MessageKey)}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.concern ? RISK_TONE.moderate : RISK_TONE.none}`}
              >
                {e.concern ? t("evidenceConcern") : t("evidenceReassuring")}
              </span>
            </span>
            <p className="text-soft">{e.summary[l]}</p>
            <a
              className="inline-flex w-fit items-center gap-1 py-1 text-xs text-muted underline"
              href={evidenceUrl(e)}
              target="_blank"
              rel="noreferrer"
            >
              {e.source.org}, {e.source.year}
              <Icon name="external" className="size-3" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">{t("scienceNote")}</p>
    </details>
  );
}
