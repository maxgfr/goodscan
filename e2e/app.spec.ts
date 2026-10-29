import { readFileSync } from "node:fs";
import { type BrowserContext, expect, type Page, test } from "@playwright/test";
import { ean13Modules } from "./barcode-video";

const ENDPOINT = "https://llm.test/v1";

const fixture = (code: string) => {
  try {
    return JSON.parse(readFileSync(`src/data/fixtures/${code}.json`, "utf8"));
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
  await page.route(/images\.open\w+facts\.org/, (r) =>
    r.fulfill({
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
    const product = url.host === "world.openfoodfacts.org" ? fixture(code) : null;
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
  await page.getByPlaceholder(/3017620422003|4008400402222/).fill(code);
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

test("ask AI: explains the score with the connected model", async ({ page }) => {
  const errors: string[] = [];
  await offline(page, errors);
  await connectModel(page);
  await lookUp(page, "4008400402222");
  await page.getByRole("button", { name: "Explain this score" }).click();
  await expect(page.getByTestId("ai-answer")).toContainText("Lots of sugar");
  expect(errors).toEqual([]);
});

test.describe("offline", () => {
  test.use({ serviceWorkers: "allow" });
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
