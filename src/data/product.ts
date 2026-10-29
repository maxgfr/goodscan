/** One product, whatever database (or label photo) it came from. */

export type Source = "off" | "obf" | "opff" | "opf" | "label";
export type Grade = "a" | "b" | "c" | "d" | "e";

/** Per 100 g (or 100 ml for drinks). Missing values stay undefined, never 0. */
export interface Nutriments {
  energyKj?: number;
  energyKcal?: number;
  fat?: number;
  saturatedFat?: number;
  sugars?: number;
  addedSugars?: number;
  salt?: number;
  fiber?: number;
  proteins?: number;
  /** % of fruits, vegetables and legumes. */
  fruitsVeg?: number;
}

/** One Open Food Facts attribute: how well the product does on it, 0–100. */
export interface Attribute {
  id: string;
  group: string;
  status: "known" | "unknown";
  match?: number;
  title: string;
  description?: string;
}

export interface Product {
  code: string;
  source: Source;
  name: string;
  brands?: string;
  quantity?: string;
  image?: string;
  countries: string[];
  categories: string[];
  labels: string[];
  /** e.g. "en:e330" */
  additives: string[];
  allergens: string[];
  traces: string[];
  /** e.g. "en:palm-oil", "en:vegan", "en:non-vegetarian" */
  analysis: string[];
  ingredients?: string;
  nutriments: Nutriments;
  /** Grams in one serving, when the label says. */
  servingGrams?: number;
  servingSize?: string;
  isBeverage: boolean;
  isWater: boolean;
  /** Nutri-Score as computed by the database, when it could. */
  nutriscore?: { grade: Grade; score?: number };
  /** The database says Nutri-Score does not apply (water, coffee, baby milk…). */
  nutriscoreNotApplicable: boolean;
  /** Has artificial sweeteners (Nutri-Score 2023 counts them for drinks). */
  sweeteners: boolean;
  nova?: 1 | 2 | 3 | 4;
  ecoscore?: Grade;
  /** Open Food Facts' attributes, for matching against the user's preferences. */
  attributes: Attribute[];
  /** True when a model read the values from a photo. */
  estimated?: boolean;
}

export const isGrade = (g: unknown): g is Grade =>
  g === "a" || g === "b" || g === "c" || g === "d" || g === "e";

/** Is it something we eat or drink (the health score applies)? */
export const isFood = (p: Product) => p.source === "off" || p.source === "label";
