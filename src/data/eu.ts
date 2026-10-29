/**
 * Additives found on products sold elsewhere that the EU does not allow (or no
 * longer allows) in food. The OFF taxonomy carries no flag for this, so it is
 * kept here by hand, each with the reason. Checked against the EU additives
 * list (Regulation (EC) No 1333/2008, Annex II) and the decisions cited.
 */
export const EU_NOT_AUTHORISED: Record<string, string> = {
  // Commission Regulation (EU) 2022/63, after EFSA's 2021 opinion (genotoxicity not ruled out).
  "en:e171": "Titanium dioxide — banned in EU food since 2022 (EFSA 2021).",
  // Never on the EU list; the US FDA revoked it in 2024 too.
  "en:e443": "Brominated vegetable oil — not authorised in the EU.",
  // Potassium bromate: not authorised in the EU (carcinogen in animals).
  "en:e924": "Potassium bromate — not authorised in the EU.",
  // Azodicarbonamide: flour treatment agent, not authorised in the EU.
  "en:e927a": "Azodicarbonamide — not authorised in the EU.",
  // Propyl parabens: removed from the EU list in 2006 (Directive 2006/52/EC).
  "en:e216": "Propyl paraben — removed from the EU list in 2006.",
  "en:e217": "Sodium propyl paraben — removed from the EU list in 2006.",
};
