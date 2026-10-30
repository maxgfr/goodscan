import { describe, expect, test } from "bun:test";
import additives from "./additives.json";
import { EVIDENCE, type Evidence, evidenceUrl, weighs } from "./evidence";

const finding = (kind: Evidence["kind"], concern = true): Evidence => ({
  summary: { en: "x", fr: "x", de: "x" },
  kind,
  source: { org: "Test", year: 2024, title: "t", url: "https://example.org" },
  concern,
});

describe("evidence data", () => {
  const entries = Object.entries(EVIDENCE);

  test("covers the sweeteners, emulsifiers, colours and nitrites researched", () => {
    for (const tag of ["en:e951", "en:e950", "en:e955", "en:e471", "en:e433", "en:e250"])
      expect(EVIDENCE[tag]?.length, tag).toBeGreaterThan(0);
  });

  test("every key is an additive of the taxonomy", () => {
    for (const [tag] of entries) expect(tag in additives, tag).toBe(true);
  });

  test("every finding is cited, dated and in three languages", () => {
    const year = new Date().getFullYear();
    for (const [tag, list] of entries) {
      expect(list.length, tag).toBeGreaterThan(0);
      for (const e of list) {
        const where = `${tag}: ${e.summary.en}`;
        for (const l of ["en", "fr", "de"] as const) {
          expect(e.summary[l].trim().length, where).toBeGreaterThan(20);
          expect(e.summary[l].length, where).toBeLessThanOrEqual(260);
        }
        expect(e.source.url, where).toMatch(/^https:\/\//);
        expect(e.source.org.length, where).toBeGreaterThan(1);
        expect(e.source.title.length, where).toBeGreaterThan(3);
        expect(e.source.year, where).toBeGreaterThanOrEqual(1970);
        expect(e.source.year, where).toBeLessThanOrEqual(year);
        if (e.source.doi) expect(e.source.doi, where).toMatch(/^10\.\d{4,9}\/\S+$/);
        if (e.source.pmid) expect(e.source.pmid, where).toMatch(/^\d{5,9}$/);
        // Studies are traceable to their record, official texts at least to their page.
        if (e.kind !== "official") expect(Boolean(e.source.doi || e.source.pmid), where).toBe(true);
      }
    }
  });

  test("links go to the DOI, then PubMed, then the page", () => {
    const e = finding("cohort");
    expect(evidenceUrl(e)).toBe("https://example.org");
    expect(evidenceUrl({ ...e, source: { ...e.source, pmid: "123456" } })).toBe(
      "https://pubmed.ncbi.nlm.nih.gov/123456/",
    );
    expect(evidenceUrl({ ...e, source: { ...e.source, pmid: "1", doi: "10.1136/bmj-1" } })).toBe(
      "https://doi.org/10.1136/bmj-1",
    );
  });
});

describe("what weighs", () => {
  test("an official concern weighs", () => {
    expect(weighs([finding("official")])).toBe(true);
  });

  test("two human studies of concern weigh, one does not", () => {
    expect(weighs([finding("cohort")])).toBe(false);
    expect(weighs([finding("cohort"), finding("meta")])).toBe(true);
    expect(weighs([finding("trial"), finding("cohort")])).toBe(true);
  });

  test("animal and lab work, or reassuring findings, never weigh", () => {
    expect(weighs([finding("animal"), finding("lab"), finding("animal")])).toBe(false);
    expect(weighs([finding("official", false), finding("cohort"), finding("meta", false)])).toBe(
      false,
    );
  });
});
