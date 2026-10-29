import { describe, expect, test } from "bun:test";
import { MockLanguageModelV4 } from "ai/test";
import { type LlmSettings, resolveCapabilities } from "llm-connect";
import { RAW } from "../data/fixtures";
import { normalize } from "../data/off";
import { DEFAULT_PREFERENCES, matchProduct } from "../score/match";
import { scoreProduct } from "../score/score";
import { AiError } from "./call";
import {
  explainProduct,
  type LabelAnswer,
  productFacts,
  productFromLabel,
  readLabel,
} from "./product";
import { proxySettings } from "./settings";

const settings: LlmSettings = {
  apiKey: "sk-test-123456",
  model: "gpt-test",
  providerId: "openai",
  providerNpm: "@ai-sdk/openai",
};

function answering(text: string) {
  const prompts: unknown[] = [];
  const model = new MockLanguageModelV4({
    doGenerate: async (opts) => {
      prompts.push(opts.prompt);
      return {
        content: [{ type: "text", text }],
        finishReason: { unified: "stop", raw: "stop" },
        usage: {
          inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 10, text: 10, reasoning: 0 },
        },
        warnings: [],
      };
    },
  });
  return { model, prompts };
}

const caps = (vision: boolean) =>
  resolveCapabilities({ kind: "openai", modelId: "gpt-test", override: { vision } });

const label: LabelAnswer = {
  name: "Granola maison",
  brands: "Test",
  isBeverage: false,
  per100: {
    energyKcal: 450,
    fat: 18,
    saturatedFat: 3,
    sugars: 22,
    addedSugars: null,
    salt: 0.3,
    fiber: 7,
    proteins: 9,
    fruitsVeg: null,
  },
  servingGrams: 40,
  ingredients: "avoine, sucre, huile de tournesol, noisettes, E322",
  additives: ["E322"],
  allergens: ["gluten", "nuts"],
  nova: 3,
  organic: true,
  confidence: "high",
};

describe("AI", () => {
  test("explains from the facts, in the user's language", async () => {
    const p = normalize(RAW.nutellaDe, "off", "de");
    const score = scoreProduct(p);
    const facts = productFacts(p, score, matchProduct(p, DEFAULT_PREFERENCES));
    const { model, prompts } = answering("- Viel Zucker\n- Hochverarbeitet");
    const out = await explainProduct(
      { settings, model, capabilities: caps(false) },
      facts,
      "de",
      "Für Kinder?",
    );
    expect(out).toBe("- Viel Zucker\n- Hochverarbeitet");
    const prompt = JSON.stringify(prompts[0]);
    expect(prompt).toContain("German");
    expect(prompt).toContain("Für Kinder?");
    expect(prompt).toContain("goodscanScore");
    expect(prompt).not.toContain("sk-test");
  });

  test("reads a label and the same score applies", async () => {
    const { model } = answering(JSON.stringify(label));
    const image = { data: new Uint8Array([1, 2, 3]), mediaType: "image/jpeg" };
    const answer = await readLabel({ settings, model, capabilities: caps(true) }, image, "fr");
    const p = productFromLabel(answer, "1234567890128");
    expect(p).toMatchObject({
      source: "label",
      estimated: true,
      additives: ["en:e322"],
      nova: 3,
      servingGrams: 40,
    });
    expect(p.allergens).toEqual(["en:gluten", "en:nuts"]);
    const s = scoreProduct(p);
    expect(s.nutri?.computed).toBe(true);
    expect(s.value).not.toBeNull();
    expect(s.reasons.map((r) => r.key)).toContain("organic");
  });

  test("a photo needs a vision model", async () => {
    const { model } = answering("{}");
    const image = { data: new Uint8Array([1]), mediaType: "image/jpeg" };
    await expect(
      readLabel({ settings, model, capabilities: caps(false) }, image, "en"),
    ).rejects.toBeInstanceOf(AiError);
  });

  test("a label fills in what the database lacks, database values win", () => {
    const base = normalize(
      { code: "1", product_name: "X", nutriments: { sugars_100g: 10 } },
      "off",
      "en",
    );
    const p = productFromLabel(label, "1", base);
    expect(p.name).toBe("X");
    expect(p.source).toBe("off");
    expect(p.nutriments.sugars).toBe(10);
    expect(p.nutriments.salt).toBe(0.3);
  });

  test("a site proxy, only with a valid endpoint", () => {
    expect(proxySettings(undefined, undefined)).toBeNull();
    expect(proxySettings("not a url", "m")).toBeNull();
    expect(proxySettings("https://proxy.example/v1", "small")).toMatchObject({
      apiKey: "",
      customEndpoint: "https://proxy.example/v1",
      customModel: "small",
    });
  });
});
