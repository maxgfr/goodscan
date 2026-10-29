/**
 * The three nutrients the FDA's proposed front-of-package "Nutrition Info box"
 * rates: saturated fat, sodium and added sugars, each Low, Med or High from
 * its share of the Daily Value in one serving (≤ 5 % low, ≥ 20 % high, as on
 * the Nutrition Facts label). With no serving size, 100 g stands in.
 */
import type { Product } from "../data/product";

export const DAILY_VALUES = { saturatedFat: 20, sodium: 2.3, addedSugars: 50 } as const;

export type Level = "low" | "med" | "high";
export type FopNutrient = "saturatedFat" | "sodium" | "addedSugars" | "sugars";

export interface FopChip {
  nutrient: FopNutrient;
  /** % of the Daily Value. */
  dv: number;
  level: Level;
  /** Grams (sodium in milligrams) in the amount rated. */
  amount: number;
}

export interface FopBox {
  per: "serving" | "100g";
  grams: number;
  chips: FopChip[];
}

export const levelOf = (dv: number): Level => (dv <= 5 ? "low" : dv >= 20 ? "high" : "med");

export function fopBox(p: Product): FopBox | null {
  const n = p.nutriments;
  const grams = p.servingGrams ?? 100;
  const per = p.servingGrams ? "serving" : "100g";
  const k = grams / 100;
  const chips: FopChip[] = [];
  const chip = (nutrient: FopNutrient, per100: number | undefined, dvGrams: number, mg = false) => {
    if (per100 === undefined) return;
    const amount = per100 * k;
    const dv = Math.round((amount / dvGrams) * 100);
    chips.push({
      nutrient,
      dv,
      level: levelOf(dv),
      amount: mg ? Math.round(amount * 1000) : amount,
    });
  };
  chip("saturatedFat", n.saturatedFat, DAILY_VALUES.saturatedFat);
  chip("sodium", n.salt !== undefined ? n.salt / 2.5 : undefined, DAILY_VALUES.sodium, true);
  // Added sugars are rarely listed outside the US: total sugars stand in, labelled as such.
  if (n.addedSugars !== undefined) chip("addedSugars", n.addedSugars, DAILY_VALUES.addedSugars);
  else chip("sugars", n.sugars, DAILY_VALUES.addedSugars);
  return chips.length ? { per, grams, chips } : null;
}
