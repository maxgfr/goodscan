import { describe, expect, test } from "bun:test";
import { DICTS, detectLang, detectRegion, translator } from ".";
import { en } from "./en";

describe("i18n", () => {
  test("every language has every key, none empty, same placeholders", () => {
    const keys = Object.keys(en).sort();
    for (const [lang, dict] of Object.entries(DICTS)) {
      expect(Object.keys(dict).sort()).toEqual(keys);
      for (const k of keys) {
        const text = dict[k as keyof typeof en];
        expect(text.length, `${lang}.${k}`).toBeGreaterThan(0);
        const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
        expect(vars(text), `${lang}.${k}`).toEqual(vars(en[k as keyof typeof en]));
      }
    }
  });

  test("detects the language and the region", () => {
    expect(detectLang(["de-AT", "en"])).toBe("de");
    expect(detectLang(["fr-CA"])).toBe("fr");
    expect(detectLang(["es-ES"])).toBe("en");
    expect(detectRegion(["en-US"])).toBe("us");
    expect(detectRegion(["fr-FR", "en-GB"])).toBe("eu");
    expect(detectRegion(["fr-FR", "en-US"])).toBe("eu");
    expect(detectRegion(["es-US", "en"])).toBe("us");
  });

  test("fills placeholders", () => {
    expect(translator("fr")("lookupWait", { s: 12 })).toBe(
      "Trop de recherches en une minute. Réessayez dans 12 s.",
    );
  });
});
