/**
 * goodscan's health score, 0 to 100: deterministic, and every point explained.
 *
 * It starts from nutrition (the Nutri-Score, the database's or ours), then
 * adds or takes points for processing (NOVA), additives (EFSA's
 * overexposure risk, and those the EU does not authorise), organic and palm
 * oil. Some findings also cap the score: a product cannot be "good" with a
 * high-risk additive in it.
 */
import additivesData from "../data/additives.json";
import { EU_NOT_AUTHORISED } from "../data/eu";
import { type Grade, isFood, type Product } from "../data/product";
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
    | "organic"
    | "palmOil";
  delta?: number;
  /** A ceiling this finding sets. */
  cap?: number;
  grade?: Grade;
  additive?: string;
}

export interface AdditiveInfo {
  tag: string;
  code: string;
  names: Record<string, string>;
  risk?: "high" | "moderate" | "none";
  anses?: boolean;
  euNotAuthorised?: boolean;
}

export interface Score {
  /** 0–100, null when the data is too thin to say. */
  value: number | null;
  verdict: Verdict;
  reasons: Reason[];
  /** The Nutri-Score shown, with where it came from. */
  nutri?: { grade: Grade; score?: number; computed: boolean };
  additives: AdditiveInfo[];
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
const isRedMeat = (p: Product) =>
  has(p.categories, /^en:(beef|pork|lamb|veal|red-meats|beef-meat|pork-meat)$/);

export function scoreProduct(p: Product): Score {
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

  let additivePenalty = 0;
  for (const a of additives) {
    if (a.euNotAuthorised) {
      additivePenalty += 25;
      cap = Math.min(cap, 25);
      reasons.push({ key: "additiveEu", additive: a.tag, delta: -25, cap: 25 });
    } else if (a.risk === "high") {
      additivePenalty += 15;
      cap = Math.min(cap, 49);
      reasons.push({ key: "additiveHigh", additive: a.tag, delta: -15, cap: 49 });
    } else if (a.risk === "moderate") {
      additivePenalty += 6;
      reasons.push({ key: "additiveModerate", additive: a.tag, delta: -6 });
    }
  }
  // Many flagged additives say the same thing: the total stops at 45.
  delta -= Math.min(45, additivePenalty);

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

export function verdictOf(value: number): Verdict {
  return value >= 75 ? "excellent" : value >= 50 ? "good" : value >= 25 ? "poor" : "bad";
}
