/** Three languages, picked from the browser, switchable in the settings. */
import { de } from "./de";
import { en, type MessageKey } from "./en";
import { fr } from "./fr";

export const LANGS = { en: "English", fr: "Français", de: "Deutsch" } as const;
export type Lang = keyof typeof LANGS;
export const DICTS = { en, fr, de };

export function detectLang(
  languages: readonly string[] = navigator.languages ?? [navigator.language],
): Lang {
  for (const l of languages) {
    const base = l.toLowerCase().split("-")[0];
    if (base && base in LANGS) return base as Lang;
  }
  return "en";
}

export type Region = "us" | "eu";

/**
 * US when the browser's first language is a US one (en-US, es-US); anywhere
 * else gets the European view. Only the first counts: a French browser that
 * also lists en-US is still in France.
 */
export function detectRegion(
  languages: readonly string[] = navigator.languages ?? [navigator.language],
): Region {
  return /-us$/i.test(languages[0] ?? "") ? "us" : "eu";
}

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function translator(lang: Lang): Translate {
  const dict = DICTS[lang];
  return (key, vars) => {
    const text = dict[key] ?? en[key] ?? key;
    return vars ? text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : text;
  };
}

export type { MessageKey };
