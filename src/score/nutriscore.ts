/**
 * Nutri-Score, 2023 algorithm (in force in France and Germany since
 * 2024–2025), for when the database could not compute it: a product with
 * nutrition facts but no grade, or values read from a label photo. Covers
 * general foods, cheeses, red meat and drinks; the "fats, oils, nuts and
 * seeds" group uses the general table, a small approximation.
 *
 * Points are the number of thresholds a value is strictly above.
 */
import type { Grade, Nutriments } from "../data/product";

const points = (value: number, thresholds: number[]) =>
  thresholds.reduce((n, t) => (value > t ? n + 1 : n), 0);

const FOOD = {
  energy: [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350],
  sugars: [3.4, 6.8, 10, 14, 17, 20, 24, 27, 31, 34, 37, 41, 44, 48, 51],
  saturatedFat: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  salt: [
    0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4,
  ],
  proteins: [2.4, 4.8, 7.2, 9.6, 12, 14, 17],
  fiber: [3, 4.1, 5.2, 6.3, 7.4],
};

const DRINK = {
  energy: [30, 90, 150, 210, 240, 270, 300, 330, 360, 390],
  sugars: [0.5, 2, 3.5, 5, 6, 7, 8, 9, 10, 11],
  proteins: [1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3],
};

export interface NutriInput {
  nutriments: Nutriments;
  isBeverage: boolean;
  isWater: boolean;
  sweeteners: boolean;
  isCheese?: boolean;
  isRedMeat?: boolean;
}

export interface NutriResult {
  score: number;
  grade: Grade;
}

/** Null when a value the score needs is missing. */
export function nutriscore(p: NutriInput): NutriResult | null {
  if (p.isWater) return { score: 0, grade: "a" };
  const n = p.nutriments;
  const energy = n.energyKj ?? (n.energyKcal !== undefined ? n.energyKcal * 4.184 : undefined);
  if (
    energy === undefined ||
    n.sugars === undefined ||
    n.saturatedFat === undefined ||
    n.salt === undefined
  ) {
    return null;
  }
  const fiber = n.fiber ?? 0;
  const proteins = n.proteins ?? 0;
  const fv = n.fruitsVeg ?? 0;

  if (p.isBeverage) {
    const negative =
      points(energy, DRINK.energy) +
      points(n.sugars, DRINK.sugars) +
      points(n.saturatedFat, FOOD.saturatedFat) +
      points(n.salt, FOOD.salt) +
      (p.sweeteners ? 4 : 0);
    const fvPoints = fv > 80 ? 6 : fv > 60 ? 4 : fv > 40 ? 2 : 0;
    const score =
      negative - (points(proteins, DRINK.proteins) + points(fiber, FOOD.fiber) + fvPoints);
    const grade: Grade = score <= 2 ? "b" : score <= 6 ? "c" : score <= 9 ? "d" : "e";
    return { score, grade };
  }

  const negative =
    points(energy, FOOD.energy) +
    points(n.sugars, FOOD.sugars) +
    points(n.saturatedFat, FOOD.saturatedFat) +
    points(n.salt, FOOD.salt);
  const fvPoints = fv > 80 ? 5 : fv > 60 ? 2 : fv > 40 ? 1 : 0;
  let proteinPoints = points(proteins, FOOD.proteins);
  if (p.isRedMeat) proteinPoints = Math.min(2, proteinPoints);
  const countProteins = negative < 11 || p.isCheese;
  const score =
    negative - ((countProteins ? proteinPoints : 0) + points(fiber, FOOD.fiber) + fvPoints);
  const grade: Grade =
    score <= 0 ? "a" : score <= 2 ? "b" : score <= 10 ? "c" : score <= 18 ? "d" : "e";
  return { score, grade };
}
