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
import { EVIDENCE, type Evidence, weighs } from "../data/evidence";
import { type Grade, isCosmetic, isFood, type Product } from "../data/product";
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
    | "ingredientRestricted"
    | "ingredientSuspected"
    | "ingredientAllergens";
  delta?: number;
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
  { n: Record<string, string>; r?: "h" | "m" | "n"; a?: 1 }
>;
const RISK = { h: "high", m: "moderate", n: "none" } as const;

export function additiveInfo(tag: string): AdditiveInfo {
  const d = DATA[tag];
  const code = tag.replace(/^en:/, "").toUpperCase();
  const info: AdditiveInfo = { tag, code, names: d?.n ?? { en: code } };
  if (d?.r) info.risk = RISK[d.r];
  if (d?.a) info.anses = true;
  if (tag in EU_NOT_AUTHORISED) info.euNotAuthorised = true;
  const evidence = EVIDENCE[tag];
  if (evidence?.length) {
    info.evidence = evidence;
    if (weighs(evidence)) info.evidenceWeighs = true;
  }
  const hazard = additiveHazard(tag);
  if (hazard) info.hazard = hazard;
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
    reasons.push({ key: "water" });
  } else if (isAlcohol(p)) {
    base = 20;
    cap = 20;
    reasons.push({ key: "alcohol", cap });
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
    reasons.push({ key: nutri.computed ? "nutritionComputed" : "nutrition", grade: nutri.grade });
  } else if (base === null && p.nutriscoreNotApplicable) {
    base = 75;
    reasons.push({ key: "nutritionNotApplicable" });
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

export function verdictOf(value: number): Verdict {
  return value >= 75 ? "excellent" : value >= 50 ? "good" : value >= 25 ? "poor" : "bad";
}
