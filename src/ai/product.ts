/**
 * What a model adds, when the user connected one: a plain-words explanation
 * of the score, answers about the product, and a label read from a photo when
 * the databases know too little. The score itself never comes from the model:
 * label values go through the same scoreProduct as database values.
 */
import type { ModelMessage } from "ai";
import { languageName } from "llm-connect";
import { z } from "zod";
import { SWEETENERS } from "../data/off";
import type { Nutriments, Product } from "../data/product";
import type { Match } from "../score/match";
import type { Score } from "../score/score";
import { type CallContext, structured, text } from "./call";
import type { ModelImage } from "./image";

/** The facts a model gets: what the page shows, nothing about the user beyond what they set. */
export function productFacts(p: Product, score: Score, match: Match | null): string {
  const facts = {
    name: p.name,
    brands: p.brands,
    quantity: p.quantity,
    categories: p.categories.slice(0, 8),
    ingredients: p.ingredients?.slice(0, 1500),
    nutrimentsPer100: p.nutriments,
    servingGrams: p.servingGrams,
    isBeverage: p.isBeverage,
    nutriscore: score.nutri,
    nova: p.nova,
    additives: score.additives.map((a) => ({
      code: a.code,
      name: a.names.en,
      efsaOverexposureRisk: a.risk,
      notAuthorisedInEU: a.euNotAuthorised,
      science: a.evidence?.map((e) => ({
        kind: e.kind,
        concern: e.concern,
        finding: e.summary.en,
        source: `${e.source.org} ${e.source.year}`,
      })),
    })),
    allergens: p.allergens,
    traces: p.traces,
    labels: p.labels.slice(0, 10),
    goodscanScore: score.value,
    verdict: score.verdict,
    reasons: score.reasons,
    ingredientsOfConcern: score.cosmetic?.map((f) => ({
      inci: f.ingredient.inci,
      category: f.category,
      why: f.ingredient.summary.en,
    })),
    estimatedFromPhoto: p.estimated,
    personalMatch: match
      ? {
          status: match.status,
          score: match.score,
          rulesOut: match.failed.map((a) => a.title),
          toCheck: match.doubtful.map((a) => a.title),
        }
      : undefined,
  };
  return JSON.stringify(facts);
}

const COSMETIC_INSTRUCTIONS = [
  "You are a careful cosmetic-safety advisor explaining a cosmetic's ingredient score to a shopper, in a phone app.",
  "Use only the facts given (from Open Beauty Facts and goodscan's score). Never invent ingredients or rules; say when data is missing.",
  "goodscan's ingredient score (0–100) starts at 100 and removes points for ingredients banned or restricted in EU cosmetics, CMR substances, endocrine disruptors identified in the EU, PFAS, US state bans and fragrance allergens to label.",
  "Answer in 3 to 6 short lines: the main reasons, then one practical tip (patch test, fragrance-free choice, what to look for on the label). If a question is asked, answer it first.",
  "Plain text only: no Markdown headings, no tables; a line may start with '- '.",
  "You are not a doctor: for skin conditions, pregnancy or children, add one short line suggesting to ask a professional.",
];

export function explainInstructions(language: string, cosmetic = false): string {
  if (cosmetic) return [...COSMETIC_INSTRUCTIONS, `Write in ${languageName(language)}.`].join("\n");
  return [
    "You are a careful dietitian explaining a food product's health score to a shopper, in a phone app.",
    "Use only the facts given (from Open Food Facts and goodscan's score). Never invent values; say when data is missing.",
    "goodscan's score (0–100) starts from the 2023 Nutri-Score, then removes points for ultra-processing (NOVA) and additives with an EFSA overexposure risk, not authorised in the EU, or with an official position of concern or concordant human studies (the 'science' findings given), or classified by official lists (IARC, EU CLP carcinogenic/mutagenic/reprotoxic, EU endocrine-disruptor lists), processed meat (IARC group 1) and red meat (IARC group 2A), with small adjustments for organic and palm oil.",
    "Answer in 3 to 6 short lines: the main reasons, then one practical tip (portion, how often, or what kind of product to choose instead). If a question is asked, answer it first.",
    "Plain text only: no Markdown headings, no tables; a line may start with '- '.",
    "You are not a doctor: for medical conditions, pregnancy or children, add one short line suggesting to ask a professional.",
    `Write in ${languageName(language)}.`,
  ].join("\n");
}

export async function explainProduct(
  ctx: CallContext,
  facts: string,
  language: string,
  question?: string,
  cosmetic = false,
): Promise<string> {
  const ask = question?.trim();
  return text(ctx, explainInstructions(language, cosmetic), [
    {
      role: "user",
      content: `Product facts (JSON): ${facts}\n\n${ask ? `My question: ${ask}` : "Explain this score."}`,
    },
  ]);
}

const per100 = z.number().min(0).nullable();

export const labelSchema = z.object({
  name: z.string().describe("Product name as printed, or a short description"),
  brands: z.string().nullable(),
  isBeverage: z.boolean().describe("A drink (values per 100 ml)"),
  per100: z
    .object({
      energyKcal: per100,
      fat: per100,
      saturatedFat: per100,
      sugars: per100,
      addedSugars: per100,
      salt: per100.describe("Salt in g; if only sodium is printed, sodium × 2.5"),
      fiber: per100,
      proteins: per100,
      fruitsVeg: per100.describe(
        "% fruits, vegetables and legumes, estimated from the ingredients",
      ),
    })
    .describe(
      "Per 100 g or 100 ml. Convert from per serving when only that is printed. null when not visible.",
    ),
  servingGrams: z.number().positive().nullable(),
  ingredients: z.string().nullable().describe("The ingredient list as printed"),
  additives: z
    .array(z.string())
    .describe(
      "E-numbers of additives in the ingredients, lowercase like 'e330'; map names to E-numbers",
    ),
  allergens: z
    .array(z.string())
    .describe(
      "Allergens in the ingredients, English, lowercase: gluten, milk, eggs, nuts, peanuts, soybeans…",
    ),
  nova: z
    .number()
    .int()
    .min(1)
    .max(4)
    .nullable()
    .describe("NOVA group guessed from the ingredients"),
  organic: z.boolean(),
  confidence: z.enum(["low", "medium", "high"]),
});

export type LabelAnswer = z.infer<typeof labelSchema>;

export function labelInstructions(language: string): string {
  return [
    "You read food labels from photos for a health app.",
    "Read the nutrition facts table and the ingredient list exactly; do not guess values that are not visible (use null).",
    "Values must be per 100 g (or 100 ml for drinks). US labels give values per serving: divide by the serving size in grams and multiply by 100.",
    "Salt in grams. If only sodium is shown (mg), salt = sodium in g × 2.5.",
    "List additives as E-numbers (e.g. citric acid → e330, potassium sorbate → e202, titanium dioxide → e171).",
    `Write the name in the label's language or in ${languageName(language)}.`,
  ].join("\n");
}

export async function readLabel(
  ctx: CallContext,
  image: ModelImage,
  language: string,
): Promise<LabelAnswer> {
  const messages: ModelMessage[] = [
    {
      role: "user",
      content: [
        { type: "text", text: "Read this food label." },
        { type: "file", mediaType: image.mediaType, data: { type: "data", data: image.data } },
      ],
    },
  ];
  return structured(ctx, labelSchema, "food_label", labelInstructions(language), messages);
}

/**
 * A label made into a product: on its own (unknown barcode) or filling in
 * what the database lacks (database values win where both exist).
 */
export function productFromLabel(label: LabelAnswer, code: string, base?: Product): Product {
  const n: Nutriments = {};
  for (const [k, v] of Object.entries(label.per100) as [keyof Nutriments, number | null][]) {
    if (v !== null) n[k] = v;
  }
  if (n.energyKcal !== undefined) n.energyKj = n.energyKcal * 4.184;
  const tag = (s: string) => `en:${s.toLowerCase().replace(/\s+/g, "-")}`;
  const product: Product = base
    ? { ...base, nutriments: { ...n, ...base.nutriments } }
    : {
        code,
        source: "label",
        name: label.name,
        countries: [],
        categories: [],
        labels: label.organic ? ["en:organic"] : [],
        additives: [...new Set(label.additives.map((a) => tag(a.replace(/^en:/, ""))))],
        allergens: label.allergens.map(tag),
        traces: [],
        analysis: [],
        nutriments: n,
        isBeverage: label.isBeverage,
        isWater: false,
        nutriscoreNotApplicable: false,
        sweeteners: false,
        attributes: [],
      };
  if (!base) {
    if (label.brands) product.brands = label.brands;
    if (label.ingredients) product.ingredients = label.ingredients;
    if (label.servingGrams) product.servingGrams = label.servingGrams;
    if (label.nova === 1 || label.nova === 2 || label.nova === 3 || label.nova === 4)
      product.nova = label.nova;
  } else {
    if (!base.ingredients && label.ingredients) product.ingredients = label.ingredients;
    if (!base.additives.length && label.additives.length)
      product.additives = label.additives.map((a) => tag(a.replace(/^en:/, "")));
    if (!base.nova && label.nova) product.nova = label.nova as 1 | 2 | 3 | 4;
  }
  product.sweeteners = product.additives.some((a) => SWEETENERS.has(a));
  product.estimated = true;
  return product;
}

export const cosmeticLabelSchema = z.object({
  name: z.string().nullable().describe("Product name as printed"),
  ingredients: z
    .string()
    .describe(
      "The INCI ingredient list exactly as printed, comma-separated, in its order; empty when none is visible",
    ),
  confidence: z.enum(["low", "medium", "high"]),
});

export type CosmeticLabelAnswer = z.infer<typeof cosmeticLabelSchema>;

export function cosmeticLabelInstructions(): string {
  return [
    "You read the ingredient list (INCI) of cosmetics from photos for a health app.",
    "Copy the list exactly, in its order, with the names as printed (Aqua, Parfum, CI 77891…); separate items with commas.",
    "Leave out everything that is not an ingredient: directions, warnings, addresses, batch numbers.",
    "Do not guess hidden or cut-off names; never add an ingredient that is not visible.",
  ].join("\n");
}

export async function readCosmeticLabel(
  ctx: CallContext,
  image: ModelImage,
): Promise<CosmeticLabelAnswer> {
  const messages: ModelMessage[] = [
    {
      role: "user",
      content: [
        { type: "text", text: "Read this cosmetic's ingredient list." },
        { type: "file", mediaType: image.mediaType, data: { type: "data", data: image.data } },
      ],
    },
  ];
  return structured(
    ctx,
    cosmeticLabelSchema,
    "cosmetic_label",
    cosmeticLabelInstructions(),
    messages,
  );
}

/** The list read from a photo, on the product the database gave: it goes through scoreCosmetic. */
export function productFromCosmeticLabel(label: CosmeticLabelAnswer, base: Product): Product {
  const product: Product = { ...base, estimated: true };
  const ingredients = label.ingredients.trim();
  if (ingredients) product.ingredients = ingredients;
  if (!base.name && label.name) product.name = label.name;
  return product;
}
