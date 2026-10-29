import { describe, expect, test } from "bun:test";
import { RAW } from "../data/fixtures";
import { normalize } from "../data/off";
import type { Attribute } from "../data/product";
import { DEFAULT_PREFERENCES, matchProduct } from "./match";

const attr = (id: string, match?: number): Attribute =>
  match === undefined
    ? { id, group: "g", status: "unknown", title: id }
    : { id, group: "g", status: "known", match, title: id };

describe("preference matching", () => {
  test("defaults come from Open Food Facts", () => {
    expect(DEFAULT_PREFERENCES).toEqual({
      nutriscore: "very_important",
      nova: "important",
      ecoscore: "important",
    });
  });

  test("weighted average of known attributes", () => {
    const m = matchProduct(
      { attributes: [attr("a", 100), attr("b", 40)] },
      { a: "very_important", b: "important" },
    );
    expect(m.score).toBe(80);
    expect(m.status).toBe("very_good_match");
  });

  test("a mandatory allergen rules the product out", () => {
    const m = matchProduct(
      { attributes: [attr("nutriscore", 90), attr("allergens_no_gluten", 0)] },
      { nutriscore: "very_important", allergens_no_gluten: "mandatory" },
    );
    expect(m.status).toBe("does_not_match");
    expect(m.score).toBe(0);
    expect(m.failed.map((a) => a.id)).toEqual(["allergens_no_gluten"]);
  });

  test("traces: may not match", () => {
    const m = matchProduct(
      { attributes: [attr("allergens_no_nuts", 20)] },
      { allergens_no_nuts: "mandatory" },
    );
    expect(m.status).toBe("may_not_match");
  });

  test("unknown mandatory or too much unknown", () => {
    expect(
      matchProduct(
        { attributes: [attr("vegan"), attr("nutriscore", 80)] },
        { vegan: "mandatory", nutriscore: "important" },
      ).status,
    ).toBe("unknown_match");
    expect(
      matchProduct({ attributes: [attr("a"), attr("b", 90)] }, { a: "important", b: "important" })
        .status,
    ).toBe("unknown_match");
  });

  test("real products with the default preferences", () => {
    const nutella = matchProduct(normalize(RAW.nutellaDe, "off", "en"), DEFAULT_PREFERENCES);
    expect(nutella.status).toBe("poor_match");
    const water = matchProduct(normalize(RAW.water, "off", "en"), DEFAULT_PREFERENCES);
    expect(["very_good_match", "unknown_match"]).toContain(water.status);
  });
});
