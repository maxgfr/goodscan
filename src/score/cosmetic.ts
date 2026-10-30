/**
 * The ingredient score of a cosmetic, 0 to 100: deterministic, every point
 * explained, the same verdicts as food. It starts from 100 and takes points
 * for each ingredient of concern found in the list (src/data/cosmetics.ts):
 * the strongest category of each ingredient counts once, and some cap the
 * score, like a high-risk additive in food.
 */
import { COSMETICS, type CosmeticCategory, type CosmeticIngredient } from "../data/cosmetics";
import type { Product } from "../data/product";
import { type Reason, type Score, verdictOf } from "./score";

export interface CosmeticFlag {
  ingredient: CosmeticIngredient;
  /** The category that counted. */
  category: CosmeticCategory;
}

/** Lowercase, no accents, no punctuation, CI codes as "ci 77891". */
export function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\bci\s*(\d{5})\b/g, "ci $1")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const PREFIX =
  /^\s*(ingredients?|ingr[eé]dients?|inhaltsstoffe|zutaten|inci|may contain|peut contenir|kann enthalten)\s*:?\s*/i;

/**
 * Every name the list gives, normalized: each item, and each alternative in
 * it ("Aqua/Water/Eau", "Parfum (Fragrance)", "[+/- CI 77891]").
 */
export function ingredientNames(text: string): string[] {
  const names = new Set<string>();
  for (const raw of text.split(/[,;•·\n]|\.\s|\s[-–]\s/)) {
    const item = raw.replace(PREFIX, "").replace(/\+\/-/g, "");
    const inner = [...item.matchAll(/[([]([^)\]]*)[)\]]?/g)].map((m) => m[1] ?? "");
    const outer = item.replace(/[([][^)\]]*[)\]]?/g, " ");
    for (const part of [outer, ...inner]) {
      const whole = normalizeName(part.replace(PREFIX, ""));
      if (whole) names.add(whole);
      for (const alt of part.split("/")) {
        const n = normalizeName(alt.replace(PREFIX, ""));
        if (n) names.add(n);
      }
    }
  }
  return [...names];
}

/** How many items the list has, for "N ingredients checked". */
export function ingredientCount(text: string): number {
  return text
    .split(/[,;•·\n]|\.\s|\s[-–]\s/)
    .map((s) => normalizeName(s.replace(PREFIX, "")))
    .filter((s) => s && !/^\d+$/.test(s)).length;
}

const INDEX = new Map<string, CosmeticIngredient>();
for (const i of COSMETICS) {
  for (const name of [i.inci, ...i.synonyms.en, ...i.synonyms.fr, ...i.synonyms.de]) {
    const n = normalizeName(name);
    if (n && !INDEX.has(n)) INDEX.set(n, i);
  }
}

/** The ingredients of concern in a list and its Open Beauty Facts tags, each once. */
export function findConcerns(text: string | undefined, tags: string[] = []): CosmeticIngredient[] {
  const names = [
    ...(text ? ingredientNames(text) : []),
    ...tags.map((t) => normalizeName(t.replace(/^\w\w:/, "").replace(/-/g, " "))),
  ];
  const found = new Map<string, CosmeticIngredient>();
  for (const n of names) {
    const i = INDEX.get(n);
    if (i) found.set(i.id, i);
  }
  return [...found.values()];
}

const POINTS: Record<CosmeticCategory, number> = {
  "eu-prohibited": 40,
  cmr: 25,
  endocrine: 25,
  pfas: 20,
  "us-state-ban": 20,
  "eu-restricted": 8,
  "fragrance-allergen": 3,
};
const CAPS: Partial<Record<CosmeticCategory, number>> = {
  "eu-prohibited": 20,
  cmr: 49,
  endocrine: 49,
  pfas: 49,
};
const KEYS: Record<Exclude<CosmeticCategory, "fragrance-allergen">, Reason["key"]> = {
  "eu-prohibited": "ingredientProhibited",
  cmr: "ingredientCmr",
  endocrine: "ingredientEndocrine",
  pfas: "ingredientPfas",
  "us-state-ban": "ingredientUsBan",
  "eu-restricted": "ingredientRestricted",
};
const EU: ReadonlySet<CosmeticCategory> = new Set([
  "eu-prohibited",
  "eu-restricted",
  "cmr",
  "endocrine",
  "fragrance-allergen",
]);
const ALLERGENS_MAX = 15;

/** The category that counts: the strongest; a US ban only when no EU rule covers it. */
export function countedCategory(i: CosmeticIngredient): CosmeticCategory {
  const eu = i.categories.some((c) => EU.has(c));
  const cats = i.categories.filter((c) => !(eu && c === "us-state-ban"));
  return cats.reduce((a, b) => (POINTS[b] > POINTS[a] ? b : a));
}

export function scoreCosmetic(p: Product): Score {
  const tags = p.ingredientTags ?? [];
  if (!p.ingredients && !tags.length) {
    return {
      value: null,
      verdict: "unknown",
      reasons: [{ key: "ingredientsMissing" }],
      additives: [],
    };
  }
  const count = p.ingredients ? ingredientCount(p.ingredients) : tags.length;
  const flags: CosmeticFlag[] = findConcerns(p.ingredients, tags)
    .map((ingredient) => ({ ingredient, category: countedCategory(ingredient) }))
    .sort((a, b) => POINTS[b.category] - POINTS[a.category]);

  const reasons: Reason[] = [{ key: "ingredientsChecked", count }];
  let delta = 0;
  let cap = 100;
  let allergens = 0;
  for (const f of flags) {
    if (f.category === "fragrance-allergen") {
      allergens++;
      continue;
    }
    const points = POINTS[f.category];
    const c = CAPS[f.category];
    delta -= points;
    if (c !== undefined) cap = Math.min(cap, c);
    reasons.push({
      key: KEYS[f.category],
      ingredient: f.ingredient.id,
      delta: -points,
      ...(c !== undefined ? { cap: c } : {}),
    });
  }
  if (allergens) {
    const points = Math.min(ALLERGENS_MAX, allergens * POINTS["fragrance-allergen"]);
    delta -= points;
    reasons.push({ key: "ingredientAllergens", count: allergens, delta: -points });
  }
  if (!flags.length) reasons.push({ key: "ingredientsClean" });

  const value = Math.round(Math.max(0, Math.min(cap, 100 + delta)));
  return { value, verdict: verdictOf(value), reasons, additives: [], cosmetic: flags };
}
