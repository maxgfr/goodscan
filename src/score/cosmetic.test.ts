import { describe, expect, test } from "bun:test";
import { COSMETICS, type CosmeticIngredient } from "../data/cosmetics";
import { RAW_OBF } from "../data/fixtures";
import { normalize } from "../data/off";
import type { Product } from "../data/product";
import {
  countedCategory,
  findConcerns,
  ingredientCount,
  ingredientNames,
  normalizeName,
  scoreCosmetic,
} from "./cosmetic";
import { scoreProduct } from "./score";

const cosmetic = (key: keyof typeof RAW_OBF, lang = "en") => normalize(RAW_OBF[key], "obf", lang);
const blank: Product = { ...normalize({ code: "1" }, "obf", "en"), name: "Test cream" };
const withList = (ingredients: string): Product => ({ ...blank, ingredients });
const byInci = (inci: string) => {
  const i = COSMETICS.find((c) => normalizeName(c.inci) === normalizeName(inci));
  if (!i) throw new Error(`${inci} is not in the list`);
  return i;
};
const ids = (text: string) => findConcerns(text).map((i) => i.id);

describe("cosmetic ingredients data", () => {
  test("100 to 150 ingredients, ids unique", () => {
    expect(COSMETICS.length).toBeGreaterThanOrEqual(100);
    expect(COSMETICS.length).toBeLessThanOrEqual(150);
    expect(new Set(COSMETICS.map((i) => i.id)).size).toBe(COSMETICS.length);
  });

  test("every ingredient is sourced, summarised in three languages", () => {
    const year = new Date().getFullYear();
    for (const i of COSMETICS) {
      expect(i.id, i.inci).toMatch(/^[a-z0-9-]+$/);
      expect(i.categories.length, i.id).toBeGreaterThan(0);
      for (const l of ["en", "fr", "de"] as const) {
        expect(i.summary[l].trim().length, `${i.id} ${l}`).toBeGreaterThan(20);
        expect(i.summary[l].length, `${i.id} ${l}`).toBeLessThanOrEqual(260);
      }
      expect(i.sources.length, i.id).toBeGreaterThan(0);
      for (const s of i.sources) {
        expect(s.url, i.id).toMatch(/^https:\/\//);
        expect(s.year, i.id).toBeGreaterThanOrEqual(1970);
        expect(s.year, i.id).toBeLessThanOrEqual(year);
        if (s.doi) expect(s.doi, i.id).toMatch(/^10\.\d{4,9}\/\S+$/);
        if (s.pmid) expect(s.pmid, i.id).toMatch(/^\d{5,9}$/);
      }
    }
  });

  test("no name points to two ingredients, and none is a generic word", () => {
    const seen = new Map<string, string>();
    for (const i of COSMETICS) {
      for (const n of [i.inci, ...i.synonyms.en, ...i.synonyms.fr, ...i.synonyms.de]) {
        const key = normalizeName(n);
        expect(key.length, `${i.id}: "${n}"`).toBeGreaterThan(2);
        expect(["parfum", "fragrance", "aroma", "alcohol", "water", "aqua"], i.id).not.toContain(
          key,
        );
        const other = seen.get(key);
        if (other && other !== i.id) throw new Error(`"${n}" is both ${other} and ${i.id}`);
        seen.set(key, i.id);
      }
    }
  });
});

describe("reading an ingredient list", () => {
  test("case, accents, punctuation and CI codes", () => {
    expect(normalizeName("Glycérine")).toBe("glycerine");
    expect(normalizeName("Alpha-Isomethyl Ionone*")).toBe("alpha isomethyl ionone");
    expect(normalizeName("CI77891")).toBe("ci 77891");
    expect(normalizeName("C.I. 77891")).toBe("c i 77891");
  });

  test("alternatives in parentheses, after slashes, in brackets", () => {
    const names = ingredientNames(
      "INGREDIENTS: Aqua/Water/Eau, Parfum (Fragrance), Linalool. [+/- May contain CI 77891, CI 77491]",
    );
    for (const n of [
      "aqua",
      "water",
      "eau",
      "parfum",
      "fragrance",
      "linalool",
      "ci 77891",
      "ci 77491",
    ])
      expect(names).toContain(n);
    expect(ingredientCount("Aqua, Glycerin, Parfum (Fragrance), Linalool")).toBe(4);
  });

  test("finds INCI names, synonyms and Open Beauty Facts tags", () => {
    const linalool = byInci("Linalool").id;
    expect(ids("aqua, LINALOOL, glycerin")).toEqual([linalool]);
    expect(ids("Parfum (Linalool)")).toEqual([linalool]);
    expect(findConcerns(undefined, ["en:aqua", "en:linalool"]).map((i) => i.id)).toEqual([
      linalool,
    ]);
    const lilial = byInci("Butylphenyl Methylpropional");
    for (const n of [...lilial.synonyms.fr, ...lilial.synonyms.de])
      expect(ids(n), n).toEqual([lilial.id]);
  });

  test("no false positive on words around a name", () => {
    expect(ids("Sans parfum, sans paraben, aqua, glycerin")).toEqual([]);
    expect(ids("Fragrance free. Aqua, Glycerin")).toEqual([]);
    expect(ids("Aqua, Linalool-free fragrance")).toEqual([]);
  });
});

const ingredient = (categories: CosmeticIngredient["categories"]): CosmeticIngredient => ({
  id: "x",
  inci: "X",
  synonyms: { en: [], fr: [], de: [] },
  categories,
  summary: { en: "", fr: "", de: "" },
  sources: [],
});

describe("ingredient score", () => {
  test("each ingredient counts once, at its strongest category", () => {
    expect(countedCategory(ingredient(["fragrance-allergen", "eu-prohibited"]))).toBe(
      "eu-prohibited",
    );
    expect(countedCategory(ingredient(["eu-restricted", "endocrine"]))).toBe("endocrine");
    // A US ban counts only when no EU rule covers the ingredient.
    expect(countedCategory(ingredient(["eu-restricted", "us-state-ban"]))).toBe("eu-restricted");
    expect(countedCategory(ingredient(["us-state-ban"]))).toBe("us-state-ban");
    expect(countedCategory(ingredient(["pfas", "us-state-ban"]))).toBe("pfas");
  });

  test("no list: no score", () => {
    const s = scoreCosmetic(blank);
    expect(s.value).toBeNull();
    expect(s.verdict).toBe("unknown");
    expect(s.reasons).toEqual([{ key: "ingredientsMissing" }]);
  });

  test("nothing of concern: 100", () => {
    const s = scoreCosmetic(withList("Aqua, Glycerin, Cetearyl Alcohol"));
    expect(s.value).toBe(100);
    expect(s.verdict).toBe("excellent");
    expect(s.reasons.map((r) => r.key)).toEqual(["ingredientsChecked", "ingredientsClean"]);
    expect(s.reasons[0]?.count).toBe(3);
  });

  test("an ingredient banned in the EU: −40 and at most 20", () => {
    const s = scoreCosmetic(withList("Aqua, Butylphenyl Methylpropional"));
    expect(s.value).toBe(20);
    expect(s.verdict).toBe("bad");
    expect(s.reasons[1]).toMatchObject({ key: "ingredientProhibited", delta: -40, cap: 20 });
  });

  test("fragrance allergens: −3 each, −15 at most", () => {
    const allergens = COSMETICS.filter((i) => countedCategory(i) === "fragrance-allergen");
    expect(allergens.length).toBeGreaterThanOrEqual(6);
    const two = scoreCosmetic(withList(`Aqua, ${allergens[0]?.inci}, ${allergens[1]?.inci}`));
    expect(two.value).toBe(94);
    expect(two.reasons.at(-1)).toEqual({ key: "ingredientAllergens", count: 2, delta: -6 });
    const six = scoreCosmetic(
      withList(
        allergens
          .slice(0, 6)
          .map((i) => i.inci)
          .join(", "),
      ),
    );
    expect(six.value).toBe(85);
  });

  test("the score never goes below 0", () => {
    const worst = COSMETICS.filter((i) => countedCategory(i) === "eu-prohibited").slice(0, 4);
    const s = scoreCosmetic(withList(worst.map((i) => i.inci).join(", ")));
    expect(s.value).toBe(0);
  });

  test("scoreProduct hands cosmetics over; pet food and other products stay unrated", () => {
    expect(scoreProduct(withList("Aqua")).value).toBe(100);
    expect(scoreProduct({ ...blank, source: "opff" }).verdict).toBe("not-food");
    expect(scoreProduct({ ...blank, source: "opf" }).verdict).toBe("not-food");
  });
});

describe("real Open Beauty Facts products", () => {
  test("Garnier (FR): seven fragrance allergens", () => {
    const s = scoreProduct(cosmetic("garnier", "fr"));
    expect(s.reasons.find((r) => r.key === "ingredientAllergens")?.count).toBeGreaterThanOrEqual(6);
    expect(s.cosmetic?.map((f) => f.ingredient.inci.toLowerCase())).toContain("linalool");
  });

  test("Nivea Soft (DE): allergens of the 2023 list", () => {
    const s = scoreProduct(cosmetic("nivea", "de"));
    expect(s.cosmetic?.length).toBeGreaterThanOrEqual(3);
    expect(s.verdict).not.toBe("unknown");
  });

  test("Secret (US): cyclopentasiloxane is restricted in the EU", () => {
    const s = scoreProduct(cosmetic("secret"));
    expect(s.reasons).toContainEqual(
      expect.objectContaining({
        key: "ingredientRestricted",
        ingredient: byInci("Cyclopentasiloxane").id,
      }),
    );
  });

  test("CeraVe (FR): a list in French is read, its tags too", () => {
    const p = cosmetic("cerave", "fr");
    expect(p.ingredientTags?.length).toBeGreaterThan(10);
    const s = scoreProduct(p);
    expect(s.value).not.toBeNull();
    expect(s.reasons[0]?.count).toBeGreaterThan(20);
  });
});
