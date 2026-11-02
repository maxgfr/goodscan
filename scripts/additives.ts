/**
 * Builds src/data/additives.json from the Open Food Facts additives taxonomy:
 * each additive's name (en, fr, de), EFSA's overexposure risk, whether ANSES
 * lists it, what it is used for (its classes) and EFSA's evaluation, nothing
 * else. Also builds src/data/additiveClasses.json: what each class does, in
 * en, fr and de. Data © Open Food Facts contributors, ODbL.
 */
import { EU_NOT_AUTHORISED } from "../src/data/eu";

const BASE = "https://static.openfoodfacts.org/data/taxonomies";
const HEADERS = { "User-Agent": "goodscan/1.0 (https://github.com/maxgfr/goodscan)" };

type Entry = Record<string, Record<string, string> | undefined>;

async function taxonomy(name: string): Promise<Record<string, Entry>> {
  const url = `${BASE}/${name}.json`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return (await res.json()) as Record<string, Entry>;
}

/** en, and fr and de when they differ from en. */
function trio(names: Record<string, string> | undefined, fallback: string): Record<string, string> {
  const en = names?.en ?? fallback;
  const out: Record<string, string> = { en };
  if (names?.fr && names.fr !== en) out.fr = names.fr;
  if (names?.de && names.de !== en) out.de = names.de;
  return out;
}

const additives = await taxonomy("additives");
const classes = await taxonomy("additives_classes");

const slug = (tag: string) => tag.replace(/^en:/, "");

const classesOf = (entry: Entry | undefined) =>
  (entry?.additives_classes?.en ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s in classes)
    .map(slug);

/** The taxonomy's links, tidied: DOIs on doi.org, https, no spreadsheets. */
function efsaUrl(raw: string | undefined): string | undefined {
  const url = raw
    ?.trim()
    .replace(/^hhttps:/, "https:")
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "https://doi.org/")
    .replace(/^http:\/\/(www\.)?efsa\.europa\.eu/, "https://www.efsa.europa.eu");
  return url && /^https:\/\//.test(url) && !/\.xlsx?$/.test(url) ? url : undefined;
}

const RISK = { high: "h", moderate: "m", no: "n" } as const;
interface Out {
  n: Record<string, string>;
  r?: "h" | "m" | "n";
  a?: 1;
  /** Classes: what it is used for. */
  c?: string[];
  /** EFSA's evaluation: its page and year. */
  e?: { u: string; y?: number };
}
const out: Record<string, Out> = {};
const used = new Set<string>();

for (const [tag, entry] of Object.entries(additives)) {
  if (!/^en:e\d/.test(tag)) continue;
  const item: Out = { n: trio(entry.name, tag.slice(3)) };
  const risk = entry.efsa_evaluation_overexposure_risk?.en?.replace(/^en:/, "");
  if (risk && risk in RISK) item.r = RISK[risk as keyof typeof RISK];
  if (entry.anses_additives_of_interest?.en === "yes") item.a = 1;
  // A subtype (E100i) is used like its family (E100) when it says nothing itself.
  let c = classesOf(entry);
  for (const parent of (entry.parents as unknown as string[] | undefined) ?? []) {
    if (!c.length) c = classesOf(additives[parent]);
  }
  if (c.length) {
    item.c = c;
    for (const s of c) used.add(s);
  }
  const url = efsaUrl(entry.efsa_evaluation_url?.en);
  if (url) {
    const year = Number(entry.efsa_evaluation_date?.en?.match(/\b(?:19|20)\d\d\b/)?.[0]);
    item.e = year ? { u: url, y: year } : { u: url };
  }
  out[tag] = item;
}

for (const tag of Object.keys(EU_NOT_AUTHORISED)) {
  if (!out[tag]) throw new Error(`${tag} is not in the taxonomy`);
}

const byKey = <T>(o: Record<string, T>) =>
  Object.fromEntries(
    Object.entries(o).sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true })),
  );

// The names are the app's own (src/i18n, role_*): the taxonomy's have gaps.
const classOut: Record<string, Record<string, string>> = {};
for (const [tag, entry] of Object.entries(classes)) {
  const s = slug(tag);
  if (used.has(s) && entry.description?.en) classOut[s] = trio(entry.description, "");
}

await Bun.write("src/data/additives.json", `${JSON.stringify(byKey(out))}\n`);
await Bun.write("src/data/additiveClasses.json", `${JSON.stringify(byKey(classOut))}\n`);
const count = (r: string) => Object.values(out).filter((x) => x.r === r).length;
const withClass = Object.values(out).filter((x) => x.c).length;
console.log(
  `${Object.keys(out).length} additives, ${count("h")} high risk, ${count("m")} moderate, ${withClass} with a class; ${Object.keys(classOut).length} classes`,
);
