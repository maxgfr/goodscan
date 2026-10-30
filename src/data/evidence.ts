/**
 * What science says about additives, finding by finding, each one cited.
 * Kept by hand from a verified web research (docs/research/additives-evidence):
 * only claims that passed its adversarial check are here, and every DOI and
 * PMID was resolved on Crossref and PubMed.
 *
 * A finding only costs points when it is weighty (see weighs): an official
 * position of concern, or human studies that agree. A lone signal is shown,
 * not counted.
 */

export type EvidenceKind = "official" | "cohort" | "trial" | "meta" | "animal" | "lab";

export interface Evidence {
  summary: { en: string; fr: string; de: string };
  kind: EvidenceKind;
  source: {
    /** The body or the journal. */
    org: string;
    year: number;
    title: string;
    url: string;
    doi?: string;
    pmid?: string;
  };
  /** True when it points to a health risk, false when it reassures. */
  concern: boolean;
}

export const HUMAN_KINDS: ReadonlySet<EvidenceKind> = new Set(["cohort", "trial", "meta"]);

/** Enough to take points off: one official concern, or two human studies of concern. */
export function weighs(list: readonly Evidence[]): boolean {
  const concerns = list.filter((e) => e.concern);
  return (
    concerns.some((e) => e.kind === "official") ||
    concerns.filter((e) => HUMAN_KINDS.has(e.kind)).length >= 2
  );
}

/**
 * The findings on an additive: its own, else its family's, for a lettered
 * subtype (E960c, enzymatically produced steviol glycosides, is still E960).
 */
export function evidenceFor(tag: string): Evidence[] | undefined {
  return EVIDENCE[tag] ?? EVIDENCE[tag.replace(/^(en:e\d+)[a-z]+$/, "$1")];
}

/** The link to show: the DOI, else PubMed, else the page. */
export function evidenceUrl(e: Evidence): string {
  if (e.source.doi) return `https://doi.org/${e.source.doi}`;
  if (e.source.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${e.source.pmid}/`;
  return e.source.url;
}

export const EVIDENCE: Record<string, Evidence[]> = {
  "en:e951": [
    {
      summary: {
        en: "IARC (2023) classified aspartame as possibly carcinogenic to humans (Group 2B), citing limited human evidence for liver cancer (hepatocellular carcinoma).",
        fr: "Le CIRC (2023) a classé l'aspartame cancérogène possible pour l'homme (groupe 2B), sur la base d'indications limitées chez l'homme pour le cancer du foie.",
        de: "Die IARC (2023) stufte Aspartam als möglicherweise krebserregend ein (Gruppe 2B), gestützt auf begrenzte Hinweise beim Menschen für Leberkrebs.",
      },
      kind: "official",
      source: {
        org: "IARC",
        year: 2023,
        title: "Carcinogenicity of aspartame, methyleugenol, and isoeugenol (IARC Monographs 134)",
        url: "https://www.who.int/news/item/14-07-2023-aspartame-hazard-and-risk-assessment-results-released",
        doi: "10.1016/S1470-2045(23)00341-8",
        pmid: "37454664",
      },
      concern: true,
    },
    {
      summary: {
        en: "JECFA (2023) found no sufficient reason to change aspartame's acceptable daily intake of 0–40 mg/kg body weight and reaffirmed it.",
        fr: "Le JECFA (2023) n'a trouvé aucune raison suffisante de modifier la dose journalière admissible de l'aspartame (0–40 mg/kg de poids corporel) et l'a confirmée.",
        de: "Der JECFA (2023) sah keinen ausreichenden Grund, die zulässige Tagesdosis von Aspartam (0–40 mg/kg Körpergewicht) zu ändern, und bestätigte sie.",
      },
      kind: "official",
      source: {
        org: "JECFA",
        year: 2023,
        title: "Aspartame hazard and risk assessment results released (WHO/JECFA)",
        url: "https://www.who.int/news/item/14-07-2023-aspartame-hazard-and-risk-assessment-results-released",
      },
      concern: false,
    },
    {
      summary: {
        en: "The US FDA disagrees with IARC's conclusion on aspartame and keeps an acceptable daily intake of 50 mg/kg body weight per day.",
        fr: "La FDA américaine conteste la conclusion du CIRC sur l'aspartame et maintient une dose journalière admissible de 50 mg/kg de poids corporel par jour.",
        de: "Die US-FDA widerspricht der IARC-Einschätzung zu Aspartam und hält an einer zulässigen Tagesdosis von 50 mg/kg Körpergewicht fest.",
      },
      kind: "official",
      source: {
        org: "FDA",
        year: 2023,
        title: "Aspartame and Other Sweeteners in Food",
        url: "https://www.fda.gov/food/food-additives-petitions/aspartame-and-other-sweeteners-food",
      },
      concern: false,
    },
    {
      summary: {
        en: "WHO (2023) suggests that non-sugar sweeteners not be used to control weight or lower the risk of noncommunicable diseases; a conditional recommendation.",
        fr: "L'OMS (2023) suggère de ne pas utiliser les édulcorants non sucrés pour contrôler le poids ou réduire le risque de maladies non transmissibles ; recommandation conditionnelle.",
        de: "Die WHO (2023) rät, Süßstoffe nicht zur Gewichtskontrolle oder zur Senkung des Risikos nichtübertragbarer Krankheiten zu nutzen; eine bedingte Empfehlung.",
      },
      kind: "official",
      source: {
        org: "WHO",
        year: 2023,
        title: "Use of non-sugar sweeteners: WHO guideline",
        url: "https://iris.who.int/server/api/core/bitstreams/e567a191-33a4-44ff-8b37-788a4e432764/content",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 103,000 French adults (NutriNet-Santé), higher aspartame intake was associated with higher overall cancer risk (HR 1.15).",
        fr: "Chez environ 103 000 adultes français (NutriNet-Santé), une consommation plus élevée d'aspartame était associée à un risque global de cancer accru (HR 1,15).",
        de: "Bei rund 103.000 französischen Erwachsenen (NutriNet-Santé) war höherer Aspartamkonsum mit einem höheren Krebsrisiko insgesamt verbunden (HR 1,15).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Debras et al.)",
        year: 2022,
        title:
          "Artificial sweeteners and cancer risk: Results from the NutriNet-Santé population-based cohort study",
        url: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1003950",
        doi: "10.1371/journal.pmed.1003950",
        pmid: "35324894",
      },
      concern: true,
    },
    {
      summary: {
        en: "In NutriNet-Santé, aspartame was associated with higher type 2 diabetes risk (HR 1.63) and with cerebrovascular events; authors note reverse causality cannot be excluded.",
        fr: "Dans NutriNet-Santé, l'aspartame était associé à un risque accru de diabète de type 2 (HR 1,63) ; les auteurs notent qu'une causalité inverse ne peut être exclue.",
        de: "In NutriNet-Santé war Aspartam mit höherem Typ-2-Diabetes-Risiko verbunden (HR 1,63); laut Autoren ist umgekehrte Kausalität nicht auszuschließen.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Debras et al.)",
        year: 2023,
        title:
          "Artificial Sweeteners and Risk of Type 2 Diabetes in the Prospective NutriNet-Santé Cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/37490630/",
        doi: "10.2337/dc23-0206",
        pmid: "37490630",
      },
      concern: true,
    },
  ],
  "en:e950": [
    {
      summary: {
        en: "EFSA (2025) set an acceptable daily intake of 15 mg/kg bw per day for acesulfame K and found no genotoxicity concern for it or its degradation products.",
        fr: "L'EFSA (2025) a fixé une dose journalière admissible de 15 mg/kg p.c. par jour pour l'acésulfame K, sans préoccupation de génotoxicité pour lui ni ses produits de dégradation.",
        de: "Die EFSA (2025) legte für Acesulfam K eine zulässige Tagesdosis von 15 mg/kg KG pro Tag fest und sah keine Genotoxizitätsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2025,
        title: "Re-evaluation of acesulfame K (E 950) as food additive",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2025.9317",
        doi: "10.2903/j.efsa.2025.9317",
        pmid: "40309404",
      },
      concern: false,
    },
    {
      summary: {
        en: "WHO (2023) suggests that non-sugar sweeteners not be used to control weight or lower the risk of noncommunicable diseases; a conditional recommendation.",
        fr: "L'OMS (2023) suggère de ne pas utiliser les édulcorants non sucrés pour contrôler le poids ou réduire le risque de maladies non transmissibles ; recommandation conditionnelle.",
        de: "Die WHO (2023) rät, Süßstoffe nicht zur Gewichtskontrolle oder zur Senkung des Risikos nichtübertragbarer Krankheiten zu nutzen; eine bedingte Empfehlung.",
      },
      kind: "official",
      source: {
        org: "WHO",
        year: 2023,
        title: "Use of non-sugar sweeteners: WHO guideline",
        url: "https://iris.who.int/server/api/core/bitstreams/e567a191-33a4-44ff-8b37-788a4e432764/content",
      },
      concern: true,
    },
    {
      summary: {
        en: "In NutriNet-Santé (about 103,000 French adults), higher acesulfame-K intake was associated with higher overall cancer risk (HR 1.13).",
        fr: "Dans NutriNet-Santé (environ 103 000 adultes français), une consommation plus élevée d'acésulfame K était associée à un risque global de cancer accru (HR 1,13).",
        de: "In NutriNet-Santé (rund 103.000 französische Erwachsene) war höherer Acesulfam-K-Konsum mit höherem Krebsrisiko insgesamt verbunden (HR 1,13).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Debras et al.)",
        year: 2022,
        title:
          "Artificial sweeteners and cancer risk: Results from the NutriNet-Santé population-based cohort study",
        url: "https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1003950",
        doi: "10.1371/journal.pmed.1003950",
        pmid: "35324894",
      },
      concern: true,
    },
    {
      summary: {
        en: "In NutriNet-Santé, acesulfame potassium was associated with higher coronary heart disease risk (HR 1.40).",
        fr: "Dans NutriNet-Santé, l'acésulfame potassium était associé à un risque accru de maladie coronarienne (HR 1,40).",
        de: "In NutriNet-Santé war Acesulfam-Kalium mit einem höheren Risiko für koronare Herzkrankheit verbunden (HR 1,40).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Debras et al.)",
        year: 2022,
        title:
          "Artificial sweeteners and risk of cardiovascular diseases: results from the prospective NutriNet-Santé cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/36638072/",
        doi: "10.1136/bmj-2022-071204",
        pmid: "36638072",
      },
      concern: true,
    },
    {
      summary: {
        en: "In NutriNet-Santé, acesulfame-K was associated with higher type 2 diabetes risk (HR 1.70); authors note reverse causality cannot be excluded.",
        fr: "Dans NutriNet-Santé, l'acésulfame K était associé à un risque accru de diabète de type 2 (HR 1,70) ; une causalité inverse ne peut être exclue.",
        de: "In NutriNet-Santé war Acesulfam K mit höherem Typ-2-Diabetes-Risiko verbunden (HR 1,70); umgekehrte Kausalität ist nicht auszuschließen.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Debras et al.)",
        year: 2023,
        title:
          "Artificial Sweeteners and Risk of Type 2 Diabetes in the Prospective NutriNet-Santé Cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/37490630/",
        doi: "10.2337/dc23-0206",
        pmid: "37490630",
      },
      concern: true,
    },
  ],
  "en:e955": [
    {
      summary: {
        en: "EFSA (2026) found no genotoxicity concern for sucralose and kept its acceptable daily intake of 15 mg/kg bw per day; exposure did not exceed it.",
        fr: "L'EFSA (2026) n'a relevé aucune préoccupation de génotoxicité pour le sucralose et a maintenu sa DJA de 15 mg/kg p.c. par jour, non dépassée.",
        de: "Die EFSA (2026) sah keine Genotoxizitätsbedenken für Sucralose und behielt die zulässige Tagesdosis von 15 mg/kg KG bei; sie wird nicht überschritten.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2026,
        title:
          "Re-evaluation of sucralose (E 955) as a food additive and evaluation of a new application on extension of use in fine bakery wares",
        url: "https://doi.org/10.2903/j.efsa.2026.9854",
        doi: "10.2903/j.efsa.2026.9854",
        pmid: "41710869",
      },
      concern: false,
    },
    {
      summary: {
        en: "EFSA (2026) could not conclude on using sucralose in fine bakery wares, citing uncertainty about chlorinated compounds formed during baking.",
        fr: "L'EFSA (2026) n'a pas pu conclure sur l'usage du sucralose dans les produits de boulangerie fine, faute de certitude sur les composés chlorés formés à la cuisson.",
        de: "Die EFSA (2026) konnte die Verwendung von Sucralose in feinen Backwaren nicht bewerten, wegen Unsicherheiten über beim Backen entstehende Chlorverbindungen.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2026,
        title:
          "Re-evaluation of sucralose (E 955) as a food additive and evaluation of a new application on extension of use in fine bakery wares",
        url: "https://doi.org/10.2903/j.efsa.2026.9854",
        doi: "10.2903/j.efsa.2026.9854",
        pmid: "41710869",
      },
      concern: true,
    },
    {
      summary: {
        en: "In lab assays, sucralose-6-acetate, an impurity found at up to 0.67% in commercial sucralose, was genotoxic in lab screening assays (Schiffman et al., 2023).",
        fr: "En laboratoire, le sucralose-6-acétate, impureté présente jusqu'à 0,67 % dans le sucralose commercial, s'est montré génotoxique dans des tests de laboratoire (Schiffman, 2023).",
        de: "Im Labor war Sucralose-6-acetat, eine Verunreinigung mit bis zu 0,67 % in handelsüblicher Sucralose, in Labortests genotoxisch (Schiffman 2023).",
      },
      kind: "lab",
      source: {
        org: "Schiffman et al.",
        year: 2023,
        title:
          "Toxicological and pharmacokinetic properties of sucralose-6-acetate and its parent sucralose: in vitro screening assays",
        url: "https://doi.org/10.1080/10937404.2023.2213903",
        doi: "10.1080/10937404.2023.2213903",
        pmid: "37246822",
      },
      concern: true,
    },
    {
      summary: {
        en: "In NutriNet-Santé, sucralose was associated with higher coronary heart disease risk (HR 1.31).",
        fr: "Dans NutriNet-Santé, le sucralose était associé à un risque accru de maladie coronarienne (HR 1,31).",
        de: "In NutriNet-Santé war Sucralose mit einem höheren Risiko für koronare Herzkrankheit verbunden (HR 1,31).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Debras et al.)",
        year: 2022,
        title:
          "Artificial sweeteners and risk of cardiovascular diseases: results from the prospective NutriNet-Santé cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/36638072/",
        doi: "10.1136/bmj-2022-071204",
        pmid: "36638072",
      },
      concern: true,
    },
    {
      summary: {
        en: "In NutriNet-Santé, sucralose was associated with higher type 2 diabetes risk (HR 1.34); authors note reverse causality cannot be excluded.",
        fr: "Dans NutriNet-Santé, le sucralose était associé à un risque accru de diabète de type 2 (HR 1,34) ; une causalité inverse ne peut être exclue.",
        de: "In NutriNet-Santé war Sucralose mit höherem Typ-2-Diabetes-Risiko verbunden (HR 1,34); umgekehrte Kausalität ist nicht auszuschließen.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Debras et al.)",
        year: 2023,
        title:
          "Artificial Sweeteners and Risk of Type 2 Diabetes in the Prospective NutriNet-Santé Cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/37490630/",
        doi: "10.2337/dc23-0206",
        pmid: "37490630",
      },
      concern: true,
    },
    {
      summary: {
        en: "WHO (2023) suggests that non-sugar sweeteners not be used to control weight or lower the risk of noncommunicable diseases; a conditional recommendation.",
        fr: "L'OMS (2023) suggère de ne pas utiliser les édulcorants non sucrés pour contrôler le poids ou réduire le risque de maladies non transmissibles ; recommandation conditionnelle.",
        de: "Die WHO (2023) rät, Süßstoffe nicht zur Gewichtskontrolle oder zur Senkung des Risikos nichtübertragbarer Krankheiten zu nutzen; eine bedingte Empfehlung.",
      },
      kind: "official",
      source: {
        org: "WHO",
        year: 2023,
        title: "Use of non-sugar sweeteners: WHO guideline",
        url: "https://iris.who.int/server/api/core/bitstreams/e567a191-33a4-44ff-8b37-788a4e432764/content",
      },
      concern: true,
    },
  ],
  "en:e954": [
    {
      summary: {
        en: "EFSA (2024) set an acceptable daily intake of 9 mg/kg bw per day for saccharin and its salts.",
        fr: "L'EFSA (2024) a fixé une dose journalière admissible de 9 mg/kg p.c. par jour pour la saccharine et ses sels.",
        de: "Die EFSA (2024) legte für Saccharin und seine Salze eine zulässige Tagesdosis von 9 mg/kg KG pro Tag fest.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2024,
        title:
          "Re-evaluation of saccharin and its sodium, potassium and calcium salts (E 954) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2024.9044",
        doi: "10.2903/j.efsa.2024.9044",
        pmid: "39553702",
      },
      concern: false,
    },
    {
      summary: {
        en: "WHO (2023) suggests that non-sugar sweeteners not be used to control weight or lower the risk of noncommunicable diseases; a conditional recommendation.",
        fr: "L'OMS (2023) suggère de ne pas utiliser les édulcorants non sucrés pour contrôler le poids ou réduire le risque de maladies non transmissibles ; recommandation conditionnelle.",
        de: "Die WHO (2023) rät, Süßstoffe nicht zur Gewichtskontrolle oder zur Senkung des Risikos nichtübertragbarer Krankheiten zu nutzen; eine bedingte Empfehlung.",
      },
      kind: "official",
      source: {
        org: "WHO",
        year: 2023,
        title: "Use of non-sugar sweeteners: WHO guideline",
        url: "https://iris.who.int/server/api/core/bitstreams/e567a191-33a4-44ff-8b37-788a4e432764/content",
      },
      concern: true,
    },
  ],
  "en:e960": [
    {
      summary: {
        en: "EFSA (2024) found insufficient justification to raise the acceptable daily intake of steviol glycosides above 4 mg/kg bw per day (as steviol).",
        fr: "L'EFSA (2024) a jugé insuffisamment justifié de relever la dose journalière admissible des glycosides de stéviol au-delà de 4 mg/kg p.c. par jour (en stéviol).",
        de: "Die EFSA (2024) sah keine ausreichende Begründung, die zulässige Tagesdosis für Steviolglycoside über 4 mg/kg KG pro Tag (als Steviol) anzuheben.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2024,
        title:
          "Extension of the authorisation of use of steviol glycosides (E 960a–d) and modification of the ADI for steviol",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11533382/",
        doi: "10.2903/j.efsa.2024.9045",
        pmid: "39502654",
      },
      concern: false,
    },
    {
      summary: {
        en: "WHO (2023) suggests that non-sugar sweeteners not be used to control weight or lower the risk of noncommunicable diseases; a conditional recommendation.",
        fr: "L'OMS (2023) suggère de ne pas utiliser les édulcorants non sucrés pour contrôler le poids ou réduire le risque de maladies non transmissibles ; recommandation conditionnelle.",
        de: "Die WHO (2023) rät, Süßstoffe nicht zur Gewichtskontrolle oder zur Senkung des Risikos nichtübertragbarer Krankheiten zu nutzen; eine bedingte Empfehlung.",
      },
      kind: "official",
      source: {
        org: "WHO",
        year: 2023,
        title: "Use of non-sugar sweeteners: WHO guideline",
        url: "https://iris.who.int/server/api/core/bitstreams/e567a191-33a4-44ff-8b37-788a4e432764/content",
      },
      concern: true,
    },
  ],
  "en:e952": [
    {
      summary: {
        en: "Cyclamate is approved in the EU and over 100 countries; JECFA set an ADI of 0–11 mg/kg/day and the EU's former SCF 0–7 mg/kg/day.",
        fr: "Le cyclamate est autorisé dans l'UE et plus de 100 pays ; le JECFA a fixé une DJA de 0–11 mg/kg/j et l'ancien SCF européen de 0–7 mg/kg/j.",
        de: "Cyclamat ist in der EU und über 100 Ländern zugelassen; der JECFA legte eine ADI von 0–11 mg/kg/Tag fest, der frühere EU-SCF 0–7 mg/kg/Tag.",
      },
      kind: "official",
      source: {
        org: "JECFA / SCF (reported in Marchitti et al., Adv Nutr)",
        year: 2025,
        title:
          "Lack of Genotoxic and Carcinogenic Potential for Nonsugar Sweeteners: A Review of Animal and Mechanistic Evidence",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12686615/",
        doi: "10.1016/j.advnut.2025.100552",
        pmid: "41197905",
      },
      concern: false,
    },
    {
      summary: {
        en: "EFSA lists its re-evaluation of cyclamates (E 952) as still ongoing.",
        fr: "L'EFSA indique que sa réévaluation des cyclamates (E 952) est toujours en cours.",
        de: "Laut EFSA ist die Neubewertung der Cyclamate (E 952) noch nicht abgeschlossen.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2026,
        title: "EFSA topic: Sweeteners (re-evaluation status)",
        url: "https://www.efsa.europa.eu/en/topics/topic/sweeteners",
      },
      concern: false,
    },
    {
      summary: {
        en: "WHO (2023) suggests that non-sugar sweeteners not be used to control weight or lower the risk of noncommunicable diseases; a conditional recommendation.",
        fr: "L'OMS (2023) suggère de ne pas utiliser les édulcorants non sucrés pour contrôler le poids ou réduire le risque de maladies non transmissibles ; recommandation conditionnelle.",
        de: "Die WHO (2023) rät, Süßstoffe nicht zur Gewichtskontrolle oder zur Senkung des Risikos nichtübertragbarer Krankheiten zu nutzen; eine bedingte Empfehlung.",
      },
      kind: "official",
      source: {
        org: "WHO",
        year: 2023,
        title: "Use of non-sugar sweeteners: WHO guideline",
        url: "https://iris.who.int/server/api/core/bitstreams/e567a191-33a4-44ff-8b37-788a4e432764/content",
      },
      concern: true,
    },
  ],
  "en:e968": [
    {
      summary: {
        en: "EFSA (2023) set an acceptable daily intake of 0.5 g/kg body weight for erythritol, based on its laxative effect, and found exposure above it in all age groups.",
        fr: "L'EFSA (2023) a fixé une DJA de 0,5 g/kg de poids corporel pour l'érythritol, d'après son effet laxatif, et estime l'exposition supérieure dans toutes les tranches d'âge.",
        de: "Die EFSA (2023) legte für Erythrit eine ADI von 0,5 g/kg Körpergewicht fest (abführende Wirkung) und sah die Aufnahme in allen Altersgruppen darüber.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2023,
        title: "Re-evaluation of erythritol (E 968) as a food additive",
        url: "https://www.efsa.europa.eu/en/plain-language-summary/re-evaluation-erythritol-e-968-food-additive",
        doi: "10.2903/j.efsa.2023.8430",
        pmid: "38125972",
      },
      concern: true,
    },
    {
      summary: {
        en: "In US and European patients undergoing cardiac evaluation, higher blood erythritol was associated with more heart attacks, strokes or deaths over 3 years.",
        fr: "Chez des patients américains et européens en bilan cardiaque, un taux sanguin d'érythritol plus élevé était associé à plus d'infarctus, d'AVC ou de décès sur 3 ans.",
        de: "Bei Herzpatienten in den USA und Europa war ein höherer Erythrit-Blutspiegel mit mehr Herzinfarkten, Schlaganfällen oder Todesfällen über 3 Jahre verbunden.",
      },
      kind: "cohort",
      source: {
        org: "Witkowski et al.",
        year: 2023,
        title: "The artificial sweetener erythritol and cardiovascular event risk",
        url: "https://pubmed.ncbi.nlm.nih.gov/36849732/",
        doi: "10.1038/s41591-023-02223-9",
        pmid: "36849732",
      },
      concern: true,
    },
    {
      summary: {
        en: "The same team found erythritol enhanced platelet reactivity in vitro and clot formation in animals; in 8 volunteers, eating it raised blood levels for over 2 days.",
        fr: "La même équipe a observé que l'érythritol accroît la réactivité plaquettaire in vitro et la thrombose chez l'animal ; chez 8 volontaires, son taux restait élevé plus de 2 jours.",
        de: "Dasselbe Team fand, dass Erythrit die Thrombozytenreaktivität in vitro und Gerinnsel bei Tieren verstärkt; bei 8 Freiwilligen blieb der Blutspiegel über 2 Tage erhöht.",
      },
      kind: "lab",
      source: {
        org: "Witkowski et al.",
        year: 2023,
        title: "The artificial sweetener erythritol and cardiovascular event risk",
        url: "https://pubmed.ncbi.nlm.nih.gov/36849732/",
        doi: "10.1038/s41591-023-02223-9",
        pmid: "36849732",
      },
      concern: true,
    },
    {
      summary: {
        en: "A Mendelian randomization study found no supportive evidence that erythritol increases coronary artery disease or cardiometabolic disease.",
        fr: "Une étude de randomisation mendélienne n'a trouvé aucun élément indiquant que l'érythritol augmente la maladie coronarienne ou les maladies cardiométaboliques.",
        de: "Eine Mendelsche Randomisierungsstudie fand keine Belege dafür, dass Erythrit koronare Herzkrankheit oder kardiometabolische Erkrankungen fördert.",
      },
      kind: "cohort",
      source: {
        org: "Khafagy et al.",
        year: 2024,
        title:
          "Erythritol as a Potential Causal Contributor to Cardiometabolic Disease: A Mendelian Randomization Study",
        url: "https://pubmed.ncbi.nlm.nih.gov/37939167/",
        doi: "10.2337/db23-0330",
        pmid: "37939167",
      },
      concern: false,
    },
    {
      summary: {
        en: "In cultured human brain blood-vessel cells, erythritol at a level matching one sweetened drink raised oxidative stress within 3 hours (Berry et al., 2025).",
        fr: "Sur des cellules de vaisseaux cérébraux humains en culture, l'érythritol à une dose équivalant à une boisson sucrée a accru le stress oxydatif en 3 heures (Berry, 2025).",
        de: "In kultivierten menschlichen Hirngefäßzellen erhöhte Erythrit in einer Dosis wie in einem gesüßten Getränk binnen 3 Stunden den oxidativen Stress (Berry 2025).",
      },
      kind: "lab",
      source: {
        org: "Berry et al.",
        year: 2025,
        title:
          "The non-nutritive sweetener erythritol adversely affects brain microvascular endothelial cell function",
        url: "https://journals.physiology.org/doi/full/10.1152/japplphysiol.00276.2025",
        doi: "10.1152/japplphysiol.00276.2025",
        pmid: "40459966",
      },
      concern: true,
    },
  ],
  "en:e967": [
    {
      summary: {
        en: "In patients undergoing cardiac evaluation, higher fasting blood xylitol was associated with more major cardiovascular events (top vs bottom third HR 1.57).",
        fr: "Chez des patients en bilan cardiaque, un taux sanguin de xylitol à jeun plus élevé était associé à plus d'événements cardiovasculaires majeurs (HR 1,57).",
        de: "Bei Herzpatienten war ein höherer Xylit-Nüchternblutspiegel mit mehr schweren kardiovaskulären Ereignissen verbunden (oberes vs. unteres Drittel HR 1,57).",
      },
      kind: "cohort",
      source: {
        org: "Witkowski et al.",
        year: 2024,
        title: "Xylitol is prothrombotic and associated with cardiovascular risk",
        url: "https://pubmed.ncbi.nlm.nih.gov/38842092/",
        doi: "10.1093/eurheartj/ehae244",
        pmid: "38842092",
      },
      concern: true,
    },
    {
      summary: {
        en: "In the same study, xylitol enhanced platelet reactivity and clotting potential, including after xylitol intake in 10 healthy volunteers.",
        fr: "Dans la même étude, le xylitol a accru la réactivité plaquettaire et le potentiel de thrombose, y compris après ingestion chez 10 volontaires sains.",
        de: "In derselben Studie verstärkte Xylit die Thrombozytenreaktivität und Gerinnungsneigung, auch nach Einnahme bei 10 gesunden Freiwilligen.",
      },
      kind: "trial",
      source: {
        org: "Witkowski et al.",
        year: 2024,
        title: "Xylitol is prothrombotic and associated with cardiovascular risk",
        url: "https://pubmed.ncbi.nlm.nih.gov/38842092/",
        doi: "10.1093/eurheartj/ehae244",
        pmid: "38842092",
      },
      concern: true,
    },
    {
      summary: {
        en: "A Cochrane review of 10 trials found only low-quality evidence that xylitol fluoride toothpaste prevents caries better than fluoride toothpaste in children.",
        fr: "Une revue Cochrane de 10 essais n'a trouvé que des preuves de faible qualité que le dentifrice fluoré au xylitol prévient mieux les caries chez l'enfant.",
        de: "Ein Cochrane-Review von 10 Studien fand nur schwache Belege, dass Fluorid-Zahnpasta mit Xylit Karies bei Kindern besser verhindert als ohne.",
      },
      kind: "meta",
      source: {
        org: "Cochrane (Riley et al.)",
        year: 2015,
        title: "Xylitol-containing products for preventing dental caries in children and adults",
        url: "https://pubmed.ncbi.nlm.nih.gov/25809586/",
        doi: "10.1002/14651858.CD010743.pub2",
        pmid: "25809586",
      },
      concern: false,
    },
    {
      summary: {
        en: "A systematic review found that polyols are malabsorbed in a dose-dependent way in healthy people; results in irritable bowel syndrome were conflicting.",
        fr: "Une revue systématique montre que les polyols sont mal absorbés de façon dose-dépendante chez les personnes en bonne santé ; résultats contradictoires dans le côlon irritable.",
        de: "Ein systematischer Review fand, dass Polyole bei Gesunden dosisabhängig schlecht aufgenommen werden; bei Reizdarm waren die Ergebnisse widersprüchlich.",
      },
      kind: "meta",
      source: {
        org: "Lenhart & Chey",
        year: 2017,
        title:
          "A Systematic Review of the Effects of Polyols on Gastrointestinal Health and Irritable Bowel Syndrome",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5508768/",
        doi: "10.3945/an.117.015560",
        pmid: "28710145",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA lists its re-evaluation of xylitol (E 967) as still ongoing.",
        fr: "L'EFSA indique que sa réévaluation du xylitol (E 967) est toujours en cours.",
        de: "Laut EFSA ist die Neubewertung von Xylit (E 967) noch nicht abgeschlossen.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2026,
        title: "EFSA topic: Sweeteners (re-evaluation status)",
        url: "https://www.efsa.europa.eu/en/topics/topic/sweeteners",
      },
      concern: false,
    },
  ],
  "en:e420": [
    {
      summary: {
        en: "EFSA lists its re-evaluation of sorbitols (E 420) as still ongoing.",
        fr: "L'EFSA indique que sa réévaluation des sorbitols (E 420) est toujours en cours.",
        de: "Laut EFSA ist die Neubewertung der Sorbite (E 420) noch nicht abgeschlossen.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2026,
        title: "EFSA topic: Sweeteners (re-evaluation status)",
        url: "https://www.efsa.europa.eu/en/topics/topic/sweeteners",
      },
      concern: false,
    },
    {
      summary: {
        en: "A systematic review found that polyols are malabsorbed in a dose-dependent way in healthy people; results in irritable bowel syndrome were conflicting.",
        fr: "Une revue systématique montre que les polyols sont mal absorbés de façon dose-dépendante chez les personnes en bonne santé ; résultats contradictoires dans le côlon irritable.",
        de: "Ein systematischer Review fand, dass Polyole bei Gesunden dosisabhängig schlecht aufgenommen werden; bei Reizdarm waren die Ergebnisse widersprüchlich.",
      },
      kind: "meta",
      source: {
        org: "Lenhart & Chey",
        year: 2017,
        title:
          "A Systematic Review of the Effects of Polyols on Gastrointestinal Health and Irritable Bowel Syndrome",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5508768/",
        doi: "10.3945/an.117.015560",
        pmid: "28710145",
      },
      concern: true,
    },
  ],
  "en:e421": [
    {
      summary: {
        en: "EFSA lists its re-evaluation of mannitol (E 421) as still ongoing.",
        fr: "L'EFSA indique que sa réévaluation des mannitol (E 421) est toujours en cours.",
        de: "Laut EFSA ist die Neubewertung der Mannit (E 421) noch nicht abgeschlossen.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2026,
        title: "EFSA topic: Sweeteners (re-evaluation status)",
        url: "https://www.efsa.europa.eu/en/topics/topic/sweeteners",
      },
      concern: false,
    },
    {
      summary: {
        en: "A systematic review found that polyols are malabsorbed in a dose-dependent way in healthy people; results in irritable bowel syndrome were conflicting.",
        fr: "Une revue systématique montre que les polyols sont mal absorbés de façon dose-dépendante chez les personnes en bonne santé ; résultats contradictoires dans le côlon irritable.",
        de: "Ein systematischer Review fand, dass Polyole bei Gesunden dosisabhängig schlecht aufgenommen werden; bei Reizdarm waren die Ergebnisse widersprüchlich.",
      },
      kind: "meta",
      source: {
        org: "Lenhart & Chey",
        year: 2017,
        title:
          "A Systematic Review of the Effects of Polyols on Gastrointestinal Health and Irritable Bowel Syndrome",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5508768/",
        doi: "10.3945/an.117.015560",
        pmid: "28710145",
      },
      concern: true,
    },
  ],
  "en:e953": [
    {
      summary: {
        en: "EFSA lists its re-evaluation of isomalt (E 953) as still ongoing.",
        fr: "L'EFSA indique que sa réévaluation des isomalt (E 953) est toujours en cours.",
        de: "Laut EFSA ist die Neubewertung der Isomalt (E 953) noch nicht abgeschlossen.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2026,
        title: "EFSA topic: Sweeteners (re-evaluation status)",
        url: "https://www.efsa.europa.eu/en/topics/topic/sweeteners",
      },
      concern: false,
    },
    {
      summary: {
        en: "A systematic review found that polyols are malabsorbed in a dose-dependent way in healthy people; results in irritable bowel syndrome were conflicting.",
        fr: "Une revue systématique montre que les polyols sont mal absorbés de façon dose-dépendante chez les personnes en bonne santé ; résultats contradictoires dans le côlon irritable.",
        de: "Ein systematischer Review fand, dass Polyole bei Gesunden dosisabhängig schlecht aufgenommen werden; bei Reizdarm waren die Ergebnisse widersprüchlich.",
      },
      kind: "meta",
      source: {
        org: "Lenhart & Chey",
        year: 2017,
        title:
          "A Systematic Review of the Effects of Polyols on Gastrointestinal Health and Irritable Bowel Syndrome",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5508768/",
        doi: "10.3945/an.117.015560",
        pmid: "28710145",
      },
      concern: true,
    },
  ],
  "en:e965": [
    {
      summary: {
        en: "EFSA lists its re-evaluation of maltitols (E 965) as still ongoing.",
        fr: "L'EFSA indique que sa réévaluation des maltitols (E 965) est toujours en cours.",
        de: "Laut EFSA ist die Neubewertung der Maltite (E 965) noch nicht abgeschlossen.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2026,
        title: "EFSA topic: Sweeteners (re-evaluation status)",
        url: "https://www.efsa.europa.eu/en/topics/topic/sweeteners",
      },
      concern: false,
    },
    {
      summary: {
        en: "A systematic review found that polyols are malabsorbed in a dose-dependent way in healthy people; results in irritable bowel syndrome were conflicting.",
        fr: "Une revue systématique montre que les polyols sont mal absorbés de façon dose-dépendante chez les personnes en bonne santé ; résultats contradictoires dans le côlon irritable.",
        de: "Ein systematischer Review fand, dass Polyole bei Gesunden dosisabhängig schlecht aufgenommen werden; bei Reizdarm waren die Ergebnisse widersprüchlich.",
      },
      kind: "meta",
      source: {
        org: "Lenhart & Chey",
        year: 2017,
        title:
          "A Systematic Review of the Effects of Polyols on Gastrointestinal Health and Irritable Bowel Syndrome",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5508768/",
        doi: "10.3945/an.117.015560",
        pmid: "28710145",
      },
      concern: true,
    },
  ],
  "en:e966": [
    {
      summary: {
        en: "EFSA lists its re-evaluation of lactitols (E 966) as still ongoing.",
        fr: "L'EFSA indique que sa réévaluation des lactitols (E 966) est toujours en cours.",
        de: "Laut EFSA ist die Neubewertung der Lactite (E 966) noch nicht abgeschlossen.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2026,
        title: "EFSA topic: Sweeteners (re-evaluation status)",
        url: "https://www.efsa.europa.eu/en/topics/topic/sweeteners",
      },
      concern: false,
    },
    {
      summary: {
        en: "A systematic review found that polyols are malabsorbed in a dose-dependent way in healthy people; results in irritable bowel syndrome were conflicting.",
        fr: "Une revue systématique montre que les polyols sont mal absorbés de façon dose-dépendante chez les personnes en bonne santé ; résultats contradictoires dans le côlon irritable.",
        de: "Ein systematischer Review fand, dass Polyole bei Gesunden dosisabhängig schlecht aufgenommen werden; bei Reizdarm waren die Ergebnisse widersprüchlich.",
      },
      kind: "meta",
      source: {
        org: "Lenhart & Chey",
        year: 2017,
        title:
          "A Systematic Review of the Effects of Polyols on Gastrointestinal Health and Irritable Bowel Syndrome",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5508768/",
        doi: "10.3945/an.117.015560",
        pmid: "28710145",
      },
      concern: true,
    },
  ],
  "en:e407": [
    {
      summary: {
        en: "EFSA (2018) judged the group acceptable daily intake of 75 mg/kg bw per day for carrageenan (E 407, E 407a) temporary, pending better data.",
        fr: "L'EFSA (2018) a jugé temporaire la DJA de groupe de 75 mg/kg p.c. par jour des carraghénanes (E 407, E 407a), dans l'attente de meilleures données.",
        de: "Die EFSA (2018) stufte die Gruppen-ADI von 75 mg/kg KG pro Tag für Carrageen (E 407, E 407a) bis zu besseren Daten als vorläufig ein.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2018,
        title:
          "Re-evaluation of carrageenan (E 407) and processed Eucheuma seaweed (E 407a) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2018.5238",
        doi: "10.2903/j.efsa.2018.5238",
        pmid: "32625873",
      },
      concern: false,
    },
    {
      summary: {
        en: "In about 92,000 French adults (NutriNet-Santé), higher carrageenan (E407) intake was associated with higher breast cancer risk (HR 1.28).",
        fr: "Chez environ 92 000 adultes français (NutriNet-Santé), une consommation plus élevée de carraghénane (E407) était associée à un risque accru de cancer du sein (HR 1,28).",
        de: "Bei rund 92.000 französischen Erwachsenen (NutriNet-Santé) war höherer Carrageen-Konsum (E407) mit höherem Brustkrebsrisiko verbunden (HR 1,28).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Sellem et al.)",
        year: 2024,
        title:
          "Food additive emulsifiers and cancer risk: Results from the French prospective NutriNet-Santé cohort",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10863884/",
        doi: "10.1371/journal.pmed.1004338",
        pmid: "38349899",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 104,000 French adults (NutriNet-Santé), higher carrageenan intake was associated with a higher risk of type 2 diabetes.",
        fr: "Chez environ 104 000 adultes français (NutriNet-Santé), une consommation plus élevée de carraghénanes était associée à un risque accru de diabète de type 2.",
        de: "Bei rund 104.000 französischen Erwachsenen (NutriNet-Santé) war höherer Carrageen-Konsum mit einem höheren Typ-2-Diabetes-Risiko verbunden.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Salame et al.)",
        year: 2024,
        title:
          "Food additive emulsifiers and the risk of type 2 diabetes: analysis of data from the NutriNet-Santé prospective cohort study",
        url: "https://pubmed.ncbi.nlm.nih.gov/38663950/",
        doi: "10.1016/S2213-8587(24)00086-X",
        pmid: "38663950",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a small randomized trial in ulcerative colitis in remission, 3 patients given carrageenan capsules relapsed, versus none on placebo.",
        fr: "Dans un petit essai randomisé chez des patients en rémission de rectocolite hémorragique, 3 patients sous carraghénane ont rechuté, aucun sous placebo.",
        de: "In einer kleinen randomisierten Studie bei Colitis ulcerosa in Remission erlitten 3 Patienten mit Carrageen-Kapseln einen Rückfall, keiner unter Placebo.",
      },
      kind: "trial",
      source: {
        org: "Bhattacharyya et al.",
        year: 2017,
        title:
          "A randomized trial of the effects of the no-carrageenan diet on ulcerative colitis disease activity",
        url: "https://pubmed.ncbi.nlm.nih.gov/28447072/",
        doi: "10.3233/NHA-170023",
        pmid: "28447072",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a small randomized feeding trial in people with prediabetes, those on a carrageenan-free diet had declines in HbA1c and insulin resistance (HOMA-IR).",
        fr: "Dans un petit essai alimentaire randomisé chez des prédiabétiques, le régime sans carraghénane s'est accompagné d'une baisse de l'HbA1c et de l'insulinorésistance.",
        de: "In einer kleinen randomisierten Ernährungsstudie bei Prädiabetes sanken unter carrageenfreier Kost HbA1c und Insulinresistenz (HOMA-IR).",
      },
      kind: "trial",
      source: {
        org: "Feferman et al.",
        year: 2020,
        title:
          "Carrageenan-Free Diet Shows Improved Glucose Tolerance and Insulin Signaling in Prediabetes: A Randomized, Pilot Clinical Trial",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7191375/",
        doi: "10.1155/2020/8267980",
        pmid: "32377523",
      },
      concern: true,
    },
  ],
  "en:e407a": [
    {
      summary: {
        en: "EFSA (2018) judged the group acceptable daily intake of 75 mg/kg bw per day for carrageenan (E 407, E 407a) temporary, pending better data.",
        fr: "L'EFSA (2018) a jugé temporaire la DJA de groupe de 75 mg/kg p.c. par jour des carraghénanes (E 407, E 407a), dans l'attente de meilleures données.",
        de: "Die EFSA (2018) stufte die Gruppen-ADI von 75 mg/kg KG pro Tag für Carrageen (E 407, E 407a) bis zu besseren Daten als vorläufig ein.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2018,
        title:
          "Re-evaluation of carrageenan (E 407) and processed Eucheuma seaweed (E 407a) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2018.5238",
        doi: "10.2903/j.efsa.2018.5238",
        pmid: "32625873",
      },
      concern: false,
    },
    {
      summary: {
        en: "In about 104,000 French adults (NutriNet-Santé), higher carrageenan intake was associated with a higher risk of type 2 diabetes.",
        fr: "Chez environ 104 000 adultes français (NutriNet-Santé), une consommation plus élevée de carraghénanes était associée à un risque accru de diabète de type 2.",
        de: "Bei rund 104.000 französischen Erwachsenen (NutriNet-Santé) war höherer Carrageen-Konsum mit einem höheren Typ-2-Diabetes-Risiko verbunden.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Salame et al.)",
        year: 2024,
        title:
          "Food additive emulsifiers and the risk of type 2 diabetes: analysis of data from the NutriNet-Santé prospective cohort study",
        url: "https://pubmed.ncbi.nlm.nih.gov/38663950/",
        doi: "10.1016/S2213-8587(24)00086-X",
        pmid: "38663950",
      },
      concern: true,
    },
  ],
  "en:e466": [
    {
      summary: {
        en: "In about 95,000 French adults (NutriNet-Santé), higher carboxymethylcellulose (E466) intake was associated with higher cardiovascular disease risk (HR 1.03 per SD).",
        fr: "Chez environ 95 000 adultes français (NutriNet-Santé), une consommation plus élevée de carboxyméthylcellulose (E466) était associée à un risque cardiovasculaire accru.",
        de: "Bei rund 95.000 französischen Erwachsenen (NutriNet-Santé) war höherer Carboxymethylcellulose-Konsum (E466) mit höherem Herz-Kreislauf-Risiko verbunden.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Sellem et al.)",
        year: 2023,
        title:
          "Food additive emulsifiers and risk of cardiovascular disease in the NutriNet-Santé cohort: prospective cohort study",
        url: "https://pubmed.ncbi.nlm.nih.gov/37673430/",
        doi: "10.1136/bmj-2023-076058",
        pmid: "37673430",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a controlled-feeding trial, healthy adults eating 15 g/day of carboxymethylcellulose for 11 days had more abdominal discomfort and less diverse gut microbiota.",
        fr: "Dans un essai d'alimentation contrôlée, des adultes sains consommant 15 g/j de carboxyméthylcellulose pendant 11 jours ont eu plus d'inconfort abdominal et un microbiote moins divers.",
        de: "In einer kontrollierten Fütterungsstudie hatten Gesunde mit 15 g/Tag Carboxymethylcellulose über 11 Tage mehr Bauchbeschwerden und eine weniger vielfältige Darmflora.",
      },
      kind: "trial",
      source: {
        org: "Chassaing et al.",
        year: 2022,
        title:
          "Randomized Controlled-Feeding Study of Dietary Emulsifier Carboxymethylcellulose Reveals Detrimental Impacts on the Gut Microbiota and Metabolome",
        url: "https://pubmed.ncbi.nlm.nih.gov/34774538/",
        doi: "10.1053/j.gastro.2021.11.006",
        pmid: "34774538",
      },
      concern: true,
    },
    {
      summary: {
        en: "In mice, carboxymethylcellulose and polysorbate-80 induced low-grade gut inflammation and metabolic syndrome, and promoted colitis in susceptible mice.",
        fr: "Chez la souris, la carboxyméthylcellulose et le polysorbate 80 ont induit une inflammation intestinale à bas bruit et un syndrome métabolique, et favorisé la colite.",
        de: "Bei Mäusen lösten Carboxymethylcellulose und Polysorbat 80 eine leichte Darmentzündung und ein metabolisches Syndrom aus und förderten Kolitis.",
      },
      kind: "animal",
      source: {
        org: "Chassaing et al.",
        year: 2015,
        title:
          "Dietary emulsifiers impact the mouse gut microbiota promoting colitis and metabolic syndrome",
        url: "https://pubmed.ncbi.nlm.nih.gov/25731162/",
        doi: "10.1038/nature14232",
        pmid: "25731162",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2018) found no need for a numerical acceptable daily intake and no safety concern for celluloses, including E 460 and E 466, at reported uses.",
        fr: "L'EFSA (2018) n'a jugé nécessaire aucune DJA chiffrée et n'a relevé aucun problème de sécurité pour les celluloses, dont E 460 et E 466, aux usages déclarés.",
        de: "Die EFSA (2018) hielt für Cellulosen, darunter E 460 und E 466, keine numerische ADI für nötig und sah bei den gemeldeten Verwendungen keine Bedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2018,
        title:
          "Re-evaluation of celluloses E 460(i), E 460(ii), E 461–466, E 468 and E 469 as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2018.5047",
        doi: "10.2903/j.efsa.2018.5047",
        pmid: "32625652",
      },
      concern: false,
    },
  ],
  "en:e460": [
    {
      summary: {
        en: "In about 95,000 French adults (NutriNet-Santé), higher intake of celluloses, including E460, was associated with higher cardiovascular disease risk (HR 1.05 per SD).",
        fr: "Chez environ 95 000 adultes français (NutriNet-Santé), une consommation plus élevée de celluloses, dont E460, était associée à un risque cardiovasculaire accru.",
        de: "Bei rund 95.000 französischen Erwachsenen (NutriNet-Santé) war höherer Cellulose-Konsum, einschließlich E460, mit höherem Herz-Kreislauf-Risiko verbunden.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Sellem et al.)",
        year: 2023,
        title:
          "Food additive emulsifiers and risk of cardiovascular disease in the NutriNet-Santé cohort: prospective cohort study",
        url: "https://pubmed.ncbi.nlm.nih.gov/37673430/",
        doi: "10.1136/bmj-2023-076058",
        pmid: "37673430",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2018) found no need for a numerical acceptable daily intake and no safety concern for celluloses, including E 460 and E 466, at reported uses.",
        fr: "L'EFSA (2018) n'a jugé nécessaire aucune DJA chiffrée et n'a relevé aucun problème de sécurité pour les celluloses, dont E 460 et E 466, aux usages déclarés.",
        de: "Die EFSA (2018) hielt für Cellulosen, darunter E 460 und E 466, keine numerische ADI für nötig und sah bei den gemeldeten Verwendungen keine Bedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2018,
        title:
          "Re-evaluation of celluloses E 460(i), E 460(ii), E 461–466, E 468 and E 469 as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2018.5047",
        doi: "10.2903/j.efsa.2018.5047",
        pmid: "32625652",
      },
      concern: false,
    },
  ],
  "en:e471": [
    {
      summary: {
        en: "In NutriNet-Santé (about 95,000 French adults), higher intake of mono- and diglycerides of fatty acids (E471/E472) was associated with higher cardiovascular risks.",
        fr: "Dans NutriNet-Santé (environ 95 000 adultes), une consommation plus élevée de mono- et diglycérides d'acides gras (E471/E472) était associée à un risque cardiovasculaire accru.",
        de: "In NutriNet-Santé (rund 95.000 Erwachsene) war höherer Konsum von Mono- und Diglyceriden von Speisefettsäuren (E471/E472) mit höherem Herz-Kreislauf-Risiko verbunden.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Sellem et al.)",
        year: 2023,
        title:
          "Food additive emulsifiers and risk of cardiovascular disease in the NutriNet-Santé cohort: prospective cohort study",
        url: "https://pubmed.ncbi.nlm.nih.gov/37673430/",
        doi: "10.1136/bmj-2023-076058",
        pmid: "37673430",
      },
      concern: true,
    },
    {
      summary: {
        en: "In NutriNet-Santé (about 92,000 adults), higher E471 intake was associated with higher overall (HR 1.15), breast (HR 1.24) and prostate (HR 1.46) cancer risk.",
        fr: "Dans NutriNet-Santé (environ 92 000 adultes), une consommation plus élevée d'E471 était associée à plus de cancers au total (HR 1,15), du sein (1,24) et de la prostate (1,46).",
        de: "In NutriNet-Santé (rund 92.000 Erwachsene) war höherer E471-Konsum mit mehr Krebs insgesamt (HR 1,15), Brust- (1,24) und Prostatakrebs (1,46) verbunden.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Sellem et al.)",
        year: 2024,
        title:
          "Food additive emulsifiers and cancer risk: Results from the French prospective NutriNet-Santé cohort",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10863884/",
        doi: "10.1371/journal.pmed.1004338",
        pmid: "38349899",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2017) found no need for a numerical acceptable daily intake and no safety concern for mono- and diglycerides of fatty acids (E 471) at reported uses.",
        fr: "L'EFSA (2017) n'a jugé nécessaire aucune DJA chiffrée et n'a relevé aucun problème de sécurité pour les mono- et diglycérides d'acides gras (E 471) aux usages déclarés.",
        de: "Die EFSA (2017) hielt für Mono- und Diglyceride von Speisefettsäuren (E 471) keine numerische ADI für nötig und sah keine Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2017,
        title: "Re-evaluation of mono- and di-glycerides of fatty acids (E 471) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2017.5045",
        doi: "10.2903/j.efsa.2017.5045",
        pmid: "32625340",
      },
      concern: false,
    },
  ],
  "en:e433": [
    {
      summary: {
        en: "EFSA (2015) set a group acceptable daily intake of 25 mg/kg bw per day for polysorbates, including polysorbate 80 (E 433).",
        fr: "L'EFSA (2015) a fixé une DJA de groupe de 25 mg/kg p.c. par jour pour les polysorbates, dont le polysorbate 80 (E 433).",
        de: "Die EFSA (2015) legte für Polysorbate, einschließlich Polysorbat 80 (E 433), eine Gruppen-ADI von 25 mg/kg KG pro Tag fest.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2015,
        title:
          "Scientific Opinion on the re-evaluation of polysorbates (E 432–436) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2015.4152",
        doi: "10.2903/j.efsa.2015.4152",
        pmid: "42109790",
      },
      concern: false,
    },
    {
      summary: {
        en: "In mice, polysorbate-80 and carboxymethylcellulose induced low-grade gut inflammation and metabolic syndrome, and promoted colitis in susceptible mice.",
        fr: "Chez la souris, le polysorbate 80 et la carboxyméthylcellulose ont induit une inflammation intestinale à bas bruit et un syndrome métabolique, et favorisé la colite.",
        de: "Bei Mäusen lösten Polysorbat 80 und Carboxymethylcellulose eine leichte Darmentzündung und ein metabolisches Syndrom aus und förderten Kolitis.",
      },
      kind: "animal",
      source: {
        org: "Chassaing et al.",
        year: 2015,
        title:
          "Dietary emulsifiers impact the mouse gut microbiota promoting colitis and metabolic syndrome",
        url: "https://pubmed.ncbi.nlm.nih.gov/25731162/",
        doi: "10.1038/nature14232",
        pmid: "25731162",
      },
      concern: true,
    },
  ],
  "en:e104": [
    {
      summary: {
        en: "In a UK trial in 3- and 8/9-year-olds, drinks with artificial colour mixes plus sodium benzoate increased hyperactivity versus placebo (McCann et al., 2007).",
        fr: "Dans un essai britannique chez des enfants de 3 et 8-9 ans, des boissons avec mélanges de colorants et benzoate de sodium ont accru l'hyperactivité vs placebo (McCann, 2007).",
        de: "In einer britischen Studie mit 3- und 8/9-Jährigen steigerten Getränke mit Farbstoffmischungen und Natriumbenzoat die Hyperaktivität gegenüber Placebo (McCann 2007).",
      },
      kind: "trial",
      source: {
        org: "McCann et al. (Southampton study)",
        year: 2007,
        title:
          "Food additives and hyperactive behaviour in 3-year-old and 8/9-year-old children in the community: a randomised, double-blinded, placebo-controlled trial",
        url: "https://pubmed.ncbi.nlm.nih.gov/17825405/",
        doi: "10.1016/S0140-6736(07)61306-3",
        pmid: "17825405",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2008) judged the Southampton study gave limited evidence of a small, inconsistent effect on activity and attention in some children.",
        fr: "L'EFSA (2008) a estimé que l'étude de Southampton n'apportait que des preuves limitées d'un effet faible et inconstant sur l'activité et l'attention de certains enfants.",
        de: "Die EFSA (2008) sah in der Southampton-Studie nur begrenzte Hinweise auf einen kleinen, uneinheitlichen Effekt auf Aktivität und Aufmerksamkeit mancher Kinder.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2008,
        title: "EFSA evaluates Southampton study on food additives and child behaviour",
        url: "https://www.efsa.europa.eu/en/news/efsa-evaluates-southampton-study-food-additives-and-child-behaviour",
      },
      concern: false,
    },
    {
      summary: {
        en: "EU law requires foods with this colour to carry the warning 'may have an adverse effect on activity and attention in children'.",
        fr: "Le droit européen impose aux aliments contenant ce colorant la mention « peut avoir des effets indésirables sur l'activité et l'attention chez les enfants ».",
        de: "EU-Recht schreibt für Lebensmittel mit diesem Farbstoff den Hinweis vor: „Kann Aktivität und Aufmerksamkeit bei Kindern beeinträchtigen“.",
      },
      kind: "official",
      source: {
        org: "EU",
        year: 2008,
        title:
          "Regulation (EC) No 1333/2008 on food additives, Annex V (labelling of certain food colours)",
        url: "https://www.legislation.gov.uk/eur/2008/1333/annex/V",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2009) lowered the acceptable daily intake of Quinoline Yellow (E104) to 0.5 mg/kg bw per day.",
        fr: "L'EFSA (2009) a abaissé la dose journalière admissible du jaune de quinoléine (E104) à 0,5 mg/kg p.c. par jour.",
        de: "Die EFSA (2009) senkte die zulässige Tagesdosis für Chinolingelb (E104) auf 0,5 mg/kg KG pro Tag.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2009,
        title:
          "Scientific Opinion on the re-evaluation of Quinoline Yellow (E 104) as a food additive",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2009.1329",
        doi: "10.2903/j.efsa.2009.1329",
      },
      concern: true,
    },
    {
      summary: {
        en: "After EFSA lowered its ADI, the EU amended the conditions and levels of use of Quinoline Yellow (E104) in 2012.",
        fr: "Après l'abaissement de sa DJA par l'EFSA, l'UE a modifié en 2012 les conditions et doses d'emploi du jaune de quinoléine (E104).",
        de: "Nach der Senkung der ADI durch die EFSA änderte die EU 2012 die Verwendungsbedingungen und Höchstmengen für Chinolingelb (E104).",
      },
      kind: "official",
      source: {
        org: "EU",
        year: 2012,
        title: "Commission Regulation (EU) No 232/2012 (conditions of use of E 104, E 110, E 124)",
        url: "https://www.legislation.gov.uk/eur/2012/232/introduction",
      },
      concern: true,
    },
  ],
  "en:e110": [
    {
      summary: {
        en: "In a UK trial in 3- and 8/9-year-olds, drinks with artificial colour mixes plus sodium benzoate increased hyperactivity versus placebo (McCann et al., 2007).",
        fr: "Dans un essai britannique chez des enfants de 3 et 8-9 ans, des boissons avec mélanges de colorants et benzoate de sodium ont accru l'hyperactivité vs placebo (McCann, 2007).",
        de: "In einer britischen Studie mit 3- und 8/9-Jährigen steigerten Getränke mit Farbstoffmischungen und Natriumbenzoat die Hyperaktivität gegenüber Placebo (McCann 2007).",
      },
      kind: "trial",
      source: {
        org: "McCann et al. (Southampton study)",
        year: 2007,
        title:
          "Food additives and hyperactive behaviour in 3-year-old and 8/9-year-old children in the community: a randomised, double-blinded, placebo-controlled trial",
        url: "https://pubmed.ncbi.nlm.nih.gov/17825405/",
        doi: "10.1016/S0140-6736(07)61306-3",
        pmid: "17825405",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2008) judged the Southampton study gave limited evidence of a small, inconsistent effect on activity and attention in some children.",
        fr: "L'EFSA (2008) a estimé que l'étude de Southampton n'apportait que des preuves limitées d'un effet faible et inconstant sur l'activité et l'attention de certains enfants.",
        de: "Die EFSA (2008) sah in der Southampton-Studie nur begrenzte Hinweise auf einen kleinen, uneinheitlichen Effekt auf Aktivität und Aufmerksamkeit mancher Kinder.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2008,
        title: "EFSA evaluates Southampton study on food additives and child behaviour",
        url: "https://www.efsa.europa.eu/en/news/efsa-evaluates-southampton-study-food-additives-and-child-behaviour",
      },
      concern: false,
    },
    {
      summary: {
        en: "EU law requires foods with this colour to carry the warning 'may have an adverse effect on activity and attention in children'.",
        fr: "Le droit européen impose aux aliments contenant ce colorant la mention « peut avoir des effets indésirables sur l'activité et l'attention chez les enfants ».",
        de: "EU-Recht schreibt für Lebensmittel mit diesem Farbstoff den Hinweis vor: „Kann Aktivität und Aufmerksamkeit bei Kindern beeinträchtigen“.",
      },
      kind: "official",
      source: {
        org: "EU",
        year: 2008,
        title:
          "Regulation (EC) No 1333/2008 on food additives, Annex V (labelling of certain food colours)",
        url: "https://www.legislation.gov.uk/eur/2008/1333/annex/V",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2009) lowered the acceptable daily intake of Sunset Yellow FCF (E110), setting a temporary ADI of 1 mg/kg bw per day.",
        fr: "L'EFSA (2009) a abaissé la dose journalière admissible du jaune orangé S (E110), avec une DJA temporaire de 1 mg/kg p.c. par jour.",
        de: "Die EFSA (2009) senkte die zulässige Tagesdosis für Gelborange S (E110) auf einen vorläufigen Wert von 1 mg/kg KG pro Tag.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2009,
        title:
          "Scientific Opinion on the re-evaluation of Sunset Yellow FCF (E 110) as a food additive",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2009.1330",
        doi: "10.2903/j.efsa.2009.1330",
      },
      concern: true,
    },
  ],
  "en:e124": [
    {
      summary: {
        en: "In a UK trial in 3- and 8/9-year-olds, drinks with artificial colour mixes plus sodium benzoate increased hyperactivity versus placebo (McCann et al., 2007).",
        fr: "Dans un essai britannique chez des enfants de 3 et 8-9 ans, des boissons avec mélanges de colorants et benzoate de sodium ont accru l'hyperactivité vs placebo (McCann, 2007).",
        de: "In einer britischen Studie mit 3- und 8/9-Jährigen steigerten Getränke mit Farbstoffmischungen und Natriumbenzoat die Hyperaktivität gegenüber Placebo (McCann 2007).",
      },
      kind: "trial",
      source: {
        org: "McCann et al. (Southampton study)",
        year: 2007,
        title:
          "Food additives and hyperactive behaviour in 3-year-old and 8/9-year-old children in the community: a randomised, double-blinded, placebo-controlled trial",
        url: "https://pubmed.ncbi.nlm.nih.gov/17825405/",
        doi: "10.1016/S0140-6736(07)61306-3",
        pmid: "17825405",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2008) judged the Southampton study gave limited evidence of a small, inconsistent effect on activity and attention in some children.",
        fr: "L'EFSA (2008) a estimé que l'étude de Southampton n'apportait que des preuves limitées d'un effet faible et inconstant sur l'activité et l'attention de certains enfants.",
        de: "Die EFSA (2008) sah in der Southampton-Studie nur begrenzte Hinweise auf einen kleinen, uneinheitlichen Effekt auf Aktivität und Aufmerksamkeit mancher Kinder.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2008,
        title: "EFSA evaluates Southampton study on food additives and child behaviour",
        url: "https://www.efsa.europa.eu/en/news/efsa-evaluates-southampton-study-food-additives-and-child-behaviour",
      },
      concern: false,
    },
    {
      summary: {
        en: "EU law requires foods with this colour to carry the warning 'may have an adverse effect on activity and attention in children'.",
        fr: "Le droit européen impose aux aliments contenant ce colorant la mention « peut avoir des effets indésirables sur l'activité et l'attention chez les enfants ».",
        de: "EU-Recht schreibt für Lebensmittel mit diesem Farbstoff den Hinweis vor: „Kann Aktivität und Aufmerksamkeit bei Kindern beeinträchtigen“.",
      },
      kind: "official",
      source: {
        org: "EU",
        year: 2008,
        title:
          "Regulation (EC) No 1333/2008 on food additives, Annex V (labelling of certain food colours)",
        url: "https://www.legislation.gov.uk/eur/2008/1333/annex/V",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2009) lowered the acceptable daily intake of Ponceau 4R (E124) to 0.7 mg/kg bw per day.",
        fr: "L'EFSA (2009) a abaissé la dose journalière admissible du ponceau 4R (E124) à 0,7 mg/kg p.c. par jour.",
        de: "Die EFSA (2009) senkte die zulässige Tagesdosis für Cochenillerot A (E124) auf 0,7 mg/kg KG pro Tag.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2009,
        title: "Scientific Opinion on the re-evaluation of Ponceau 4R (E 124) as a food additive",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2009.1328",
        doi: "10.2903/j.efsa.2009.1328",
      },
      concern: true,
    },
  ],
  "en:e102": [
    {
      summary: {
        en: "In a UK trial in 3- and 8/9-year-olds, drinks with artificial colour mixes plus sodium benzoate increased hyperactivity versus placebo (McCann et al., 2007).",
        fr: "Dans un essai britannique chez des enfants de 3 et 8-9 ans, des boissons avec mélanges de colorants et benzoate de sodium ont accru l'hyperactivité vs placebo (McCann, 2007).",
        de: "In einer britischen Studie mit 3- und 8/9-Jährigen steigerten Getränke mit Farbstoffmischungen und Natriumbenzoat die Hyperaktivität gegenüber Placebo (McCann 2007).",
      },
      kind: "trial",
      source: {
        org: "McCann et al. (Southampton study)",
        year: 2007,
        title:
          "Food additives and hyperactive behaviour in 3-year-old and 8/9-year-old children in the community: a randomised, double-blinded, placebo-controlled trial",
        url: "https://pubmed.ncbi.nlm.nih.gov/17825405/",
        doi: "10.1016/S0140-6736(07)61306-3",
        pmid: "17825405",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2008) judged the Southampton study gave limited evidence of a small, inconsistent effect on activity and attention in some children.",
        fr: "L'EFSA (2008) a estimé que l'étude de Southampton n'apportait que des preuves limitées d'un effet faible et inconstant sur l'activité et l'attention de certains enfants.",
        de: "Die EFSA (2008) sah in der Southampton-Studie nur begrenzte Hinweise auf einen kleinen, uneinheitlichen Effekt auf Aktivität und Aufmerksamkeit mancher Kinder.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2008,
        title: "EFSA evaluates Southampton study on food additives and child behaviour",
        url: "https://www.efsa.europa.eu/en/news/efsa-evaluates-southampton-study-food-additives-and-child-behaviour",
      },
      concern: false,
    },
    {
      summary: {
        en: "EU law requires foods with this colour to carry the warning 'may have an adverse effect on activity and attention in children'.",
        fr: "Le droit européen impose aux aliments contenant ce colorant la mention « peut avoir des effets indésirables sur l'activité et l'attention chez les enfants ».",
        de: "EU-Recht schreibt für Lebensmittel mit diesem Farbstoff den Hinweis vor: „Kann Aktivität und Aufmerksamkeit bei Kindern beeinträchtigen“.",
      },
      kind: "official",
      source: {
        org: "EU",
        year: 2008,
        title:
          "Regulation (EC) No 1333/2008 on food additives, Annex V (labelling of certain food colours)",
        url: "https://www.legislation.gov.uk/eur/2008/1333/annex/V",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2009) found no reason to revise the acceptable daily intake of 7.5 mg/kg bw per day for tartrazine (E102).",
        fr: "L'EFSA (2009) n'a trouvé aucune raison de réviser la dose journalière admissible de 7,5 mg/kg p.c. par jour de la tartrazine (E102).",
        de: "Die EFSA (2009) sah keinen Grund, die zulässige Tagesdosis von 7,5 mg/kg KG pro Tag für Tartrazin (E102) zu ändern.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2009,
        title: "Scientific Opinion on the re-evaluation Tartrazine (E 102)",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2009.1331",
        doi: "10.2903/j.efsa.2009.1331",
      },
      concern: false,
    },
  ],
  "en:e122": [
    {
      summary: {
        en: "In a UK trial in 3- and 8/9-year-olds, drinks with artificial colour mixes plus sodium benzoate increased hyperactivity versus placebo (McCann et al., 2007).",
        fr: "Dans un essai britannique chez des enfants de 3 et 8-9 ans, des boissons avec mélanges de colorants et benzoate de sodium ont accru l'hyperactivité vs placebo (McCann, 2007).",
        de: "In einer britischen Studie mit 3- und 8/9-Jährigen steigerten Getränke mit Farbstoffmischungen und Natriumbenzoat die Hyperaktivität gegenüber Placebo (McCann 2007).",
      },
      kind: "trial",
      source: {
        org: "McCann et al. (Southampton study)",
        year: 2007,
        title:
          "Food additives and hyperactive behaviour in 3-year-old and 8/9-year-old children in the community: a randomised, double-blinded, placebo-controlled trial",
        url: "https://pubmed.ncbi.nlm.nih.gov/17825405/",
        doi: "10.1016/S0140-6736(07)61306-3",
        pmid: "17825405",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2008) judged the Southampton study gave limited evidence of a small, inconsistent effect on activity and attention in some children.",
        fr: "L'EFSA (2008) a estimé que l'étude de Southampton n'apportait que des preuves limitées d'un effet faible et inconstant sur l'activité et l'attention de certains enfants.",
        de: "Die EFSA (2008) sah in der Southampton-Studie nur begrenzte Hinweise auf einen kleinen, uneinheitlichen Effekt auf Aktivität und Aufmerksamkeit mancher Kinder.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2008,
        title: "EFSA evaluates Southampton study on food additives and child behaviour",
        url: "https://www.efsa.europa.eu/en/news/efsa-evaluates-southampton-study-food-additives-and-child-behaviour",
      },
      concern: false,
    },
    {
      summary: {
        en: "EU law requires foods with this colour to carry the warning 'may have an adverse effect on activity and attention in children'.",
        fr: "Le droit européen impose aux aliments contenant ce colorant la mention « peut avoir des effets indésirables sur l'activité et l'attention chez les enfants ».",
        de: "EU-Recht schreibt für Lebensmittel mit diesem Farbstoff den Hinweis vor: „Kann Aktivität und Aufmerksamkeit bei Kindern beeinträchtigen“.",
      },
      kind: "official",
      source: {
        org: "EU",
        year: 2008,
        title:
          "Regulation (EC) No 1333/2008 on food additives, Annex V (labelling of certain food colours)",
        url: "https://www.legislation.gov.uk/eur/2008/1333/annex/V",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2009) found no reason to revise the acceptable daily intake of 4 mg/kg bw per day for azorubine/carmoisine (E122).",
        fr: "L'EFSA (2009) n'a trouvé aucune raison de réviser la dose journalière admissible de 4 mg/kg p.c. par jour de l'azorubine (E122).",
        de: "Die EFSA (2009) sah keinen Grund, die zulässige Tagesdosis von 4 mg/kg KG pro Tag für Azorubin (E122) zu ändern.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2009,
        title:
          "Scientific Opinion on the re-evaluation of Azorubine/Carmoisine (E 122) as a food additive",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2009.1332",
        doi: "10.2903/j.efsa.2009.1332",
      },
      concern: false,
    },
  ],
  "en:e129": [
    {
      summary: {
        en: "In a UK trial in 3- and 8/9-year-olds, drinks with artificial colour mixes plus sodium benzoate increased hyperactivity versus placebo (McCann et al., 2007).",
        fr: "Dans un essai britannique chez des enfants de 3 et 8-9 ans, des boissons avec mélanges de colorants et benzoate de sodium ont accru l'hyperactivité vs placebo (McCann, 2007).",
        de: "In einer britischen Studie mit 3- und 8/9-Jährigen steigerten Getränke mit Farbstoffmischungen und Natriumbenzoat die Hyperaktivität gegenüber Placebo (McCann 2007).",
      },
      kind: "trial",
      source: {
        org: "McCann et al. (Southampton study)",
        year: 2007,
        title:
          "Food additives and hyperactive behaviour in 3-year-old and 8/9-year-old children in the community: a randomised, double-blinded, placebo-controlled trial",
        url: "https://pubmed.ncbi.nlm.nih.gov/17825405/",
        doi: "10.1016/S0140-6736(07)61306-3",
        pmid: "17825405",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2008) judged the Southampton study gave limited evidence of a small, inconsistent effect on activity and attention in some children.",
        fr: "L'EFSA (2008) a estimé que l'étude de Southampton n'apportait que des preuves limitées d'un effet faible et inconstant sur l'activité et l'attention de certains enfants.",
        de: "Die EFSA (2008) sah in der Southampton-Studie nur begrenzte Hinweise auf einen kleinen, uneinheitlichen Effekt auf Aktivität und Aufmerksamkeit mancher Kinder.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2008,
        title: "EFSA evaluates Southampton study on food additives and child behaviour",
        url: "https://www.efsa.europa.eu/en/news/efsa-evaluates-southampton-study-food-additives-and-child-behaviour",
      },
      concern: false,
    },
    {
      summary: {
        en: "EU law requires foods with this colour to carry the warning 'may have an adverse effect on activity and attention in children'.",
        fr: "Le droit européen impose aux aliments contenant ce colorant la mention « peut avoir des effets indésirables sur l'activité et l'attention chez les enfants ».",
        de: "EU-Recht schreibt für Lebensmittel mit diesem Farbstoff den Hinweis vor: „Kann Aktivität und Aufmerksamkeit bei Kindern beeinträchtigen“.",
      },
      kind: "official",
      source: {
        org: "EU",
        year: 2008,
        title:
          "Regulation (EC) No 1333/2008 on food additives, Annex V (labelling of certain food colours)",
        url: "https://www.legislation.gov.uk/eur/2008/1333/annex/V",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2009) found no reason to revise the acceptable daily intake of 7 mg/kg bw per day for Allura Red AC (E129).",
        fr: "L'EFSA (2009) n'a trouvé aucune raison de réviser la dose journalière admissible de 7 mg/kg p.c. par jour du rouge allura AC (E129).",
        de: "Die EFSA (2009) sah keinen Grund, die zulässige Tagesdosis von 7 mg/kg KG pro Tag für Allurarot AC (E129) zu ändern.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2009,
        title:
          "Scientific Opinion on the re-evaluation of Allura Red AC (E 129) as a food additive",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2009.1327",
        doi: "10.2903/j.efsa.2009.1327",
      },
      concern: false,
    },
  ],
  "en:e171": [
    {
      summary: {
        en: "EFSA (2021) concluded titanium dioxide (E171) can no longer be considered safe as a food additive, as genotoxicity concerns could not be excluded.",
        fr: "L'EFSA (2021) a conclu que le dioxyde de titane (E171) ne peut plus être considéré comme sûr comme additif, une génotoxicité ne pouvant être exclue.",
        de: "Die EFSA (2021) kam zu dem Schluss, dass Titandioxid (E171) als Lebensmittelzusatz nicht mehr als sicher gilt, da Genotoxizität nicht auszuschließen ist.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2021,
        title: "Titanium dioxide: E171 no longer considered safe when used as a food additive",
        url: "https://www.efsa.europa.eu/en/news/titanium-dioxide-e171-no-longer-considered-safe-when-used-food-additive",
        doi: "10.2903/j.efsa.2021.6585",
        pmid: "33976718",
      },
      concern: true,
    },
    {
      summary: {
        en: "Under EU Regulation 2022/63, food placed on the EU market after 7 August 2022 can no longer contain titanium dioxide (E171).",
        fr: "En vertu du règlement UE 2022/63, les aliments mis sur le marché européen après le 7 août 2022 ne peuvent plus contenir de dioxyde de titane (E171).",
        de: "Nach EU-Verordnung 2022/63 dürfen Lebensmittel, die nach dem 7. August 2022 in der EU in Verkehr kommen, kein Titandioxid (E171) mehr enthalten.",
      },
      kind: "official",
      source: {
        org: "EU",
        year: 2022,
        title:
          "Titanium Dioxide is No Longer Authorised as a Food Additive in the EU from 7 August 2022 (Regulation (EU) 2022/63)",
        url: "https://www.fsai.ie/news-and-alerts/latest-news/titanium-dioxide-is-no-longer-authorised-as-a-food",
      },
      concern: true,
    },
  ],
  "en:e127": [
    {
      summary: {
        en: "The US FDA revoked Red No. 3 (erythrosine) in food under the Delaney Clause, due to cancer in male rats by a mechanism FDA says does not occur in humans.",
        fr: "La FDA américaine a retiré le rouge n° 3 (érythrosine) des aliments en vertu de la clause Delaney, à cause de cancers chez le rat mâle, mécanisme absent chez l'homme selon elle.",
        de: "Die US-FDA widerrief Rot Nr. 3 (Erythrosin) für Lebensmittel nach der Delaney-Klausel wegen Krebs bei männlichen Ratten; der Mechanismus gilt nicht für Menschen.",
      },
      kind: "official",
      source: {
        org: "FDA",
        year: 2025,
        title: "FDA to Revoke Authorization for the Use of Red No. 3 in Food and Ingested Drugs",
        url: "https://www.fda.gov/food/hfp-constituent-updates/fda-revoke-authorization-use-red-no-3-food-and-ingested-drugs",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2011) kept erythrosine's acceptable daily intake of 0.1 mg/kg bw per day, judging rat thyroid tumours secondary to effects on thyroid function.",
        fr: "L'EFSA (2011) a maintenu la DJA de l'érythrosine à 0,1 mg/kg p.c. par jour, jugeant les tumeurs thyroïdiennes du rat secondaires à un effet sur la thyroïde.",
        de: "Die EFSA (2011) behielt die ADI von Erythrosin von 0,1 mg/kg KG pro Tag bei; Schilddrüsentumoren bei Ratten seien Folge von Schilddrüseneffekten.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2011,
        title: "Scientific Opinion on the re-evaluation of Erythrosine (E 127) as a food additive",
        url: "https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2011.1854",
        doi: "10.2903/j.efsa.2011.1854",
      },
      concern: false,
    },
  ],
  "en:e249": [
    {
      summary: {
        en: "IARC classifies ingested nitrate or nitrite, under conditions that lead to nitrosation in the body, as probably carcinogenic to humans (Group 2A).",
        fr: "Le CIRC classe les nitrates ou nitrites ingérés, dans des conditions entraînant une nitrosation dans l'organisme, comme probablement cancérogènes (groupe 2A).",
        de: "Die IARC stuft aufgenommenes Nitrat oder Nitrit unter Bedingungen, die zu Nitrosierung im Körper führen, als wahrscheinlich krebserregend ein (Gruppe 2A).",
      },
      kind: "official",
      source: {
        org: "IARC",
        year: 2010,
        title:
          "IARC Monographs Volume 94: Ingested Nitrate and Nitrite, and Cyanobacterial Peptide Toxins",
        url: "https://publications.iarc.who.int/download/mono94.pdf",
        pmid: "21141240",
      },
      concern: true,
    },
    {
      summary: {
        en: "IARC (2015) classified processed meat as carcinogenic to humans (Group 1); each 50 g eaten daily raises colorectal cancer risk by 18%.",
        fr: "Le CIRC (2015) a classé la viande transformée cancérogène pour l'homme (groupe 1) ; chaque portion de 50 g par jour accroît le risque de cancer colorectal de 18 %.",
        de: "Die IARC (2015) stufte verarbeitetes Fleisch als krebserregend ein (Gruppe 1); je 50 g täglich steigt das Darmkrebsrisiko um 18 %.",
      },
      kind: "official",
      source: {
        org: "IARC",
        year: 2015,
        title: "IARC Monographs evaluate consumption of red meat and processed meat (Volume 114)",
        url: "https://www.iarc.who.int/wp-content/uploads/2018/07/pr240_E.pdf",
        doi: "10.1016/S1470-2045(15)00444-1",
        pmid: "26514947",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2017) set an acceptable daily intake for nitrite of 0.07 mg/kg bw per day and found no in vivo genotoxic potential for sodium and potassium nitrite.",
        fr: "L'EFSA (2017) a fixé une DJA des nitrites de 0,07 mg/kg p.c. par jour et n'a pas relevé de potentiel génotoxique in vivo des nitrites de sodium et de potassium.",
        de: "Die EFSA (2017) legte für Nitrit eine ADI von 0,07 mg/kg KG pro Tag fest und fand kein In-vivo-Genotoxizitätspotenzial von Natrium- und Kaliumnitrit.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2017,
        title:
          "Re-evaluation of potassium nitrite (E 249) and sodium nitrite (E 250) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2017.4786",
        doi: "10.2903/j.efsa.2017.4786",
        pmid: "32625504",
      },
      concern: false,
    },
    {
      summary: {
        en: "EFSA (2023) found exposure to carcinogenic nitrosamines in food raises a health concern for all age groups; meat products are the main source.",
        fr: "L'EFSA (2023) estime que l'exposition aux nitrosamines cancérogènes des aliments pose un problème de santé à tous les âges ; les produits carnés en sont la source principale.",
        de: "Die EFSA (2023) sah in der Aufnahme krebserregender Nitrosamine aus Lebensmitteln ein Gesundheitsrisiko für alle Altersgruppen; Fleischprodukte sind Hauptquelle.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2023,
        title: "Risk assessment of N-nitrosamines in food",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2023.7884",
        doi: "10.2903/j.efsa.2023.7884",
        pmid: "36999063",
      },
      concern: true,
    },
    {
      summary: {
        en: "ANSES (2022) confirmed an association between colorectal cancer risk and exposure to nitrites and/or nitrates, from processed meat or drinking water.",
        fr: "L'Anses (2022) a confirmé une association entre le risque de cancer colorectal et l'exposition aux nitrites et/ou nitrates, via la charcuterie ou l'eau de boisson.",
        de: "Die ANSES (2022) bestätigte einen Zusammenhang zwischen Darmkrebsrisiko und der Aufnahme von Nitrit und/oder Nitrat aus Wurstwaren oder Trinkwasser.",
      },
      kind: "official",
      source: {
        org: "ANSES",
        year: 2022,
        title: "Reducing dietary exposure to nitrites and nitrates",
        url: "https://www.anses.fr/en/news/reducing-dietary-exposure-nitrites-and-nitrates",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 104,000 French adults (NutriNet-Santé), higher exposure to additive nitrites, especially sodium nitrite, was associated with type 2 diabetes (HR 1.53).",
        fr: "Chez environ 104 000 adultes (NutriNet-Santé), une exposition plus élevée aux nitrites additifs, surtout le nitrite de sodium, était associée au diabète de type 2 (HR 1,53).",
        de: "Bei rund 104.000 Erwachsenen (NutriNet-Santé) war höhere Aufnahme von Nitrit-Zusätzen, v. a. Natriumnitrit, mit Typ-2-Diabetes verbunden (HR 1,53).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Srour et al.)",
        year: 2023,
        title:
          "Dietary exposure to nitrites and nitrates in association with type 2 diabetes risk: Results from the NutriNet-Santé population-based cohort study",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9844911/",
        doi: "10.1371/journal.pmed.1004149",
        pmid: "36649248",
      },
      concern: true,
    },
  ],
  "en:e250": [
    {
      summary: {
        en: "IARC classifies ingested nitrate or nitrite, under conditions that lead to nitrosation in the body, as probably carcinogenic to humans (Group 2A).",
        fr: "Le CIRC classe les nitrates ou nitrites ingérés, dans des conditions entraînant une nitrosation dans l'organisme, comme probablement cancérogènes (groupe 2A).",
        de: "Die IARC stuft aufgenommenes Nitrat oder Nitrit unter Bedingungen, die zu Nitrosierung im Körper führen, als wahrscheinlich krebserregend ein (Gruppe 2A).",
      },
      kind: "official",
      source: {
        org: "IARC",
        year: 2010,
        title:
          "IARC Monographs Volume 94: Ingested Nitrate and Nitrite, and Cyanobacterial Peptide Toxins",
        url: "https://publications.iarc.who.int/download/mono94.pdf",
        pmid: "21141240",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2017) set an acceptable daily intake for nitrite of 0.07 mg/kg bw per day and found no in vivo genotoxic potential for sodium and potassium nitrite.",
        fr: "L'EFSA (2017) a fixé une DJA des nitrites de 0,07 mg/kg p.c. par jour et n'a pas relevé de potentiel génotoxique in vivo des nitrites de sodium et de potassium.",
        de: "Die EFSA (2017) legte für Nitrit eine ADI von 0,07 mg/kg KG pro Tag fest und fand kein In-vivo-Genotoxizitätspotenzial von Natrium- und Kaliumnitrit.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2017,
        title:
          "Re-evaluation of potassium nitrite (E 249) and sodium nitrite (E 250) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2017.4786",
        doi: "10.2903/j.efsa.2017.4786",
        pmid: "32625504",
      },
      concern: false,
    },
    {
      summary: {
        en: "EFSA (2023) found exposure to carcinogenic nitrosamines in food raises a health concern for all age groups; meat products are the main source.",
        fr: "L'EFSA (2023) estime que l'exposition aux nitrosamines cancérogènes des aliments pose un problème de santé à tous les âges ; les produits carnés en sont la source principale.",
        de: "Die EFSA (2023) sah in der Aufnahme krebserregender Nitrosamine aus Lebensmitteln ein Gesundheitsrisiko für alle Altersgruppen; Fleischprodukte sind Hauptquelle.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2023,
        title: "Risk assessment of N-nitrosamines in food",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2023.7884",
        doi: "10.2903/j.efsa.2023.7884",
        pmid: "36999063",
      },
      concern: true,
    },
    {
      summary: {
        en: "ANSES (2022) confirmed an association between colorectal cancer risk and exposure to nitrites and/or nitrates, from processed meat or drinking water.",
        fr: "L'Anses (2022) a confirmé une association entre le risque de cancer colorectal et l'exposition aux nitrites et/ou nitrates, via la charcuterie ou l'eau de boisson.",
        de: "Die ANSES (2022) bestätigte einen Zusammenhang zwischen Darmkrebsrisiko und der Aufnahme von Nitrit und/oder Nitrat aus Wurstwaren oder Trinkwasser.",
      },
      kind: "official",
      source: {
        org: "ANSES",
        year: 2022,
        title: "Reducing dietary exposure to nitrites and nitrates",
        url: "https://www.anses.fr/en/news/reducing-dietary-exposure-nitrites-and-nitrates",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 101,000 French adults (NutriNet-Santé), high consumers of additive nitrites had higher prostate cancer risk (HR 1.58); natural sources showed no link.",
        fr: "Chez environ 101 000 adultes français (NutriNet-Santé), les forts consommateurs de nitrites additifs avaient plus de cancers de la prostate (HR 1,58) ; pas de lien pour les sources naturelles.",
        de: "Bei rund 101.000 französischen Erwachsenen (NutriNet-Santé) hatten Vielverzehrer von Nitrit-Zusätzen mehr Prostatakrebs (HR 1,58); natürliche Quellen ohne Zusammenhang.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Chazelas et al.)",
        year: 2022,
        title:
          "Nitrites and nitrates from food additives and natural sources and cancer risk: results from the NutriNet-Santé cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/35303088/",
        doi: "10.1093/ije/dyac046",
        pmid: "35303088",
      },
      concern: true,
    },
    {
      summary: {
        en: "A 2026 NutriNet-Santé analysis linked higher sodium nitrite (E250) intake with higher prostate cancer incidence (HR 1.32).",
        fr: "Une analyse NutriNet-Santé de 2026 a associé une consommation plus élevée de nitrite de sodium (E250) à une incidence accrue du cancer de la prostate (HR 1,32).",
        de: "Eine NutriNet-Santé-Analyse von 2026 verband höheren Natriumnitrit-Konsum (E250) mit häufigerem Prostatakrebs (HR 1,32).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 104,000 French adults (NutriNet-Santé), higher exposure to additive nitrites, especially sodium nitrite, was associated with type 2 diabetes (HR 1.53).",
        fr: "Chez environ 104 000 adultes (NutriNet-Santé), une exposition plus élevée aux nitrites additifs, surtout le nitrite de sodium, était associée au diabète de type 2 (HR 1,53).",
        de: "Bei rund 104.000 Erwachsenen (NutriNet-Santé) war höhere Aufnahme von Nitrit-Zusätzen, v. a. Natriumnitrit, mit Typ-2-Diabetes verbunden (HR 1,53).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Srour et al.)",
        year: 2023,
        title:
          "Dietary exposure to nitrites and nitrates in association with type 2 diabetes risk: Results from the NutriNet-Santé population-based cohort study",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9844911/",
        doi: "10.1371/journal.pmed.1004149",
        pmid: "36649248",
      },
      concern: true,
    },
  ],
  "en:e251": [
    {
      summary: {
        en: "IARC classifies ingested nitrate or nitrite, under conditions that lead to nitrosation in the body, as probably carcinogenic to humans (Group 2A).",
        fr: "Le CIRC classe les nitrates ou nitrites ingérés, dans des conditions entraînant une nitrosation dans l'organisme, comme probablement cancérogènes (groupe 2A).",
        de: "Die IARC stuft aufgenommenes Nitrat oder Nitrit unter Bedingungen, die zu Nitrosierung im Körper führen, als wahrscheinlich krebserregend ein (Gruppe 2A).",
      },
      kind: "official",
      source: {
        org: "IARC",
        year: 2010,
        title:
          "IARC Monographs Volume 94: Ingested Nitrate and Nitrite, and Cyanobacterial Peptide Toxins",
        url: "https://publications.iarc.who.int/download/mono94.pdf",
        pmid: "21141240",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2017) kept the acceptable daily intake for nitrate of 3.7 mg/kg bw per day and found carcinogenicity studies in mice and rats negative.",
        fr: "L'EFSA (2017) a maintenu la DJA des nitrates à 3,7 mg/kg p.c. par jour et a jugé négatives les études de cancérogénicité chez la souris et le rat.",
        de: "Die EFSA (2017) behielt die ADI für Nitrat von 3,7 mg/kg KG pro Tag bei; Kanzerogenitätsstudien an Mäusen und Ratten waren negativ.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2017,
        title:
          "Re-evaluation of sodium nitrate (E 251) and potassium nitrate (E 252) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2017.4787",
        doi: "10.2903/j.efsa.2017.4787",
        pmid: "32625505",
      },
      concern: false,
    },
    {
      summary: {
        en: "ANSES (2022) confirmed an association between colorectal cancer risk and exposure to nitrites and/or nitrates, from processed meat or drinking water.",
        fr: "L'Anses (2022) a confirmé une association entre le risque de cancer colorectal et l'exposition aux nitrites et/ou nitrates, via la charcuterie ou l'eau de boisson.",
        de: "Die ANSES (2022) bestätigte einen Zusammenhang zwischen Darmkrebsrisiko und der Aufnahme von Nitrit und/oder Nitrat aus Wurstwaren oder Trinkwasser.",
      },
      kind: "official",
      source: {
        org: "ANSES",
        year: 2022,
        title: "Reducing dietary exposure to nitrites and nitrates",
        url: "https://www.anses.fr/en/news/reducing-dietary-exposure-nitrites-and-nitrates",
      },
      concern: true,
    },
    {
      summary: {
        en: "The EU has lowered the maximum levels of nitrites and nitrates that may be used as food additives.",
        fr: "L'UE a abaissé les teneurs maximales de nitrites et de nitrates autorisées comme additifs alimentaires.",
        de: "Die EU hat die Höchstmengen für Nitrit und Nitrat als Lebensmittelzusatzstoffe gesenkt.",
      },
      kind: "official",
      source: {
        org: "EU",
        year: 2023,
        title:
          "Maximum levels of nitrites and nitrates lowered (Commission Regulation (EU) 2023/2108)",
        url: "https://agrinfo.eu/book-of-reports/maximum-levels-of-nitrites-and-nitrates-lowered/",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 101,000 French adults (NutriNet-Santé), high consumers of additive nitrates had higher breast cancer risk (HR 1.24); natural sources showed no link.",
        fr: "Chez environ 101 000 adultes français (NutriNet-Santé), les forts consommateurs de nitrates additifs avaient plus de cancers du sein (HR 1,24) ; pas de lien pour les sources naturelles.",
        de: "Bei rund 101.000 französischen Erwachsenen (NutriNet-Santé) hatten Vielverzehrer von Nitrat-Zusätzen mehr Brustkrebs (HR 1,24); natürliche Quellen ohne Zusammenhang.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Chazelas et al.)",
        year: 2022,
        title:
          "Nitrites and nitrates from food additives and natural sources and cancer risk: results from the NutriNet-Santé cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/35303088/",
        doi: "10.1093/ije/dyac046",
        pmid: "35303088",
      },
      concern: true,
    },
    {
      summary: {
        en: "In NutriNet-Santé, nitrates from additives or other sources were not associated with type 2 diabetes risk.",
        fr: "Dans NutriNet-Santé, les nitrates, additifs ou non, n'étaient pas associés au risque de diabète de type 2.",
        de: "In NutriNet-Santé war Nitrat, ob aus Zusätzen oder anderen Quellen, nicht mit dem Typ-2-Diabetes-Risiko verbunden.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Srour et al.)",
        year: 2023,
        title:
          "Dietary exposure to nitrites and nitrates in association with type 2 diabetes risk: Results from the NutriNet-Santé population-based cohort study",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9844911/",
        doi: "10.1371/journal.pmed.1004149",
        pmid: "36649248",
      },
      concern: false,
    },
  ],
  "en:e252": [
    {
      summary: {
        en: "IARC classifies ingested nitrate or nitrite, under conditions that lead to nitrosation in the body, as probably carcinogenic to humans (Group 2A).",
        fr: "Le CIRC classe les nitrates ou nitrites ingérés, dans des conditions entraînant une nitrosation dans l'organisme, comme probablement cancérogènes (groupe 2A).",
        de: "Die IARC stuft aufgenommenes Nitrat oder Nitrit unter Bedingungen, die zu Nitrosierung im Körper führen, als wahrscheinlich krebserregend ein (Gruppe 2A).",
      },
      kind: "official",
      source: {
        org: "IARC",
        year: 2010,
        title:
          "IARC Monographs Volume 94: Ingested Nitrate and Nitrite, and Cyanobacterial Peptide Toxins",
        url: "https://publications.iarc.who.int/download/mono94.pdf",
        pmid: "21141240",
      },
      concern: true,
    },
    {
      summary: {
        en: "EFSA (2017) kept the acceptable daily intake for nitrate of 3.7 mg/kg bw per day and found carcinogenicity studies in mice and rats negative.",
        fr: "L'EFSA (2017) a maintenu la DJA des nitrates à 3,7 mg/kg p.c. par jour et a jugé négatives les études de cancérogénicité chez la souris et le rat.",
        de: "Die EFSA (2017) behielt die ADI für Nitrat von 3,7 mg/kg KG pro Tag bei; Kanzerogenitätsstudien an Mäusen und Ratten waren negativ.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2017,
        title:
          "Re-evaluation of sodium nitrate (E 251) and potassium nitrate (E 252) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2017.4787",
        doi: "10.2903/j.efsa.2017.4787",
        pmid: "32625505",
      },
      concern: false,
    },
    {
      summary: {
        en: "ANSES (2022) confirmed an association between colorectal cancer risk and exposure to nitrites and/or nitrates, from processed meat or drinking water.",
        fr: "L'Anses (2022) a confirmé une association entre le risque de cancer colorectal et l'exposition aux nitrites et/ou nitrates, via la charcuterie ou l'eau de boisson.",
        de: "Die ANSES (2022) bestätigte einen Zusammenhang zwischen Darmkrebsrisiko und der Aufnahme von Nitrit und/oder Nitrat aus Wurstwaren oder Trinkwasser.",
      },
      kind: "official",
      source: {
        org: "ANSES",
        year: 2022,
        title: "Reducing dietary exposure to nitrites and nitrates",
        url: "https://www.anses.fr/en/news/reducing-dietary-exposure-nitrites-and-nitrates",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 101,000 French adults (NutriNet-Santé), high consumers of additive nitrates had higher breast cancer risk (HR 1.24); natural sources showed no link.",
        fr: "Chez environ 101 000 adultes français (NutriNet-Santé), les forts consommateurs de nitrates additifs avaient plus de cancers du sein (HR 1,24) ; pas de lien pour les sources naturelles.",
        de: "Bei rund 101.000 französischen Erwachsenen (NutriNet-Santé) hatten Vielverzehrer von Nitrat-Zusätzen mehr Brustkrebs (HR 1,24); natürliche Quellen ohne Zusammenhang.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Chazelas et al.)",
        year: 2022,
        title:
          "Nitrites and nitrates from food additives and natural sources and cancer risk: results from the NutriNet-Santé cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/35303088/",
        doi: "10.1093/ije/dyac046",
        pmid: "35303088",
      },
      concern: true,
    },
    {
      summary: {
        en: "A 2026 NutriNet-Santé analysis linked higher potassium nitrate (E252) intake with higher overall (HR 1.13) and breast (HR 1.22) cancer incidence.",
        fr: "Une analyse NutriNet-Santé de 2026 a associé une consommation plus élevée de nitrate de potassium (E252) à plus de cancers au total (HR 1,13) et du sein (HR 1,22).",
        de: "Eine NutriNet-Santé-Analyse von 2026 verband höheren Kaliumnitrat-Konsum (E252) mit mehr Krebs insgesamt (HR 1,13) und Brustkrebs (HR 1,22).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
    {
      summary: {
        en: "In NutriNet-Santé, nitrates from additives or other sources were not associated with type 2 diabetes risk.",
        fr: "Dans NutriNet-Santé, les nitrates, additifs ou non, n'étaient pas associés au risque de diabète de type 2.",
        de: "In NutriNet-Santé war Nitrat, ob aus Zusätzen oder anderen Quellen, nicht mit dem Typ-2-Diabetes-Risiko verbunden.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Srour et al.)",
        year: 2023,
        title:
          "Dietary exposure to nitrites and nitrates in association with type 2 diabetes risk: Results from the NutriNet-Santé population-based cohort study",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9844911/",
        doi: "10.1371/journal.pmed.1004149",
        pmid: "36649248",
      },
      concern: false,
    },
  ],
  "en:e210": [
    {
      summary: {
        en: "EFSA (2016) set a group acceptable daily intake of 5 mg/kg bw per day for benzoic acid and benzoates; toddlers and children drinking flavoured drinks may exceed it.",
        fr: "L'EFSA (2016) a fixé une DJA de groupe de 5 mg/kg p.c. par jour pour l'acide benzoïque et les benzoates ; les jeunes enfants buvant des boissons aromatisées peuvent la dépasser.",
        de: "Die EFSA (2016) legte für Benzoesäure und Benzoate eine Gruppen-ADI von 5 mg/kg KG pro Tag fest; Kleinkinder mit aromatisierten Getränken können sie überschreiten.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2016,
        title:
          "Scientific Opinion on the re-evaluation of benzoic acid (E 210), sodium benzoate (E 211), potassium benzoate (E 212) and calcium benzoate (E 213) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2016.4433",
        doi: "10.2903/j.efsa.2016.4433",
      },
      concern: true,
    },
  ],
  "en:e212": [
    {
      summary: {
        en: "EFSA (2016) set a group acceptable daily intake of 5 mg/kg bw per day for benzoic acid and benzoates; toddlers and children drinking flavoured drinks may exceed it.",
        fr: "L'EFSA (2016) a fixé une DJA de groupe de 5 mg/kg p.c. par jour pour l'acide benzoïque et les benzoates ; les jeunes enfants buvant des boissons aromatisées peuvent la dépasser.",
        de: "Die EFSA (2016) legte für Benzoesäure und Benzoate eine Gruppen-ADI von 5 mg/kg KG pro Tag fest; Kleinkinder mit aromatisierten Getränken können sie überschreiten.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2016,
        title:
          "Scientific Opinion on the re-evaluation of benzoic acid (E 210), sodium benzoate (E 211), potassium benzoate (E 212) and calcium benzoate (E 213) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2016.4433",
        doi: "10.2903/j.efsa.2016.4433",
      },
      concern: true,
    },
  ],
  "en:e213": [
    {
      summary: {
        en: "EFSA (2016) set a group acceptable daily intake of 5 mg/kg bw per day for benzoic acid and benzoates; toddlers and children drinking flavoured drinks may exceed it.",
        fr: "L'EFSA (2016) a fixé une DJA de groupe de 5 mg/kg p.c. par jour pour l'acide benzoïque et les benzoates ; les jeunes enfants buvant des boissons aromatisées peuvent la dépasser.",
        de: "Die EFSA (2016) legte für Benzoesäure und Benzoate eine Gruppen-ADI von 5 mg/kg KG pro Tag fest; Kleinkinder mit aromatisierten Getränken können sie überschreiten.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2016,
        title:
          "Scientific Opinion on the re-evaluation of benzoic acid (E 210), sodium benzoate (E 211), potassium benzoate (E 212) and calcium benzoate (E 213) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2016.4433",
        doi: "10.2903/j.efsa.2016.4433",
      },
      concern: true,
    },
  ],
  "en:e211": [
    {
      summary: {
        en: "EFSA (2016) set a group acceptable daily intake of 5 mg/kg bw per day for benzoic acid and benzoates; toddlers and children drinking flavoured drinks may exceed it.",
        fr: "L'EFSA (2016) a fixé une DJA de groupe de 5 mg/kg p.c. par jour pour l'acide benzoïque et les benzoates ; les jeunes enfants buvant des boissons aromatisées peuvent la dépasser.",
        de: "Die EFSA (2016) legte für Benzoesäure und Benzoate eine Gruppen-ADI von 5 mg/kg KG pro Tag fest; Kleinkinder mit aromatisierten Getränken können sie überschreiten.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2016,
        title:
          "Scientific Opinion on the re-evaluation of benzoic acid (E 210), sodium benzoate (E 211), potassium benzoate (E 212) and calcium benzoate (E 213) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2016.4433",
        doi: "10.2903/j.efsa.2016.4433",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a UK trial in 3- and 8/9-year-olds, drinks with artificial colour mixes plus sodium benzoate increased hyperactivity versus placebo (McCann et al., 2007).",
        fr: "Dans un essai britannique chez des enfants de 3 et 8-9 ans, des boissons avec mélanges de colorants et benzoate de sodium ont accru l'hyperactivité vs placebo (McCann, 2007).",
        de: "In einer britischen Studie mit 3- und 8/9-Jährigen steigerten Getränke mit Farbstoffmischungen und Natriumbenzoat die Hyperaktivität gegenüber Placebo (McCann 2007).",
      },
      kind: "trial",
      source: {
        org: "McCann et al. (Southampton study)",
        year: 2007,
        title:
          "Food additives and hyperactive behaviour in 3-year-old and 8/9-year-old children in the community: a randomised, double-blinded, placebo-controlled trial",
        url: "https://pubmed.ncbi.nlm.nih.gov/17825405/",
        doi: "10.1016/S0140-6736(07)61306-3",
        pmid: "17825405",
      },
      concern: true,
    },
  ],
  "en:e220": [
    {
      summary: {
        en: "EFSA (2022) withdrew the temporary acceptable daily intake for sulfur dioxide and sulfites and concluded that current dietary exposures raise a safety concern.",
        fr: "L'EFSA (2022) a retiré la DJA temporaire du dioxyde de soufre et des sulfites et a conclu que l'exposition alimentaire actuelle pose un problème de sécurité.",
        de: "Die EFSA (2022) zog die vorläufige ADI für Schwefeldioxid und Sulfite zurück und sah in der derzeitigen Aufnahme ein Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2022,
        title:
          "Follow-up of the re-evaluation of sulfur dioxide (E 220) and sulfites (E 221–E 228)",
        url: "https://doi.org/10.2903/j.efsa.2022.7594",
        doi: "10.2903/j.efsa.2022.7594",
        pmid: "36440381",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a 2026 NutriNet-Santé analysis of French adults, higher intake of total sulfites was associated with higher overall cancer incidence (HR 1.12).",
        fr: "Dans une analyse NutriNet-Santé de 2026, une consommation plus élevée de sulfites totaux était associée à une incidence accrue de cancers (HR 1,12).",
        de: "In einer NutriNet-Santé-Analyse von 2026 war höherer Konsum von Sulfiten insgesamt mit häufigerem Krebs verbunden (HR 1,12).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
  ],
  "en:e221": [
    {
      summary: {
        en: "EFSA (2022) withdrew the temporary acceptable daily intake for sulfur dioxide and sulfites and concluded that current dietary exposures raise a safety concern.",
        fr: "L'EFSA (2022) a retiré la DJA temporaire du dioxyde de soufre et des sulfites et a conclu que l'exposition alimentaire actuelle pose un problème de sécurité.",
        de: "Die EFSA (2022) zog die vorläufige ADI für Schwefeldioxid und Sulfite zurück und sah in der derzeitigen Aufnahme ein Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2022,
        title:
          "Follow-up of the re-evaluation of sulfur dioxide (E 220) and sulfites (E 221–E 228)",
        url: "https://doi.org/10.2903/j.efsa.2022.7594",
        doi: "10.2903/j.efsa.2022.7594",
        pmid: "36440381",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a 2026 NutriNet-Santé analysis of French adults, higher intake of total sulfites was associated with higher overall cancer incidence (HR 1.12).",
        fr: "Dans une analyse NutriNet-Santé de 2026, une consommation plus élevée de sulfites totaux était associée à une incidence accrue de cancers (HR 1,12).",
        de: "In einer NutriNet-Santé-Analyse von 2026 war höherer Konsum von Sulfiten insgesamt mit häufigerem Krebs verbunden (HR 1,12).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
  ],
  "en:e222": [
    {
      summary: {
        en: "EFSA (2022) withdrew the temporary acceptable daily intake for sulfur dioxide and sulfites and concluded that current dietary exposures raise a safety concern.",
        fr: "L'EFSA (2022) a retiré la DJA temporaire du dioxyde de soufre et des sulfites et a conclu que l'exposition alimentaire actuelle pose un problème de sécurité.",
        de: "Die EFSA (2022) zog die vorläufige ADI für Schwefeldioxid und Sulfite zurück und sah in der derzeitigen Aufnahme ein Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2022,
        title:
          "Follow-up of the re-evaluation of sulfur dioxide (E 220) and sulfites (E 221–E 228)",
        url: "https://doi.org/10.2903/j.efsa.2022.7594",
        doi: "10.2903/j.efsa.2022.7594",
        pmid: "36440381",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a 2026 NutriNet-Santé analysis of French adults, higher intake of total sulfites was associated with higher overall cancer incidence (HR 1.12).",
        fr: "Dans une analyse NutriNet-Santé de 2026, une consommation plus élevée de sulfites totaux était associée à une incidence accrue de cancers (HR 1,12).",
        de: "In einer NutriNet-Santé-Analyse von 2026 war höherer Konsum von Sulfiten insgesamt mit häufigerem Krebs verbunden (HR 1,12).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
  ],
  "en:e223": [
    {
      summary: {
        en: "EFSA (2022) withdrew the temporary acceptable daily intake for sulfur dioxide and sulfites and concluded that current dietary exposures raise a safety concern.",
        fr: "L'EFSA (2022) a retiré la DJA temporaire du dioxyde de soufre et des sulfites et a conclu que l'exposition alimentaire actuelle pose un problème de sécurité.",
        de: "Die EFSA (2022) zog die vorläufige ADI für Schwefeldioxid und Sulfite zurück und sah in der derzeitigen Aufnahme ein Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2022,
        title:
          "Follow-up of the re-evaluation of sulfur dioxide (E 220) and sulfites (E 221–E 228)",
        url: "https://doi.org/10.2903/j.efsa.2022.7594",
        doi: "10.2903/j.efsa.2022.7594",
        pmid: "36440381",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a 2026 NutriNet-Santé analysis of French adults, higher intake of total sulfites was associated with higher overall cancer incidence (HR 1.12).",
        fr: "Dans une analyse NutriNet-Santé de 2026, une consommation plus élevée de sulfites totaux était associée à une incidence accrue de cancers (HR 1,12).",
        de: "In einer NutriNet-Santé-Analyse von 2026 war höherer Konsum von Sulfiten insgesamt mit häufigerem Krebs verbunden (HR 1,12).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
  ],
  "en:e225": [
    {
      summary: {
        en: "EFSA (2022) withdrew the temporary acceptable daily intake for sulfur dioxide and sulfites and concluded that current dietary exposures raise a safety concern.",
        fr: "L'EFSA (2022) a retiré la DJA temporaire du dioxyde de soufre et des sulfites et a conclu que l'exposition alimentaire actuelle pose un problème de sécurité.",
        de: "Die EFSA (2022) zog die vorläufige ADI für Schwefeldioxid und Sulfite zurück und sah in der derzeitigen Aufnahme ein Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2022,
        title:
          "Follow-up of the re-evaluation of sulfur dioxide (E 220) and sulfites (E 221–E 228)",
        url: "https://doi.org/10.2903/j.efsa.2022.7594",
        doi: "10.2903/j.efsa.2022.7594",
        pmid: "36440381",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a 2026 NutriNet-Santé analysis of French adults, higher intake of total sulfites was associated with higher overall cancer incidence (HR 1.12).",
        fr: "Dans une analyse NutriNet-Santé de 2026, une consommation plus élevée de sulfites totaux était associée à une incidence accrue de cancers (HR 1,12).",
        de: "In einer NutriNet-Santé-Analyse von 2026 war höherer Konsum von Sulfiten insgesamt mit häufigerem Krebs verbunden (HR 1,12).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
  ],
  "en:e226": [
    {
      summary: {
        en: "EFSA (2022) withdrew the temporary acceptable daily intake for sulfur dioxide and sulfites and concluded that current dietary exposures raise a safety concern.",
        fr: "L'EFSA (2022) a retiré la DJA temporaire du dioxyde de soufre et des sulfites et a conclu que l'exposition alimentaire actuelle pose un problème de sécurité.",
        de: "Die EFSA (2022) zog die vorläufige ADI für Schwefeldioxid und Sulfite zurück und sah in der derzeitigen Aufnahme ein Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2022,
        title:
          "Follow-up of the re-evaluation of sulfur dioxide (E 220) and sulfites (E 221–E 228)",
        url: "https://doi.org/10.2903/j.efsa.2022.7594",
        doi: "10.2903/j.efsa.2022.7594",
        pmid: "36440381",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a 2026 NutriNet-Santé analysis of French adults, higher intake of total sulfites was associated with higher overall cancer incidence (HR 1.12).",
        fr: "Dans une analyse NutriNet-Santé de 2026, une consommation plus élevée de sulfites totaux était associée à une incidence accrue de cancers (HR 1,12).",
        de: "In einer NutriNet-Santé-Analyse von 2026 war höherer Konsum von Sulfiten insgesamt mit häufigerem Krebs verbunden (HR 1,12).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
  ],
  "en:e227": [
    {
      summary: {
        en: "EFSA (2022) withdrew the temporary acceptable daily intake for sulfur dioxide and sulfites and concluded that current dietary exposures raise a safety concern.",
        fr: "L'EFSA (2022) a retiré la DJA temporaire du dioxyde de soufre et des sulfites et a conclu que l'exposition alimentaire actuelle pose un problème de sécurité.",
        de: "Die EFSA (2022) zog die vorläufige ADI für Schwefeldioxid und Sulfite zurück und sah in der derzeitigen Aufnahme ein Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2022,
        title:
          "Follow-up of the re-evaluation of sulfur dioxide (E 220) and sulfites (E 221–E 228)",
        url: "https://doi.org/10.2903/j.efsa.2022.7594",
        doi: "10.2903/j.efsa.2022.7594",
        pmid: "36440381",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a 2026 NutriNet-Santé analysis of French adults, higher intake of total sulfites was associated with higher overall cancer incidence (HR 1.12).",
        fr: "Dans une analyse NutriNet-Santé de 2026, une consommation plus élevée de sulfites totaux était associée à une incidence accrue de cancers (HR 1,12).",
        de: "In einer NutriNet-Santé-Analyse von 2026 war höherer Konsum von Sulfiten insgesamt mit häufigerem Krebs verbunden (HR 1,12).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
  ],
  "en:e228": [
    {
      summary: {
        en: "EFSA (2022) withdrew the temporary acceptable daily intake for sulfur dioxide and sulfites and concluded that current dietary exposures raise a safety concern.",
        fr: "L'EFSA (2022) a retiré la DJA temporaire du dioxyde de soufre et des sulfites et a conclu que l'exposition alimentaire actuelle pose un problème de sécurité.",
        de: "Die EFSA (2022) zog die vorläufige ADI für Schwefeldioxid und Sulfite zurück und sah in der derzeitigen Aufnahme ein Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2022,
        title:
          "Follow-up of the re-evaluation of sulfur dioxide (E 220) and sulfites (E 221–E 228)",
        url: "https://doi.org/10.2903/j.efsa.2022.7594",
        doi: "10.2903/j.efsa.2022.7594",
        pmid: "36440381",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a 2026 NutriNet-Santé analysis of French adults, higher intake of total sulfites was associated with higher overall cancer incidence (HR 1.12).",
        fr: "Dans une analyse NutriNet-Santé de 2026, une consommation plus élevée de sulfites totaux était associée à une incidence accrue de cancers (HR 1,12).",
        de: "In einer NutriNet-Santé-Analyse von 2026 war höherer Konsum von Sulfiten insgesamt mit häufigerem Krebs verbunden (HR 1,12).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
  ],
  "en:e224": [
    {
      summary: {
        en: "EFSA (2022) withdrew the temporary acceptable daily intake for sulfur dioxide and sulfites and concluded that current dietary exposures raise a safety concern.",
        fr: "L'EFSA (2022) a retiré la DJA temporaire du dioxyde de soufre et des sulfites et a conclu que l'exposition alimentaire actuelle pose un problème de sécurité.",
        de: "Die EFSA (2022) zog die vorläufige ADI für Schwefeldioxid und Sulfite zurück und sah in der derzeitigen Aufnahme ein Sicherheitsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2022,
        title:
          "Follow-up of the re-evaluation of sulfur dioxide (E 220) and sulfites (E 221–E 228)",
        url: "https://doi.org/10.2903/j.efsa.2022.7594",
        doi: "10.2903/j.efsa.2022.7594",
        pmid: "36440381",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a 2026 NutriNet-Santé analysis, higher potassium metabisulfite (E224) intake was associated with higher overall cancer incidence (HR 1.11).",
        fr: "Dans une analyse NutriNet-Santé de 2026, une consommation plus élevée de métabisulfite de potassium (E224) était associée à plus de cancers (HR 1,11).",
        de: "In einer NutriNet-Santé-Analyse von 2026 war höherer Kaliummetabisulfit-Konsum (E224) mit häufigerem Krebs verbunden (HR 1,11).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Intake of food additive preservatives and incidence of cancer: results from the NutriNet-Santé prospective cohort",
        url: "https://pubmed.ncbi.nlm.nih.gov/41500678/",
        doi: "10.1136/bmj-2025-084917",
        pmid: "41500678",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 109,000 French adults (NutriNet-Santé), potassium metabisulfite was among preservatives associated with higher type 2 diabetes incidence.",
        fr: "Chez environ 109 000 adultes français (NutriNet-Santé), le métabisulfite de potassium figurait parmi les conservateurs associés à plus de diabète de type 2.",
        de: "Bei rund 109.000 französischen Erwachsenen (NutriNet-Santé) gehörte Kaliummetabisulfit zu den Konservierungsstoffen, die mit mehr Typ-2-Diabetes verbunden waren.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Hasenböhler et al.)",
        year: 2026,
        title:
          "Associations between preservative food additives and type 2 diabetes incidence in the NutriNet-Santé prospective cohort",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12780003/",
        doi: "10.1038/s41467-025-67360-w",
        pmid: "41501013",
      },
      concern: true,
    },
  ],
  "en:e338": [
    {
      summary: {
        en: "EFSA (2019) set a group acceptable daily intake for phosphates of 40 mg/kg bw per day (as phosphorus); estimated intake exceeds it in infants and children.",
        fr: "L'EFSA (2019) a fixé une DJA de groupe de 40 mg/kg p.c. par jour pour les phosphates (en phosphore) ; l'apport estimé la dépasse chez les nourrissons et enfants.",
        de: "Die EFSA (2019) legte für Phosphate eine Gruppen-ADI von 40 mg/kg KG pro Tag (als Phosphor) fest; Säuglinge und Kinder überschreiten sie schätzungsweise.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2019,
        title:
          "Re-evaluation of phosphoric acid–phosphates – di-, tri- and polyphosphates (E 338–341, E 343, E 450–452) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5674",
        doi: "10.2903/j.efsa.2019.5674",
        pmid: "32626329",
      },
      concern: true,
    },
  ],
  "en:e341": [
    {
      summary: {
        en: "EFSA (2019) set a group acceptable daily intake for phosphates of 40 mg/kg bw per day (as phosphorus); estimated intake exceeds it in infants and children.",
        fr: "L'EFSA (2019) a fixé une DJA de groupe de 40 mg/kg p.c. par jour pour les phosphates (en phosphore) ; l'apport estimé la dépasse chez les nourrissons et enfants.",
        de: "Die EFSA (2019) legte für Phosphate eine Gruppen-ADI von 40 mg/kg KG pro Tag (als Phosphor) fest; Säuglinge und Kinder überschreiten sie schätzungsweise.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2019,
        title:
          "Re-evaluation of phosphoric acid–phosphates – di-, tri- and polyphosphates (E 338–341, E 343, E 450–452) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5674",
        doi: "10.2903/j.efsa.2019.5674",
        pmid: "32626329",
      },
      concern: true,
    },
  ],
  "en:e343": [
    {
      summary: {
        en: "EFSA (2019) set a group acceptable daily intake for phosphates of 40 mg/kg bw per day (as phosphorus); estimated intake exceeds it in infants and children.",
        fr: "L'EFSA (2019) a fixé une DJA de groupe de 40 mg/kg p.c. par jour pour les phosphates (en phosphore) ; l'apport estimé la dépasse chez les nourrissons et enfants.",
        de: "Die EFSA (2019) legte für Phosphate eine Gruppen-ADI von 40 mg/kg KG pro Tag (als Phosphor) fest; Säuglinge und Kinder überschreiten sie schätzungsweise.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2019,
        title:
          "Re-evaluation of phosphoric acid–phosphates – di-, tri- and polyphosphates (E 338–341, E 343, E 450–452) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5674",
        doi: "10.2903/j.efsa.2019.5674",
        pmid: "32626329",
      },
      concern: true,
    },
  ],
  "en:e450": [
    {
      summary: {
        en: "EFSA (2019) set a group acceptable daily intake for phosphates of 40 mg/kg bw per day (as phosphorus); estimated intake exceeds it in infants and children.",
        fr: "L'EFSA (2019) a fixé une DJA de groupe de 40 mg/kg p.c. par jour pour les phosphates (en phosphore) ; l'apport estimé la dépasse chez les nourrissons et enfants.",
        de: "Die EFSA (2019) legte für Phosphate eine Gruppen-ADI von 40 mg/kg KG pro Tag (als Phosphor) fest; Säuglinge und Kinder überschreiten sie schätzungsweise.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2019,
        title:
          "Re-evaluation of phosphoric acid–phosphates – di-, tri- and polyphosphates (E 338–341, E 343, E 450–452) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5674",
        doi: "10.2903/j.efsa.2019.5674",
        pmid: "32626329",
      },
      concern: true,
    },
  ],
  "en:e451": [
    {
      summary: {
        en: "EFSA (2019) set a group acceptable daily intake for phosphates of 40 mg/kg bw per day (as phosphorus); estimated intake exceeds it in infants and children.",
        fr: "L'EFSA (2019) a fixé une DJA de groupe de 40 mg/kg p.c. par jour pour les phosphates (en phosphore) ; l'apport estimé la dépasse chez les nourrissons et enfants.",
        de: "Die EFSA (2019) legte für Phosphate eine Gruppen-ADI von 40 mg/kg KG pro Tag (als Phosphor) fest; Säuglinge und Kinder überschreiten sie schätzungsweise.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2019,
        title:
          "Re-evaluation of phosphoric acid–phosphates – di-, tri- and polyphosphates (E 338–341, E 343, E 450–452) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5674",
        doi: "10.2903/j.efsa.2019.5674",
        pmid: "32626329",
      },
      concern: true,
    },
  ],
  "en:e452": [
    {
      summary: {
        en: "EFSA (2019) set a group acceptable daily intake for phosphates of 40 mg/kg bw per day (as phosphorus); estimated intake exceeds it in infants and children.",
        fr: "L'EFSA (2019) a fixé une DJA de groupe de 40 mg/kg p.c. par jour pour les phosphates (en phosphore) ; l'apport estimé la dépasse chez les nourrissons et enfants.",
        de: "Die EFSA (2019) legte für Phosphate eine Gruppen-ADI von 40 mg/kg KG pro Tag (als Phosphor) fest; Säuglinge und Kinder überschreiten sie schätzungsweise.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2019,
        title:
          "Re-evaluation of phosphoric acid–phosphates – di-, tri- and polyphosphates (E 338–341, E 343, E 450–452) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5674",
        doi: "10.2903/j.efsa.2019.5674",
        pmid: "32626329",
      },
      concern: true,
    },
  ],
  "en:e339": [
    {
      summary: {
        en: "EFSA (2019) set a group acceptable daily intake for phosphates of 40 mg/kg bw per day (as phosphorus); estimated intake exceeds it in infants and children.",
        fr: "L'EFSA (2019) a fixé une DJA de groupe de 40 mg/kg p.c. par jour pour les phosphates (en phosphore) ; l'apport estimé la dépasse chez les nourrissons et enfants.",
        de: "Die EFSA (2019) legte für Phosphate eine Gruppen-ADI von 40 mg/kg KG pro Tag (als Phosphor) fest; Säuglinge und Kinder überschreiten sie schätzungsweise.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2019,
        title:
          "Re-evaluation of phosphoric acid–phosphates – di-, tri- and polyphosphates (E 338–341, E 343, E 450–452) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5674",
        doi: "10.2903/j.efsa.2019.5674",
        pmid: "32626329",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 95,000 French adults (NutriNet-Santé), higher trisodium phosphate (E339) intake was associated with higher coronary heart disease risk (HR 1.06).",
        fr: "Chez environ 95 000 adultes français (NutriNet-Santé), une consommation plus élevée de phosphate trisodique (E339) était associée à plus de maladies coronariennes (HR 1,06).",
        de: "Bei rund 95.000 französischen Erwachsenen (NutriNet-Santé) war höherer Trinatriumphosphat-Konsum (E339) mit mehr koronarer Herzkrankheit verbunden (HR 1,06).",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Sellem et al.)",
        year: 2023,
        title:
          "Food additive emulsifiers and risk of cardiovascular disease in the NutriNet-Santé cohort: prospective cohort study",
        url: "https://pubmed.ncbi.nlm.nih.gov/37673430/",
        doi: "10.1136/bmj-2023-076058",
        pmid: "37673430",
      },
      concern: true,
    },
  ],
  "en:e340": [
    {
      summary: {
        en: "EFSA (2019) set a group acceptable daily intake for phosphates of 40 mg/kg bw per day (as phosphorus); estimated intake exceeds it in infants and children.",
        fr: "L'EFSA (2019) a fixé une DJA de groupe de 40 mg/kg p.c. par jour pour les phosphates (en phosphore) ; l'apport estimé la dépasse chez les nourrissons et enfants.",
        de: "Die EFSA (2019) legte für Phosphate eine Gruppen-ADI von 40 mg/kg KG pro Tag (als Phosphor) fest; Säuglinge und Kinder überschreiten sie schätzungsweise.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2019,
        title:
          "Re-evaluation of phosphoric acid–phosphates – di-, tri- and polyphosphates (E 338–341, E 343, E 450–452) as food additives",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2019.5674",
        doi: "10.2903/j.efsa.2019.5674",
        pmid: "32626329",
      },
      concern: true,
    },
    {
      summary: {
        en: "In about 104,000 French adults (NutriNet-Santé), higher tripotassium phosphate (E340) intake was associated with a higher risk of type 2 diabetes.",
        fr: "Chez environ 104 000 adultes français (NutriNet-Santé), une consommation plus élevée de phosphate tripotassique (E340) était associée à un risque accru de diabète de type 2.",
        de: "Bei rund 104.000 französischen Erwachsenen (NutriNet-Santé) war höherer Trikaliumphosphat-Konsum (E340) mit höherem Typ-2-Diabetes-Risiko verbunden.",
      },
      kind: "cohort",
      source: {
        org: "NutriNet-Santé (Salame et al.)",
        year: 2024,
        title:
          "Food additive emulsifiers and the risk of type 2 diabetes: analysis of data from the NutriNet-Santé prospective cohort study",
        url: "https://pubmed.ncbi.nlm.nih.gov/38663950/",
        doi: "10.1016/S2213-8587(24)00086-X",
        pmid: "38663950",
      },
      concern: true,
    },
  ],
  "en:e621": [
    {
      summary: {
        en: "EFSA (2017) set a group acceptable daily intake of 30 mg/kg bw per day for glutamates and found some groups' intake may exceed it and doses tied to effects in humans.",
        fr: "L'EFSA (2017) a fixé une DJA de groupe de 30 mg/kg p.c. par jour pour les glutamates ; l'apport de certains groupes peut la dépasser, ainsi que des doses à effets chez l'homme.",
        de: "Die EFSA (2017) legte für Glutamate eine Gruppen-ADI von 30 mg/kg KG pro Tag fest; manche Gruppen könnten sie und beim Menschen wirksame Dosen überschreiten.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2017,
        title: "EFSA reviews safety of glutamates added to food",
        url: "https://www.efsa.europa.eu/en/press/news/170712",
        doi: "10.2903/j.efsa.2017.4910",
        pmid: "32625571",
      },
      concern: true,
    },
    {
      summary: {
        en: "In a double-blind trial in self-reported MSG-sensitive people, large MSG doses without food caused more symptoms than placebo, but not consistently on retesting.",
        fr: "Dans un essai en double aveugle chez des personnes se disant sensibles au glutamate, de fortes doses à jeun ont causé plus de symptômes que le placebo, sans constance au retest.",
        de: "In einer Doppelblindstudie mit selbst als MSG-empfindlich Eingestuften lösten hohe MSG-Dosen ohne Essen mehr Symptome aus als Placebo, aber nicht reproduzierbar.",
      },
      kind: "trial",
      source: {
        org: "Geha et al.",
        year: 2000,
        title:
          "Multicenter, double-blind, placebo-controlled, multiple-challenge evaluation of reported reactions to monosodium glutamate",
        url: "https://pubmed.ncbi.nlm.nih.gov/11080723/",
        doi: "10.1067/mai.2000.110794",
        pmid: "11080723",
      },
      concern: false,
    },
  ],
  "en:e320": [
    {
      summary: {
        en: "EFSA (2011) set an acceptable daily intake of 1.0 mg/kg bw per day for BHA (E320).",
        fr: "L'EFSA (2011) a fixé une dose journalière admissible de 1,0 mg/kg p.c. par jour pour le BHA (E320).",
        de: "Die EFSA (2011) legte für BHA (E320) eine zulässige Tagesdosis von 1,0 mg/kg KG pro Tag fest.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2011,
        title:
          "Scientific Opinion on the re-evaluation of butylated hydroxyanisole – BHA (E 320) as a food additive",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2011.2392",
        doi: "10.2903/j.efsa.2011.2392",
      },
      concern: false,
    },
    {
      summary: {
        en: "IARC classifies BHA as possibly carcinogenic to humans (Group 2B), based on sufficient evidence in experimental animals and inadequate evidence in humans.",
        fr: "Le CIRC classe le BHA cancérogène possible pour l'homme (groupe 2B), sur la base de preuves suffisantes chez l'animal et insuffisantes chez l'homme.",
        de: "Die IARC stuft BHA als möglicherweise krebserregend ein (Gruppe 2B), gestützt auf ausreichende Belege bei Versuchstieren und unzureichende beim Menschen.",
      },
      kind: "official",
      source: {
        org: "IARC",
        year: 1986,
        title:
          "IARC Monographs Volume 40 classification of BHA (as reported in EFSA's 2011 BHA opinion)",
        url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2011.2392",
        doi: "10.2903/j.efsa.2011.2392",
      },
      concern: true,
    },
  ],
  "en:e321": [
    {
      summary: {
        en: "EFSA (2012) raised the acceptable daily intake of BHT (E321) to 0.25 mg/kg bw per day and concluded it is not of concern for genotoxicity.",
        fr: "L'EFSA (2012) a relevé la dose journalière admissible du BHT (E321) à 0,25 mg/kg p.c. par jour et a conclu à l'absence de préoccupation de génotoxicité.",
        de: "Die EFSA (2012) hob die zulässige Tagesdosis für BHT (E321) auf 0,25 mg/kg KG pro Tag an und sah keine Genotoxizitätsbedenken.",
      },
      kind: "official",
      source: {
        org: "EFSA",
        year: 2012,
        title:
          "Scientific Opinion on the re-evaluation of butylated hydroxytoluene BHT (E 321) as a food additive",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13151845/",
        doi: "10.2903/j.efsa.2012.2588",
        pmid: "42111992",
      },
      concern: false,
    },
  ],
};
