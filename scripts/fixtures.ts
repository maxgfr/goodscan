/**
 * Records real Open Food Facts answers as test fixtures (src/data/fixtures),
 * one read every 5 s to stay well under the API's limit. Pass codes to record
 * only those (bun run fixtures 5449000131805).
 * Data © Open Food Facts contributors, ODbL.
 */
import { fieldsFor, USER_AGENT } from "../src/data/off";

export const FIXTURES: Record<string, string> = {
  "0049000028911": "Diet Coke (US)",
  "0016000275287": "Cheerios (US)",
  "3017620422003": "Nutella (FR)",
  "4008400402222": "Nutella (DE)",
  "4000417025005": "Ritter Sport marzipan (DE)",
  "3274080005003": "Cristaline water (FR)",
  "5449000131805": "Coca-Cola Zero Sugar (FR, aspartame)",
};

const fields = `${fieldsFor("en")},product_name_fr,product_name_de,ingredients_text_fr,ingredients_text_de`;

const only = process.argv.slice(2);
for (const [code, label] of Object.entries(FIXTURES)) {
  if (only.length && !only.includes(code)) continue;
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v3/product/${code}?fields=${fields}&lc=en`,
    {
      headers: { "User-Agent": USER_AGENT },
    },
  );
  const body = (await res.json()) as { status: string; product?: unknown };
  if (body.product) {
    await Bun.write(`src/data/fixtures/${code}.json`, `${JSON.stringify(body.product, null, 2)}\n`);
    console.log(`${code} ${label}: saved`);
  } else {
    console.log(`${code} ${label}: ${res.status} ${body.status}`);
  }
  await Bun.sleep(5000);
}
