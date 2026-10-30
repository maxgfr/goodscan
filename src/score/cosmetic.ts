/**
 * The ingredient score of a cosmetic, 0 to 100: deterministic, every point
 * explained, the same verdicts as food. It starts from 100 and takes points
 * for each ingredient of concern found in the list: the hand-kept, cited ones
 * (src/data/cosmetics.ts) and what official lists say about every other
 * ingredient (./hazard.ts). The strongest category of each ingredient counts
 * once, and some cap the score, like a high-risk additive in food.
 */
import { COSMETICS, type CosmeticCategory, type CosmeticIngredient } from "../data/cosmetics";
import type { Product } from "../data/product";
import { COSMETIC_HAZARDS, cosmeticFromHazards } from "./hazard";
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
  return listItems(text).length;
}

/**
 * The items of a list as printed, without what is not an ingredient: bare
 * numbers, and the packaging text some lists run into ("Contenance nette :
 * 250 ml… Date de fabrication"), longer than any INCI name.
 */
export function listItems(text: string): string[] {
  return text
    .split(/[,;•·\n]|\.\s|\s[-–]\s/)
    .map((s) => s.replace(PREFIX, "").trim().replace(/\.$/, ""))
    .filter((s) => {
      const n = normalizeName(s);
      return n && !/^\d+$/.test(n) && n.split(" ").length <= 10;
    });
}

/** Hand-kept entries by every name they go by. */
const CURATED = new Map<string, CosmeticIngredient>();
for (const i of COSMETICS) {
  for (const name of [i.inci, ...i.synonyms.en, ...i.synonyms.fr, ...i.synonyms.de]) {
    const n = normalizeName(name);
    if (n && !CURATED.has(n)) CURATED.set(n, i);
  }
}

/**
 * Every ingredient the official lists say something about, by its Open Beauty
 * Facts tag and by its INCI name; merged with the hand-kept entry for the same
 * ingredient, whose summary leads.
 */
const OFFICIAL = new Map<string, CosmeticIngredient>();
const BY_TAG = new Map<string, CosmeticIngredient>();
for (const [tag, r] of Object.entries(COSMETIC_HAZARDS)) {
  const auto = cosmeticFromHazards(tag, r);
  if (!auto) continue;
  const name = normalizeName(auto.inci);
  const curated =
    CURATED.get(name) ?? CURATED.get(normalizeName(tag.replace(/^\w\w:/, "").replace(/-/g, " ")));
  const merged: CosmeticIngredient = curated
    ? {
        ...curated,
        categories: [...new Set([...curated.categories, ...auto.categories])],
        sources: [...curated.sources, ...auto.sources],
      }
    : auto;
  BY_TAG.set(tag, merged);
  if (name && !OFFICIAL.has(name)) OFFICIAL.set(name, merged);
  if (curated) for (const [n, i] of CURATED) if (i === curated) CURATED.set(n, merged);
}

/** One name, or one Open Beauty Facts tag, to its entry. */
export function lookupIngredient(name: string, tag?: string): CosmeticIngredient | undefined {
  if (tag) {
    const byTag = BY_TAG.get(tag);
    if (byTag) return byTag;
  }
  return CURATED.get(name) ?? OFFICIAL.get(name);
}

const tagName = (t: string) => normalizeName(t.replace(/^\w\w:/, "").replace(/-/g, " "));

/** The ingredients of concern in a list and its Open Beauty Facts tags, each once. */
export function findConcerns(text: string | undefined, tags: string[] = []): CosmeticIngredient[] {
  const found = new Map<string, CosmeticIngredient>();
  for (const n of text ? ingredientNames(text) : []) {
    const i = lookupIngredient(n);
    if (i) found.set(i.id, i);
  }
  for (const t of tags) {
    const i = lookupIngredient(tagName(t), t);
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
  "non-eu-ban": 20,
  "eu-restricted": 8,
  suspected: 8,
  "fragrance-allergen": 3,
  sensitiser: 3,
  "eu-listed": 0,
  "restricted-abroad": 0,
  "eu-annex-ii": 0,
  "under-review": 0,
};
const CAPS: Partial<Record<CosmeticCategory, number>> = {
  "eu-prohibited": 20,
  cmr: 49,
  endocrine: 49,
  pfas: 49,
};
/** Allergens and sensitisers share one budget; a listed ingredient costs nothing. */
const ALLERGENS: ReadonlySet<CosmeticCategory> = new Set(["fragrance-allergen", "sensitiser"]);
const KEYS: Record<
  Exclude<
    CosmeticCategory,
    | "fragrance-allergen"
    | "sensitiser"
    | "eu-listed"
    | "under-review"
    | "restricted-abroad"
    | "eu-annex-ii"
  >,
  Reason["key"]
> = {
  "eu-prohibited": "ingredientProhibited",
  cmr: "ingredientCmr",
  endocrine: "ingredientEndocrine",
  pfas: "ingredientPfas",
  "us-state-ban": "ingredientUsBan",
  "non-eu-ban": "ingredientNonEuBan",
  "eu-restricted": "ingredientRestricted",
  suspected: "ingredientSuspected",
};
/** EU rules that already settle an ingredient: a ban abroad then adds nothing. */
const EU: ReadonlySet<CosmeticCategory> = new Set([
  "eu-prohibited",
  "eu-restricted",
  "eu-listed",
  "cmr",
  "endocrine",
  "fragrance-allergen",
]);
const ABROAD: ReadonlySet<CosmeticCategory> = new Set(["us-state-ban", "non-eu-ban"]);
const ALLERGENS_MAX = 15;

/** The category that counts: the strongest; a ban abroad only when no EU rule covers it. */
export function countedCategory(i: CosmeticIngredient): CosmeticCategory {
  const eu = i.categories.some((c) => EU.has(c));
  const cats = i.categories.filter((c) => !(eu && ABROAD.has(c)));
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
    .filter((f) => POINTS[f.category] > 0)
    .sort((a, b) => POINTS[b.category] - POINTS[a.category]);

  const reasons: Reason[] = [{ key: "ingredientsChecked", count }];
  let delta = 0;
  let cap = 100;
  let allergens = 0;
  for (const f of flags) {
    if (ALLERGENS.has(f.category)) {
      allergens++;
      continue;
    }
    const points = POINTS[f.category];
    const c = CAPS[f.category];
    delta -= points;
    if (c !== undefined) cap = Math.min(cap, c);
    reasons.push({
      key: KEYS[f.category as keyof typeof KEYS],
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

export type IngredientLevel = "high" | "moderate" | "low" | "none";
const LEVEL: Record<CosmeticCategory, Exclude<IngredientLevel, "none">> = {
  "eu-prohibited": "high",
  cmr: "high",
  endocrine: "high",
  pfas: "high",
  "us-state-ban": "high",
  "non-eu-ban": "high",
  "eu-restricted": "moderate",
  suspected: "moderate",
  "fragrance-allergen": "low",
  sensitiser: "low",
  "eu-listed": "low",
  "restricted-abroad": "low",
  "eu-annex-ii": "low",
  "under-review": "low",
};

export interface RatedIngredient {
  /** As printed. */
  label: string;
  level: IngredientLevel;
  ingredient?: CosmeticIngredient;
}

/** Every item of the list, in its order, with the level of what is said about it. */
export function rateIngredients(p: Product): RatedIngredient[] {
  const items = p.ingredients
    ? listItems(p.ingredients)
    : (p.ingredientTags ?? []).map((t) => t.replace(/^\w\w:/, "").replace(/-/g, " "));
  return items.map((label) => {
    const ingredient = ingredientNames(label)
      .map((n) => lookupIngredient(n))
      .find(Boolean);
    return ingredient
      ? { label, level: LEVEL[countedCategory(ingredient)], ingredient }
      : { label, level: "none" };
  });
}
