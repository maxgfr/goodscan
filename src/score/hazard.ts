/**
 * What official lists say about an ingredient, from src/data/hazards.json
 * (bun run hazards): IARC classifications, the EU harmonised classification
 * (CLP Annex VI), the EU endocrine-disruptor lists and, for cosmetics, the
 * annexes of the Cosmetics Regulation. Each finding becomes a level, a
 * sentence in three languages and a link to its source.
 */
import type { CosmeticCategory, CosmeticIngredient, CosmeticSource } from "../data/cosmetics";
import type { Evidence } from "../data/evidence";
import data from "../data/hazards.json";

type IarcGroup = "1" | "2A" | "2B";
export interface HazardRecord {
  i?: [IarcGroup, number?] | (string | number)[];
  c?: [string, string[]] | (string | string[])[];
  e?: string;
  a?: string;
  n?: string;
  k?: string;
}

const HAZARDS = data as unknown as {
  date: string;
  additives: Record<string, HazardRecord>;
  cosmetics: Record<string, HazardRecord>;
};
const YEAR = Number(HAZARDS.date.slice(0, 4));

export type HazardLevel = "high" | "moderate" | "low";
type Lang = "en" | "fr" | "de";
type Text = Record<Lang, string>;

const IARC_TEXT: Record<IarcGroup, Text> = {
  "1": {
    en: "carcinogenic to humans",
    fr: "cancérogène pour l'homme",
    de: "krebserregend für den Menschen",
  },
  "2A": {
    en: "probably carcinogenic to humans",
    fr: "cancérogène probable pour l'homme",
    de: "wahrscheinlich krebserregend für den Menschen",
  },
  "2B": {
    en: "possibly carcinogenic to humans",
    fr: "cancérogène possible pour l'homme",
    de: "möglicherweise krebserregend für den Menschen",
  },
};

/** CLP hazard statements kept, with their level. */
const CLP: { re: RegExp; level: HazardLevel; text: Text }[] = [
  {
    re: /^H350i?$/,
    level: "high",
    text: { en: "may cause cancer", fr: "peut provoquer le cancer", de: "kann Krebs erzeugen" },
  },
  {
    re: /^H340$/,
    level: "high",
    text: {
      en: "may cause genetic defects",
      fr: "peut induire des anomalies génétiques",
      de: "kann genetische Defekte verursachen",
    },
  },
  {
    re: /^H360/,
    level: "high",
    text: {
      en: "may damage fertility or the unborn child",
      fr: "peut nuire à la fertilité ou au fœtus",
      de: "kann die Fruchtbarkeit beeinträchtigen oder das Kind im Mutterleib schädigen",
    },
  },
  {
    re: /^H351$/,
    level: "moderate",
    text: {
      en: "suspected of causing cancer",
      fr: "susceptible de provoquer le cancer",
      de: "kann vermutlich Krebs erzeugen",
    },
  },
  {
    re: /^H341$/,
    level: "moderate",
    text: {
      en: "suspected of causing genetic defects",
      fr: "susceptible d'induire des anomalies génétiques",
      de: "kann vermutlich genetische Defekte verursachen",
    },
  },
  {
    re: /^H361/,
    level: "moderate",
    text: {
      en: "suspected of damaging fertility or the unborn child",
      fr: "susceptible de nuire à la fertilité ou au fœtus",
      de: "kann vermutlich die Fruchtbarkeit beeinträchtigen oder das Kind im Mutterleib schädigen",
    },
  },
  {
    re: /^H362$/,
    level: "moderate",
    text: {
      en: "may cause harm to breast-fed children",
      fr: "peut être nocif pour les bébés nourris au lait maternel",
      de: "kann Säuglinge über die Muttermilch schädigen",
    },
  },
  {
    re: /^H317$/,
    level: "low",
    text: {
      en: "may cause an allergic skin reaction",
      fr: "peut provoquer une allergie cutanée",
      de: "kann allergische Hautreaktionen verursachen",
    },
  },
  {
    re: /^H334$/,
    level: "low",
    text: {
      en: "may cause allergy or asthma symptoms if inhaled",
      fr: "peut provoquer des symptômes allergiques ou d'asthme par inhalation",
      de: "kann beim Einatmen Allergie- oder Asthmasymptome verursachen",
    },
  },
];

const ED_PAGE: Record<string, string> = {
  I: "list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
  II: "list-ii-substances-under-eu-investigation-endocrine-disruption",
  III: "list-iii-substances-identified-as-endocrine-disruptors-by-participating-national-authorities",
};
const ED_TEXT: Record<string, Text> = {
  I: {
    en: "Identified as an endocrine disruptor by the EU (list I).",
    fr: "Identifié comme perturbateur endocrinien par l'UE (liste I).",
    de: "Von der EU als endokriner Disruptor identifiziert (Liste I).",
  },
  II: {
    en: "Under EU investigation as an endocrine disruptor (list II).",
    fr: "En cours d'évaluation par l'UE comme perturbateur endocrinien (liste II).",
    de: "Wird von der EU als möglicher endokriner Disruptor geprüft (Liste II).",
  },
  III: {
    en: "Identified as an endocrine disruptor by a national authority (list III).",
    fr: "Identifié comme perturbateur endocrinien par une autorité nationale (liste III).",
    de: "Von einer nationalen Behörde als endokriner Disruptor identifiziert (Liste III).",
  },
};
const ANNEX_TEXT: Record<string, (entry: string) => Text> = {
  // CosIng ties many ingredients to an annex II entry that only bans an impure
  // grade or some uses (petrolatum, entry 904: unless fully refined), so it is
  // shown, not counted; outright bans are in the hand-kept list.
  II: (n) => ({
    en: `Named in annex II of the Cosmetics Regulation (prohibited substances, entry ${n}); several entries only ban an impure grade or some uses.`,
    fr: `Cité à l'annexe II du règlement cosmétique (substances interdites, entrée ${n}) ; plusieurs entrées n'interdisent qu'une qualité impure ou certains usages.`,
    de: `In Anhang II der Kosmetikverordnung genannt (verbotene Stoffe, Eintrag ${n}); manche Einträge verbieten nur eine unreine Qualität oder bestimmte Verwendungen.`,
  }),
  III: (n) => ({
    en: `Allowed in EU cosmetics within limits (annex III, entry ${n}).`,
    fr: `Autorisé dans les cosmétiques de l'UE avec des limites (annexe III, entrée ${n}).`,
    de: `In EU-Kosmetik mit Einschränkungen erlaubt (Anhang III, Eintrag ${n}).`,
  }),
  V: (n) => ({
    en: `Preservative allowed up to a maximum concentration (annex V, entry ${n}).`,
    fr: `Conservateur autorisé jusqu'à une concentration maximale (annexe V, entrée ${n}).`,
    de: `Konservierungsstoff bis zu einer Höchstkonzentration erlaubt (Anhang V, Eintrag ${n}).`,
  }),
  VI: (n) => ({
    en: `UV filter allowed up to a maximum concentration (annex VI, entry ${n}).`,
    fr: `Filtre UV autorisé jusqu'à une concentration maximale (annexe VI, entrée ${n}).`,
    de: `UV-Filter bis zu einer Höchstkonzentration erlaubt (Anhang VI, Eintrag ${n}).`,
  }),
};

/** One finding of an official list, ready to show. */
export interface HazardFinding {
  level: HazardLevel | "listed";
  summary: Text;
  source: CosmeticSource;
}

const RANK = { high: 3, moderate: 2, low: 1, listed: 0 } as const;
export const strongest = (levels: (HazardLevel | "listed")[]): HazardLevel | undefined =>
  levels.reduce<HazardLevel | "listed" | undefined>(
    (a, b) => (a === undefined || RANK[b] > RANK[a] ? b : a),
    undefined,
  ) as HazardLevel | undefined;

export function findingsOf(r: HazardRecord): HazardFinding[] {
  const out: HazardFinding[] = [];
  if (r.i) {
    const [group, year] = r.i as [IarcGroup, number?];
    const t = IARC_TEXT[group];
    out.push({
      level: group === "2B" ? "moderate" : "high",
      summary: {
        en: `IARC: ${t.en} (group ${group}).`,
        fr: `CIRC : ${t.fr} (groupe ${group}).`,
        de: `IARC: ${t.de} (Gruppe ${group}).`,
      },
      source: {
        org: "IARC",
        year: year ?? YEAR,
        title: "IARC Monographs, list of classifications",
        url: "https://monographs.iarc.who.int/list-of-classifications",
      },
    });
  }
  if (r.c) {
    const [index, codes] = r.c as [string, string[]];
    const kept = CLP.filter((x) => codes.some((c) => x.re.test(c)));
    if (kept.length) {
      const join = (l: Lang) => kept.map((x) => x.text[l]).join(", ");
      const list = codes.join(", ");
      out.push({
        level: strongest(kept.map((x) => x.level)) ?? "low",
        summary: {
          en: `EU harmonised classification (CLP): ${join("en")} (${list}).`,
          fr: `Classification harmonisée de l'UE (CLP) : ${join("fr")} (${list}).`,
          de: `Harmonisierte EU-Einstufung (CLP): ${join("de")} (${list}).`,
        },
        source: {
          org: "EU CLP, Annex VI",
          year: YEAR,
          title: `Regulation (EC) No 1272/2008, Annex VI, index ${index}`,
          url: "https://eur-lex.europa.eu/eli/reg/2008/1272/oj",
        },
      });
    }
  }
  if (r.e && ED_TEXT[r.e]) {
    // List II is only under investigation: shown, not counted.
    out.push({
      level: r.e === "I" ? "high" : r.e === "III" ? "moderate" : "low",
      summary: ED_TEXT[r.e] as Text,
      source: {
        org: "edlists.org",
        year: YEAR,
        title: `EU endocrine disruptor list ${r.e}`,
        url: `https://edlists.org/the-ed-lists/${ED_PAGE[r.e]}`,
      },
    });
  }
  if (r.a) {
    const [annex = "", entry = ""] = r.a.split("/");
    const text = ANNEX_TEXT[annex];
    if (text)
      out.push({
        level: "listed",
        summary: text(entry),
        source: {
          org: "European Commission, CosIng",
          year: 2009,
          title: `Regulation (EC) No 1223/2009, annex ${annex}`,
          url: r.k
            ? `https://ec.europa.eu/growth/tools-databases/cosing/details/${r.k}`
            : "https://eur-lex.europa.eu/eli/reg/2009/1223/oj",
        },
      });
  }
  return out;
}

// ---------------------------------------------------------------- additives

export interface AdditiveHazard {
  level: HazardLevel;
  findings: HazardFinding[];
}

/** What official lists say about one additive, undefined when nothing. */
export function additiveHazard(tag: string): AdditiveHazard | undefined {
  const r = HAZARDS.additives[tag];
  if (!r) return undefined;
  const findings = findingsOf(r);
  const level = strongest(findings.map((f) => f.level));
  return level ? { level, findings } : undefined;
}

/** A finding shown with the cited evidence on an additive. */
export function asEvidence(f: HazardFinding): Evidence {
  return { summary: f.summary, kind: "official", source: f.source, concern: true };
}

// ---------------------------------------------------------------- cosmetics

/** The categories one cosmetic ingredient's findings put it in. */
export function categoriesOf(r: HazardRecord): CosmeticCategory[] {
  const cats = new Set<CosmeticCategory>();
  if (r.a) cats.add("eu-listed");
  if (r.i) cats.add(r.i[0] === "2B" ? "suspected" : "cmr");
  if (r.c) {
    const codes = r.c[1] as string[];
    if (codes.some((c) => /^H(340|350i?|360)/.test(c))) cats.add("cmr");
    else if (codes.some((c) => /^H(341|351|361|362)/.test(c))) cats.add("suspected");
    if (codes.some((c) => /^H(317|334)$/.test(c))) cats.add("sensitiser");
  }
  if (r.e === "I") cats.add("endocrine");
  else if (r.e === "III") cats.add("suspected");
  else if (r.e) cats.add("under-review");
  return [...cats];
}

/** An ingredient of the official lists, as an entry like the hand-kept ones. */
export function cosmeticFromHazards(tag: string, r: HazardRecord): CosmeticIngredient | undefined {
  const categories = categoriesOf(r);
  if (!categories.length) return undefined;
  const findings = findingsOf(r);
  const text = (l: Lang) => findings.map((f) => f.summary[l]).join(" ");
  const inci =
    r.n ??
    tag
      .replace(/^\w\w:/, "")
      .replace(/-/g, " ")
      .toUpperCase();
  return {
    id: tag,
    inci,
    synonyms: { en: [], fr: [], de: [] },
    categories,
    summary: { en: text("en"), fr: text("fr"), de: text("de") },
    sources: findings.map((f) => f.source),
  };
}

export const COSMETIC_HAZARDS = HAZARDS.cosmetics;
