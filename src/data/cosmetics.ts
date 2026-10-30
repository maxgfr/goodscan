/**
 * Cosmetic ingredients of concern, each with its rule or finding and its
 * sources. Open Beauty Facts gives the ingredient list (INCI) but no hazard
 * data, so goodscan keeps its own: the EU Cosmetics Regulation's annexes,
 * the fragrance allergens to label, SCCS opinions, CMR classifications, the
 * EU endocrine-disruptor list, PFAS and US state bans. Kept by hand from a
 * verified web research (docs/research/cosmetics): only claims that passed
 * its adversarial check are here.
 */

export type CosmeticCategory =
  | "eu-prohibited"
  | "eu-restricted"
  | "cmr"
  | "endocrine"
  | "fragrance-allergen"
  | "pfas"
  | "us-state-ban";

export interface CosmeticSource {
  org: string;
  year: number;
  title: string;
  url: string;
  doi?: string;
  pmid?: string;
}

export interface CosmeticIngredient {
  /** Stable lowercase slug. */
  id: string;
  /** The INCI name, as printed on packs. */
  inci: string;
  /** Other names it is listed under, CI codes included. */
  synonyms: { en: string[]; fr: string[]; de: string[] };
  categories: CosmeticCategory[];
  summary: { en: string; fr: string; de: string };
  sources: CosmeticSource[];
}

export const COSMETICS: CosmeticIngredient[] = [
  {
    id: "butylphenyl-methylpropional",
    inci: "BUTYLPHENYL METHYLPROPIONAL",
    synonyms: {
      en: [
        "butylphenyl methylpropional",
        "lilial",
        "lily aldehyde",
        "2-(4-tert-butylbenzyl)propionaldehyde",
        "p-bmhca",
      ],
      fr: ["butylphenyl methylpropional", "butylphényl méthylpropional", "lilial"],
      de: ["butylphenyl methylpropional", "butylphenylmethylpropional", "lilial"],
    },
    categories: ["eu-prohibited", "us-state-ban"],
    summary: {
      en: "Lilial: banned in EU cosmetics (Annex II) since 1 March 2022 as a CMR substance (Reg. 2021/1902); California bans it from 1 January 2027.",
      fr: "Lilial : interdit dans les cosmétiques UE (annexe II) depuis le 1er mars 2022 comme substance CMR (règl. 2021/1902) ; interdit en Californie dès le 1er janvier 2027.",
      de: "Lilial: seit 1. März 2022 als CMR-Stoff in EU-Kosmetik verboten (Anhang II, VO 2021/1902); in Kalifornien ab 1. Januar 2027 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2021,
        title: "Commission Regulation (EU) 2021/1902 (CMR omnibus IV)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021R1902",
      },
      {
        org: "ADSL Laboratories",
        year: 2022,
        title: "Commission Regulation (EU) 2021/1902 (4th CMR Omnibus)",
        url: "https://adslaboratories.com/commission-regulation-eu-2021-1902-4th-cmr-omnibus/",
      },
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2019,
        title: "SCCS/1591/17 Opinion on Butylphenyl methylpropional (p-BMHCA) – Submission II",
        url: "https://health.ec.europa.eu/system/files/2021-08/sccs_o_213_0.pdf",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "zinc-pyrithione",
    inci: "ZINC PYRITHIONE",
    synonyms: {
      en: ["zinc pyrithione", "pyrithione zinc", "zpt"],
      fr: ["zinc pyrithione", "pyrithione de zinc", "pyrithione zincique"],
      de: ["zinc pyrithione", "zinkpyrithion"],
    },
    categories: ["eu-prohibited", "cmr"],
    summary: {
      en: "Anti-dandruff agent classified CMR 1B (reprotoxic): banned in all EU cosmetics (Annex II) since 1 March 2022 by Reg. 2021/1902, despite an SCCS opinion on 1% rinse-off use.",
      fr: "Antipelliculaire classé CMR 1B (reprotoxique) : interdit dans tous les cosmétiques UE (annexe II) depuis le 1er mars 2022 (règl. 2021/1902), malgré un avis du CSSC à 1 % rincé.",
      de: "Anti-Schuppen-Wirkstoff, CMR 1B (reproduktionstoxisch): seit 1. März 2022 in allen EU-Kosmetika verboten (Anhang II, VO 2021/1902), trotz SCCS-Gutachten zu 1 % Rinse-off.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2021,
        title: "Commission Regulation (EU) 2021/1902 (CMR omnibus IV)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021R1902",
      },
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2020,
        title: "SCCS/1614/19 Opinion on Zinc Pyrithione (ZPT) – Submission III",
        url: "https://health.ec.europa.eu/system/files/2021-11/sccs_o_236.pdf",
        doi: "10.2875/116722",
      },
    ],
  },
  {
    id: "trimethylbenzoyl-diphenylphosphine-oxide",
    inci: "TRIMETHYLBENZOYL DIPHENYLPHOSPHINE OXIDE",
    synonyms: {
      en: [
        "trimethylbenzoyl diphenylphosphine oxide",
        "diphenyl(2,4,6-trimethylbenzoyl)phosphine oxide",
        "tpo photoinitiator",
      ],
      fr: [
        "trimethylbenzoyl diphenylphosphine oxide",
        "oxyde de diphényl(2,4,6-triméthylbenzoyl)phosphine",
      ],
      de: [
        "trimethylbenzoyl diphenylphosphine oxide",
        "diphenyl(2,4,6-trimethylbenzoyl)phosphinoxid",
      ],
    },
    categories: ["eu-prohibited", "cmr"],
    summary: {
      en: "TPO, classified CMR 1B (reprotoxic): banned in EU cosmetics (Annex II) from 1 September 2025 by Reg. 2025/877, with no sell-off period; use by nail professionals included.",
      fr: "TPO, classé CMR 1B (reprotoxique) : interdit dans les cosmétiques UE (annexe II) dès le 1er septembre 2025 (règl. 2025/877), sans écoulement des stocks ; usage en onglerie inclus.",
      de: "TPO, als CMR 1B (reproduktionstoxisch) eingestuft: ab 1. September 2025 in EU-Kosmetik verboten (Anhang II, VO 2025/877), ohne Abverkaufsfrist, auch im Nagelstudio.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2025,
        title: "Commission Regulation (EU) 2025/877 (CMR omnibus VII)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R0877",
      },
      {
        org: "European Commission",
        year: 2025,
        title: "TPO in nail products – questions and answers",
        url: "https://single-market-economy.ec.europa.eu/sectors/cosmetics/tpo-nail-products-questions-answers_en",
      },
    ],
  },
  {
    id: "n-n-dimethyl-p-toluidine",
    inci: "DIMETHYLTOLYLAMINE",
    synonyms: {
      en: ["n,n-dimethyl-p-toluidine", "dimethyltolylamine", "dimethyl tolylamine", "dmpt"],
      fr: ["n,n-diméthyl-p-toluidine", "dimethyltolylamine"],
      de: ["n,n-dimethyl-p-toluidin", "dimethyltolylamine"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "N,N-dimethyl-p-toluidine: added to the EU Annex II list of substances prohibited in cosmetics from 1 September 2025 by CMR omnibus Reg. 2025/877.",
      fr: "N,N-diméthyl-p-toluidine : ajoutée à la liste des substances interdites dans les cosmétiques (annexe II) dès le 1er septembre 2025 par le règlement CMR 2025/877.",
      de: "N,N-Dimethyl-p-toluidin: ab 1. September 2025 durch die CMR-Sammelverordnung (EU) 2025/877 in die Liste der in Kosmetik verbotenen Stoffe (Anhang II) aufgenommen.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2025,
        title: "Commission Regulation (EU) 2025/877 (CMR omnibus VII)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32025R0877",
      },
    ],
  },
  {
    id: "benzophenone",
    inci: "BENZOPHENONE",
    synonyms: {
      en: ["benzophenone", "diphenylmethanone"],
      fr: ["benzophenone", "benzophénone"],
      de: ["benzophenone", "benzophenon"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Benzophenone (not benzophenone-3): banned in EU cosmetics (Annex II) since 1 December 2023 by Reg. 2023/1490; as an octocrylene impurity it must stay at trace level.",
      fr: "Benzophénone (pas la benzophénone-3) : interdite dans les cosmétiques UE (annexe II) depuis le 1er décembre 2023 (règl. 2023/1490) ; à l'état de traces seulement comme impureté de l'octocrylène.",
      de: "Benzophenon (nicht Benzophenon-3): seit 1. Dezember 2023 in EU-Kosmetik verboten (Anhang II, VO 2023/1490); als Octocrylen-Verunreinigung nur in Spuren zulässig.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1490 (CMR omnibus VI)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1490",
      },
      {
        org: "European Commission",
        year: 2022,
        title: "Commission Regulation (EU) 2022/1176 (Benzophenone-3 and Octocrylene)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1176",
      },
    ],
  },
  {
    id: "trimethylolpropane-triacrylate",
    inci: "TRIMETHYLOLPROPANE TRIACRYLATE",
    synonyms: {
      en: ["trimethylolpropane triacrylate", "tmpta"],
      fr: ["trimethylolpropane triacrylate", "triacrylate de triméthylolpropane"],
      de: ["trimethylolpropane triacrylate", "trimethylolpropantriacrylat"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Trimethylolpropane triacrylate: added to the EU Annex II list of substances prohibited in cosmetics from 1 December 2023 by CMR omnibus Reg. 2023/1490.",
      fr: "Triacrylate de triméthylolpropane : ajouté à la liste des substances interdites dans les cosmétiques (annexe II) dès le 1er décembre 2023 par le règlement CMR 2023/1490.",
      de: "Trimethylolpropantriacrylat: seit 1. Dezember 2023 durch die CMR-Sammelverordnung (EU) 2023/1490 in Anhang II (in Kosmetik verbotene Stoffe) gelistet.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1490 (CMR omnibus VI)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1490",
      },
    ],
  },
  {
    id: "pentetic-acid",
    inci: "PENTETIC ACID",
    synonyms: {
      en: ["pentetic acid", "dtpa", "diethylenetriaminepentaacetic acid"],
      fr: ["pentetic acid", "acide pentétique"],
      de: ["pentetic acid", "pentetsäure"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Pentetic acid (DTPA): added to the EU Annex II list of prohibited substances from 1 December 2023 by CMR omnibus Reg. 2023/1490.",
      fr: "Acide pentétique (DTPA) : ajouté à la liste des substances interdites de l'annexe II dès le 1er décembre 2023 par le règlement CMR 2023/1490.",
      de: "Pentetsäure (DTPA): seit 1. Dezember 2023 durch die CMR-Sammelverordnung (EU) 2023/1490 in Anhang II (verbotene Stoffe) aufgenommen.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1490 (CMR omnibus VI)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1490",
      },
    ],
  },
  {
    id: "pentasodium-pentetate",
    inci: "PENTASODIUM PENTETATE",
    synonyms: {
      en: ["pentasodium pentetate", "pentasodium dtpa"],
      fr: ["pentasodium pentetate", "pentétate pentasodique"],
      de: ["pentasodium pentetate", "pentanatriumpentetat"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Pentasodium pentetate: added to the EU Annex II list of prohibited substances from 1 December 2023 by Reg. 2023/1490.",
      fr: "Pentétate pentasodique : ajouté à la liste des substances interdites de l'annexe II dès le 1er décembre 2023 (règl. 2023/1490).",
      de: "Pentanatriumpentetat: seit 1. Dezember 2023 durch VO (EU) 2023/1490 in Anhang II (verbotene Stoffe) aufgenommen.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1490 (CMR omnibus VI)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1490",
      },
    ],
  },
  {
    id: "hicc",
    inci: "HYDROXYISOHEXYL 3-CYCLOHEXENE CARBOXALDEHYDE",
    synonyms: {
      en: ["hydroxyisohexyl 3-cyclohexene carboxaldehyde", "hicc", "lyral"],
      fr: ["hydroxyisohexyl 3-cyclohexene carboxaldehyde", "lyral"],
      de: ["hydroxyisohexyl 3-cyclohexene carboxaldehyde", "lyral"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Fragrance allergen HICC: banned in EU cosmetics by Reg. 2017/1410; no placing on the market from 23 August 2019, no sale from 23 August 2021.",
      fr: "Allergène parfumant HICC : interdit dans les cosmétiques UE par le règl. 2017/1410 ; plus de mise sur le marché dès le 23 août 2019, plus de vente dès le 23 août 2021.",
      de: "Duftstoffallergen HICC: durch VO 2017/1410 in EU-Kosmetik verboten; kein Inverkehrbringen ab 23. August 2019, keine Bereitstellung ab 23. August 2021.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2017,
        title: "Commission Regulation (EU) 2017/1410 (HICC, atranol, chloroatranol)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R1410",
      },
    ],
  },
  {
    id: "atranol",
    inci: "ATRANOL",
    synonyms: {
      en: ["atranol", "2,6-dihydroxy-4-methylbenzaldehyde"],
      fr: ["atranol"],
      de: ["atranol"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Occurs naturally in oakmoss and treemoss extracts: banned in EU cosmetics by Reg. 2017/1410 (placing from 23 August 2019, sale from 23 August 2021).",
      fr: "Présent naturellement dans les extraits de mousse de chêne et d'arbre : interdit par le règl. 2017/1410 (mise sur le marché dès le 23/08/2019, vente dès le 23/08/2021).",
      de: "Natürlich in Eichen- und Baummoosextrakt enthalten: durch VO 2017/1410 in EU-Kosmetik verboten (Inverkehrbringen ab 23.08.2019, Bereitstellung ab 23.08.2021).",
    },
    sources: [
      {
        org: "European Commission",
        year: 2017,
        title: "Commission Regulation (EU) 2017/1410 (HICC, atranol, chloroatranol)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R1410",
      },
      {
        org: "Biorius",
        year: 2019,
        title: "Upcoming ban of HICC/Lyral, atranol and chloroatranol",
        url: "https://biorius.com/cosmetic-news/upcoming-ban-of-hicc_lyral-atranol-and-chloroatranol/",
      },
    ],
  },
  {
    id: "chloroatranol",
    inci: "CHLOROATRANOL",
    synonyms: {
      en: ["chloroatranol", "3-chloro-2,6-dihydroxy-4-methylbenzaldehyde"],
      fr: ["chloroatranol"],
      de: ["chloratranol", "chloroatranol"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Occurs naturally in oakmoss and treemoss extracts: banned in EU cosmetics by Reg. 2017/1410 (placing from 23 August 2019, sale from 23 August 2021).",
      fr: "Présent naturellement dans les extraits de mousse de chêne et d'arbre : interdit par le règl. 2017/1410 (mise sur le marché dès le 23/08/2019, vente dès le 23/08/2021).",
      de: "Natürlich in Eichen- und Baummoosextrakt enthalten: durch VO 2017/1410 in EU-Kosmetik verboten (Inverkehrbringen ab 23.08.2019, Bereitstellung ab 23.08.2021).",
    },
    sources: [
      {
        org: "European Commission",
        year: 2017,
        title: "Commission Regulation (EU) 2017/1410 (HICC, atranol, chloroatranol)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R1410",
      },
      {
        org: "Biorius",
        year: 2019,
        title: "Upcoming ban of HICC/Lyral, atranol and chloroatranol",
        url: "https://biorius.com/cosmetic-news/upcoming-ban-of-hicc_lyral-atranol-and-chloroatranol/",
      },
    ],
  },
  {
    id: "4-methylbenzylidene-camphor",
    inci: "4-METHYLBENZYLIDENE CAMPHOR",
    synonyms: {
      en: [
        "4-methylbenzylidene camphor",
        "4-mbc",
        "enzacamene",
        "3-(4'-methylbenzylidene)-camphor",
      ],
      fr: ["4-methylbenzylidene camphor", "4-méthylbenzylidène camphre"],
      de: ["4-methylbenzylidene camphor", "4-methylbenzylidencampher"],
    },
    categories: ["eu-prohibited", "endocrine"],
    summary: {
      en: "UV filter 4-MBC: on EU endocrine-disruptor List I; banned in EU cosmetics by Reg. 2024/996 (no placing from 1 May 2025, no sale from 1 May 2026).",
      fr: "Filtre UV 4-MBC : sur la liste I des perturbateurs endocriniens ; interdit dans les cosmétiques UE par le règl. 2024/996 (mise sur le marché dès le 1/05/2025, vente dès le 1/05/2026).",
      de: "UV-Filter 4-MBC: auf der EU-Liste I der endokrinen Disruptoren; durch VO 2024/996 verboten (kein Inverkehrbringen ab 1.5.2025, keine Bereitstellung ab 1.5.2026).",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/996 (Vitamin A, arbutins, potential endocrine disruptors)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0996",
      },
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2022,
        title: "SCCS/1640/21 Opinion on 4-Methylbenzylidene camphor (4-MBC)",
        url: "https://health.ec.europa.eu/system/files/2023-08/sccs_o_262.pdf",
        doi: "10.2875/915957",
      },
      {
        org: "edlists.org (BE, DK, FR, NL, ES, SE national authorities)",
        year: 2026,
        title: "List I: Substances identified as endocrine disruptors at EU level",
        url: "https://edlists.org/the-ed-lists/list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
      },
    ],
  },
  {
    id: "isopropylparaben",
    inci: "ISOPROPYLPARABEN",
    synonyms: {
      en: [
        "isopropylparaben",
        "isopropyl paraben",
        "isopropyl 4-hydroxybenzoate",
        "sodium isopropylparaben",
      ],
      fr: ["isopropylparaben", "isopropylparabène"],
      de: ["isopropylparaben"],
    },
    categories: ["eu-prohibited", "us-state-ban"],
    summary: {
      en: "Paraben banned in EU cosmetics (Annex II) by Reg. 358/2014, compliance by 30 October 2014 (sale by 30 July 2015); banned in California since 1 January 2025.",
      fr: "Paraben interdit dans les cosmétiques UE (annexe II) par le règl. 358/2014, conformité au 30 octobre 2014 (vente au 30 juillet 2015) ; interdit en Californie depuis le 1er janvier 2025.",
      de: "Paraben, in EU-Kosmetik verboten (Anhang II, VO 358/2014; Inverkehrbringen ab 30.10.2014, Bereitstellung ab 30.07.2015); in Kalifornien seit 1. Januar 2025 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 358/2014 (parabens, Annexes II and V)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0358",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "isobutylparaben",
    inci: "ISOBUTYLPARABEN",
    synonyms: {
      en: [
        "isobutylparaben",
        "isobutyl paraben",
        "isobutyl 4-hydroxybenzoate",
        "sodium isobutylparaben",
      ],
      fr: ["isobutylparaben", "isobutylparabène"],
      de: ["isobutylparaben"],
    },
    categories: ["eu-prohibited", "endocrine", "us-state-ban"],
    summary: {
      en: "Paraben banned in EU cosmetics (Annex II) by Reg. 358/2014 since 2014; on EU endocrine-disruptor List I; banned in California since 1 January 2025.",
      fr: "Paraben interdit dans les cosmétiques UE (annexe II) par le règl. 358/2014 depuis 2014 ; sur la liste I des perturbateurs endocriniens ; interdit en Californie depuis le 1er janvier 2025.",
      de: "Paraben, seit 2014 in EU-Kosmetik verboten (Anhang II, VO 358/2014); auf der EU-Liste I endokriner Disruptoren; in Kalifornien seit 1. Januar 2025 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 358/2014 (parabens, Annexes II and V)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0358",
      },
      {
        org: "edlists.org (BE, DK, FR, NL, ES, SE national authorities)",
        year: 2026,
        title: "List I: Substances identified as endocrine disruptors at EU level",
        url: "https://edlists.org/the-ed-lists/list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "phenylparaben",
    inci: "PHENYLPARABEN",
    synonyms: {
      en: ["phenylparaben", "phenyl paraben", "phenyl 4-hydroxybenzoate"],
      fr: ["phenylparaben", "phénylparabène"],
      de: ["phenylparaben"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Paraben banned in EU cosmetics (Annex II) by Reg. 358/2014 because industry supplied too little safety data; compliance by 30 October 2014, sale by 30 July 2015.",
      fr: "Paraben interdit dans les cosmétiques UE (annexe II) par le règl. 358/2014, faute de données de sécurité ; conformité au 30 octobre 2014, vente au 30 juillet 2015.",
      de: "Paraben, durch VO 358/2014 in EU-Kosmetik verboten (Anhang II), da kaum Sicherheitsdaten vorlagen; Inverkehrbringen ab 30.10.2014, Bereitstellung ab 30.07.2015.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 358/2014 (parabens, Annexes II and V)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0358",
      },
    ],
  },
  {
    id: "benzylparaben",
    inci: "BENZYLPARABEN",
    synonyms: {
      en: ["benzylparaben", "benzyl paraben", "benzyl 4-hydroxybenzoate"],
      fr: ["benzylparaben", "benzylparabène"],
      de: ["benzylparaben"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Paraben banned in EU cosmetics (Annex II) by Reg. 358/2014 because industry supplied too little safety data; compliance by 30 October 2014, sale by 30 July 2015.",
      fr: "Paraben interdit dans les cosmétiques UE (annexe II) par le règl. 358/2014, faute de données de sécurité ; conformité au 30 octobre 2014, vente au 30 juillet 2015.",
      de: "Paraben, durch VO 358/2014 in EU-Kosmetik verboten (Anhang II), da kaum Sicherheitsdaten vorlagen; Inverkehrbringen ab 30.10.2014, Bereitstellung ab 30.07.2015.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 358/2014 (parabens, Annexes II and V)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0358",
      },
    ],
  },
  {
    id: "pentylparaben",
    inci: "PENTYLPARABEN",
    synonyms: {
      en: ["pentylparaben", "pentyl paraben", "pentyl 4-hydroxybenzoate"],
      fr: ["pentylparaben", "pentylparabène"],
      de: ["pentylparaben"],
    },
    categories: ["eu-prohibited"],
    summary: {
      en: "Paraben banned in EU cosmetics (Annex II) by Reg. 358/2014 because industry supplied too little safety data; compliance by 30 October 2014, sale by 30 July 2015.",
      fr: "Paraben interdit dans les cosmétiques UE (annexe II) par le règl. 358/2014, faute de données de sécurité ; conformité au 30 octobre 2014, vente au 30 juillet 2015.",
      de: "Paraben, durch VO 358/2014 in EU-Kosmetik verboten (Anhang II), da kaum Sicherheitsdaten vorlagen; Inverkehrbringen ab 30.10.2014, Bereitstellung ab 30.07.2015.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 358/2014 (parabens, Annexes II and V)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0358",
      },
    ],
  },
  {
    id: "formaldehyde",
    inci: "FORMALDEHYDE",
    synonyms: {
      en: ["formaldehyde", "formalin", "methanal"],
      fr: ["formaldehyde", "formaldéhyde", "formol"],
      de: ["formaldehyde", "formaldehyd"],
    },
    categories: ["eu-prohibited", "cmr", "us-state-ban"],
    summary: {
      en: "Classified CMR 1B: banned as an ingredient in EU cosmetics (Annex II) by Reg. 2019/831, incl. nail hardeners; banned in California since 1 January 2025.",
      fr: "Classé CMR 1B : interdit comme ingrédient dans les cosmétiques UE (annexe II) par le règl. 2019/831, durcisseurs d'ongles compris ; interdit en Californie depuis le 1er janvier 2025.",
      de: "Als CMR 1B eingestuft: als Bestandteil in EU-Kosmetik verboten (Anhang II, VO 2019/831), auch in Nagelhärtern; in Kalifornien seit 1. Januar 2025 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2019,
        title:
          "Commission Regulation (EU) 2019/831 (Annexes II, III and V; formaldehyde, quaternium-15)",
        url: "https://www.legislation.gov.uk/eur/2019/831/adopted/data.xht?view=snippet&wrap=true",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "paraformaldehyde",
    inci: "PARAFORMALDEHYDE",
    synonyms: {
      en: ["paraformaldehyde", "polyoxymethylene"],
      fr: ["paraformaldehyde", "paraformaldéhyde"],
      de: ["paraformaldehyde", "paraformaldehyd"],
    },
    categories: ["eu-prohibited", "us-state-ban"],
    summary: {
      en: "Paraformaldehyde: removed from EU preservatives and banned (Annex II) by Reg. 2019/831 because it releases formaldehyde; banned in California since 1 January 2025.",
      fr: "Paraformaldéhyde : retiré des conservateurs UE et interdit (annexe II) par le règl. 2019/831 car il libère du formaldéhyde ; interdit en Californie depuis le 1er janvier 2025.",
      de: "Paraformaldehyd: durch VO 2019/831 aus den EU-Konservierungsstoffen gestrichen und verboten (Anhang II), da es Formaldehyd freisetzt; in Kalifornien seit 1.1.2025 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2019,
        title:
          "Commission Regulation (EU) 2019/831 (Annexes II, III and V; formaldehyde, quaternium-15)",
        url: "https://www.legislation.gov.uk/eur/2019/831/adopted/data.xht?view=snippet&wrap=true",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "methylene-glycol",
    inci: "METHYLENE GLYCOL",
    synonyms: {
      en: ["methylene glycol", "methanediol", "formaldehyde hydrate"],
      fr: ["methylene glycol", "méthylène glycol", "méthanediol"],
      de: ["methylene glycol", "methylenglykol", "methandiol"],
    },
    categories: ["eu-prohibited", "us-state-ban"],
    summary: {
      en: "Methylene glycol, which readily reverts to formaldehyde in water: banned in EU cosmetics (Annex II) by Reg. 2019/831; banned in California since 1 January 2025.",
      fr: "Méthylène glycol, qui redonne du formaldéhyde en solution aqueuse : interdit dans les cosmétiques UE (annexe II) par le règl. 2019/831 ; interdit en Californie depuis le 1er janvier 2025.",
      de: "Methylenglykol, das in Wasser rasch zu Formaldehyd wird: in EU-Kosmetik verboten (Anhang II, VO 2019/831); in Kalifornien seit 1. Januar 2025 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2019,
        title:
          "Commission Regulation (EU) 2019/831 (Annexes II, III and V; formaldehyde, quaternium-15)",
        url: "https://www.legislation.gov.uk/eur/2019/831/adopted/data.xht?view=snippet&wrap=true",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "quaternium-15",
    inci: "QUATERNIUM-15",
    synonyms: {
      en: [
        "quaternium-15",
        "quaternium 15",
        "cis-ctac",
        "cis-1-(3-chloroallyl)-3,5,7-triaza-1-azoniaadamantane chloride",
      ],
      fr: ["quaternium-15"],
      de: ["quaternium-15"],
    },
    categories: ["eu-prohibited", "us-state-ban"],
    summary: {
      en: "Formaldehyde-releasing preservative: banned in EU cosmetics (Annex II) by Reg. 2019/831; banned in California since 1 January 2025 and in Washington from 1 January 2027.",
      fr: "Conservateur libérant du formaldéhyde : interdit dans les cosmétiques UE (annexe II) par le règl. 2019/831 ; interdit en Californie depuis 2025 et dans l'État de Washington dès 2027.",
      de: "Formaldehydabspalter: in EU-Kosmetik verboten (Anhang II, VO 2019/831); in Kalifornien seit 1. Januar 2025 und in Washington ab 1. Januar 2027 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2019,
        title:
          "Commission Regulation (EU) 2019/831 (Annexes II, III and V; formaldehyde, quaternium-15)",
        url: "https://www.legislation.gov.uk/eur/2019/831/adopted/data.xht?view=snippet&wrap=true",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
      {
        org: "Washington State Department of Ecology",
        year: 2025,
        title: "Toxic-Free Cosmetics Act guide: restrictions for cosmetic industry and sellers",
        url: "https://apps.ecology.wa.gov/publications/documents/2404019.pdf",
      },
    ],
  },
  {
    id: "butylparaben",
    inci: "BUTYLPARABEN",
    synonyms: {
      en: [
        "butylparaben",
        "butyl paraben",
        "butyl 4-hydroxybenzoate",
        "sodium butylparaben",
        "potassium butylparaben",
      ],
      fr: ["butylparaben", "butylparabène"],
      de: ["butylparaben"],
    },
    categories: ["eu-restricted", "endocrine"],
    summary: {
      en: "EU preservative limit 0.14% (with propylparaben, as acid) and banned in leave-on nappy-area products for under-3s since 16 April 2015 (Reg. 1004/2014); on ED List I.",
      fr: "Conservateur limité dans l'UE à 0,14 % (avec le propylparaben) et interdit dans les produits sans rinçage pour le siège des moins de 3 ans depuis le 16/04/2015 ; liste I PE.",
      de: "EU-Höchstwert 0,14 % (mit Propylparaben, als Säure), verboten in Leave-on-Produkten für den Windelbereich unter 3 Jahren seit 16.04.2015 (VO 1004/2014); ED-Liste I.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 1004/2014 (butyl- and propylparaben)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R1004",
      },
      {
        org: "edlists.org (BE, DK, FR, NL, ES, SE national authorities)",
        year: 2026,
        title: "List I: Substances identified as endocrine disruptors at EU level",
        url: "https://edlists.org/the-ed-lists/list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
      },
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2013,
        title: "SCCS/1514/13 Opinion on Parabens – propyl- and butylparaben",
        url: "https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_132.pdf",
        doi: "10.2772/66369",
      },
    ],
  },
  {
    id: "propylparaben",
    inci: "PROPYLPARABEN",
    synonyms: {
      en: [
        "propylparaben",
        "propyl paraben",
        "propyl 4-hydroxybenzoate",
        "sodium propylparaben",
        "potassium propylparaben",
      ],
      fr: ["propylparaben", "propylparabène"],
      de: ["propylparaben"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "EU preservative limited to 0.14% (summed with butylparaben, as acid) and banned in leave-on nappy-area products for under-3s since 16 April 2015 (Reg. 1004/2014).",
      fr: "Conservateur limité dans l'UE à 0,14 % (avec le butylparaben, en acide) et interdit dans les produits sans rinçage pour le siège des moins de 3 ans depuis le 16 avril 2015.",
      de: "EU-Konservierungsstoff, max. 0,14 % (zusammen mit Butylparaben, als Säure), seit 16.04.2015 in Leave-on-Produkten für den Windelbereich unter 3 Jahren verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 1004/2014 (butyl- and propylparaben)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R1004",
      },
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2021,
        title: "SCCS/1623/20 Opinion on Propylparaben",
        url: "https://health.ec.europa.eu/system/files/2022-08/sccs_o_243.pdf",
        doi: "10.2875/607198",
      },
    ],
  },
  {
    id: "methylparaben",
    inci: "METHYLPARABEN",
    synonyms: {
      en: ["methylparaben", "methyl paraben", "methyl 4-hydroxybenzoate", "sodium methylparaben"],
      fr: ["methylparaben", "méthylparabène"],
      de: ["methylparaben"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Allowed EU preservative capped at 0.4% (as acid) alone and 0.8% in paraben mixtures (Annex V); the SCCS confirmed 0.4% as safe (SCCS/1652/23).",
      fr: "Conservateur autorisé dans l'UE jusqu'à 0,4 % (en acide) seul et 0,8 % en mélange de parabènes (annexe V) ; le CSSC a confirmé 0,4 % comme sûr (SCCS/1652/23).",
      de: "In der EU zugelassener Konservierungsstoff, max. 0,4 % (als Säure) allein und 0,8 % in Parabengemischen (Anhang V); SCCS bestätigte 0,4 % als sicher (SCCS/1652/23).",
    },
    sources: [
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2023,
        title: "SCCS/1652/23 Opinion on Methylparaben",
        url: "https://health.ec.europa.eu/system/files/2023-12/sccs_o_276_final.pdf",
        doi: "10.2875/86920",
      },
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 1004/2014 (butyl- and propylparaben)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R1004",
      },
    ],
  },
  {
    id: "ethylparaben",
    inci: "ETHYLPARABEN",
    synonyms: {
      en: ["ethylparaben", "ethyl paraben", "ethyl 4-hydroxybenzoate", "sodium ethylparaben"],
      fr: ["ethylparaben", "éthylparabène"],
      de: ["ethylparaben"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Allowed EU preservative capped at 0.4% (as acid) alone and 0.8% in paraben mixtures (Annex V entry 12); the SCCS confirmed it safe at these limits.",
      fr: "Conservateur autorisé dans l'UE jusqu'à 0,4 % (en acide) seul et 0,8 % en mélange de parabènes (annexe V, entrée 12) ; jugé sûr à ces niveaux par le CSSC.",
      de: "In der EU zugelassener Konservierungsstoff, max. 0,4 % (als Säure) allein und 0,8 % in Parabengemischen (Anhang V Nr. 12); laut SCCS bei diesen Werten sicher.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 1004/2014 (butyl- and propylparaben)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R1004",
      },
    ],
  },
  {
    id: "methylisothiazolinone",
    inci: "METHYLISOTHIAZOLINONE",
    synonyms: {
      en: ["methylisothiazolinone", "mit", "2-methyl-4-isothiazolin-3-one"],
      fr: ["methylisothiazolinone", "méthylisothiazolinone"],
      de: ["methylisothiazolinone", "methylisothiazolinon"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Allergenic preservative: banned in EU leave-on cosmetics (incl. wet wipes) since 12 February 2017; max 0.0015% in rinse-off products since 27 January 2018.",
      fr: "Conservateur allergisant : interdit dans les cosmétiques UE sans rinçage (lingettes incluses) depuis le 12 février 2017 ; max. 0,0015 % dans les produits rincés depuis le 27 janvier 2018.",
      de: "Allergener Konservierungsstoff: seit 12. Februar 2017 in EU-Leave-on-Produkten (auch Feuchttüchern) verboten; in Rinse-off-Produkten seit 27. Januar 2018 max. 0,0015 %.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2016,
        title: "Commission Regulation (EU) 2016/1198 (Methylisothiazolinone in leave-on products)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R1198",
      },
      {
        org: "European Commission",
        year: 2017,
        title: "Commission Regulation (EU) 2017/1224 (Methylisothiazolinone in rinse-off products)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R1224",
      },
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2015,
        title: "SCCS/1557/15 Opinion on Methylisothiazolinone (MI) – Submission III",
        url: "https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_178.pdf",
        doi: "10.2875/713830",
      },
    ],
  },
  {
    id: "methylchloroisothiazolinone",
    inci: "METHYLCHLOROISOTHIAZOLINONE",
    synonyms: {
      en: [
        "methylchloroisothiazolinone",
        "methylchloroisothiazolinone (and) methylisothiazolinone",
        "mci/mi",
        "mcit/mit",
        "kathon cg",
      ],
      fr: ["methylchloroisothiazolinone", "méthylchloroisothiazolinone"],
      de: ["methylchloroisothiazolinone", "methylchlorisothiazolinon"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "MCI/MI preservative mixture: rinse-off products only, max 0.0015% of the 3:1 mix (Reg. 1003/2014); banned in EU leave-on products since 16 April 2016.",
      fr: "Mélange conservateur MCI/MI : produits rincés uniquement, max. 0,0015 % du mélange 3:1 (règl. 1003/2014) ; interdit dans les produits sans rinçage depuis le 16 avril 2016.",
      de: "Konservierungsgemisch MCI/MI: nur Rinse-off-Produkte, max. 0,0015 % des 3:1-Gemischs (VO 1003/2014); in Leave-on-Produkten seit 16. April 2016 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2014,
        title: "Commission Regulation (EU) No 1003/2014 (MCI/MI mixture)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R1003",
      },
      {
        org: "European Commission",
        year: 2016,
        title: "Commission Regulation (EU) 2016/1198 (Methylisothiazolinone in leave-on products)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R1198",
      },
    ],
  },
  {
    id: "triclosan",
    inci: "TRICLOSAN",
    synonyms: {
      en: ["triclosan", "5-chloro-2-(2,4-dichlorophenoxy)phenol"],
      fr: ["triclosan"],
      de: ["triclosan"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Preservative: EU max 0.3% in listed products only (toothpaste, soaps, non-spray deodorants...), not in toothpaste for under-3s (Reg. 2024/996).",
      fr: "Conservateur : max. 0,3 % dans l'UE pour certains produits seulement (dentifrice, savons, déodorants non aérosol…), pas en dentifrice pour moins de 3 ans.",
      de: "Konservierungsstoff: EU-Höchstwert 0,3 % nur in bestimmten Produkten (Zahnpasta, Seifen, Deos ohne Spray…), nicht in Kinderzahnpasta unter 3 Jahren.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/996 (Vitamin A, arbutins, potential endocrine disruptors)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0996",
      },
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2022,
        title: "SCCS/1643/22 Scientific advice on Triclocarban and Triclosan",
        url: "https://health.ec.europa.eu/system/files/2023-08/sccs_o_265.pdf",
        doi: "10.2875/442449",
      },
    ],
  },
  {
    id: "triclocarban",
    inci: "TRICLOCARBAN",
    synonyms: {
      en: ["triclocarban", "1-(4-chlorophenyl)-3-(3,4-dichlorophenyl)urea"],
      fr: ["triclocarban"],
      de: ["triclocarban"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Preservative: SCCS found up to 0.2% safe in skin products, not in mouthwash; EU conditions tightened by Reg. 2024/996.",
      fr: "Conservateur : jugé sûr jusqu'à 0,2 % dans les produits cutanés, pas dans les bains de bouche ; conditions UE resserrées par le règl. 2024/996.",
      de: "Konservierungsstoff: bis 0,2 % in Hautprodukten sicher, nicht in Mundwasser; EU-Bedingungen durch VO 2024/996 verschärft.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/996 (Vitamin A, arbutins, potential endocrine disruptors)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0996",
      },
    ],
  },
  {
    id: "dmdm-hydantoin",
    inci: "DMDM HYDANTOIN",
    synonyms: {
      en: ["dmdm hydantoin", "1,3-bis(hydroxymethyl)-5,5-dimethylimidazolidine-2,4-dione"],
      fr: ["dmdm hydantoin", "dmdm hydantoïne"],
      de: ["dmdm hydantoin", "dmdm-hydantoin"],
    },
    categories: ["eu-restricted", "us-state-ban"],
    summary: {
      en: "Formaldehyde-releasing preservative allowed in EU Annex V; 'releases formaldehyde' warning above 0.001% (Reg. 2022/1181, all stock by 31 July 2026); Washington ban from 2027.",
      fr: "Conservateur libérant du formaldéhyde, autorisé (annexe V) ; mention « libère du formaldéhyde » au-delà de 0,001 % (règl. 2022/1181, au 31/07/2026) ; interdit à Washington dès 2027.",
      de: "Formaldehydabspalter, in Anhang V erlaubt; Warnhinweis „setzt Formaldehyd frei“ ab 0,001 % (VO 2022/1181, ab 31.07.2026 für alle Waren); in Washington ab 2027 verboten.",
    },
    sources: [
      {
        org: "UK Scientific Advisory Group on Chemical Safety (SAG-CS)",
        year: 2023,
        title: "SAG-CS Opinion 07: Formaldehyde releasing substances",
        url: "https://assets.publishing.service.gov.uk/media/63ce6face90e071ba448517b/sag-cs-opinion-07-formaldehyde-releasing-substances.pdf",
      },
      {
        org: "Washington State Department of Ecology",
        year: 2025,
        title: "Toxic-Free Cosmetics Act guide: restrictions for cosmetic industry and sellers",
        url: "https://apps.ecology.wa.gov/publications/documents/2404019.pdf",
      },
      {
        org: "European Commission",
        year: 2022,
        title: "Commission Regulation (EU) 2022/1181 (formaldehyde-releaser labelling)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1181",
      },
    ],
  },
  {
    id: "imidazolidinyl-urea",
    inci: "IMIDAZOLIDINYL UREA",
    synonyms: {
      en: ["imidazolidinyl urea", "imidurea"],
      fr: ["imidazolidinyl urea", "imidazolidinyl urée"],
      de: ["imidazolidinyl urea", "imidazolidinylharnstoff"],
    },
    categories: ["eu-restricted", "us-state-ban"],
    summary: {
      en: "Formaldehyde-releasing preservative allowed in EU Annex V; 'releases formaldehyde' warning above 0.001% (Reg. 2022/1181, all stock by 31 July 2026); Washington ban from 2027.",
      fr: "Conservateur libérant du formaldéhyde, autorisé (annexe V) ; mention « libère du formaldéhyde » au-delà de 0,001 % (règl. 2022/1181, au 31/07/2026) ; interdit à Washington dès 2027.",
      de: "Formaldehydabspalter, in Anhang V erlaubt; Warnhinweis „setzt Formaldehyd frei“ ab 0,001 % (VO 2022/1181, ab 31.07.2026 für alle Waren); in Washington ab 2027 verboten.",
    },
    sources: [
      {
        org: "UK Scientific Advisory Group on Chemical Safety (SAG-CS)",
        year: 2023,
        title: "SAG-CS Opinion 07: Formaldehyde releasing substances",
        url: "https://assets.publishing.service.gov.uk/media/63ce6face90e071ba448517b/sag-cs-opinion-07-formaldehyde-releasing-substances.pdf",
      },
      {
        org: "Washington State Department of Ecology",
        year: 2025,
        title: "Toxic-Free Cosmetics Act guide: restrictions for cosmetic industry and sellers",
        url: "https://apps.ecology.wa.gov/publications/documents/2404019.pdf",
      },
      {
        org: "European Commission",
        year: 2022,
        title: "Commission Regulation (EU) 2022/1181 (formaldehyde-releaser labelling)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1181",
      },
    ],
  },
  {
    id: "diazolidinyl-urea",
    inci: "DIAZOLIDINYL UREA",
    synonyms: {
      en: ["diazolidinyl urea"],
      fr: ["diazolidinyl urea", "diazolidinyl urée"],
      de: ["diazolidinyl urea", "diazolidinylharnstoff"],
    },
    categories: ["eu-restricted", "us-state-ban"],
    summary: {
      en: "Formaldehyde-releasing preservative allowed in EU Annex V; 'releases formaldehyde' warning above 0.001% (Reg. 2022/1181, all stock by 31 July 2026); Washington ban from 2027.",
      fr: "Conservateur libérant du formaldéhyde, autorisé (annexe V) ; mention « libère du formaldéhyde » au-delà de 0,001 % (règl. 2022/1181, au 31/07/2026) ; interdit à Washington dès 2027.",
      de: "Formaldehydabspalter, in Anhang V erlaubt; Warnhinweis „setzt Formaldehyd frei“ ab 0,001 % (VO 2022/1181, ab 31.07.2026 für alle Waren); in Washington ab 2027 verboten.",
    },
    sources: [
      {
        org: "UK Scientific Advisory Group on Chemical Safety (SAG-CS)",
        year: 2023,
        title: "SAG-CS Opinion 07: Formaldehyde releasing substances",
        url: "https://assets.publishing.service.gov.uk/media/63ce6face90e071ba448517b/sag-cs-opinion-07-formaldehyde-releasing-substances.pdf",
      },
      {
        org: "Washington State Department of Ecology",
        year: 2025,
        title: "Toxic-Free Cosmetics Act guide: restrictions for cosmetic industry and sellers",
        url: "https://apps.ecology.wa.gov/publications/documents/2404019.pdf",
      },
      {
        org: "European Commission",
        year: 2022,
        title: "Commission Regulation (EU) 2022/1181 (formaldehyde-releaser labelling)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1181",
      },
    ],
  },
  {
    id: "bronopol",
    inci: "2-BROMO-2-NITROPROPANE-1,3-DIOL",
    synonyms: {
      en: ["2-bromo-2-nitropropane-1,3-diol", "bronopol"],
      fr: ["2-bromo-2-nitropropane-1,3-diol", "bronopol"],
      de: ["2-bromo-2-nitropropane-1,3-diol", "bronopol"],
    },
    categories: ["eu-restricted", "us-state-ban"],
    summary: {
      en: "Formaldehyde-releasing preservative allowed in EU Annex V; 'releases formaldehyde' warning above 0.001% (Reg. 2022/1181, all stock by 31 July 2026); Washington ban from 2027.",
      fr: "Conservateur libérant du formaldéhyde, autorisé (annexe V) ; mention « libère du formaldéhyde » au-delà de 0,001 % (règl. 2022/1181, au 31/07/2026) ; interdit à Washington dès 2027.",
      de: "Formaldehydabspalter, in Anhang V erlaubt; Warnhinweis „setzt Formaldehyd frei“ ab 0,001 % (VO 2022/1181, ab 31.07.2026 für alle Waren); in Washington ab 2027 verboten.",
    },
    sources: [
      {
        org: "UK Scientific Advisory Group on Chemical Safety (SAG-CS)",
        year: 2023,
        title: "SAG-CS Opinion 07: Formaldehyde releasing substances",
        url: "https://assets.publishing.service.gov.uk/media/63ce6face90e071ba448517b/sag-cs-opinion-07-formaldehyde-releasing-substances.pdf",
      },
      {
        org: "Washington State Department of Ecology",
        year: 2025,
        title: "Toxic-Free Cosmetics Act guide: restrictions for cosmetic industry and sellers",
        url: "https://apps.ecology.wa.gov/publications/documents/2404019.pdf",
      },
      {
        org: "European Commission",
        year: 2022,
        title: "Commission Regulation (EU) 2022/1181 (formaldehyde-releaser labelling)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1181",
      },
    ],
  },
  {
    id: "sodium-hydroxymethylglycinate",
    inci: "SODIUM HYDROXYMETHYLGLYCINATE",
    synonyms: {
      en: ["sodium hydroxymethylglycinate", "sodium n-(hydroxymethyl)glycinate"],
      fr: ["sodium hydroxymethylglycinate", "hydroxyméthylglycinate de sodium"],
      de: ["sodium hydroxymethylglycinate", "natriumhydroxymethylglycinat"],
    },
    categories: ["eu-restricted", "us-state-ban"],
    summary: {
      en: "Formaldehyde-releasing preservative: EU max 0.5% (Annex V), barred if releasable formaldehyde ≥0.1% (Reg. 2021/1902); 'releases formaldehyde' label rule; Washington ban from 2027.",
      fr: "Conservateur libérant du formaldéhyde : max. 0,5 % (annexe V), exclu si formaldéhyde libérable ≥ 0,1 % (règl. 2021/1902) ; étiquetage dédié ; interdit à Washington dès 2027.",
      de: "Formaldehydabspalter: EU max. 0,5 % (Anhang V), unzulässig bei freisetzbarem Formaldehyd ≥ 0,1 % (VO 2021/1902); Warnhinweispflicht; in Washington ab 2027 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2021,
        title: "Commission Regulation (EU) 2021/1902 (CMR omnibus IV)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021R1902",
      },
      {
        org: "Washington State Department of Ecology",
        year: 2025,
        title: "Toxic-Free Cosmetics Act guide: restrictions for cosmetic industry and sellers",
        url: "https://apps.ecology.wa.gov/publications/documents/2404019.pdf",
      },
      {
        org: "European Commission",
        year: 2022,
        title: "Commission Regulation (EU) 2022/1181 (formaldehyde-releaser labelling)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1181",
      },
    ],
  },
  {
    id: "benzophenone-3",
    inci: "BENZOPHENONE-3",
    synonyms: {
      en: ["benzophenone-3", "oxybenzone", "bp-3", "2-hydroxy-4-methoxybenzophenone"],
      fr: ["benzophenone-3", "benzophénone-3", "oxybenzone"],
      de: ["benzophenone-3", "benzophenon-3", "oxybenzon"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "UV filter with potential endocrine concerns: EU max 6% face/hand/lip, 2.2% body incl. sprays, 0.5% other products, 'Contains Benzophenone-3' label; full effect 28 July 2023.",
      fr: "Filtre UV suspecté PE : max. 6 % visage/mains/lèvres, 2,2 % corps (sprays inclus), 0,5 % autres, mention « Contient de la benzophénone-3 » ; pleinement applicable au 28/07/2023.",
      de: "UV-Filter mit ED-Verdacht: EU max. 6 % Gesicht/Hand/Lippe, 2,2 % Körper inkl. Sprays, 0,5 % sonst; Hinweis „Enthält Benzophenon-3“; vollständig ab 28.07.2023.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2022,
        title: "Commission Regulation (EU) 2022/1176 (Benzophenone-3 and Octocrylene)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1176",
      },
    ],
  },
  {
    id: "octocrylene",
    inci: "OCTOCRYLENE",
    synonyms: {
      en: ["octocrylene", "2-ethylhexyl 2-cyano-3,3-diphenylacrylate"],
      fr: ["octocrylene", "octocrylène"],
      de: ["octocrylene", "octocrylen"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "UV filter: EU max 10% (9% in propellant sprays) under Reg. 2022/1176, with its benzophenone impurity kept at trace level; full effect since 28 July 2023.",
      fr: "Filtre UV : max. 10 % dans l'UE (9 % en spray à gaz propulseur) selon le règl. 2022/1176, impureté benzophénone à l'état de traces ; pleinement applicable depuis le 28/07/2023.",
      de: "UV-Filter: EU max. 10 % (9 % in Treibgassprays) nach VO 2022/1176, Benzophenon-Verunreinigung nur in Spuren; vollständig anwendbar seit 28.07.2023.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2022,
        title: "Commission Regulation (EU) 2022/1176 (Benzophenone-3 and Octocrylene)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1176",
      },
    ],
  },
  {
    id: "homosalate",
    inci: "HOMOSALATE",
    synonyms: {
      en: ["homosalate", "3,3,5-trimethylcyclohexyl salicylate"],
      fr: ["homosalate"],
      de: ["homosalate", "homosalat"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "UV filter with potential endocrine concerns: in the EU only in face products (not propellant sprays) up to 7.34% (Reg. 2022/2195); placing from 1 January 2025, sale from 1 July 2025.",
      fr: "Filtre UV suspecté PE : dans l'UE seulement en produits visage (hors aérosols), max. 7,34 % (règl. 2022/2195) ; mise sur le marché dès le 1/01/2025, vente dès le 1/07/2025.",
      de: "UV-Filter mit ED-Verdacht: in der EU nur in Gesichtsprodukten (keine Treibgassprays) bis 7,34 % (VO 2022/2195); Inverkehrbringen ab 1.1.2025, Bereitstellung ab 1.7.2025.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2022,
        title:
          "Commission Regulation (EU) 2022/2195 (BHT, Acid Yellow 3, Homosalate, HAA299, Resorcinol)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2195",
      },
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2021,
        title: "SCCS/1638/21 Scientific advice on Homosalate as a UV filter",
        url: "https://health.ec.europa.eu/system/files/2022-08/sccs_o_260.pdf",
        doi: "10.2875/999721",
      },
      {
        org: "European Commission – Scientific Committee on Consumer Safety (SCCS)",
        year: 2021,
        title: "SCCS/1622/20 Opinion on Homosalate",
        url: "https://health.ec.europa.eu/system/files/2022-08/sccs_o_244.pdf",
        doi: "10.2875/471351",
      },
    ],
  },
  {
    id: "bht",
    inci: "BHT",
    synonyms: {
      en: ["bht", "butylated hydroxytoluene", "2,6-di-tert-butyl-4-methylphenol"],
      fr: ["bht", "butylhydroxytoluène"],
      de: ["bht", "butylhydroxytoluol"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "BHT (butylated hydroxytoluene): EU limits since Reg. 2022/2195 of 0.001% (mouthwash), 0.1% (toothpaste) and 0.8% (other products).",
      fr: "BHT (butylhydroxytoluène) : limites UE depuis le règl. 2022/2195 de 0,001 % (bain de bouche), 0,1 % (dentifrice) et 0,8 % (autres produits).",
      de: "BHT (Butylhydroxytoluol): EU-Grenzwerte seit VO 2022/2195: 0,001 % (Mundwasser), 0,1 % (Zahnpasta), 0,8 % (sonstige Produkte).",
    },
    sources: [
      {
        org: "European Commission",
        year: 2022,
        title:
          "Commission Regulation (EU) 2022/2195 (BHT, Acid Yellow 3, Homosalate, HAA299, Resorcinol)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2195",
      },
    ],
  },
  {
    id: "acid-yellow-3",
    inci: "ACID YELLOW 3",
    synonyms: {
      en: ["acid yellow 3", "ci 47005", "quinoline yellow"],
      fr: ["acid yellow 3", "ci 47005"],
      de: ["acid yellow 3", "ci 47005"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Colorant CI 47005: in EU non-oxidative hair dyes capped at 0.5% by Reg. 2022/2195 (from 1 July 2023 for placing on the market).",
      fr: "Colorant CI 47005 : limité à 0,5 % dans les colorations capillaires non oxydantes par le règl. 2022/2195 (mise sur le marché dès le 1er juillet 2023).",
      de: "Farbstoff CI 47005: in nicht-oxidativen Haarfärbemitteln durch VO 2022/2195 auf 0,5 % begrenzt (Inverkehrbringen ab 1. Juli 2023).",
    },
    sources: [
      {
        org: "European Commission",
        year: 2022,
        title:
          "Commission Regulation (EU) 2022/2195 (BHT, Acid Yellow 3, Homosalate, HAA299, Resorcinol)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2195",
      },
    ],
  },
  {
    id: "vitamin-a-retinoids",
    inci: "RETINOL",
    synonyms: {
      en: ["retinol", "retinyl acetate", "retinyl palmitate", "vitamin a"],
      fr: [
        "retinol",
        "rétinol",
        "retinyl acetate",
        "retinyl palmitate",
        "acétate de rétinyle",
        "palmitate de rétinyle",
      ],
      de: ["retinol", "retinyl acetate", "retinyl palmitate", "retinylacetat", "retinylpalmitat"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Vitamin A forms (retinol, retinyl acetate/palmitate): EU max 0.05% RE in body lotion, 0.3% RE elsewhere (Reg. 2024/996); placing from 1 November 2025, sale from 1 May 2027.",
      fr: "Vitamine A (rétinol, acétate/palmitate de rétinyle) : max. 0,05 % ER en lait corporel, 0,3 % ER ailleurs (règl. 2024/996) ; mise sur le marché 1/11/2025, vente 1/05/2027.",
      de: "Vitamin A (Retinol, Retinylacetat/-palmitat): EU max. 0,05 % RE in Körperlotion, 0,3 % RE sonst (VO 2024/996); Inverkehrbringen ab 1.11.2025, Bereitstellung ab 1.5.2027.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/996 (Vitamin A, arbutins, potential endocrine disruptors)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0996",
      },
    ],
  },
  {
    id: "alpha-arbutin",
    inci: "ALPHA-ARBUTIN",
    synonyms: {
      en: ["alpha-arbutin", "alpha arbutin"],
      fr: ["alpha-arbutin", "alpha-arbutine"],
      de: ["alpha-arbutin"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Alpha-arbutin: EU max 2% in face creams and 0.5% in body lotions (Reg. 2024/996), hydroquinone only as unavoidable trace; placing from 1 February 2025.",
      fr: "Alpha-arbutine : max. 2 % en crème visage et 0,5 % en lait corporel dans l'UE (règl. 2024/996), hydroquinone à l'état de traces ; mise sur le marché dès le 1/02/2025.",
      de: "Alpha-Arbutin: EU max. 2 % in Gesichtscremes und 0,5 % in Körperlotionen (VO 2024/996), Hydrochinon nur als unvermeidbare Spur; Inverkehrbringen ab 1.2.2025.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/996 (Vitamin A, arbutins, potential endocrine disruptors)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0996",
      },
    ],
  },
  {
    id: "arbutin",
    inci: "ARBUTIN",
    synonyms: {
      en: ["arbutin", "beta-arbutin"],
      fr: ["arbutin", "arbutine"],
      de: ["arbutin"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Arbutin: EU use limited to face creams at up to 7% (Reg. 2024/996), hydroquinone only as unavoidable trace; placing on the market from 1 February 2025.",
      fr: "Arbutine : limitée dans l'UE aux crèmes visage, max. 7 % (règl. 2024/996), hydroquinone à l'état de traces ; mise sur le marché dès le 1er février 2025.",
      de: "Arbutin: in der EU nur in Gesichtscremes bis 7 % (VO 2024/996), Hydrochinon nur als unvermeidbare Spur; Inverkehrbringen ab 1. Februar 2025.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/996 (Vitamin A, arbutins, potential endocrine disruptors)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0996",
      },
    ],
  },
  {
    id: "kojic-acid",
    inci: "KOJIC ACID",
    synonyms: {
      en: ["kojic acid"],
      fr: ["kojic acid", "acide kojique"],
      de: ["kojic acid", "kojisäure"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Skin-lightening agent: EU max 1% (Reg. 2024/996, after SCCS opinion of March 2022); placing on the market from 1 February 2025.",
      fr: "Agent éclaircissant : max. 1 % dans l'UE (règl. 2024/996, après l'avis du CSSC de mars 2022) ; mise sur le marché dès le 1er février 2025.",
      de: "Hautaufheller: EU max. 1 % (VO 2024/996, nach SCCS-Gutachten März 2022); Inverkehrbringen ab 1. Februar 2025.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/996 (Vitamin A, arbutins, potential endocrine disruptors)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0996",
      },
    ],
  },
  {
    id: "genistein",
    inci: "GENISTEIN",
    synonyms: {
      en: ["genistein"],
      fr: ["genistein", "génistéine"],
      de: ["genistein"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Isoflavone genistein: EU max 0.007% under Reg. 2024/996; non-compliant products not placed on the market from 1 February 2025.",
      fr: "Isoflavone génistéine : max. 0,007 % dans l'UE (règl. 2024/996) ; mise sur le marché interdite pour les non-conformes dès le 1er février 2025.",
      de: "Isoflavon Genistein: EU max. 0,007 % (VO 2024/996); nicht konforme Produkte ab 1. Februar 2025 nicht mehr in Verkehr.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/996 (Vitamin A, arbutins, potential endocrine disruptors)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0996",
      },
    ],
  },
  {
    id: "daidzein",
    inci: "DAIDZEIN",
    synonyms: {
      en: ["daidzein"],
      fr: ["daidzein", "daïdzéine"],
      de: ["daidzein"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Isoflavone daidzein: EU max 0.02% under Reg. 2024/996; non-compliant products not placed on the market from 1 February 2025.",
      fr: "Isoflavone daïdzéine : max. 0,02 % dans l'UE (règl. 2024/996) ; mise sur le marché interdite pour les non-conformes dès le 1er février 2025.",
      de: "Isoflavon Daidzein: EU max. 0,02 % (VO 2024/996); nicht konforme Produkte ab 1. Februar 2025 nicht mehr in Verkehr.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/996 (Vitamin A, arbutins, potential endocrine disruptors)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R0996",
      },
    ],
  },
  {
    id: "hexyl-salicylate",
    inci: "HEXYL SALICYLATE",
    synonyms: {
      en: ["hexyl salicylate", "hexyl 2-hydroxybenzoate"],
      fr: ["hexyl salicylate", "salicylate d'hexyle"],
      de: ["hexyl salicylate", "hexylsalicylat"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Hexyl salicylate, classified CMR 2 (reprotoxic): allowed only under Annex III conditions in the EU from 1 May 2026 (CMR omnibus Reg. 2026/78).",
      fr: "Salicylate d'hexyle, classé CMR 2 (reprotoxique) : autorisé dans l'UE uniquement aux conditions de l'annexe III depuis le 1er mai 2026 (règlement CMR 2026/78).",
      de: "Hexylsalicylat, als CMR 2 (reproduktionstoxisch) eingestuft: in der EU seit 1. Mai 2026 nur unter den Bedingungen von Anhang III erlaubt (CMR-Sammelverordnung 2026/78).",
    },
    sources: [
      {
        org: "European Commission",
        year: 2026,
        title: "Commission Regulation (EU) 2026/78 (CMR omnibus VIII)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R0078",
      },
    ],
  },
  {
    id: "o-phenylphenol",
    inci: "O-PHENYLPHENOL",
    synonyms: {
      en: ["o-phenylphenol", "2-phenylphenol", "biphenyl-2-ol", "sodium o-phenylphenate"],
      fr: ["o-phenylphenol", "o-phénylphénol"],
      de: ["o-phenylphenol", "2-phenylphenol"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Preservative classified carcinogen category 2: listed in EU Annex V (max 0.2% rinse-off, 0.15% leave-on); entry amended by Reg. 2026/78 from 1 May 2026.",
      fr: "Conservateur classé cancérogène cat. 2 : inscrit à l'annexe V (max. 0,2 % rincé, 0,15 % sans rinçage) ; entrée modifiée par le règl. 2026/78 au 1er mai 2026.",
      de: "Konservierungsstoff, Karzinogen Kat. 2: in Anhang V gelistet (max. 0,2 % Rinse-off, 0,15 % Leave-on); Eintrag durch VO 2026/78 ab 1. Mai 2026 geändert.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2026,
        title: "Commission Regulation (EU) 2026/78 (CMR omnibus VIII)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R0078",
      },
    ],
  },
  {
    id: "silver",
    inci: "SILVER",
    synonyms: {
      en: ["silver", "ci 77820", "colloidal silver", "nano silver"],
      fr: ["silver", "argent", "ci 77820"],
      de: ["silver", "silber", "ci 77820"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Silver (CI 77820), classified CMR 2: nano and massive forms prohibited in EU cosmetics, micron-sized powder allowed only under set conditions, from 1 May 2026 (Reg. 2026/78).",
      fr: "Argent (CI 77820), classé CMR 2 : formes nano et massive interdites, poudre micrométrique admise sous conditions, depuis le 1er mai 2026 (règl. 2026/78).",
      de: "Silber (CI 77820), CMR 2: Nano- und Massivform in EU-Kosmetik verboten, mikronisiertes Pulver nur unter Auflagen erlaubt, ab 1. Mai 2026 (VO 2026/78).",
    },
    sources: [
      {
        org: "European Commission",
        year: 2026,
        title: "Commission Regulation (EU) 2026/78 (CMR omnibus VIII)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32026R0078",
      },
    ],
  },
  {
    id: "methyl-salicylate",
    inci: "METHYL SALICYLATE",
    synonyms: {
      en: ["methyl salicylate", "methyl 2-hydroxybenzoate", "wintergreen oil"],
      fr: ["methyl salicylate", "salicylate de méthyle"],
      de: ["methyl salicylate", "methylsalicylat"],
    },
    categories: ["eu-restricted", "fragrance-allergen"],
    summary: {
      en: "CMR 2 substance allowed under Annex III limits since 17 December 2022 (Reg. 2022/1531) and a labelled fragrance allergen above 0.001%/0.01% under Reg. 2023/1545.",
      fr: "Substance CMR 2 autorisée dans les limites de l'annexe III depuis le 17/12/2022 (règl. 2022/1531) et allergène à étiqueter au-delà de 0,001 %/0,01 % (règl. 2023/1545).",
      de: "CMR-2-Stoff, seit 17.12.2022 nur mit Anhang-III-Grenzen erlaubt (VO 2022/1531), und deklarationspflichtiges Duftstoffallergen ab 0,001 %/0,01 % (VO 2023/1545).",
    },
    sources: [
      {
        org: "European Commission",
        year: 2022,
        title: "Commission Regulation (EU) 2022/1531 (CMR omnibus V)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1531",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "cyclotetrasiloxane",
    inci: "CYCLOTETRASILOXANE",
    synonyms: {
      en: ["cyclotetrasiloxane", "octamethylcyclotetrasiloxane"],
      fr: ["cyclotetrasiloxane", "cyclotétrasiloxane", "octaméthylcyclotétrasiloxane"],
      de: ["cyclotetrasiloxane", "cyclotetrasiloxan", "octamethylcyclotetrasiloxan"],
    },
    categories: ["eu-restricted", "us-state-ban"],
    summary: {
      en: "Silicone D4 (PBT): under REACH max 0.1% in wash-off cosmetics since 31 January 2020 and in all cosmetics after 6 June 2027; California ban from 1 January 2027.",
      fr: "Silicone D4 (PBT) : REACH, max. 0,1 % dans les produits rincés depuis le 31/01/2020 et dans tous les cosmétiques après le 6/06/2027 ; interdit en Californie dès le 1/01/2027.",
      de: "Silikon D4 (PBT): nach REACH max. 0,1 % in abwaschbaren Kosmetika seit 31.01.2020, in allen Kosmetika nach 06.06.2027; in Kalifornien ab 01.01.2027 verboten.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2018,
        title: "Commission Regulation (EU) 2018/35 (REACH: D4 and D5 in wash-off cosmetics)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R0035",
      },
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/1328 amending REACH Annex XVII entry 70 (D4, D5, D6)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1328",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "cyclopentasiloxane",
    inci: "CYCLOPENTASILOXANE",
    synonyms: {
      en: ["cyclopentasiloxane", "decamethylcyclopentasiloxane"],
      fr: ["cyclopentasiloxane", "décaméthylcyclopentasiloxane"],
      de: ["cyclopentasiloxane", "cyclopentasiloxan", "decamethylcyclopentasiloxan"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Silicone D5 (vPvB): under REACH max 0.1% in wash-off cosmetics since 31 January 2020 and in all other cosmetics, incl. leave-on, after 6 June 2027 (Reg. 2024/1328).",
      fr: "Silicone D5 (vPvB) : REACH, max. 0,1 % dans les produits rincés depuis le 31/01/2020 et dans tous les autres cosmétiques, sans rinçage compris, après le 6/06/2027.",
      de: "Silikon D5 (vPvB): nach REACH max. 0,1 % in abwaschbaren Kosmetika seit 31.01.2020, in allen übrigen inkl. Leave-on nach 06.06.2027 (VO 2024/1328).",
    },
    sources: [
      {
        org: "European Commission",
        year: 2018,
        title: "Commission Regulation (EU) 2018/35 (REACH: D4 and D5 in wash-off cosmetics)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R0035",
      },
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/1328 amending REACH Annex XVII entry 70 (D4, D5, D6)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1328",
      },
    ],
  },
  {
    id: "cyclohexasiloxane",
    inci: "CYCLOHEXASILOXANE",
    synonyms: {
      en: ["cyclohexasiloxane", "dodecamethylcyclohexasiloxane"],
      fr: ["cyclohexasiloxane", "dodécaméthylcyclohexasiloxane"],
      de: ["cyclohexasiloxane", "cyclohexasiloxan", "dodecamethylcyclohexasiloxan"],
    },
    categories: ["eu-restricted"],
    summary: {
      en: "Silicone D6 (vPvB): REACH Reg. 2024/1328 caps it at 0.1% in all cosmetics, wash-off and leave-on, after 6 June 2027.",
      fr: "Silicone D6 (vPvB) : le règlement REACH 2024/1328 la limite à 0,1 % dans tous les cosmétiques, rincés ou non, après le 6 juin 2027.",
      de: "Silikon D6 (vPvB): REACH-VO 2024/1328 begrenzt es nach dem 6. Juni 2027 in allen Kosmetika (abwaschbar und Leave-on) auf 0,1 %.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2024,
        title:
          "Commission Regulation (EU) 2024/1328 amending REACH Annex XVII entry 70 (D4, D5, D6)",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1328",
      },
    ],
  },
  {
    id: "talc",
    inci: "TALC",
    synonyms: {
      en: ["talc", "talcum", "ci 77718", "magnesium silicate hydroxide"],
      fr: ["talc"],
      de: ["talc", "talkum", "talk"],
    },
    categories: ["cmr"],
    summary: {
      en: "Talc classified 'probably carcinogenic to humans' (IARC Group 2A, July 2024); US MoCRA requires an FDA asbestos-testing rule, still pending after a 2025 withdrawal.",
      fr: "Talc classé « probablement cancérogène pour l'homme » (CIRC groupe 2A, juillet 2024) ; la loi MoCRA impose un test amiante (règle FDA retirée en 2025, en attente).",
      de: "Talkum, vom IARC im Juli 2024 als „wahrscheinlich krebserregend“ (Gruppe 2A) eingestuft; MoCRA verlangt FDA-Asbesttestregel, nach Rücknahme 2025 noch offen.",
    },
    sources: [
      {
        org: "International Agency for Research on Cancer (IARC)",
        year: 2024,
        title:
          "Press release No 352: IARC Monographs evaluate the carcinogenicity of talc and acrylonitrile",
        url: "https://www.iarc.who.int/wp-content/uploads/2024/07/pr352_E.pdf",
      },
      {
        org: "U.S. Food and Drug Administration",
        year: 2022,
        title: "Modernization of Cosmetics Regulation Act of 2022 (MoCRA)",
        url: "https://www.fda.gov/cosmetics/cosmetics-laws-regulations/modernization-cosmetics-regulation-act-2022-mocra",
      },
      {
        org: "Wiley Rein LLP",
        year: 2025,
        title: "FDA withdraws standardized asbestos testing proposal for talc-containing cosmetics",
        url: "https://www.wiley.law/alert-FDA-Withdraws-Standardized-Asbestos-Testing-Proposal-for-Talc-Containing-Cosmetics-With-Intent-to-Reexamine-and-Reissue",
      },
    ],
  },
  {
    id: "3-benzylidene-camphor",
    inci: "3-BENZYLIDENE CAMPHOR",
    synonyms: {
      en: ["3-benzylidene camphor", "3-bc"],
      fr: ["3-benzylidene camphor", "3-benzylidène camphre"],
      de: ["3-benzylidene camphor", "3-benzylidencampher"],
    },
    categories: ["endocrine"],
    summary: {
      en: "3-Benzylidene camphor: on the EU endocrine-disruptor List I (edlists.org), identified under REACH via the 2019 Candidate List.",
      fr: "3-Benzylidène camphre : inscrit sur la liste I des perturbateurs endocriniens de l'UE (edlists.org), identifié sous REACH (liste candidate 2019).",
      de: "3-Benzylidencampher: auf der EU-Liste I endokriner Disruptoren (edlists.org), unter REACH über die Kandidatenliste 2019 identifiziert.",
    },
    sources: [
      {
        org: "edlists.org (BE, DK, FR, NL, ES, SE national authorities)",
        year: 2026,
        title: "List I: Substances identified as endocrine disruptors at EU level",
        url: "https://edlists.org/the-ed-lists/list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
      },
    ],
  },
  {
    id: "dibutyl-phthalate",
    inci: "DIBUTYL PHTHALATE",
    synonyms: {
      en: ["dibutyl phthalate", "dbp"],
      fr: ["dibutyl phthalate", "phtalate de dibutyle"],
      de: ["dibutyl phthalate", "dibutylphthalat"],
    },
    categories: ["endocrine", "us-state-ban"],
    summary: {
      en: "Phthalate DBP: on EU endocrine-disruptor List I under REACH; banned in California cosmetics since 1 January 2025.",
      fr: "Phtalate DBP : sur la liste I des perturbateurs endocriniens (REACH) ; interdit dans les cosmétiques en Californie depuis le 1er janvier 2025.",
      de: "Phthalat DBP: auf der EU-Liste I endokriner Disruptoren (REACH); in Kalifornien seit 1. Januar 2025 in Kosmetik verboten.",
    },
    sources: [
      {
        org: "edlists.org (BE, DK, FR, NL, ES, SE national authorities)",
        year: 2026,
        title: "List I: Substances identified as endocrine disruptors at EU level",
        url: "https://edlists.org/the-ed-lists/list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "diethylhexyl-phthalate",
    inci: "DIETHYLHEXYL PHTHALATE",
    synonyms: {
      en: ["diethylhexyl phthalate", "dehp", "bis(2-ethylhexyl) phthalate"],
      fr: ["diethylhexyl phthalate", "phtalate de bis(2-éthylhexyle)"],
      de: ["diethylhexyl phthalate", "bis(2-ethylhexyl)phthalat"],
    },
    categories: ["endocrine", "us-state-ban"],
    summary: {
      en: "Phthalate DEHP: on EU endocrine-disruptor List I under REACH; banned in California cosmetics since 1 January 2025.",
      fr: "Phtalate DEHP : sur la liste I des perturbateurs endocriniens de l'UE (REACH) ; interdit dans les cosmétiques en Californie depuis le 1er janvier 2025.",
      de: "Phthalat DEHP: auf der EU-Liste I endokriner Disruptoren (REACH); in Kalifornien seit 1. Januar 2025 in Kosmetik verboten.",
    },
    sources: [
      {
        org: "edlists.org (BE, DK, FR, NL, ES, SE national authorities)",
        year: 2026,
        title: "List I: Substances identified as endocrine disruptors at EU level",
        url: "https://edlists.org/the-ed-lists/list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
      },
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "triphenyl-phosphate",
    inci: "TRIPHENYL PHOSPHATE",
    synonyms: {
      en: ["triphenyl phosphate", "tpp", "tphp"],
      fr: ["triphenyl phosphate", "phosphate de triphényle"],
      de: ["triphenyl phosphate", "triphenylphosphat"],
    },
    categories: ["endocrine"],
    summary: {
      en: "Triphenyl phosphate: on the EU endocrine-disruptor List I (edlists.org), identified under REACH.",
      fr: "Phosphate de triphényle : inscrit sur la liste I des perturbateurs endocriniens de l'UE (edlists.org), identifié sous REACH.",
      de: "Triphenylphosphat: auf der EU-Liste I endokriner Disruptoren (edlists.org), unter REACH identifiziert.",
    },
    sources: [
      {
        org: "edlists.org (BE, DK, FR, NL, ES, SE national authorities)",
        year: 2026,
        title: "List I: Substances identified as endocrine disruptors at EU level",
        url: "https://edlists.org/the-ed-lists/list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
      },
    ],
  },
  {
    id: "nonoxynols",
    inci: "NONOXYNOL-9",
    synonyms: {
      en: [
        "nonoxynol-9",
        "nonoxynol-4",
        "nonoxynol-6",
        "nonoxynol-8",
        "nonoxynol-10",
        "nonoxynol-12",
        "nonylphenol ethoxylate",
      ],
      fr: ["nonoxynol-9", "nonoxynol-4", "nonoxynol-10"],
      de: ["nonoxynol-9", "nonoxynol-4", "nonoxynol-10", "nonylphenolethoxylat"],
    },
    categories: ["endocrine"],
    summary: {
      en: "Nonylphenol ethoxylates (INCI nonoxynol-n): on EU endocrine-disruptor List I under REACH as 'nonylphenol, ethoxylated' (CAS 9016-45-9).",
      fr: "Nonylphénols éthoxylés (INCI nonoxynol-n) : sur la liste I des perturbateurs endocriniens de l'UE (REACH), « nonylphenol, ethoxylated » (CAS 9016-45-9).",
      de: "Nonylphenolethoxylate (INCI Nonoxynol-n): auf der EU-Liste I endokriner Disruptoren (REACH) als „Nonylphenol, ethoxylated“ (CAS 9016-45-9).",
    },
    sources: [
      {
        org: "edlists.org (BE, DK, FR, NL, ES, SE national authorities)",
        year: 2026,
        title: "List I: Substances identified as endocrine disruptors at EU level",
        url: "https://edlists.org/the-ed-lists/list-i-substances-identified-as-endocrine-disruptors-by-the-eu",
      },
    ],
  },
  {
    id: "mercury",
    inci: "MERCURY",
    synonyms: {
      en: ["mercury", "mercury compounds", "mercurous chloride", "calomel", "hydrargyrum"],
      fr: ["mercure"],
      de: ["quecksilber"],
    },
    categories: ["us-state-ban"],
    summary: {
      en: "Mercury: banned in California cosmetics since 1 January 2025; FDA allows only unavoidable traces below 1 ppm.",
      fr: "Mercure : interdit dans les cosmétiques en Californie depuis le 1er janvier 2025 ; la FDA ne tolère que des traces inévitables < 1 ppm.",
      de: "Quecksilber: in Kalifornien seit 1. Januar 2025 verboten; FDA duldet nur unvermeidbare Spuren unter 1 ppm.",
    },
    sources: [
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
      {
        org: "U.S. Food and Drug Administration",
        year: 2025,
        title: "Prohibited & restricted ingredients in cosmetics",
        url: "https://www.fda.gov/cosmetics/cosmetics-laws-regulations/prohibited-restricted-ingredients-cosmetics",
      },
    ],
  },
  {
    id: "m-phenylenediamine",
    inci: "m-PHENYLENEDIAMINE",
    synonyms: {
      en: ["m-phenylenediamine", "1,3-phenylenediamine", "m-phenylenediamine sulfate"],
      fr: ["m-phenylenediamine", "m-phénylènediamine"],
      de: ["m-phenylenediamine", "m-phenylendiamin"],
    },
    categories: ["us-state-ban"],
    summary: {
      en: "m-Phenylenediamine and its salts banned in cosmetics sold in California since 1 January 2025 (AB 2762).",
      fr: "La m-phénylènediamine et ses sels sont interdits dans les cosmétiques en Californie depuis le 1er janvier 2025 (AB 2762).",
      de: "m-Phenylendiamin und seine Salze sind in Kalifornien seit 1. Januar 2025 in Kosmetik verboten (AB 2762).",
    },
    sources: [
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "o-phenylenediamine",
    inci: "o-PHENYLENEDIAMINE",
    synonyms: {
      en: ["o-phenylenediamine", "1,2-phenylenediamine"],
      fr: ["o-phenylenediamine", "o-phénylènediamine"],
      de: ["o-phenylenediamine", "o-phenylendiamin"],
    },
    categories: ["us-state-ban"],
    summary: {
      en: "o-Phenylenediamine and its salts banned in cosmetics sold in California since 1 January 2025 (AB 2762).",
      fr: "L'o-phénylènediamine et ses sels sont interdits dans les cosmétiques en Californie depuis le 1er janvier 2025 (AB 2762).",
      de: "o-Phenylendiamin und seine Salze sind in Kalifornien seit 1. Januar 2025 in Kosmetik verboten (AB 2762).",
    },
    sources: [
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "boric-acid",
    inci: "BORIC ACID",
    synonyms: {
      en: ["boric acid", "sodium borate", "borax", "disodium tetraborate", "sodium perborate"],
      fr: ["boric acid", "acide borique", "sodium borate", "borax"],
      de: ["boric acid", "borsäure", "sodium borate", "borax"],
    },
    categories: ["us-state-ban"],
    summary: {
      en: "Boron compounds (boric acid, borax/sodium borate, perborates): banned as intentional ingredients in cosmetics sold in California from 1 January 2027 (AB 496).",
      fr: "Composés du bore (acide borique, borax/borate de sodium, perborates) : interdits comme ingrédients des cosmétiques vendus en Californie dès le 1er janvier 2027 (AB 496).",
      de: "Borverbindungen (Borsäure, Borax/Natriumborat, Perborate): ab 1. Januar 2027 als gezielte Zutat in in Kalifornien verkauften Kosmetika verboten (AB 496).",
    },
    sources: [
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "phytonadione",
    inci: "PHYTONADIONE",
    synonyms: {
      en: ["phytonadione", "vitamin k1", "phylloquinone"],
      fr: ["phytonadione", "vitamine k1"],
      de: ["phytonadione", "vitamin k1", "phyllochinon"],
    },
    categories: ["us-state-ban"],
    summary: {
      en: "Phytonadione (vitamin K1): banned as an intentional ingredient in cosmetics sold in California from 1 January 2027 (AB 496).",
      fr: "Phytonadione (vitamine K1) : interdite comme ingrédient des cosmétiques vendus en Californie dès le 1er janvier 2027 (AB 496).",
      de: "Phytonadion (Vitamin K1): ab 1. Januar 2027 als gezielte Zutat in in Kalifornien verkauften Kosmetika verboten (AB 496).",
    },
    sources: [
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
    ],
  },
  {
    id: "pfos",
    inci: "PERFLUOROOCTANE SULFONATE",
    synonyms: {
      en: [
        "perfluorooctane sulfonate",
        "pfos",
        "heptadecafluorooctane-1-sulfonic acid",
        "potassium perfluorooctanesulfonate",
      ],
      fr: ["sulfonate de perfluorooctane", "pfos"],
      de: ["perfluoroctansulfonat", "pfos"],
    },
    categories: ["pfas", "us-state-ban"],
    summary: {
      en: "PFAS: PFOS and its salts banned in California cosmetics since 1 January 2025; all PFAS-containing cosmetics banned in France from 1 January 2026.",
      fr: "PFAS : le PFOS et ses sels sont interdits dans les cosmétiques en Californie depuis 2025 ; tout cosmétique contenant des PFAS est interdit en France dès le 1er janvier 2026.",
      de: "PFAS: PFOS und Salze in Kalifornien seit 1.1.2025 in Kosmetik verboten; in Frankreich sind PFAS-haltige Kosmetika ab 1. Januar 2026 verboten.",
    },
    sources: [
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
      {
        org: "Légifrance",
        year: 2025,
        title: "Code de l'environnement, article L524-1 (loi n° 2025-188 du 27 février 2025)",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051266190",
      },
    ],
  },
  {
    id: "pfoa",
    inci: "PERFLUOROOCTANOIC ACID",
    synonyms: {
      en: ["perfluorooctanoic acid", "pfoa", "ammonium pentadecafluorooctanoate"],
      fr: ["acide perfluorooctanoïque", "pfoa"],
      de: ["perfluoroctansäure", "pfoa"],
    },
    categories: ["pfas", "us-state-ban"],
    summary: {
      en: "PFAS: PFOA and its ammonium salt banned in California cosmetics since 1 January 2025; all PFAS-containing cosmetics banned in France from 1 January 2026.",
      fr: "PFAS : le PFOA et son sel d'ammonium sont interdits en Californie depuis 2025 ; tout cosmétique contenant des PFAS est interdit en France dès le 1er janvier 2026.",
      de: "PFAS: PFOA und Ammoniumsalz in Kalifornien seit 1.1.2025 in Kosmetik verboten; in Frankreich sind PFAS-haltige Kosmetika ab 1. Januar 2026 verboten.",
    },
    sources: [
      {
        org: "California State Legislature",
        year: 2023,
        title: "AB 496 Cosmetic safety (amends Health and Safety Code §108980)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB496",
      },
      {
        org: "Légifrance",
        year: 2025,
        title: "Code de l'environnement, article L524-1 (loi n° 2025-188 du 27 février 2025)",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051266190",
      },
    ],
  },
  {
    id: "ptfe",
    inci: "PTFE",
    synonyms: {
      en: ["ptfe", "polytetrafluoroethylene", "teflon"],
      fr: ["ptfe", "polytétrafluoroéthylène"],
      de: ["ptfe", "polytetrafluorethylen"],
    },
    categories: ["pfas", "us-state-ban"],
    summary: {
      en: "PTFE (a PFAS): banned in French cosmetics from 1 January 2026 and in California (intentionally added PFAS) since 1 January 2025.",
      fr: "PTFE (PFAS) : interdit dans les cosmétiques en France dès le 1er janvier 2026 et en Californie (PFAS ajoutés intentionnellement) depuis le 1er janvier 2025.",
      de: "PTFE (PFAS): in Frankreich ab 1. Januar 2026 und in Kalifornien (gezielt zugesetzte PFAS) seit 1. Januar 2025 in Kosmetik verboten.",
    },
    sources: [
      {
        org: "Breast Cancer Prevention Partners",
        year: 2022,
        title: "Chemicals of concern: PFAS (Red List)",
        url: "https://www.safecosmetics.org/wp-content/uploads/2022/08/BCPP-Red-List-for-Web_Tier-1_PFAS_Key.pdf",
      },
      {
        org: "Légifrance",
        year: 2025,
        title: "Code de l'environnement, article L524-1 (loi n° 2025-188 du 27 février 2025)",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051266190",
      },
      {
        org: "California State Legislature",
        year: 2022,
        title: "AB 2771 Cosmetic products: safety (intentionally added PFAS)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202120220AB2771",
      },
    ],
  },
  {
    id: "c9-15-fluoroalcohol-phosphate",
    inci: "C9-15 FLUOROALCOHOL PHOSPHATE",
    synonyms: {
      en: ["c9-15 fluoroalcohol phosphate", "c9-15 fluoroalcohol phosphates"],
      fr: ["c9-15 fluoroalcohol phosphate"],
      de: ["c9-15 fluoroalcohol phosphate"],
    },
    categories: ["pfas", "us-state-ban"],
    summary: {
      en: "C9-15 fluoroalcohol phosphate (a PFAS): banned in French cosmetics from 1 January 2026 and in California (intentionally added PFAS) since 1 January 2025.",
      fr: "C9-15 fluoroalcohol phosphate (PFAS) : interdit dans les cosmétiques en France dès le 1er janvier 2026 et en Californie (PFAS ajoutés intentionnellement) depuis le 1er janvier 2025.",
      de: "C9-15 Fluoroalcohol Phosphate (PFAS): in Frankreich ab 1. Januar 2026 und in Kalifornien (gezielt zugesetzte PFAS) seit 1. Januar 2025 in Kosmetik verboten.",
    },
    sources: [
      {
        org: "Breast Cancer Prevention Partners",
        year: 2022,
        title: "Chemicals of concern: PFAS (Red List)",
        url: "https://www.safecosmetics.org/wp-content/uploads/2022/08/BCPP-Red-List-for-Web_Tier-1_PFAS_Key.pdf",
      },
      {
        org: "Légifrance",
        year: 2025,
        title: "Code de l'environnement, article L524-1 (loi n° 2025-188 du 27 février 2025)",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051266190",
      },
      {
        org: "California State Legislature",
        year: 2022,
        title: "AB 2771 Cosmetic products: safety (intentionally added PFAS)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202120220AB2771",
      },
    ],
  },
  {
    id: "perfluorooctyl-triethoxysilane",
    inci: "PERFLUOROOCTYL TRIETHOXYSILANE",
    synonyms: {
      en: ["perfluorooctyl triethoxysilane", "triethoxy(tridecafluorooctyl)silane"],
      fr: ["perfluorooctyl triethoxysilane"],
      de: ["perfluorooctyl triethoxysilane"],
    },
    categories: ["pfas", "us-state-ban"],
    summary: {
      en: "Perfluorooctyl triethoxysilane (a PFAS): banned in French cosmetics from 1 January 2026 and in California (intentionally added PFAS) since 1 January 2025.",
      fr: "Perfluorooctyl triethoxysilane (PFAS) : interdit dans les cosmétiques en France dès le 1er janvier 2026 et en Californie (PFAS ajoutés intentionnellement) depuis le 1er janvier 2025.",
      de: "Perfluorooctyl Triethoxysilane (PFAS): in Frankreich ab 1. Januar 2026 und in Kalifornien (gezielt zugesetzte PFAS) seit 1. Januar 2025 in Kosmetik verboten.",
    },
    sources: [
      {
        org: "Breast Cancer Prevention Partners",
        year: 2022,
        title: "Chemicals of concern: PFAS (Red List)",
        url: "https://www.safecosmetics.org/wp-content/uploads/2022/08/BCPP-Red-List-for-Web_Tier-1_PFAS_Key.pdf",
      },
      {
        org: "Légifrance",
        year: 2025,
        title: "Code de l'environnement, article L524-1 (loi n° 2025-188 du 27 février 2025)",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051266190",
      },
      {
        org: "California State Legislature",
        year: 2022,
        title: "AB 2771 Cosmetic products: safety (intentionally added PFAS)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202120220AB2771",
      },
    ],
  },
  {
    id: "perfluorononyl-dimethicone",
    inci: "PERFLUORONONYL DIMETHICONE",
    synonyms: {
      en: ["perfluorononyl dimethicone"],
      fr: ["perfluorononyl dimethicone"],
      de: ["perfluorononyl dimethicone"],
    },
    categories: ["pfas", "us-state-ban"],
    summary: {
      en: "Perfluorononyl dimethicone (a PFAS): banned in French cosmetics from 1 January 2026 and in California (intentionally added PFAS) since 1 January 2025.",
      fr: "Perfluorononyl dimethicone (PFAS) : interdit dans les cosmétiques en France dès le 1er janvier 2026 et en Californie (PFAS ajoutés intentionnellement) depuis le 1er janvier 2025.",
      de: "Perfluorononyl Dimethicone (PFAS): in Frankreich ab 1. Januar 2026 und in Kalifornien (gezielt zugesetzte PFAS) seit 1. Januar 2025 in Kosmetik verboten.",
    },
    sources: [
      {
        org: "Breast Cancer Prevention Partners",
        year: 2022,
        title: "Chemicals of concern: PFAS (Red List)",
        url: "https://www.safecosmetics.org/wp-content/uploads/2022/08/BCPP-Red-List-for-Web_Tier-1_PFAS_Key.pdf",
      },
      {
        org: "Légifrance",
        year: 2025,
        title: "Code de l'environnement, article L524-1 (loi n° 2025-188 du 27 février 2025)",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051266190",
      },
      {
        org: "California State Legislature",
        year: 2022,
        title: "AB 2771 Cosmetic products: safety (intentionally added PFAS)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202120220AB2771",
      },
    ],
  },
  {
    id: "polyperfluoromethylisopropyl-ether",
    inci: "POLYPERFLUOROMETHYLISOPROPYL ETHER",
    synonyms: {
      en: ["polyperfluoromethylisopropyl ether", "perfluoropolymethylisopropyl ether"],
      fr: ["polyperfluoromethylisopropyl ether"],
      de: ["polyperfluoromethylisopropyl ether"],
    },
    categories: ["pfas", "us-state-ban"],
    summary: {
      en: "Polyperfluoromethylisopropyl ether (a PFAS): banned in French cosmetics from 1 January 2026 and in California (intentionally added PFAS) since 1 January 2025.",
      fr: "Polyperfluoromethylisopropyl ether (PFAS) : interdit dans les cosmétiques en France dès le 1er janvier 2026 et en Californie (PFAS ajoutés intentionnellement) depuis le 1er janvier 2025.",
      de: "Polyperfluoromethylisopropyl Ether (PFAS): in Frankreich ab 1. Januar 2026 und in Kalifornien (gezielt zugesetzte PFAS) seit 1. Januar 2025 in Kosmetik verboten.",
    },
    sources: [
      {
        org: "Breast Cancer Prevention Partners",
        year: 2022,
        title: "Chemicals of concern: PFAS (Red List)",
        url: "https://www.safecosmetics.org/wp-content/uploads/2022/08/BCPP-Red-List-for-Web_Tier-1_PFAS_Key.pdf",
      },
      {
        org: "Légifrance",
        year: 2025,
        title: "Code de l'environnement, article L524-1 (loi n° 2025-188 du 27 février 2025)",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000051266190",
      },
      {
        org: "California State Legislature",
        year: 2022,
        title: "AB 2771 Cosmetic products: safety (intentionally added PFAS)",
        url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202120220AB2771",
      },
    ],
  },
  {
    id: "6-methyl-coumarin",
    inci: "6-METHYL COUMARIN",
    synonyms: {
      en: ["6-methyl coumarin", "6-methylcoumarin"],
      fr: ["6-methyl coumarin", "6-méthylcoumarine"],
      de: ["6-methylcumarin", "6-methyl coumarin"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "pinus-mugo",
    inci: "PINUS MUGO LEAF OIL",
    synonyms: {
      en: [
        "dwarf pine oil",
        "pinus mugo leaf oil",
        "pinus mugo twig leaf extract",
        "pinus mugo twig oil",
      ],
      fr: ["huile de pin des montagnes", "pinus mugo leaf oil"],
      de: ["latschenkiefernöl", "pinus mugo leaf oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "pinus-pumila",
    inci: "PINUS PUMILA TWIG LEAF OIL",
    synonyms: {
      en: [
        "pinus pumila needle extract",
        "pinus pumila twig leaf extract",
        "pinus pumila twig leaf oil",
      ],
      fr: ["huile de pin nain", "pinus pumila twig leaf oil"],
      de: ["zwergkiefernöl", "pinus pumila twig leaf oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "cedrus-atlantica",
    inci: "CEDRUS ATLANTICA BARK OIL",
    synonyms: {
      en: [
        "cedrus atlantica bark extract",
        "cedrus atlantica bark oil",
        "cedrus atlantica bark water",
        "cedrus atlantica leaf extract",
        "cedrus atlantica wood extract",
        "cedrus atlantica wood oil",
      ],
      fr: ["cedrus atlantica bark oil", "huile de cèdre de l'atlas"],
      de: ["atlaszedernöl", "cedrus atlantica bark oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "turpentine",
    inci: "TURPENTINE",
    synonyms: {
      en: ["turpentine", "turpentine gum", "turpentine oil"],
      fr: ["turpentine", "térébenthine"],
      de: ["terpentin", "turpentine"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "alpha-terpinene",
    inci: "ALPHA-TERPINENE",
    synonyms: {
      en: ["alpha-terpinene", "p-mentha-1,3-diene"],
      fr: ["alpha-terpinene", "alpha-terpinène"],
      de: ["alpha-terpinen", "alpha-terpinene"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "terpinolene",
    inci: "TERPINOLENE",
    synonyms: {
      en: ["p-mentha-1,4(8)-diene", "terpinolene"],
      fr: ["terpinolene", "terpinolène"],
      de: ["terpinolen", "terpinolene"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "myroxylon-pereirae",
    inci: "MYROXYLON PEREIRAE OIL",
    synonyms: {
      en: [
        "balsam peru",
        "myroxylon balsamum pereirae balsam extract",
        "myroxylon balsamum pereirae balsam oil",
        "myroxylon pereirae oil",
        "myroxylon pereirae resin",
        "myroxylon pereirae resin extract",
      ],
      fr: ["baume du pérou", "myroxylon pereirae oil"],
      de: ["perubalsam", "myroxylon pereirae oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "rose-ketones",
    inci: "ROSE KETONES",
    synonyms: {
      en: [
        "alpha-damascone",
        "damascone",
        "delta-damascone",
        "rose ketone 1",
        "rose ketone 2",
        "rose ketone 3",
        "rose ketone 4",
        "rose ketones",
        "trans-beta-damascone",
      ],
      fr: ["damascones", "rose ketones"],
      de: ["damascone", "rose ketones"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "3-propylidenephthalide",
    inci: "3-PROPYLIDENEPHTHALIDE",
    synonyms: {
      en: ["3-propylidene-1(3h)-isobenzofuranone", "3-propylidenephthalide"],
      fr: ["3-propylidenephthalide", "3-propylidènephtalide"],
      de: ["3-propylidenphthalid", "3-propylidenephthalide"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "lippia-citriodora",
    inci: "LIPPIA CITRIODORA ABSOLUTE",
    synonyms: {
      en: ["lippia citriodora absolute", "verbena absolute"],
      fr: ["absolue de verveine", "lippia citriodora absolute"],
      de: ["verbenen-absolue", "lippia citriodora absolute"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen whose EU Annex III entry was rewritten by Reg. 2023/1545 to require labelling above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant dont l'entrée de l'annexe III a été réécrite par le règl. 2023/1545 : étiquetage au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, dessen Anhang-III-Eintrag durch VO 2023/1545 neu gefasst wurde: Deklaration ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off); neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "acetyl-cedrene",
    inci: "ACETYL CEDRENE",
    synonyms: {
      en: ["acetyl cedrene", "acetylcedrene", "methyl cedryl ketone"],
      fr: ["acetyl cedrene", "acétylcédrène"],
      de: ["acetylcedren", "acetyl cedrene"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "amyl-salicylate",
    inci: "AMYL SALICYLATE",
    synonyms: {
      en: ["amyl salicylate", "pentyl salicylate"],
      fr: ["amyl salicylate", "salicylate d'amyle"],
      de: ["amylsalicylat", "amyl salicylate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "anethole",
    inci: "ANETHOLE",
    synonyms: {
      en: ["anethole", "trans-anethole"],
      fr: ["anethole", "anéthole"],
      de: ["anethol", "anethole"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "benzaldehyde",
    inci: "BENZALDEHYDE",
    synonyms: {
      en: ["benzaldehyde"],
      fr: ["benzaldehyde", "benzaldéhyde"],
      de: ["benzaldehyd", "benzaldehyde"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "camphor",
    inci: "CAMPHOR",
    synonyms: {
      en: ["bornan-2-one", "camphor"],
      fr: ["camphor", "camphre"],
      de: ["campher", "camphor"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "beta-caryophyllene",
    inci: "BETA-CARYOPHYLLENE",
    synonyms: {
      en: ["beta-caryophyllene", "caryophyllene"],
      fr: ["beta-caryophyllene", "bêta-caryophyllène"],
      de: ["beta-caryophyllen", "beta-caryophyllene"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "carvone",
    inci: "CARVONE",
    synonyms: {
      en: ["carvone", "d-carvone", "l-carvone"],
      fr: ["carvone"],
      de: ["carvon", "carvone"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "dimethyl-phenethyl-acetate",
    inci: "DIMETHYL PHENETHYL ACETATE",
    synonyms: {
      en: ["dimethyl phenethyl acetate", "dimethylbenzyl carbinyl acetate", "dmbca"],
      fr: ["acétate de diméthylbenzylcarbinyle", "dimethyl phenethyl acetate"],
      de: ["dimethylbenzylcarbinylacetat", "dimethyl phenethyl acetate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "hexadecanolactone",
    inci: "HEXADECANOLACTONE",
    synonyms: {
      en: ["hexadecanolactone", "oxacycloheptadecan-2-one"],
      fr: ["hexadecanolactone", "hexadécanolactone"],
      de: ["hexadecanolacton", "hexadecanolactone"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "hexamethylindanopyran",
    inci: "HEXAMETHYLINDANOPYRAN",
    synonyms: {
      en: ["galaxolide", "hexamethylindanopyran", "hhcb"],
      fr: ["hexamethylindanopyran", "hexaméthylindanopyrane"],
      de: ["hexamethylindanopyran"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "linalyl-acetate",
    inci: "LINALYL ACETATE",
    synonyms: {
      en: ["linalyl acetate"],
      fr: ["acétate de linalyle", "linalyl acetate"],
      de: ["linalylacetat", "linalyl acetate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "menthol",
    inci: "MENTHOL",
    synonyms: {
      en: ["d-menthol", "dl-menthol", "l-menthol", "menthol"],
      fr: ["menthol"],
      de: ["menthol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "trimethylcyclopentenyl-methylisopentenol",
    inci: "TRIMETHYLCYCLOPENTENYL METHYLISOPENTENOL",
    synonyms: {
      en: ["trimethylcyclopentenyl methylisopentenol"],
      fr: ["trimethylcyclopentenyl methylisopentenol", "triméthylcyclopentényl méthylisopenténol"],
      de: ["trimethylcyclopentenyl-methylisopentenol", "trimethylcyclopentenyl methylisopentenol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "salicylaldehyde",
    inci: "SALICYLALDEHYDE",
    synonyms: {
      en: ["o-hydroxybenzaldehyde", "salicylaldehyde"],
      fr: ["salicylaldehyde", "salicylaldéhyde"],
      de: ["salicylaldehyd", "salicylaldehyde"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "santalol",
    inci: "SANTALOL",
    synonyms: {
      en: ["alpha-santalol", "beta-santalol", "santalol"],
      fr: ["santalol"],
      de: ["santalol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "sclareol",
    inci: "SCLAREOL",
    synonyms: {
      en: ["sclareol"],
      fr: ["sclareol", "sclaréol"],
      de: ["sclareol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "terpineol",
    inci: "TERPINEOL",
    synonyms: {
      en: ["alpha-terpineol", "beta-terpineol", "gamma-terpineol", "terpineol"],
      fr: ["terpineol", "terpinéol"],
      de: ["terpineol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "tetramethyl-acetyloctahydronaphthalenes",
    inci: "TETRAMETHYL ACETYLOCTAHYDRONAPHTHALENES",
    synonyms: {
      en: ["iso e super", "otne", "tetramethyl acetyloctahydronaphthalenes"],
      fr: ["tetramethyl acetyloctahydronaphthalenes", "tétraméthyl acétyloctahydronaphtalènes"],
      de: ["tetramethylacetyloctahydronaphthaline", "tetramethyl acetyloctahydronaphthalenes"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "trimethylbenzenepropanol",
    inci: "TRIMETHYLBENZENEPROPANOL",
    synonyms: {
      en: ["majantol", "trimethylbenzenepropanol"],
      fr: ["trimethylbenzenepropanol", "triméthylbenzènepropanol"],
      de: ["trimethylbenzolpropanol", "trimethylbenzenepropanol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "vanillin",
    inci: "VANILLIN",
    synonyms: {
      en: ["vanillin"],
      fr: ["vanillin", "vanilline"],
      de: ["vanillin"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "cananga-odorata",
    inci: "CANANGA ODORATA FLOWER OIL",
    synonyms: {
      en: ["cananga odorata flower extract", "cananga odorata flower oil", "ylang ylang oil"],
      fr: ["cananga odorata flower oil", "huile d'ylang-ylang"],
      de: ["ylang-ylang-öl", "cananga odorata flower oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "cinnamomum-cassia-leaf-oil",
    inci: "CINNAMOMUM CASSIA LEAF OIL",
    synonyms: {
      en: ["cassia leaf oil", "cinnamomum cassia leaf oil"],
      fr: ["cinnamomum cassia leaf oil", "huile de feuille de cannelle de chine"],
      de: ["cassiablätteröl", "cinnamomum cassia leaf oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "cinnamomum-zeylanicum-bark-oil",
    inci: "CINNAMOMUM ZEYLANICUM BARK OIL",
    synonyms: {
      en: ["cinnamomum zeylanicum bark oil", "cinnamon bark oil"],
      fr: ["cinnamomum zeylanicum bark oil", "huile d'écorce de cannelle"],
      de: ["zimtrindenöl", "cinnamomum zeylanicum bark oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "citrus-aurantium-flower-oil",
    inci: "CITRUS AURANTIUM AMARA FLOWER OIL",
    synonyms: {
      en: ["citrus aurantium amara flower oil", "neroli oil", "orange flower oil"],
      fr: ["citrus aurantium amara flower oil", "huile de néroli"],
      de: ["neroliöl", "citrus aurantium amara flower oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "citrus-aurantium-peel-oil",
    inci: "CITRUS AURANTIUM AMARA PEEL OIL",
    synonyms: {
      en: [
        "bitter orange peel oil",
        "citrus aurantium amara peel oil",
        "citrus aurantium dulcis peel oil",
      ],
      fr: ["citrus aurantium amara peel oil", "huile d'écorce d'orange"],
      de: ["orangenschalenöl", "citrus aurantium amara peel oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "citrus-aurantium-bergamia-peel-oil",
    inci: "CITRUS AURANTIUM BERGAMIA PEEL OIL",
    synonyms: {
      en: ["bergamot oil", "citrus aurantium bergamia peel oil"],
      fr: ["citrus aurantium bergamia peel oil", "huile de bergamote"],
      de: ["bergamotteöl", "citrus aurantium bergamia peel oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "citrus-limon-peel-oil",
    inci: "CITRUS LIMON PEEL OIL",
    synonyms: {
      en: ["citrus limon peel oil", "lemon oil", "lemon peel oil"],
      fr: ["citrus limon peel oil", "huile essentielle de citron"],
      de: ["zitronenöl", "citrus limon peel oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "cymbopogon-oils",
    inci: "CYMBOPOGON SCHOENANTHUS OIL",
    synonyms: {
      en: [
        "cymbopogon citratus oil",
        "cymbopogon flexuosus oil",
        "cymbopogon schoenanthus oil",
        "lemongrass oil",
      ],
      fr: ["cymbopogon schoenanthus oil", "huile de lemongrass"],
      de: ["lemongrasöl", "cymbopogon schoenanthus oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "eucalyptus-globulus-leaf-oil",
    inci: "EUCALYPTUS GLOBULUS LEAF OIL",
    synonyms: {
      en: ["eucalyptus globulus leaf oil", "eucalyptus oil"],
      fr: ["eucalyptus globulus leaf oil", "huile d'eucalyptus"],
      de: ["eukalyptusöl", "eucalyptus globulus leaf oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "eugenia-caryophyllus-oil",
    inci: "EUGENIA CARYOPHYLLUS LEAF OIL",
    synonyms: {
      en: ["clove oil", "eugenia caryophyllus flower oil", "eugenia caryophyllus leaf oil"],
      fr: ["eugenia caryophyllus leaf oil", "huile de girofle"],
      de: ["nelkenöl", "eugenia caryophyllus leaf oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "jasminum-oil-extract",
    inci: "JASMINUM OFFICINALE OIL",
    synonyms: {
      en: [
        "jasmine oil",
        "jasminum grandiflorum flower extract",
        "jasminum officinale flower extract",
        "jasminum officinale oil",
      ],
      fr: ["huile de jasmin", "jasminum officinale oil"],
      de: ["jasminöl", "jasminum officinale oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "juniperus-virginiana-oil",
    inci: "JUNIPERUS VIRGINIANA OIL",
    synonyms: {
      en: ["cedarwood oil virginia", "juniperus virginiana oil", "juniperus virginiana wood oil"],
      fr: ["huile de cèdre de virginie", "juniperus virginiana oil"],
      de: ["virginia-zedernholzöl", "juniperus virginiana oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "laurus-nobilis-leaf-oil",
    inci: "LAURUS NOBILIS LEAF OIL",
    synonyms: {
      en: ["bay laurel leaf oil", "laurus nobilis leaf oil"],
      fr: ["huile de feuille de laurier", "laurus nobilis leaf oil"],
      de: ["lorbeerblätteröl", "laurus nobilis leaf oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "lavandula-oil-extract",
    inci: "LAVANDULA HYBRIDA OIL",
    synonyms: {
      en: [
        "lavandin oil",
        "lavandula angustifolia flower/leaf/stem extract",
        "lavandula angustifolia oil",
        "lavandula hybrida extract",
        "lavandula hybrida flower extract",
        "lavandula hybrida oil",
        "lavandula intermedia oil",
        "lavender oil",
      ],
      fr: ["huile de lavande", "lavandula hybrida oil"],
      de: ["lavendelöl", "lavandula hybrida oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "mentha-piperita-oil",
    inci: "MENTHA PIPERITA OIL",
    synonyms: {
      en: ["mentha piperita oil", "peppermint oil"],
      fr: ["huile de menthe poivrée", "mentha piperita oil"],
      de: ["pfefferminzöl", "mentha piperita oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "mentha-viridis-leaf-oil",
    inci: "MENTHA VIRIDIS LEAF OIL",
    synonyms: {
      en: ["mentha spicata oil", "mentha viridis leaf oil", "spearmint oil"],
      fr: ["huile de menthe verte", "mentha viridis leaf oil"],
      de: ["krauseminzöl", "mentha viridis leaf oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "narcissus-extract",
    inci: "NARCISSUS POETICUS EXTRACT",
    synonyms: {
      en: [
        "narcissus jonquilla extract",
        "narcissus poeticus extract",
        "narcissus pseudonarcissus extract",
        "narcissus tazetta extract",
      ],
      fr: ["extrait de narcisse", "narcissus poeticus extract"],
      de: ["narzissenextrakt", "narcissus poeticus extract"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "pelargonium-graveolens-flower-oil",
    inci: "PELARGONIUM GRAVEOLENS FLOWER OIL",
    synonyms: {
      en: ["geranium oil", "pelargonium graveolens flower oil"],
      fr: ["huile de géranium", "pelargonium graveolens flower oil"],
      de: ["geraniumöl", "pelargonium graveolens flower oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "pogostemon-cablin-oil",
    inci: "POGOSTEMON CABLIN OIL",
    synonyms: {
      en: ["patchouli oil", "pogostemon cablin oil"],
      fr: ["huile de patchouli", "pogostemon cablin oil"],
      de: ["patchouliöl", "pogostemon cablin oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "rosa-damascena-flower-oil",
    inci: "ROSA DAMASCENA FLOWER OIL",
    synonyms: {
      en: ["rosa damascena flower extract", "rosa damascena flower oil", "rose oil"],
      fr: ["huile de rose de damas", "rosa damascena flower oil"],
      de: ["damaszener rosenöl", "rosa damascena flower oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "santalum-album-oil",
    inci: "SANTALUM ALBUM OIL",
    synonyms: {
      en: ["sandalwood oil", "santalum album oil"],
      fr: ["huile de santal", "santalum album oil"],
      de: ["sandelholzöl", "santalum album oil"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "eugenyl-acetate",
    inci: "EUGENYL ACETATE",
    synonyms: {
      en: ["eugenyl acetate"],
      fr: ["acétate d'eugényle", "eugenyl acetate"],
      de: ["eugenylacetat", "eugenyl acetate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "geranyl-acetate",
    inci: "GERANYL ACETATE",
    synonyms: {
      en: ["geranyl acetate"],
      fr: ["acétate de géranyle", "geranyl acetate"],
      de: ["geranylacetat", "geranyl acetate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "isoeugenyl-acetate",
    inci: "ISOEUGENYL ACETATE",
    synonyms: {
      en: ["isoeugenyl acetate"],
      fr: ["acétate d'isoeugényle", "isoeugenyl acetate"],
      de: ["isoeugenylacetat", "isoeugenyl acetate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "pinene",
    inci: "PINENE",
    synonyms: {
      en: ["alpha-pinene", "beta-pinene", "pinene"],
      fr: ["pinene", "pinène"],
      de: ["pinen", "pinene"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "Fragrance allergen added to EU Annex III by Reg. 2023/1545: must be named on the label above 0.001% (leave-on) or 0.01% (rinse-off); new products from 31 July 2026, all by 31 July 2028.",
      fr: "Allergène parfumant ajouté à l'annexe III par le règl. 2023/1545 : à indiquer sur l'étiquette au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; produits neufs dès le 31/07/2026, tous au 31/07/2028.",
      de: "Duftstoffallergen, durch VO 2023/1545 in Anhang III aufgenommen: ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren; neue Produkte ab 31.07.2026, alle ab 31.07.2028.",
    },
    sources: [
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "amyl-cinnamal",
    inci: "AMYL CINNAMAL",
    synonyms: {
      en: ["amyl cinnamal", "amylcinnamaldehyde"],
      fr: ["amyl cinnamal", "amylcinnamal"],
      de: ["amylzimtaldehyd", "amyl cinnamal"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "amylcinnamyl-alcohol",
    inci: "AMYLCINNAMYL ALCOHOL",
    synonyms: {
      en: ["amyl cinnamyl alcohol", "amylcinnamyl alcohol"],
      fr: ["alcool amylcinnamylique", "amylcinnamyl alcohol"],
      de: ["amylzimtalkohol", "amylcinnamyl alcohol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "anise-alcohol",
    inci: "ANISE ALCOHOL",
    synonyms: {
      en: ["anise alcohol", "anisyl alcohol"],
      fr: ["alcool anisique", "anise alcohol"],
      de: ["anisalkohol", "anise alcohol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "benzyl-alcohol",
    inci: "BENZYL ALCOHOL",
    synonyms: {
      en: ["benzyl alcohol"],
      fr: ["alcool benzylique", "benzyl alcohol"],
      de: ["benzylalkohol", "benzyl alcohol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "benzyl-benzoate",
    inci: "BENZYL BENZOATE",
    synonyms: {
      en: ["benzyl benzoate"],
      fr: ["benzoate de benzyle", "benzyl benzoate"],
      de: ["benzylbenzoat", "benzyl benzoate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "benzyl-cinnamate",
    inci: "BENZYL CINNAMATE",
    synonyms: {
      en: ["benzyl cinnamate"],
      fr: ["benzyl cinnamate", "cinnamate de benzyle"],
      de: ["benzylcinnamat", "benzyl cinnamate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "benzyl-salicylate",
    inci: "BENZYL SALICYLATE",
    synonyms: {
      en: ["benzyl salicylate"],
      fr: ["benzyl salicylate", "salicylate de benzyle"],
      de: ["benzylsalicylat", "benzyl salicylate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "cinnamal",
    inci: "CINNAMAL",
    synonyms: {
      en: ["cinnamal", "cinnamaldehyde"],
      fr: ["cinnamal", "cinnamaldéhyde"],
      de: ["zimtaldehyd", "cinnamal"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "cinnamyl-alcohol",
    inci: "CINNAMYL ALCOHOL",
    synonyms: {
      en: ["cinnamyl alcohol"],
      fr: ["alcool cinnamique", "cinnamyl alcohol"],
      de: ["zimtalkohol", "cinnamyl alcohol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "citral",
    inci: "CITRAL",
    synonyms: {
      en: ["citral", "geranial", "neral"],
      fr: ["citral"],
      de: ["citral"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "citronellol",
    inci: "CITRONELLOL",
    synonyms: {
      en: ["citronellol"],
      fr: ["citronellol"],
      de: ["citronellol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "coumarin",
    inci: "COUMARIN",
    synonyms: {
      en: ["coumarin"],
      fr: ["coumarin", "coumarine"],
      de: ["cumarin", "coumarin"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "eugenol",
    inci: "EUGENOL",
    synonyms: {
      en: ["eugenol"],
      fr: ["eugenol", "eugénol"],
      de: ["eugenol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "farnesol",
    inci: "FARNESOL",
    synonyms: {
      en: ["farnesol"],
      fr: ["farnesol", "farnésol"],
      de: ["farnesol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "geraniol",
    inci: "GERANIOL",
    synonyms: {
      en: ["geraniol"],
      fr: ["geraniol", "géraniol"],
      de: ["geraniol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "hexyl-cinnamal",
    inci: "HEXYL CINNAMAL",
    synonyms: {
      en: ["hexyl cinnamal", "hexyl cinnamaldehyde"],
      fr: ["hexyl cinnamal", "hexylcinnamaldéhyde"],
      de: ["hexylzimtaldehyd", "hexyl cinnamal"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "hydroxycitronellal",
    inci: "HYDROXYCITRONELLAL",
    synonyms: {
      en: ["hydroxycitronellal"],
      fr: ["hydroxycitronellal"],
      de: ["hydroxycitronellal"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "isoeugenol",
    inci: "ISOEUGENOL",
    synonyms: {
      en: ["isoeugenol"],
      fr: ["isoeugenol", "isoeugénol"],
      de: ["isoeugenol"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "alpha-isomethyl-ionone",
    inci: "ALPHA-ISOMETHYL IONONE",
    synonyms: {
      en: ["alpha-isomethyl ionone", "isomethyl ionone"],
      fr: ["alpha-isomethyl ionone", "alpha-isométhylionone"],
      de: ["alpha-isomethylionon", "alpha-isomethyl ionone"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "limonene",
    inci: "LIMONENE",
    synonyms: {
      en: ["d-limonene", "dipentene", "dl-limonene", "limonene"],
      fr: ["limonene", "limonène"],
      de: ["limonen", "limonene"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "linalool",
    inci: "LINALOOL",
    synonyms: {
      en: ["linalool"],
      fr: ["linalol", "linalool"],
      de: ["linalool"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "methyl-2-octynoate",
    inci: "METHYL 2-OCTYNOATE",
    synonyms: {
      en: ["methyl 2-octynoate", "methyl heptine carbonate"],
      fr: ["2-octynoate de méthyle", "methyl 2-octynoate"],
      de: ["methyl-2-octinoat", "methyl 2-octynoate"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "evernia-prunastri-extract",
    inci: "EVERNIA PRUNASTRI EXTRACT",
    synonyms: {
      en: ["evernia prunastri extract", "oak moss extract", "oakmoss extract"],
      fr: ["evernia prunastri extract", "extrait de mousse de chêne"],
      de: ["eichenmoosextrakt", "evernia prunastri extract"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
  {
    id: "evernia-furfuracea-extract",
    inci: "EVERNIA FURFURACEA EXTRACT",
    synonyms: {
      en: ["evernia furfuracea extract", "tree moss extract", "treemoss extract"],
      fr: ["evernia furfuracea extract", "extrait de mousse d'arbre"],
      de: ["baummoosextrakt", "evernia furfuracea extract"],
    },
    categories: ["fragrance-allergen"],
    summary: {
      en: "One of the 24 fragrance allergens EU law already required on labels above 0.001% (leave-on) or 0.01% (rinse-off); kept on the expanded list of Reg. 2023/1545.",
      fr: "L'un des 24 allergènes parfumants déjà à déclarer dans l'UE au-delà de 0,001 % (sans rinçage) ou 0,01 % (rincé) ; maintenu sur la liste élargie du règl. 2023/1545.",
      de: "Eines der 24 Duftstoffallergene, die in der EU schon ab 0,001 % (Leave-on) bzw. 0,01 % (Rinse-off) zu deklarieren waren; bleibt auf der erweiterten Liste der VO 2023/1545.",
    },
    sources: [
      {
        org: "Cosmacon GmbH",
        year: 2024,
        title: "Allergenic fragrances – CR 2023/1545 (list of declarable fragrance allergens)",
        url: "https://www.cosmacon.de/en/glossary/allergenic-fragrances/",
      },
      {
        org: "European Commission",
        year: 2023,
        title: "Commission Regulation (EU) 2023/1545 on labelling of fragrance allergens",
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1545",
      },
    ],
  },
];
