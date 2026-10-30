import { describe, expect, test } from "bun:test";
import { RAW } from "../data/fixtures";
import { normalize } from "../data/off";
import type { Product } from "../data/product";
import { nutriscore } from "./nutriscore";
import { interpolate, scoreProduct, verdictOf } from "./score";

const product = (key: keyof typeof RAW, lang = "en") => normalize(RAW[key], "off", lang);

describe("normalize", () => {
  test("reads names in the user's language", () => {
    expect(product("ritter", "fr").name).toBe("Pâte d'amandes Marzipan");
    expect(product("ritter", "de").name).toBe("Marzipan");
    expect(product("ritter", "en").name).toBe("Marzipane chocolate");
    expect(product("ritter", "nl").name).toBe("RITTER SPORT marsepein");
  });

  test("keeps missing values missing", () => {
    const p = product("nutellaFr");
    expect(p.nutriscore).toBeUndefined();
    expect(p.nutriments.sugars).toBe(56.3);
    expect(normalize({ code: "1" }, "off", "en").nutriments).toEqual({});
  });

  test("reads Open Food Facts attributes", () => {
    const nutriscore = product("cheerios").attributes.find((a) => a.id === "nutriscore");
    expect(nutriscore).toMatchObject({
      group: "nutritional_quality",
      status: "known",
      title: "Nutri-Score C",
    });
  });

  test("a drink and a water", () => {
    expect(product("dietCoke").isBeverage).toBe(true);
    expect(product("water").isWater).toBe(true);
    expect(product("cheerios").isBeverage).toBe(false);
  });
});

describe("Nutri-Score 2023, computed here", () => {
  // Our computation must land on the database's own score wherever it has one.
  // (Diet Coke is left out: its sugars and saturated fat are not filled in, which
  // the database scores as 0 and we, more carefully, as unknown.)
  for (const key of ["cheerios", "nutellaDe", "ritter"] as const) {
    test(`matches Open Food Facts for ${key}`, () => {
      const p = product(key);
      const ours = nutriscore({ ...p, isWater: false });
      expect(ours?.score).toBe(p.nutriscore?.score as number);
      expect(ours?.grade).toBe(p.nutriscore?.grade as "a");
    });
  }

  test("null without the four required values", () => {
    expect(
      nutriscore({
        nutriments: { sugars: 1 },
        isBeverage: false,
        isWater: false,
        sweeteners: false,
      }),
    ).toBeNull();
  });

  test("sweeteners cost a drink 4 points", () => {
    const base = {
      nutriments: { energyKj: 5, sugars: 0, saturatedFat: 0, salt: 0 },
      isBeverage: true,
      isWater: false,
    };
    expect(nutriscore({ ...base, sweeteners: false })?.score).toBe(0);
    expect(nutriscore({ ...base, sweeteners: true })?.score).toBe(4);
    expect(nutriscore({ ...base, sweeteners: true })?.grade).toBe("c");
  });

  test("proteins count for cheese even when negatives are high", () => {
    const n = { energyKj: 1600, sugars: 0.5, saturatedFat: 18, salt: 1.8, proteins: 25 };
    const plain = nutriscore({
      nutriments: n,
      isBeverage: false,
      isWater: false,
      sweeteners: false,
    });
    const cheese = nutriscore({
      nutriments: n,
      isBeverage: false,
      isWater: false,
      sweeteners: false,
      isCheese: true,
    });
    expect((plain?.score ?? 0) - (cheese?.score ?? 0)).toBe(7);
  });
});

describe("goodscan score", () => {
  test("water is excellent", () => {
    const s = scoreProduct(product("water"));
    expect(s.value).toBe(100);
    expect(s.verdict).toBe("excellent");
  });

  test("Nutella DE is bad: grade E and ultra-processed", () => {
    const s = scoreProduct(product("nutellaDe"));
    expect(s.verdict).toBe("bad");
    expect(s.value).toBeLessThan(25);
    expect(s.reasons.map((r) => r.key)).toContain("nova4");
  });

  test("Nutella FR: the database could not grade it, we compute E from its facts", () => {
    const s = scoreProduct(product("nutellaFr"));
    expect(s.nutri).toEqual({ grade: "e", score: 31, computed: true });
    expect(s.reasons[0]?.key).toBe("nutritionComputed");
    expect(s.verdict).toBe("bad");
  });

  test("no nutrition facts at all: no score, but what is known is said", () => {
    const p = { ...normalize({ code: "1", nova_group: 4 }, "off", "en") };
    const s = scoreProduct(p);
    expect(s.value).toBeNull();
    expect(s.verdict).toBe("unknown");
    expect(s.reasons.map((r) => r.key)).toEqual(["nutritionMissing", "nova4"]);
  });

  test("Diet Coke: grade B, but ultra-processed, a caramel, a benzoate and a phosphate", () => {
    const s = scoreProduct(product("dietCoke"));
    expect(s.reasons.map((r) => r.key)).toEqual([
      "nutrition",
      "nova4",
      "additiveModerate",
      "additiveHigh",
      "additiveHigh",
    ]);
    expect(s.additives.find((a) => a.tag === "en:e150c")?.risk).toBe("moderate");
    expect(s.additives.find((a) => a.tag === "en:e212")?.risk).toBe("high");
    expect(s.additives.find((a) => a.tag === "en:e338")?.risk).toBe("high");
    // 72 from grade B (0 points), −12 for NOVA 4, −36 for the additives
    expect(
      interpolate(
        [
          [-10, 82],
          [2, 70],
        ],
        0,
      ),
    ).toBe(72);
    expect(s.value).toBe(24);
    expect(s.verdict).toBe("bad");
  });

  test("Cheerios: grade C, but a high-risk phosphate caps it", () => {
    const s = scoreProduct(product("cheerios"));
    expect(s.nutri).toEqual({ grade: "c", score: 8, computed: false });
    expect(s.value).toBeLessThanOrEqual(49);
    expect(s.verdict).toBe("poor");
  });

  const blank: Product = {
    ...normalize({ code: "1" }, "off", "en"),
    name: "Test ham",
    nutriscore: { grade: "a", score: -5 },
  };

  test("a high-risk additive caps the score at 49", () => {
    const s = scoreProduct({ ...blank, additives: ["en:e250"] });
    expect(s.value).toBe(49);
    expect(s.reasons.at(-1)).toMatchObject({ key: "additiveHigh", cap: 49 });
  });

  test("an additive the EU does not authorise caps it at 25", () => {
    const s = scoreProduct({ ...blank, additives: ["en:e171"] });
    expect(s.value).toBe(25);
    expect(s.additives[0]?.euNotAuthorised).toBe(true);
  });

  test("additive penalties stop at 45", () => {
    const s = scoreProduct({
      ...blank,
      nutriscore: { grade: "a", score: -15 },
      additives: ["en:e150c", "en:e150d", "en:e250", "en:e251", "en:e252", "en:e171"],
    });
    expect(s.value).toBe(25);
    expect(
      scoreProduct({ ...blank, nutriscore: { grade: "a", score: -15 }, additives: ["en:e150c"] })
        .value,
    ).toBe(94);
  });

  test("aspartame: an official concern costs 6, in food as in drinks", () => {
    const s = scoreProduct({ ...blank, additives: ["en:e951"] });
    expect(s.additives[0]?.evidenceWeighs).toBe(true);
    expect(s.reasons.at(-1)).toEqual({ key: "additiveEvidence", additive: "en:e951", delta: -6 });
    expect(s.value).toBe((scoreProduct(blank).value ?? 0) - 6);
  });

  test("E471: concordant human cohorts cost 6", () => {
    const s = scoreProduct({ ...blank, additives: ["en:e471"] });
    expect(s.reasons.map((r) => r.key)).toContain("additiveEvidence");
    expect(s.additives[0]?.evidence?.some((e) => e.kind === "cohort")).toBe(true);
  });

  test("evidence does not stack on a high risk or an EU ban", () => {
    for (const tag of ["en:e250", "en:e171"]) {
      const s = scoreProduct({ ...blank, additives: [tag] });
      expect(s.additives[0]?.evidence?.length, tag).toBeGreaterThan(0);
      expect(
        s.reasons.map((r) => r.key),
        tag,
      ).not.toContain("additiveEvidence");
    }
  });

  test("Coca-Cola Zero: its sweeteners are cited and counted", () => {
    const s = scoreProduct(product("cokeZero"));
    const keys = s.reasons.filter((r) => r.key === "additiveEvidence").map((r) => r.additive);
    expect(keys).toContain("en:e951");
    expect(s.additives.find((a) => a.tag === "en:e950")?.evidence?.length).toBeGreaterThan(0);
  });

  test("processed meat: IARC group 1, −10 and at most 49, with its source", () => {
    const s = scoreProduct(product("grisons"));
    expect(s.reasons).toContainEqual({
      key: "processedMeat",
      delta: -10,
      cap: 49,
      source: "https://doi.org/10.1016/S1470-2045(15)00444-1",
    });
    expect(s.value).toBeLessThanOrEqual(49);
    expect(s.reasons.map((r) => r.key)).not.toContain("redMeat");
  });

  test("red meat: IARC group 2A, −5", () => {
    const s = scoreProduct(product("charal"));
    expect(s.reasons).toContainEqual(expect.objectContaining({ key: "redMeat", delta: -5 }));
    const without = scoreProduct({ ...product("charal"), categories: [] });
    expect(s.value).toBe((without.value ?? 0) - 5);
  });

  test("a veal stock is not meat; poultry is not red meat", () => {
    const keys = (p: Product) => scoreProduct(p).reasons.map((r) => r.key);
    expect(keys(product("maggiVeal"))).not.toContain("redMeat");
    expect(keys(product("maggiVeal"))).not.toContain("processedMeat");
    expect(
      keys({ ...blank, categories: ["en:meats", "en:poultries", "en:chickens"] }),
    ).not.toContain("redMeat");
    expect(keys({ ...blank, categories: ["en:meats", "en:pork", "en:bacon"] })).toContain(
      "processedMeat",
    );
  });

  test("organic adds 5, palm oil takes 3", () => {
    const base = scoreProduct(blank).value ?? 0;
    expect(scoreProduct({ ...blank, labels: ["en:organic"] }).value).toBe(Math.min(100, base + 5));
    expect(scoreProduct({ ...blank, analysis: ["en:palm-oil"] }).value).toBe(base - 3);
  });

  test("not food: no score", () => {
    expect(scoreProduct({ ...blank, source: "opff" }).verdict).toBe("not-food");
  });

  test("alcohol is capped at 20", () => {
    const s = scoreProduct({ ...blank, categories: ["en:alcoholic-beverages"] });
    expect(s.value).toBe(20);
    expect(s.verdict).toBe("bad");
  });

  test("Nutri-Score not applicable: a neutral start", () => {
    const s = scoreProduct({
      ...blank,
      nutriscore: undefined as never,
      nutriscoreNotApplicable: true,
    });
    expect(s.value).toBe(75);
  });

  test("verdict bands", () => {
    expect([100, 75, 74, 50, 49, 25, 24, 0].map(verdictOf)).toEqual([
      "excellent",
      "excellent",
      "good",
      "good",
      "poor",
      "poor",
      "bad",
      "bad",
    ]);
  });
});
