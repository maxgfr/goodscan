import { describe, expect, test } from "bun:test";
import { additiveInfo, scoreProduct } from "../score/score";
import additives from "./additives.json";
import { RAW } from "./fixtures";
import { normalize } from "./off";
import { lawsShown, US_FOOD_LAWS } from "./usFoodLaws";

describe("US food additive laws", () => {
  const entries = Object.entries(US_FOOD_LAWS);

  test("cover the federal revocations and the state laws researched", () => {
    expect(US_FOOD_LAWS["en:e127"]?.some((l) => l.kind === "federal-ban")).toBe(true);
    expect(US_FOOD_LAWS["en:e443"]?.some((l) => l.kind === "federal-ban")).toBe(true);
    expect(US_FOOD_LAWS["en:e924a"]?.some((l) => l.jurisdiction === "California")).toBe(true);
    expect(US_FOOD_LAWS["en:e129"]?.some((l) => l.kind === "school-ban")).toBe(true);
  });

  test("every entry is an additive of the taxonomy, sourced, dated and in three languages", () => {
    for (const [tag, laws] of entries) {
      expect(tag in additives, tag).toBe(true);
      for (const l of laws) {
        const where = `${tag} ${l.jurisdiction} ${l.kind}`;
        for (const lang of ["en", "fr", "de"] as const)
          expect(l.summary[lang].length, where).toBeGreaterThan(20);
        expect(l.source.url, where).toMatch(/^https:\/\//);
        expect(l.source.year, where).toBeGreaterThanOrEqual(2023);
        if (l.kind === "federal-plan") expect(l.summary.en, where).toMatch(/not binding/i);
        else expect(l.effective, where).toBeTruthy();
      }
    }
  });

  test("school-meal bans show as one line naming the states", () => {
    const shown = lawsShown(US_FOOD_LAWS["en:e129"] ?? []);
    const school = shown.at(-1);
    expect(school?.summary.en).toMatch(/^Banned in school meals in \d+ US states: /);
    expect(school?.source.url).toContain("docs/research/us-food-laws");
    expect(shown.filter((l) => l.summary.en.startsWith("Banned in school meals"))).toHaveLength(1);
  });

  test("shown, not counted: the score does not move", () => {
    const a = additiveInfo("en:e129");
    expect(a.usLaws?.length).toBeGreaterThan(0);
    const coke = normalize(RAW.cokeZero, "off", "en");
    const without = { ...a, usLaws: undefined };
    expect(without.evidenceWeighs).toBe(a.evidenceWeighs);
    expect(scoreProduct(coke).value).toBe(17);
  });
});
