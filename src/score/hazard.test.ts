import { describe, expect, test } from "bun:test";
import additives from "../data/additives.json";
import data from "../data/hazards.json";
import { normalize } from "../data/off";
import type { Product } from "../data/product";
import { findConcerns, rateIngredients, scoreCosmetic } from "./cosmetic";
import { additiveHazard, categoriesOf, findingsOf } from "./hazard";
import { additiveInfo, additiveReason, scoreProduct } from "./score";

const blank: Product = { ...normalize({ code: "1" }, "obf", "en"), name: "Test cream" };
const withList = (ingredients: string): Product => ({ ...blank, ingredients });
const cosmetics = data.cosmetics as Record<string, { n?: string }>;

describe("official lists, the extract", () => {
  test("is recent and covers additives and cosmetics", () => {
    expect(data.date).toMatch(/^20\d\d-\d\d-\d\d$/);
    expect(Object.keys(data.additives).length).toBeGreaterThan(15);
    expect(Object.keys(data.cosmetics).length).toBeGreaterThan(800);
  });

  test("every additive is one of the taxonomy", () => {
    for (const tag of Object.keys(data.additives)) expect(tag in additives, tag).toBe(true);
  });

  test("every finding has a sentence in three languages and a source", () => {
    for (const r of [...Object.values(data.additives), ...Object.values(data.cosmetics)]) {
      for (const f of findingsOf(r)) {
        for (const l of ["en", "fr", "de"] as const)
          expect(f.summary[l].length).toBeGreaterThan(20);
        expect(f.source.url).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("levels", () => {
  test("IARC: 1 and 2A high, 2B moderate", () => {
    expect(findingsOf({ i: ["1", 2010] })[0]?.level).toBe("high");
    expect(findingsOf({ i: ["2A"] })[0]?.level).toBe("high");
    expect(findingsOf({ i: ["2B", 2023] })[0]?.level).toBe("moderate");
  });

  test("CLP: CMR 1A/1B high, 2 moderate, sensitisers low", () => {
    expect(findingsOf({ c: ["x", ["H350"]] })[0]?.level).toBe("high");
    expect(findingsOf({ c: ["x", ["H360FD"]] })[0]?.level).toBe("high");
    expect(findingsOf({ c: ["x", ["H361d"]] })[0]?.level).toBe("moderate");
    expect(findingsOf({ c: ["x", ["H317"]] })[0]?.level).toBe("low");
  });

  test("endocrine lists: I high, III moderate, II (under investigation) not counted", () => {
    expect(findingsOf({ e: "I" })[0]?.level).toBe("high");
    expect(findingsOf({ e: "III" })[0]?.level).toBe("moderate");
    expect(findingsOf({ e: "II" })[0]?.level).toBe("low");
    expect(categoriesOf({ e: "II" })).toEqual(["under-review"]);
  });

  test("a cosmetics annex is shown, never counted as a ban", () => {
    // Annex II entry 904: petrolatum is banned only unless fully refined.
    expect(categoriesOf({ a: "II/904" })).toEqual(["eu-annex-ii"]);
    expect(findingsOf({ a: "III/84" })[0]?.level).toBe("listed");
  });
});

describe("additives", () => {
  test("formaldehyde, boric acid and borax are high; aspartame keeps its cited evidence", () => {
    expect(additiveHazard("en:e240")?.level).toBe("high");
    expect(additiveReason(additiveInfo("en:e284"))).toMatchObject({
      key: "additiveHazardHigh",
      delta: -15,
      cap: 49,
    });
    expect(additiveReason(additiveInfo("en:e951"))?.key).toBe("additiveEvidence");
  });

  test("each additive counts once, for the strongest finding", () => {
    // Steviol glycosides: EFSA moderate overexposure and evidence that weighs, −6 once.
    const a = additiveInfo("en:e960");
    expect(a.risk).toBe("moderate");
    expect(a.evidenceWeighs).toBe(true);
    const p = {
      ...normalize({ code: "1" }, "off", "en"),
      nutriscore: { grade: "a" as const, score: -15 },
    };
    const s = scoreProduct({ ...p, additives: ["en:e960"] });
    expect(s.reasons.filter((r) => r.additive)).toHaveLength(1);
    expect(s.value).toBe(94);
  });

  test("a polymer does not inherit its monomer's classification", () => {
    expect(additiveHazard("en:e1202")).toBeUndefined();
  });
});

describe("cosmetics", () => {
  test("drinking ethanol's IARC group does not follow alcohol onto the skin", () => {
    expect(cosmetics["en:alcohol"]).toBeUndefined();
    expect(scoreCosmetic(withList("Alcohol, Aqua, Glycerin")).value).toBe(100);
  });

  test("petrolatum and mineral oil are not banned", () => {
    expect(scoreCosmetic(withList("Petrolatum, Paraffinum Liquidum, Aqua")).value).toBe(100);
  });

  test("an ingredient no hand-kept entry covers is found in the official lists", () => {
    const s = scoreCosmetic(withList("Aqua, Cocamide DEA, Glycerin"));
    expect(s.reasons[1]).toMatchObject({ key: "ingredientSuspected", delta: -8 });
    expect(s.value).toBe(92);
  });

  test("a hand-kept entry gains the official findings, its own summary leads", () => {
    const [lilial] = findConcerns("Butylphenyl Methylpropional");
    expect(lilial?.categories).toEqual(expect.arrayContaining(["eu-prohibited", "cmr"]));
    expect(lilial?.summary.en).toMatch(/^Lilial/);
    expect(lilial?.sources.some((s) => s.org === "EU CLP, Annex VI")).toBe(true);
  });

  test("titanium dioxide, by name or colour index, is a suspected carcinogen", () => {
    expect(scoreCosmetic(withList("Aqua, CI 77891")).value).toBe(92);
    expect(scoreCosmetic(withList("Aqua, Titanium Dioxide")).value).toBe(92);
  });

  test("packaging text run into the list is not an ingredient", () => {
    const items = rateIngredients(
      withList(
        "Aqua, Glycerin, Contenance nette: 250 ml EMB 75112W Ref: 990108 Date de fabrication / N° de lot",
      ),
    );
    expect(items.map((i) => i.label)).toEqual(["Aqua", "Glycerin"]);
  });

  test("banned in Canada: counts where no EU rule covers it", () => {
    // A prostaglandin analogue of eyelash serums: prohibited by Health Canada, not named by the EU.
    const s = scoreCosmetic(withList("Aqua, Isopropyl Cloprostenate"));
    expect(s.reasons[1]).toMatchObject({ key: "ingredientNonEuBan", delta: -20 });
    // A thioglycolate the EU allows within limits (annex III): the EU rule settles it.
    expect(scoreCosmetic(withList("Aqua, Glyceryl Thioglycolate")).value).toBe(100);
  });

  test("glycerin, restricted in Canada only for an impurity, is not flagged", () => {
    expect(findConcerns("Glycerin")).toEqual([]);
  });

  test("the FDA's lists: chloroform prohibited, mercury compounds restricted", () => {
    const [chloroform] = findingsOf({ f: ["P", "700.18"] });
    expect(chloroform?.level).toBe("high");
    expect(chloroform?.summary.en).toContain("21 CFR 700.18");
    expect(categoriesOf({ f: ["R", "700.13"] })).toEqual(["restricted-abroad"]);
    expect(categoriesOf({ h: "P" })).toEqual(["non-eu-ban"]);
  });

  test("every ingredient of the list gets a level, in its order", () => {
    const items = rateIngredients(
      withList("Aqua, Linalool, Cocamide DEA, Butylphenyl Methylpropional"),
    );
    expect(items.map((i) => [i.label, i.level])).toEqual([
      ["Aqua", "none"],
      ["Linalool", "low"],
      ["Cocamide DEA", "moderate"],
      ["Butylphenyl Methylpropional", "high"],
    ]);
  });
});
