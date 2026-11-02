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
  findOnline,
  type LabelAnswer,
  type OnlineAnswer,
  productFacts,
  productFromLabel,
  productFromOnline,
  readLabel,
  WEB_SEARCH_RULE,
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

const caps = (vision: boolean, webSearch = false) =>
  resolveCapabilities({
    kind: "openai",
    modelId: "gpt-test",
    override: { vision, webSearch: webSearch ? "openai:web_search" : null },
  });

/** A model answering each call in turn, the first with the pages it read. */
function researching(answers: string[], urls: string[] = []) {
  const calls: { prompt: unknown; tools: string[] }[] = [];
  const model = new MockLanguageModelV4({
    doGenerate: async (opts) => {
      const n = calls.length;
      calls.push({ prompt: opts.prompt, tools: (opts.tools ?? []).map((t) => t.name) });
      return {
        content: [
          ...(n === 0
            ? urls.map((url, i) => ({
                type: "source" as const,
                sourceType: "url" as const,
                id: String(i),
                url,
                title: `Page ${i}`,
              }))
            : []),
          { type: "text" as const, text: answers[n] ?? "" },
        ],
        finishReason: { unified: "stop", raw: "stop" },
        usage: {
          inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 10, text: 10, reasoning: 0 },
        },
        warnings: [],
      };
    },
  });
  return { model, calls };
}

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
    expect(out.text).toBe("- Viel Zucker\n- Hochverarbeitet");
    expect(out.sources).toEqual([]);
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

  test("search mode: the provider's web search goes with the question, its pages come back", async () => {
    const p = normalize(RAW.nutellaFr, "off", "fr");
    const facts = productFacts(p, scoreProduct(p), null);
    const { model, calls } = researching(
      ["Rappel en 2026 (source : web)."],
      ["https://example.org/rappel", "https://example.org/rappel", "ftp://nope"],
    );
    const out = await explainProduct(
      { settings, model, capabilities: caps(false, true) },
      facts,
      "fr",
      "Des rappels ?",
      false,
      true,
    );
    expect(calls[0]?.tools).toEqual(["web_search"]);
    expect(JSON.stringify(calls[0]?.prompt)).toContain(WEB_SEARCH_RULE);
    expect(out.sources).toEqual([{ url: "https://example.org/rappel", title: "Page 0" }]);
    // Without the mode, no tool.
    const plain = researching(["ok"]);
    await explainProduct(
      { settings, model: plain.model, capabilities: caps(false, true) },
      facts,
      "fr",
    );
    expect(plain.calls[0]?.tools).toEqual([]);
  });

  test("search mode needs a model that searches the web", async () => {
    const { model, calls } = researching(["x"]);
    await expect(
      findOnline({ settings, model, capabilities: caps(false) }, { code: "1234567890128" }, "en"),
    ).rejects.toBeInstanceOf(AiError);
    expect(calls).toHaveLength(0);
  });

  test("a product found on the web: researched, then read, then scored like a label", async () => {
    const found: OnlineAnswer = {
      ...label,
      found: true,
      kind: "food",
      code: "1234567890128",
      ingredients: label.ingredients,
    };
    const { model, calls } = researching(
      [
        "Granola maison, Test. Per 100 g: 450 kcal… Sources: https://shop.example/granola",
        JSON.stringify(found),
      ],
      ["https://shop.example/granola"],
    );
    const result = await findOnline(
      { settings, model, capabilities: caps(false, true) },
      { code: "1234567890128" },
      "fr",
    );
    expect(calls.map((c) => c.tools)).toEqual([["web_search"], []]);
    expect(JSON.stringify(calls[0]?.prompt)).toContain("barcode 1234567890128");
    expect(JSON.stringify(calls[1]?.prompt)).toContain("Per 100 g: 450 kcal");
    const p = productFromOnline(result, "1234567890128");
    expect(p).toMatchObject({ source: "label", estimated: true, code: "1234567890128" });
    expect(p?.webSources).toEqual([{ url: "https://shop.example/granola", title: "Page 0" }]);
    expect(p && scoreProduct(p).value).not.toBeNull();

    // By name: the barcode the pages gave becomes the product's.
    expect(productFromOnline(result, "")?.code).toBe("1234567890128");
    // Nothing usable: no product.
    expect(productFromOnline({ answer: { ...found, found: false }, sources: [] }, "1")).toBeNull();
    expect(productFromOnline({ answer: { ...found, kind: "other" }, sources: [] }, "1")).toBeNull();
    const empty = {
      ...found,
      ingredients: null,
      per100: Object.fromEntries(Object.keys(found.per100).map((k) => [k, null])),
    } as OnlineAnswer;
    expect(productFromOnline({ answer: empty, sources: [] }, "1")).toBeNull();
  });

  test("a cosmetic found on the web is scored from its ingredient list", () => {
    const cosmetic: OnlineAnswer = {
      ...label,
      found: true,
      kind: "cosmetic",
      code: null,
      name: "Crème test",
      ingredients: "Aqua, Glycerin, Parfum, Limonene, Linalool, Butylphenyl Methylpropional",
    };
    const p = productFromOnline({ answer: cosmetic, sources: [] }, "3600000000009");
    expect(p).toMatchObject({ source: "obf", estimated: true, name: "Crème test" });
    expect(p?.webSources).toBeUndefined();
    const s = p ? scoreProduct(p) : null;
    expect(s?.value).not.toBeNull();
    expect(s?.cosmetic?.length).toBeGreaterThan(0);
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
