/**
 * goodscan's health score, 0 to 100: deterministic, and every point explained.
 *
 * It starts from nutrition (the Nutri-Score, the database's or ours), then
 * adds or takes points for processing (NOVA), additives (EFSA's
 * overexposure risk, those the EU does not authorise, and those with weighty
 * scientific evidence of concern), organic and palm oil. Some findings also cap the score: a product cannot be "good" with a
 * high-risk additive in it.
 */
import additivesData from "../data/additives.json";
import { EU_NOT_AUTHORISED } from "../data/eu";
import { type Evidence, evidenceFor, HUMAN_KINDS, weighs } from "../data/evidence";
import { type Grade, isCosmetic, isFood, type Product } from "../data/product";
import { US_FOOD_LAWS, type UsLaw } from "../data/usFoodLaws";
import { type CosmeticFlag, scoreCosmetic } from "./cosmetic";
import { type AdditiveHazard, additiveHazard } from "./hazard";
import { nutriscore } from "./nutriscore";

export type Verdict = "excellent" | "good" | "poor" | "bad" | "unknown" | "not-food";

/** One line of the explanation: a message key, its values, what it did to the score. */
export interface Reason {
  key:
    | "nutrition"
    | "nutritionComputed"
    | "nutritionMissing"
    | "nutritionNotApplicable"
    | "water"
    | "alcohol"
    | "nova4"
    | "nova3"
    | "nova1"
    | "additiveHigh"
    | "additiveModerate"
    | "additiveEu"
    | "additiveEvidence"
    | "additiveHazardHigh"
    | "additiveHazardModerate"
    | "organic"
    | "palmOil"
    | "processedMeat"
    | "redMeat"
    | "ingredientsMissing"
    | "ingredientsChecked"
    | "ingredientsClean"
    | "ingredientProhibited"
    | "ingredientCmr"
    | "ingredientEndocrine"
    | "ingredientPfas"
    | "ingredientUsBan"
    | "ingredientNonEuBan"
    | "ingredientRestricted"
    | "ingredientSuspected"
    | "ingredientAllergens";
  delta?: number;
  /** The 0–100 the score starts from, on the line that sets it. */
  base?: number;
  /** A ceiling this finding sets. */
  cap?: number;
  grade?: Grade;
  additive?: string;
  /** A cosmetic ingredient's id (src/data/cosmetics.ts). */
  ingredient?: string;
  count?: number;
  /** Where the finding comes from, when the line stands on one source. */
  source?: string;
}

export interface AdditiveInfo {
  tag: string;
  code: string;
  names: Record<string, string>;
  risk?: "high" | "moderate" | "none";
  anses?: boolean;
  euNotAuthorised?: boolean;
  /** Cited findings, when there are some. */
  evidence?: Evidence[];
  /** The findings are weighty enough to cost points. */
  evidenceWeighs?: boolean;
  /** What official lists (IARC, EU CLP, EU endocrine-disruptor lists) say. */
  hazard?: AdditiveHazard;
  /** US federal and state rules naming it: shown, not counted. */
  usLaws?: UsLaw[];
  /** What it is used for (Open Food Facts classes: emulsifier, colour…). */
  classes?: string[];
  /** EFSA's (re-)evaluation, with its link. */
  efsa?: { url: string; year?: number };
}

export interface Score {
  /** 0–100, null when the data is too thin to say. */
  value: number | null;
  verdict: Verdict;
  reasons: Reason[];
  /** The Nutri-Score shown, with where it came from. */
  nutri?: { grade: Grade; score?: number; computed: boolean };
  additives: AdditiveInfo[];
  /** A cosmetic's ingredients of concern, strongest first. */
  cosmetic?: CosmeticFlag[];
}

const DATA = additivesData as Record<
  string,
  {
    n: Record<string, string>;
    r?: "h" | "m" | "n";
    a?: 1;
    c?: string[];
    e?: { u: string; y?: number };
  }
>;
const RISK = { h: "high", m: "moderate", n: "none" } as const;

export function additiveInfo(tag: string): AdditiveInfo {
  const d = DATA[tag];
  const code = tag.replace(/^en:/, "").toUpperCase();
  const info: AdditiveInfo = { tag, code, names: d?.n ?? { en: code } };
  if (d?.r) info.risk = RISK[d.r];
  if (d?.a) info.anses = true;
  if (d?.c) info.classes = d.c;
  if (d?.e) info.efsa = d.e.y ? { url: d.e.u, year: d.e.y } : { url: d.e.u };
  if (tag in EU_NOT_AUTHORISED) info.euNotAuthorised = true;
  const evidence = evidenceFor(tag);
  if (evidence?.length) {
    info.evidence = evidence;
    if (weighs(evidence)) info.evidenceWeighs = true;
  }
  const hazard = additiveHazard(tag);
  if (hazard) info.hazard = hazard;
  const usLaws = US_FOOD_LAWS[tag];
  if (usLaws?.length) info.usLaws = usLaws;
  return info;
}

/** Nutri-Score points to a 0–100 base, piecewise linear, grade by grade. */
const FOOD_KNOTS: [number, number][] = [
  [-15, 100],
  [0, 85],
  [1, 80],
  [2, 70],
  [3, 68],
  [10, 50],
  [11, 48],
  [18, 25],
  [19, 23],
  [40, 0],
];
const DRINK_KNOTS: [number, number][] = [
  [-10, 82],
  [2, 70],
  [3, 68],
  [6, 50],
  [7, 48],
  [9, 25],
  [10, 23],
  [25, 0],
];
/** When only the letter is known: the middle of its band. */
const GRADE_BASE: Record<Grade, number> = { a: 90, b: 75, c: 59, d: 37, e: 12 };

export function interpolate(knots: [number, number][], x: number): number {
  const first = knots[0];
  const last = knots.at(-1);
  if (!first || !last) return 0;
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < knots.length; i++) {
    const [x1, y1] = knots[i] as [number, number];
    const [x0, y0] = knots[i - 1] as [number, number];
    if (x <= x1) return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
  }
  return last[1];
}

const has = (list: string[], re: RegExp) => list.some((t) => re.test(t));

const isAlcohol = (p: Product) =>
  has(p.categories, /^en:alcoholic-beverages$|^en:(beers|wines|spirits)$/);
const isOrganic = (p: Product) =>
  has(
    p.labels,
    /^en:(organic|eu-organic|usda-organic|bio)$|^fr:ab-agriculture-biologique$|^de:bio/,
  );
const isCheese = (p: Product) => p.categories.includes("en:cheeses");
/** IARC Monographs volume 114, summarised in The Lancet Oncology (Bouvard et al., 2015). */
export const IARC_MEAT = "https://doi.org/10.1016/S1470-2045(15)00444-1";
/** A stock, a soup or a sauce is tagged with its meat without being meat. */
const NOT_MEAT = /^en:(broths|broth-stock|soups|sauces|meals)$/;
const isMeat = (p: Product) => p.categories.includes("en:meats") && !has(p.categories, NOT_MEAT);
/** Salted, cured, fermented or smoked: IARC group 1. */
export const isProcessedMeat = (p: Product) =>
  isMeat(p) && has(p.categories, /^en:(prepared-meats|bacon|canned-meats)$/);
/** Beef, veal, pork, lamb, mutton, horse, goat: IARC group 2A. */
export const isUnprocessedRedMeat = (p: Product) =>
  isMeat(p) &&
  !isProcessedMeat(p) &&
  has(
    p.categories,
    /^en:(beef|veal|pork|lamb|mutton|horse-meat|goat-meat|red-meats|beef-meat|pork-meat)$/,
  );

const isRedMeat = (p: Product) =>
  has(p.categories, /^en:(beef|pork|lamb|veal|red-meats|beef-meat|pork-meat)$/);

export function scoreProduct(p: Product): Score {
  if (isCosmetic(p)) return scoreCosmetic(p);
  const additives = [...new Set(p.additives)].map(additiveInfo);
  if (!isFood(p)) return { value: null, verdict: "not-food", reasons: [], additives };

  const reasons: Reason[] = [];
  let base: number | null = null;
  let nutri: Score["nutri"];
  let cap = 100;

  if (p.isWater) {
    base = 100;
    reasons.push({ key: "water", base });
  } else if (isAlcohol(p)) {
    base = 20;
    cap = 20;
    reasons.push({ key: "alcohol", cap, base });
  } else if (p.nutriscore) {
    nutri = { ...p.nutriscore, computed: false };
  } else {
    const computed = nutriscore({
      nutriments: p.nutriments,
      isBeverage: p.isBeverage,
      isWater: p.isWater,
      sweeteners: p.sweeteners,
      isCheese: isCheese(p),
      isRedMeat: isRedMeat(p),
    });
    if (computed) nutri = { ...computed, computed: true };
  }

  if (nutri) {
    base =
      nutri.score === undefined
        ? GRADE_BASE[nutri.grade]
        : interpolate(p.isBeverage ? DRINK_KNOTS : FOOD_KNOTS, nutri.score);
    reasons.push({
      key: nutri.computed ? "nutritionComputed" : "nutrition",
      grade: nutri.grade,
      base: Math.round(base),
    });
  } else if (base === null && p.nutriscoreNotApplicable) {
    base = 75;
    reasons.push({ key: "nutritionNotApplicable", base });
  } else if (base === null) {
    reasons.push({ key: "nutritionMissing" });
  }

  let delta = 0;
  if (p.nova === 4) {
    delta -= 12;
    reasons.push({ key: "nova4", delta: -12 });
  } else if (p.nova === 3) {
    delta -= 4;
    reasons.push({ key: "nova3", delta: -4 });
  } else if (p.nova === 1) {
    reasons.push({ key: "nova1", delta: 0 });
  }

  // Each additive counts once, for the strongest thing said about it.
  let additivePenalty = 0;
  for (const a of additives) {
    const reason = additiveReason(a);
    if (!reason) continue;
    additivePenalty -= reason.delta ?? 0;
    if (reason.cap !== undefined) cap = Math.min(cap, reason.cap);
    reasons.push(reason);
  }
  // Many flagged additives say the same thing: the total stops at 45.
  delta -= Math.min(45, additivePenalty);

  // IARC: processed meat causes colorectal cancer (group 1), red meat probably does (2A).
  // The Nutri-Score already counts their salt and fat, hence less than an additive.
  if (isProcessedMeat(p)) {
    delta -= 10;
    cap = Math.min(cap, 49);
    reasons.push({ key: "processedMeat", delta: -10, cap: 49, source: IARC_MEAT });
  } else if (isUnprocessedRedMeat(p)) {
    delta -= 5;
    reasons.push({ key: "redMeat", delta: -5, source: IARC_MEAT });
  }
  if (p.analysis.includes("en:palm-oil")) {
    delta -= 3;
    reasons.push({ key: "palmOil", delta: -3 });
  }
  if (isOrganic(p)) {
    delta += 5;
    reasons.push({ key: "organic", delta: 5 });
  }

  if (base === null)
    return { value: null, verdict: "unknown", reasons, additives, ...(nutri ? { nutri } : {}) };
  const value = Math.round(Math.max(0, Math.min(cap, base + delta, 100)));
  return { value, verdict: verdictOf(value), reasons, additives, ...(nutri ? { nutri } : {}) };
}

/**
 * The one penalty an additive gets: not authorised in the EU, then a high
 * risk (EFSA's overexposure, or IARC 1/2A, a CMR 1A/1B or an EU-identified
 * endocrine disruptor), then a moderate one (cited evidence that weighs,
 * EFSA's moderate overexposure, IARC 2B, a suspected CMR or endocrine
 * disruptor). Allergy alone costs nothing.
 */
export function additiveReason(a: AdditiveInfo): Reason | undefined {
  const additive = a.tag;
  if (a.euNotAuthorised) return { key: "additiveEu", additive, delta: -25, cap: 25 };
  if (a.risk === "high") return { key: "additiveHigh", additive, delta: -15, cap: 49 };
  if (a.hazard?.level === "high")
    return { key: "additiveHazardHigh", additive, delta: -15, cap: 49 };
  // An official concern or concordant human studies, for food as for drinks.
  if (a.evidenceWeighs) return { key: "additiveEvidence", additive, delta: -6 };
  if (a.risk === "moderate") return { key: "additiveModerate", additive, delta: -6 };
  if (a.hazard?.level === "moderate") return { key: "additiveHazardModerate", additive, delta: -6 };
  return undefined;
}

/**
 * How worrying an additive is, in one word. The first three are exactly the
 * penalties of additiveReason, so the label never disagrees with the score;
 * "low" is something said that costs nothing, "none" an assessment that
 * found nothing, "unknown" no source saying anything.
 */
export type AdditiveLevel = "banned" | "high" | "moderate" | "low" | "none" | "unknown";

/** One plain-words reason behind the level: a message key, or a sentence of an official list. */
export interface Why {
  key:
    | "whyEu"
    | "whyEfsaHigh"
    | "whyEfsaModerate"
    | "whyEfsaNone"
    | "whyHazard"
    | "whyOfficial"
    | "whyHuman"
    | "whySignal"
    | "whyReassuring"
    | "whyUsFda"
    | "whyUsState"
    | "whyAnses"
    | "whyEfsaReviewed"
    | "whyNothing";
  tone: "high" | "moderate" | "low" | "none";
  vars?: Record<string, string | number>;
  /** The sentence itself, for an official list's finding. */
  text?: { en: string; fr: string; de: string };
}

const LEVEL_OF: Partial<Record<Reason["key"], AdditiveLevel>> = {
  additiveEu: "banned",
  additiveHigh: "high",
  additiveHazardHigh: "high",
  additiveEvidence: "moderate",
  additiveModerate: "moderate",
  additiveHazardModerate: "moderate",
};
const TONE_RANK = { high: 0, moderate: 1, low: 2, none: 3 } as const;

const orgsOf = (list: readonly Evidence[]) =>
  [...new Set(list.map((e) => e.source.org))].join(", ");

/** The level, and every reason for it, strongest first. */
export function additiveLevel(a: AdditiveInfo): { level: AdditiveLevel; why: Why[] } {
  const why: Why[] = [];
  if (a.euNotAuthorised) why.push({ key: "whyEu", tone: "high" });
  if (a.risk === "high") why.push({ key: "whyEfsaHigh", tone: "high" });
  if (a.risk === "moderate") why.push({ key: "whyEfsaModerate", tone: "moderate" });
  for (const f of a.hazard?.findings ?? []) {
    if (f.level !== "listed") why.push({ key: "whyHazard", tone: f.level, text: f.summary });
  }
  const evidence = a.evidence ?? [];
  const concerns = evidence.filter((e) => e.concern);
  // An official list already said it (IARC's group): not twice.
  const listed = new Set((a.hazard?.findings ?? []).map((f) => f.source.org));
  const official = concerns.filter((e) => e.kind === "official" && !listed.has(e.source.org));
  const human = concerns.filter((e) => HUMAN_KINDS.has(e.kind));
  const tone = a.evidenceWeighs ? "moderate" : "low";
  if (official.length) why.push({ key: "whyOfficial", tone, vars: { orgs: orgsOf(official) } });
  if (human.length) why.push({ key: "whyHuman", tone, vars: { count: human.length } });
  const signals = concerns.length - official.length - human.length;
  if (signals) why.push({ key: "whySignal", tone: "low", vars: { count: signals } });
  const ban = a.usLaws?.find((l) => l.kind === "federal-ban")
    ? "whyUsFda"
    : a.usLaws?.find((l) => l.kind === "state-ban")
      ? "whyUsState"
      : undefined;
  if (ban) why.push({ key: ban, tone: "low" });
  if (a.anses) why.push({ key: "whyAnses", tone: "low" });
  if (a.risk === "none") why.push({ key: "whyEfsaNone", tone: "none" });
  const reassuring = evidence.length - concerns.length;
  if (reassuring) why.push({ key: "whyReassuring", tone: "none", vars: { count: reassuring } });
  if (a.efsa?.year) why.push({ key: "whyEfsaReviewed", tone: "none", vars: { year: a.efsa.year } });
  why.sort((x, y) => TONE_RANK[x.tone] - TONE_RANK[y.tone]);

  const reason = additiveReason(a);
  const counted = reason ? LEVEL_OF[reason.key] : undefined;
  const level: AdditiveLevel =
    counted ??
    (why.some((w) => w.tone !== "none") ? "low" : why.length || a.efsa ? "none" : "unknown");
  if (!why.length) why.push({ key: "whyNothing", tone: "none" });
  return { level, why };
}

/** Worst first, for lists. */
export const LEVEL_RANK: Record<AdditiveLevel, number> = {
  banned: 0,
  high: 1,
  moderate: 2,
  low: 3,
  none: 4,
  unknown: 5,
};

export function verdictOf(value: number): Verdict {
  return value >= 75 ? "excellent" : value >= 50 ? "good" : value >= 25 ? "poor" : "bad";
}
