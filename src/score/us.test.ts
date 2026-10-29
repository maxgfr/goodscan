import { describe, expect, test } from "bun:test";
import { RAW } from "../data/fixtures";
import { normalize } from "../data/off";
import { fopBox, levelOf } from "./us";

describe("FDA front-of-package box", () => {
  test("levels from %DV", () => {
    expect([0, 5, 6, 19, 20, 80].map(levelOf)).toEqual([
      "low",
      "low",
      "med",
      "med",
      "high",
      "high",
    ]);
  });

  test("Cheerios per 39 g serving", () => {
    const box = fopBox(normalize(RAW.cheerios, "off", "en"));
    expect(box?.per).toBe("serving");
    expect(box?.grams).toBe(39);
    const sodium = box?.chips.find((c) => c.nutrient === "sodium");
    // 1.22 g salt / 100 g → 0.488 g sodium → 190 mg per 39 g → 8 % DV
    expect(sodium).toMatchObject({ dv: 8, level: "med", amount: 190 });
  });

  test("Nutella: added sugars when listed", () => {
    const box = fopBox(normalize(RAW.nutellaFr, "off", "en"));
    expect(box?.chips.map((c) => c.nutrient)).toEqual(["saturatedFat", "sodium", "addedSugars"]);
  });

  test("total sugars stand in when added sugars are not listed", () => {
    const p = normalize(
      { code: "1", nutriments: { sugars_100g: 56.3 }, serving_quantity: 15 },
      "off",
      "en",
    );
    const sugars = fopBox(p)?.chips.find((c) => c.nutrient === "sugars");
    expect(sugars).toMatchObject({ level: "med", dv: 17 }); // 8.4 g of 50 g
  });

  test("nothing to rate", () => {
    expect(fopBox(normalize({ code: "1" }, "off", "en"))).toBeNull();
  });
});
