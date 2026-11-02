import { readFileSync } from "node:fs";
import { type BrowserContext, expect, type Page, test } from "@playwright/test";
import { ean13Modules } from "./barcode-video";

const ENDPOINT = "https://llm.test/v1";

const fixture = (code: string, dir = "src/data/fixtures") => {
  try {
    return JSON.parse(readFileSync(`${dir}/${code}.json`, "utf8"));
  } catch {
    return null;
  }
};

const LABEL = {
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
  ingredients: "oats, sugar, sunflower oil, hazelnuts",
  additives: [],
  allergens: ["gluten", "nuts"],
  nova: 3,
  organic: true,
  confidence: "high",
};

const INCI = {
  name: null,
  ingredients: "Aqua, Glycerin, Parfum, Limonene, Linalool, Butylphenyl Methylpropional",
  confidence: "high",
};

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

/** Open Food Facts answers from the recorded fixtures, the model from here, nothing else goes out. */
async function offline(page: Page | BrowserContext, errors: string[], lookups: string[] = []) {
  if ("on" in page && "goto" in page) {
    page.on("console", (m) => {
      // Aborted catalog loads and the 404 of an unknown product are expected.
      if (m.type() === "error" && !m.text().startsWith("Failed to load resource"))
        errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
  }
  await page.route(/models\.dev|openrouter\.ai\/api\/v1\/models/, (r) => r.abort());
  // No better-choice lists unless a test serves some.
  await page.route(/\/alternatives\//, (r) => r.fulfill({ status: 404, body: "" }));
  // No name search unless a test answers it.
  await page.route(/\/cgi\/search\.pl/, (r) => r.abort());
  await page.route(/images\.open\w+facts\.org/, (r) =>
    r.fulfill({
      headers: cors,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
    }),
  );
  await page.route(/\/api\/v3\/product\//, async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() === "OPTIONS")
      return route.fulfill({ status: 204, headers: cors });
    const code = url.pathname.split("/").at(-1) ?? "";
    lookups.push(`${url.host} ${code}`);
    const product =
      url.host === "world.openfoodfacts.org"
        ? fixture(code)
        : url.host === "world.openbeautyfacts.org"
          ? fixture(code, "src/data/fixtures/obf")
          : null;
    return product
      ? route.fulfill({ headers: cors, json: { status: "success", product } })
      : route.fulfill({
          status: 404,
          headers: cors,
          json: { status: "failure", result: { id: "product_not_found" } },
        });
  });
  await page.route(`${ENDPOINT}/**`, async (route) => {
    if (route.request().method() === "OPTIONS")
      return route.fulfill({ status: 204, headers: cors });
    if (route.request().url().endsWith("/models")) {
      return route.fulfill({ headers: cors, json: { data: [{ id: "mock-model" }] } });
    }
    const body = route.request().postData() ?? "";
    const content = body.includes("food_label")
      ? JSON.stringify(LABEL)
      : body.includes("cosmetic_label")
        ? JSON.stringify(INCI)
        : body.includes("Additive facts")
          ? "- Aspartame is an intense sweetener.\n- IARC put it in group 2B in 2023."
          : "- Lots of sugar and saturated fat.\n- Keep it for a treat.";
    return route.fulfill({
      headers: cors,
      json: {
        id: "cmpl-1",
        object: "chat.completion",
        created: 1,
        model: "mock-model",
        choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
      },
    });
  });
}

async function connectModel(page: Page) {
  await page.goto("./#/settings");
  await page.getByRole("tab", { name: "Local / custom" }).click();
  await page.getByLabel("Endpoint (OpenAI-compatible)").fill(ENDPOINT);
  await page.getByLabel("Model", { exact: true }).fill("mock-model");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
}

async function lookUp(page: Page, code: string, button = "Look up") {
  await page.goto("./");
  await page.locator("#code").fill(code);
  await page.getByRole("button", { name: button }).click();
}

test("loads under the CSP with no error and navigates", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Scan a product" })).toBeVisible();
  // Samples until the first scan, no emoji standing in for flags.
  await expect(page.getByRole("link", { name: "US Cheerios" })).toBeVisible();
  for (const name of ["History", "Settings", "About", "Scan"]) {
    await page
      .getByRole("navigation", { name: "Main" })
      .first()
      .getByRole("link", { name })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("US: Cheerios, the FDA box comes first", async ({ page }) => {
  const errors: string[] = [];
  const lookups: string[] = [];
  await offline(page, errors, lookups);
  await lookUp(page, "016000275287");
  // Its English name in Open Food Facts reads "My Bff" (bad data upstream); the brand is right.
  await expect(page.getByTestId("product-name").locator("..")).toContainText("Cheerios");
  await expect(page.getByTestId("verdict")).toHaveText("Poor");
  await expect(page.getByTestId("reasons")).toContainText("Nutri-Score C");
  await expect(page.getByTestId("reasons")).toContainText("Potassium phosphates");
  const fop = page.getByTestId("fop");
  await expect(fop).toContainText("Sodium");
  await expect(fop).toContainText("8 % DV");
  // The US box sits above the Nutri-Score badges.
  const [fopBox, badges] = await Promise.all([
    fop.boundingBox(),
    page.getByText("EU Nutri-Score").boundingBox(),
  ]);
  expect((fopBox?.y ?? 0) < (badges?.y ?? 0)).toBe(true);
  // A UPC-A is found under its EAN-13.
  expect(lookups).toEqual([
    "world.openfoodfacts.org 016000275287",
    "world.openfoodfacts.org 0016000275287",
  ]);
  await expect(page.getByText("Data: Open Food Facts (ODbL)")).toBeVisible();
  expect(errors).toEqual([]);
});

test("science: Coca-Cola Zero's aspartame is cited and costs points", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await lookUp(page, "5449000131805");
  await expect(page.getByTestId("reasons")).toContainText(
    "Aspartame (E951): a concern backed by an official body or human studies",
  );
  const row = page.getByTestId("additive").filter({ hasText: "Aspartame" });
  // The pill says what the score does: EFSA sees no overexposure, IARC and WHO still weigh.
  await expect(row.getByTestId("additive-level")).toHaveText("Moderate concern");
  await expect(row).toContainText("Sweetener");
  await expect(row.getByTestId("additive-why")).toContainText("IARC");
  // Worst first: the high-risk phosphoric acid leads.
  await expect(page.getByTestId("additive").first()).toHaveAttribute("data-level", "high");
  // Allergens sit with the verdict, their label said once.
  await expect(page.getByTestId("allergens")).not.toContainText("May contain: May contain");
  await row.locator("summary").first().click();
  await expect(row).toContainText("Why this level");
  await expect(row).toContainText("Explain with AI: connect a model");
  const science = row.getByTestId("science");
  await science.getByText(/What science says/).click();
  await expect(science).toContainText("Official position");
  await expect(science.getByRole("link").first()).toHaveAttribute("href", /^https:\/\//);
  expect(errors).toEqual([]);
});

test.describe("France", () => {
  test.use({ locale: "fr-FR" });
  test("Nutella: no grade in the database, goodscan computes E", async ({ page }) => {
    const errors: string[] = [];
    await offline(page, errors);
    await lookUp(page, "3017620422003", "Chercher");
    await expect(page.getByTestId("product-name")).toHaveText("Nutella");
    await expect(page.getByTestId("verdict")).toHaveText("Mauvais");
    await expect(page.getByTestId("reasons")).toContainText("Nutri-Score E, calculé par goodscan");
    await expect(page.getByText("calculé", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pour vous" })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("Germany", () => {
  test.use({ locale: "de-DE" });
  test("Ritter Sport: the German name, the EU view first", async ({ page }) => {
    const errors: string[] = [];
    await offline(page, errors);
    await lookUp(page, "4000417025005", "Suchen");
    await expect(page.getByTestId("product-name")).toHaveText("Marzipan");
    await expect(page.getByTestId("verdict")).toHaveText("Schlecht");
    await expect(page.getByTestId("reasons")).toContainText("Hochverarbeitet (NOVA 4)");
    const [fopBox, badges] = await Promise.all([
      page.getByTestId("fop").boundingBox(),
      page.getByText("Nutri-Score (EU)").boundingBox(),
    ]);
    expect((badges?.y ?? 0) < (fopBox?.y ?? 0)).toBe(true);
    expect(errors).toEqual([]);
  });
});

test("better choices: same category, a better score, a tap away", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  const better = [
    { code: "3274080005003", name: "Cristaline", brands: "Cristaline", score: 100 },
    { code: "4000417025005", name: "Better spread", brands: "Test", score: 72 },
    { code: "4008400402222", name: "Nutella", brands: "Ferrero", score: 0 },
  ];
  await page.route(/\/alternatives\/us\/\d+\.json$/, (route) =>
    route.fulfill({
      headers: cors,
      json: Object.fromEntries(
        ["en:sweet-spreads", "en:hazelnut-spreads", "en:cocoa-and-hazelnuts-spreads"].map((c) => [
          c,
          { d: 3, p: better },
        ]),
      ),
    }),
  );
  await lookUp(page, "4008400402222");
  const list = page.getByTestId("alternatives");
  await expect(page.getByRole("heading", { name: "Better choices" })).toBeVisible();
  // Not the product itself, nothing worse.
  await expect(list.getByRole("link")).toHaveCount(2);
  await list.getByRole("link", { name: /Cristaline/ }).click();
  await expect(page.getByTestId("verdict")).toHaveText("Excellent");
  expect(errors).toEqual([]);
});

test("water is excellent; switching the language translates everything", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await lookUp(page, "3274080005003");
  await expect(page.getByTestId("verdict")).toHaveText("Excellent");
  await expect(page.getByTestId("score")).toHaveText("100");
  await page.goto("./#/settings");
  await page.getByLabel("Language").selectOption("fr");
  await expect(page.getByRole("heading", { name: "Réglages" })).toBeVisible();
  await page.getByLabel("Langue").selectOption("de");
  await expect(page.getByRole("heading", { name: "Einstellungen" })).toBeVisible();
  // Back to the browser's language.
  await page.getByLabel("Sprache").selectOption("auto");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByLabel("Language")).toHaveValue("auto");
  await page.getByLabel("Language").selectOption("de");
  await page.goto("./#/history");
  await expect(page.getByRole("heading", { name: "Verlauf" })).toBeVisible();
  await expect(page.getByText("100", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("preferences: a mandatory allergen rules a product out", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await page.goto("./#/settings");
  // Groups other than nutrition start closed.
  await page.locator("summary", { hasText: "Allergens" }).click();
  await page.getByLabel("Without gluten").selectOption("mandatory");
  await lookUp(page, "0016000275287");
  await expect(page.getByTestId("match")).toHaveText("Does not match");
  await expect(page.getByText("Rules it out")).toBeVisible();
  expect(errors).toEqual([]);
});

test("unknown barcode: the AI reads the label, goodscan scores it", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await connectModel(page);
  await lookUp(page, "1234567890128");
  await expect(page.getByRole("heading", { name: "Not in Open Food Facts yet" })).toBeVisible();
  await page.getByLabel("Read the label from a photo").setInputFiles({
    name: "label.png",
    mimeType: "image/png",
    // A 1×1 PNG: the fake model does not look at it.
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(page.getByTestId("product-name")).toHaveText("Granola maison");
  await expect(page.getByText("Estimated by AI from a photo")).toBeVisible();
  await expect(page.getByTestId("reasons")).toContainText("computed by goodscan");
  await expect(page.getByTestId("reasons")).toContainText("Organic");
  expect(errors).toEqual([]);
});

test.describe("cosmetics", () => {
  test.use({ locale: "fr-FR" });
  test("Garnier: from Open Beauty Facts, an ingredient score and its alerts", async ({ page }) => {
    const errors: string[] = [];
    const lookups: string[] = [];
    await offline(page, errors, lookups);
    await lookUp(page, "3600540539397", "Chercher");
    await expect(page.getByText("Note ingrédients")).toBeVisible();
    await expect(page.getByTestId("reasons")).toContainText("ingrédients vérifiés");
    await expect(page.getByTestId("reasons")).toContainText("allergènes ou sensibilisants");
    const concerns = page.getByTestId("concerns");
    await expect(concerns).toContainText("Linalool");
    await expect(concerns).toContainText("Allergène de parfum");
    // Folded: the sources open with the ingredient.
    await concerns.locator("summary").first().click();
    await expect(concerns.getByRole("link").first()).toHaveAttribute("href", /^https:\/\//);
    await expect(page.getByRole("heading", { name: "Ingrédients (INCI)" })).toBeVisible();
    // Every ingredient of the list with its level, as printed.
    const inci = page.getByTestId("inci");
    await expect(inci.getByRole("listitem")).toHaveCount(22);
    await expect(inci.getByRole("listitem").filter({ hasText: "linalool" })).toContainText(
      "Préoccupation faible",
    );
    await expect(inci.getByRole("listitem").first()).toContainText("Absent de nos listes");
    // No food sections on a cosmetic, not even the food preferences.
    await expect(page.getByRole("heading", { name: "Pour vous" })).toHaveCount(0);
    await expect(page.getByText("Nutri-Score (UE)")).toHaveCount(0);
    await expect(page.getByTestId("fop")).toHaveCount(0);
    await expect(page.getByText("Données : Open Beauty Facts (ODbL)")).toBeVisible();
    expect(lookups).toContain("world.openbeautyfacts.org 3600540539397");
    expect(errors).toEqual([]);
  });
});

test("US cosmetic: Secret, its cyclic silicone flagged", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await lookUp(page, "0037000123439");
  await expect(page.getByText("Ingredient score")).toBeVisible();
  await expect(page.getByTestId("concerns")).toContainText("Cyclopentasiloxane");
  await expect(page.getByTestId("reasons")).toContainText(
    "Cyclopentasiloxane: restricted in EU cosmetics",
  );
  expect(errors).toEqual([]);
});

test("cosmetic with no ingredient list: a photo, the model reads it, goodscan scores it", async ({
  page,
}) => {
  const errors: string[] = [];
  await offline(page, errors);
  await page.route(/world\.openbeautyfacts\.org\/api\/v3\/product\/3600000000009/, (route) =>
    route.fulfill({
      headers: cors,
      json: {
        status: "success",
        product: { code: "3600000000009", product_name: "Crème test", brands: "Test" },
      },
    }),
  );
  await connectModel(page);
  await lookUp(page, "3600000000009");
  await expect(page.getByTestId("verdict")).toHaveText("Not enough data");
  await expect(page.getByTestId("reasons")).toContainText("Ingredient list missing");
  await page.getByLabel("Read the ingredient list from a photo").setInputFiles({
    name: "inci.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(page.getByText("Estimated by AI from a photo")).toBeVisible();
  await expect(page.getByTestId("reasons")).toContainText(
    "Butylphenyl Methylpropional: banned in EU cosmetics",
  );
  await expect(page.getByTestId("verdict")).toHaveText("Bad");
  expect(errors).toEqual([]);
});

test("ask AI: explains the score with the connected model", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await connectModel(page);
  await lookUp(page, "4008400402222");
  await page.getByRole("button", { name: "Explain this score" }).click();
  await expect(page.getByTestId("ai-answer")).toContainText("Lots of sugar");
  expect(errors).toEqual([]);
});

test("storage full (another site of the origin filled it): say so, keep working", async ({
  page,
}) => {
  const errors: string[] = [];
  await offline(page, errors);
  // Every project page of maxgfr.github.io shares this origin's localStorage.
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
    };
  });
  await page.goto("./#/settings");
  await page.getByRole("tab", { name: "Local / custom" }).click();
  await page.getByLabel("Endpoint (OpenAI-compatible)").fill(ENDPOINT);
  await page.getByLabel("Model", { exact: true }).fill("mock-model");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(/^Storage for this site is full/)).toBeVisible();
  await expect(page.getByText("Saved.")).toHaveCount(0);
  // A preference still applies, for this page, and the settings say it will not last.
  await page.getByLabel("Language").selectOption("fr");
  await expect(page.getByRole("heading", { name: "Réglages" })).toBeVisible();
  await expect(page.getByText(/^Le stockage de ce site est plein/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("a remembered key the full IndexedDB refuses: say so, not Saved", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  // An origin over its quota: localStorage still takes the prefs, IndexedDB not the key.
  await page.addInitScript(() => {
    IDBObjectStore.prototype.put = () => {
      throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
    };
  });
  await page.goto("./#/settings");
  await page.getByRole("tab", { name: "Local / custom" }).click();
  await page.getByLabel("Endpoint (OpenAI-compatible)").fill(ENDPOINT);
  await page.getByLabel("Model", { exact: true }).fill("mock-model");
  await page.getByLabel(/^API key/).fill("sk-test");
  await page.getByLabel(/^Remember the key/).check();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(/^Storage for this site is full/)).toBeVisible();
  await expect(page.getByText("Saved.")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("ask AI about one additive: explained from its level, kept when reopened", async ({
  page,
}) => {
  const errors: string[] = [];
  await offline(page, errors);
  await connectModel(page);
  await lookUp(page, "5449000131805");
  const row = page.getByTestId("additive").filter({ hasText: "Aspartame" });
  await row.locator("summary").first().click();
  await row.getByRole("button", { name: "Explain with AI" }).click();
  await expect(row.getByTestId("ai-additive")).toContainText("intense sweetener");
  // Folded and opened again: the answer is still there, no second call.
  await row.locator("summary").first().click();
  await row.locator("summary").first().click();
  await expect(row.getByTestId("ai-additive")).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe("offline", () => {
  test.use({ serviceWorkers: "allow" });
  test("product photos are cached as CORS responses; the old opaque cache is gone", async ({
    page,
    context,
  }) => {
    await offline(context, []);
    await page.goto("./");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      // What an older version left: its photos cache, under a name without the app's.
      await (await caches.open("off-images")).put(
        "https://images.openfoodfacts.org/x.jpg",
        new Response("x"),
      );
    });
    await page.reload();
    await expect.poll(() => page.evaluate(() => caches.has("off-images"))).toBe(false);
    await expect
      .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
      .toBe(true);
    await lookUp(page, "4008400402222");
    const photo = page.locator("img[crossorigin]").first();
    await expect
      .poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
    const types = () =>
      page.evaluate(async () => {
        const cache = await caches.open("goodscan-off-images");
        const hits = await Promise.all((await cache.keys()).map((k) => cache.match(k)));
        return [...new Set(hits.map((r) => r?.type))];
      });
    await expect.poll(types).toEqual(["cors"]);
  });

  test("the app shell and scanned products still work", async ({ page, context }) => {
    const errors: string[] = [];
    await offline(context, errors);
    await page.goto("./");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await expect
      .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
      .toBe(true);
    await lookUp(page, "4008400402222");
    await expect(page.getByTestId("product-name")).toHaveText("Nutella");
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByTestId("verdict")).toHaveText("Bad");
    await page.goto("./#/");
    await expect(page.getByRole("heading", { name: "Scan a product" })).toBeVisible();
    await page
      .getByRole("link", { name: /Nutella/ })
      .first()
      .click();
    await expect(page.getByTestId("product-name")).toHaveText("Nutella");
    await page.goto("./#/about");
    await expect(page.getByRole("heading", { name: "About goodscan" })).toBeVisible();
  });
});

test("the manifest makes it installable", async ({ page, request }) => {
  await page.goto("./");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBeTruthy();
  const manifest = await (await request.get(new URL(href ?? "", page.url()).href)).json();
  expect(manifest).toMatchObject({
    short_name: "goodscan",
    display: "standalone",
    start_url: "./",
  });
  expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(
    expect.arrayContaining(["192x192", "512x512"]),
  );
  // A new version takes over without waiting for every tab to close.
  const sw = await (await request.get(new URL("sw.js", page.url()).href)).text();
  expect(sw).toMatch(/self\.skipWaiting\(\)\s*,\s*\w+\.clientsClaim\(\)/);
});

test("@camera scans a real barcode from the camera", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await page.goto("./");
  await page.getByRole("button", { name: "Start the camera" }).click();
  await expect(page.getByTestId("product-name")).toHaveText("Nutella", { timeout: 20_000 });
  expect(page.url()).toContain("#/p/3017620422003");
  expect(errors).toEqual([]);
});

test("@camera scans with the WebAssembly reader when the browser has none (iOS, Firefox…)", async ({
  page,
}) => {
  const errors: string[] = [];
  await offline(page, errors);
  await page.addInitScript(() => {
    delete (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector;
  });
  const wasm = page.waitForResponse((r) => r.url().endsWith(".wasm"));
  await page.goto("./");
  await page.getByRole("button", { name: "Start the camera" }).click();
  // Served from this site, not a CDN.
  expect(new URL((await wasm).url()).host).toBe("localhost:4318");
  await expect(page.getByTestId("product-name")).toHaveText("Nutella", { timeout: 30_000 });
  expect(errors).toEqual([]);
});

test("reads a barcode from a photo", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await page.goto("./");
  // A barcode drawn in a canvas, saved as PNG, picked as a photo.
  const png = await page.evaluate(async (modules) => {
    const canvas = new OffscreenCanvas(500, 260);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 500, 260);
    ctx.fillStyle = "#000";
    [...modules].forEach((m, i) => {
      if (m === "1") ctx.fillRect(40 + i * 4, 40, 4, 180);
    });
    const blob = await canvas.convertToBlob({ type: "image/png" });
    return [...new Uint8Array(await blob.arrayBuffer())];
  }, ean13Modules("4008400402222"));
  await page.getByLabel("Barcode from a photo").setInputFiles({
    name: "barcode.png",
    mimeType: "image/png",
    buffer: Buffer.from(png),
  });
  await expect(page.getByTestId("product-name")).toHaveText("Nutella");
  expect(page.url()).toContain("#/p/4008400402222");
  expect(errors).toEqual([]);
});

test("starts even when another tab holds the local database", async ({ page, context }) => {
  const errors: string[] = [];
  await offline(page, errors);
  // A first tab opens the app (and its database), then something deletes the database
  // while that tab still holds it: the deletion waits, and so would every later open.
  const other = await context.newPage();
  await other.goto("./");
  await expect(other.getByRole("heading", { name: "Scan a product" })).toBeVisible();
  await other.evaluate(() => {
    indexedDB.deleteDatabase("goodscan");
  });
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Scan a product" })).toBeVisible({
    timeout: 8000,
  });
  expect(errors).toEqual([]);
});

test.describe("name search", () => {
  const food = [
    {
      code: "4008400402222",
      product_name: "Nutella",
      brands: "Nutella",
      quantity: "450 g",
      nutriscore_grade: "e",
    },
    {
      code: "3017620422003",
      product_name: "Nutella",
      brands: "Nutella, Ferrero",
      quantity: "400 g",
      nutriscore_grade: "e",
    },
  ];
  const beauty = [{ code: "4005900964441", product_name: "Soft", brands: "NIVEA", nova_group: 4 }];

  /** Each database answers its hits, or fails when it has none to give. */
  async function databases(page: Page, hits: Record<string, unknown[] | "down">) {
    const asked: URL[] = [];
    await page.route(/\/cgi\/search\.pl/, (route) => {
      if (route.request().method() === "OPTIONS")
        return route.fulfill({ status: 204, headers: cors });
      const url = new URL(route.request().url());
      asked.push(url);
      const these = hits[url.host] ?? [];
      return these === "down"
        ? route.fulfill({ status: 503, headers: cors, body: "" })
        : route.fulfill({
            headers: cors,
            json: { count: these.length, page: 1, page_size: 20, products: these },
          });
    });
    return asked;
  }

  test("type a name, find it in every database, open the one in Open Beauty Facts", async ({
    page,
  }) => {
    const errors: string[] = [];
    const lookups: string[] = [];
    await offline(page, errors, lookups);
    const asked = await databases(page, {
      "world.openfoodfacts.org": food,
      "world.openbeautyfacts.org": beauty,
    });
    await page.goto("./");
    const field = page.getByLabel("Barcode or product name");
    await field.fill("nutella");
    await page.getByRole("button", { name: "Look up" }).click();
    await expect(page.getByRole("heading", { name: "Search: “nutella”" })).toBeVisible();
    await expect(page.getByText("3 products in the Open Facts databases")).toBeVisible();
    const results = page.getByTestId("search-results");
    await expect(results.getByRole("link")).toHaveCount(3);
    await expect(results.getByRole("link", { name: /Soft.*Cosmetic/ })).toBeVisible();
    await expect(page.getByText("Data: Open Food Facts, Open Beauty Facts")).toBeVisible();
    expect(new Set(asked.map((u) => u.host)).size).toBe(4);
    expect(asked.every((u) => u.searchParams.get("search_terms") === "nutella")).toBe(true);
    await results.getByRole("link", { name: /Soft/ }).click();
    await expect(page.getByTestId("product-name")).toHaveText("Soft");
    expect(page.url()).toContain("#/p/4005900964441?db=obf");
    // Read where the hit lives, no detour through the food database.
    expect(lookups).toEqual(["world.openbeautyfacts.org 4005900964441"]);
    expect(errors).toEqual([]);
  });

  test("a database down: the others' results still show; then a food product opens", async ({
    page,
  }) => {
    const errors: string[] = [];
    await offline(page, errors);
    const asked = await databases(page, {
      "world.openfoodfacts.org": food,
      "world.openbeautyfacts.org": "down",
    });
    await page.goto("./#/search?q=nutella");
    const results = page.getByTestId("search-results");
    await expect(results.getByRole("link")).toHaveCount(2);
    await expect(
      page.getByText(
        "Open Beauty Facts did not answer: these results come from the other databases.",
      ),
    ).toBeVisible();
    // Asked three times: the first try and two after a pause.
    expect(asked.filter((u) => u.host === "world.openbeautyfacts.org")).toHaveLength(3);
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(results.getByRole("link")).toHaveCount(2);
    await expect(
      page.getByText("Open Beauty Facts did not answer", { exact: false }),
    ).toBeVisible();
    await results.getByRole("link", { name: /Nutella, Ferrero/ }).click();
    await expect(page.getByTestId("product-name")).toHaveText("Nutella");
    expect(page.url()).toMatch(/#\/p\/3017620422003$/);
    expect(errors).toEqual([]);
  });

  test("every database down: say so", async ({ page }) => {
    const errors: string[] = [];
    await offline(page, errors);
    await page.goto("./#/search?q=nutella");
    await expect(
      page.getByText("The search could not be reached.", { exact: false }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("digits are still a barcode", async ({ page }) => {
    const errors: string[] = [];
    await offline(page, errors);
    await page.goto("./");
    await page.getByLabel("Barcode or product name").fill("12345");
    await page.getByRole("button", { name: "Look up" }).click();
    await expect(page.getByText("A barcode has 8, 12, 13 or 14 digits.")).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("AI web search", () => {
  const FOUND = {
    ...LABEL,
    found: true,
    kind: "food",
    code: "4006381333931",
  };

  /** OpenAI's Responses API: the web research (with its citations), then the structured read. */
  async function openai(page: Page, found: unknown = FOUND) {
    const bodies: string[] = [];
    await page.route("https://api.openai.com/v1/**", async (route) => {
      if (route.request().method() === "OPTIONS")
        return route.fulfill({ status: 204, headers: cors });
      const body = route.request().postData() ?? "";
      bodies.push(body);
      const searching = body.includes("web_search");
      const text = searching
        ? body.includes("Find this product")
          ? "Granola maison by Test: 450 kcal per 100 g. Source: https://shop.example/granola"
          : "- A recall in 2026, says the maker's site (web)."
        : body.includes("web_product")
          ? JSON.stringify(found)
          : "- A recall in 2026, says the maker's site (web).";
      return route.fulfill({
        headers: cors,
        json: {
          id: `resp_${bodies.length}`,
          object: "response",
          created_at: 1,
          model: "gpt-5-mini",
          status: "completed",
          incomplete_details: null,
          output: [
            {
              type: "message",
              id: `msg_${bodies.length}`,
              role: "assistant",
              status: "completed",
              content: [
                {
                  type: "output_text",
                  text,
                  annotations: searching
                    ? [
                        {
                          type: "url_citation",
                          start_index: 0,
                          end_index: 7,
                          url: "https://shop.example/granola",
                          title: "Granola maison – Shop",
                        },
                      ]
                    : [],
                },
              ],
            },
          ],
          usage: {
            input_tokens: 10,
            output_tokens: 10,
            total_tokens: 20,
            input_tokens_details: { cached_tokens: 0 },
            output_tokens_details: { reasoning_tokens: 0 },
          },
        },
      });
    });
    return bodies;
  }

  async function connectOpenai(page: Page) {
    await page.goto("./#/settings");
    await page.getByRole("combobox", { name: "Provider" }).selectOption({ label: "OpenAI" });
    await page.getByLabel("Search models…").fill("gpt-5-mini");
    await page.getByRole("option", { name: /^GPT-5 Mini/ }).click();
    await page.getByLabel("API key").fill("sk-test-123456");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Saved.")).toBeVisible();
  }

  test("unknown barcode: on a tap, the AI searches the web and goodscan scores it", async ({
    page,
  }) => {
    const errors: string[] = [];
    await offline(page, errors);
    const bodies = await openai(page);
    await connectOpenai(page);
    await lookUp(page, "4006381333931");
    await expect(page.getByRole("heading", { name: "Not in Open Food Facts yet" })).toBeVisible();
    // Nothing is sent before the tap.
    expect(bodies).toHaveLength(0);
    await page.getByRole("button", { name: "Search the web with AI" }).click();
    await expect(page.getByTestId("product-name")).toHaveText("Granola maison");
    await expect(page.getByText("Estimated by AI from the web")).toBeVisible();
    await expect(
      page.getByTestId("web-sources").getByRole("link", { name: "Granola maison – Shop" }),
    ).toHaveAttribute("href", "https://shop.example/granola");
    await expect(page.getByTestId("reasons")).toContainText("computed by goodscan");
    expect(bodies).toHaveLength(2);
    expect(bodies[0]).toContain("4006381333931");
    // Kept like a database answer: coming back asks nothing again.
    await page.reload();
    await expect(page.getByTestId("product-name")).toHaveText("Granola maison");
    expect(bodies).toHaveLength(2);
    expect(errors).toEqual([]);
  });

  test("nothing found on the web: say so, offer the photo", async ({ page }) => {
    const errors: string[] = [];
    await offline(page, errors);
    await openai(page, { ...FOUND, found: false });
    await connectOpenai(page);
    await lookUp(page, "4006381333931");
    await page.getByRole("button", { name: "Search the web with AI" }).click();
    await expect(page.getByText("The AI found no page about this exact product")).toBeVisible();
    await expect(page.getByLabel("Read the label from a photo")).toBeAttached();
    expect(errors).toEqual([]);
  });

  test("a name no database knows: the AI finds it, with its barcode", async ({ page }) => {
    const errors: string[] = [];
    await offline(page, errors);
    await page.route(/\/cgi\/search\.pl/, (route) =>
      route.fulfill({ headers: cors, json: { count: 0, page: 1, page_size: 20, products: [] } }),
    );
    const bodies = await openai(page);
    await connectOpenai(page);
    await page.goto("./#/search?q=granola%20maison");
    await expect(page.getByText("No product matches")).toBeVisible();
    await page.getByRole("button", { name: "Search the web with AI" }).click();
    await expect(page.getByTestId("product-name")).toHaveText("Granola maison");
    expect(page.url()).toContain("#/p/4006381333931");
    expect(bodies[0]).toContain("granola maison");
    expect(errors).toEqual([]);
  });

  test("search mode: Ask AI searches the web and shows its sources", async ({ page }) => {
    const errors: string[] = [];
    await offline(page, errors);
    const bodies = await openai(page);
    await connectOpenai(page);
    await lookUp(page, "4008400402222");
    await page.getByRole("button", { name: "Explain this score" }).click();
    await expect(page.getByTestId("ai-answer")).toContainText("A recall");
    expect(bodies.at(-1)).not.toContain("web_search");
    await page.getByLabel("Search the web").check();
    await page.getByRole("button", { name: "Explain this score" }).click();
    await expect(page.getByTestId("web-sources")).toBeVisible();
    expect(bodies.at(-1)).toContain("web_search");
    expect(errors).toEqual([]);
  });

  test("a model with no web search: say which can", async ({ page }) => {
    const errors: string[] = [];
    await offline(page, errors);
    await connectModel(page);
    await lookUp(page, "1234567890128");
    await expect(page.getByText("Your model cannot search the web")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search the web with AI" })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
