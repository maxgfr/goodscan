/**
 * Builds src/data/additives.json from the Open Food Facts additives taxonomy:
 * each additive's name (en, fr, de), EFSA's overexposure risk and whether
 * ANSES lists it, nothing else. Data © Open Food Facts contributors, ODbL.
 */
import { EU_NOT_AUTHORISED } from "../src/data/eu";

const URL = "https://static.openfoodfacts.org/data/taxonomies/additives.json";

type Entry = Record<string, Record<string, string> | undefined> & {
  name?: Record<string, string>;
};

const res = await fetch(URL, {
  headers: { "User-Agent": "goodscan/1.0 (https://github.com/maxgfr/goodscan)" },
});
if (!res.ok) throw new Error(`${URL}: ${res.status}`);
const taxonomy = (await res.json()) as Record<string, Entry>;

const RISK = { high: "h", moderate: "m", no: "n" } as const;
const out: Record<string, { n: Record<string, string>; r?: "h" | "m" | "n"; a?: 1 }> = {};

for (const [tag, entry] of Object.entries(taxonomy)) {
  if (!/^en:e\d/.test(tag)) continue;
  const names = entry.name ?? {};
  const en = names.en ?? tag.slice(3);
  const n: Record<string, string> = { en };
  if (names.fr && names.fr !== en) n.fr = names.fr;
  if (names.de && names.de !== en) n.de = names.de;
  const item: (typeof out)[string] = { n };
  const risk = entry.efsa_evaluation_overexposure_risk?.en?.replace(/^en:/, "");
  if (risk && risk in RISK) item.r = RISK[risk as keyof typeof RISK];
  if (entry.anses_additives_of_interest?.en === "yes") item.a = 1;
  out[tag] = item;
}

for (const tag of Object.keys(EU_NOT_AUTHORISED)) {
  if (!out[tag]) throw new Error(`${tag} is not in the taxonomy`);
}

const sorted = Object.fromEntries(
  Object.entries(out).sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true })),
);
await Bun.write("src/data/additives.json", `${JSON.stringify(sorted)}\n`);
const count = (r: string) => Object.values(out).filter((x) => x.r === r).length;
console.log(
  `${Object.keys(out).length} additives, ${count("h")} high risk, ${count("m")} moderate`,
);
