/**
 * "Is it for me?": the product's Open Food Facts attributes against the
 * user's preferences, the way Open Food Facts' own website and apps match
 * them (written here from that behaviour, not copied):
 *
 * - each attribute is not important, important (×1), very important (×2) or
 *   mandatory (×2, and it can rule the product out);
 * - the match is the weighted average of the known attributes' 0–100 scores;
 * - a mandatory attribute scoring ≤ 10 means "does not match" (e.g. it has an
 *   allergen), ≤ 50 "may not match" (e.g. traces), unknown "unknown";
 * - when half the weight is on unknown attributes, the match is unknown too.
 */
import attributesData from "../data/attributes.json";
import type { Attribute, Product } from "../data/product";

export type Importance = "not_important" | "important" | "very_important" | "mandatory";
export type Preferences = Record<string, Importance>;

export type MatchStatus =
  | "very_good_match"
  | "good_match"
  | "poor_match"
  | "may_not_match"
  | "does_not_match"
  | "unknown_match";

export interface AttributeGroupDef {
  id: string;
  name: Record<string, string>;
  warning?: Record<string, string>;
  attributes: { id: string; name: Record<string, string>; default?: string }[];
}

export const ATTRIBUTE_GROUPS = attributesData.groups as AttributeGroupDef[];
export const IMPORTANCE = attributesData.importance as Record<Importance, Record<string, string>>;
export const IMPORTANCES = Object.keys(IMPORTANCE) as Importance[];

/** Open Food Facts' defaults: Nutri-Score very important, NOVA and Green-Score important. */
export const DEFAULT_PREFERENCES: Preferences = Object.fromEntries(
  ATTRIBUTE_GROUPS.flatMap((g) => g.attributes)
    .filter((a) => a.default)
    .map((a) => [a.id, a.default as Importance]),
);

const FACTOR: Record<Importance, number> = {
  not_important: 0,
  important: 1,
  very_important: 2,
  mandatory: 2,
};

export interface Match {
  status: MatchStatus;
  /** 0–100, null when no attribute counted. */
  score: number | null;
  /** Mandatory attributes that rule the product out or may. */
  failed: Attribute[];
  doubtful: Attribute[];
  unknown: Attribute[];
}

export function matchProduct(p: Pick<Product, "attributes">, prefs: Preferences): Match {
  let total = 0;
  let weight = 0;
  let unknownWeight = 0;
  const failed: Attribute[] = [];
  const doubtful: Attribute[] = [];
  const unknown: Attribute[] = [];
  let mandatoryUnknown = false;

  for (const a of p.attributes) {
    const importance = prefs[a.id] ?? "not_important";
    const factor = FACTOR[importance];
    if (!factor) continue;
    weight += factor;
    if (a.status === "unknown" || a.match === undefined) {
      unknownWeight += factor;
      unknown.push(a);
      if (importance === "mandatory") mandatoryUnknown = true;
      continue;
    }
    total += a.match * factor;
    if (importance === "mandatory") {
      if (a.match <= 10) failed.push(a);
      else if (a.match <= 50) doubtful.push(a);
    }
  }

  const score = weight ? total / weight : null;
  const result = (status: MatchStatus, s = score): Match => ({
    status,
    score: s === null ? null : Math.round(s),
    failed,
    doubtful,
    unknown,
  });
  if (!p.attributes.length || score === null) return result("unknown_match", null);
  if (failed.length) return result("does_not_match", 0);
  if (doubtful.length) return result("may_not_match");
  if (mandatoryUnknown || unknownWeight >= weight / 2) return result("unknown_match");
  return result(score >= 75 ? "very_good_match" : score >= 50 ? "good_match" : "poor_match");
}

/** Shortcuts in the settings: a condition or a diet sets the attributes it cares about. */
export const PRESETS: Record<string, Preferences> = {
  diabetes: { low_sugars: "very_important", nutriscore: "very_important" },
  hypertension: { low_salt: "very_important" },
  cholesterol: { low_saturated_fat: "very_important", low_fat: "important" },
  vegan: { vegan: "mandatory" },
  vegetarian: { vegetarian: "mandatory" },
  noPalmOil: { palm_oil_free: "mandatory" },
  organic: { labels_organic: "important" },
};
