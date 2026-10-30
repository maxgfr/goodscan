/**
 * Records real Open Food Facts and Open Beauty Facts answers as test fixtures
 * (src/data/fixtures, cosmetics in its obf/ folder), one read every 5 s to
 * stay well under the API's limit. Pass codes to record only those
 * (bun run fixtures 3600540539397).
 * Data © Open Food Facts and Open Beauty Facts contributors, ODbL.
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

export const COSMETIC_FIXTURES: Record<string, string> = {
  "3600540539397": "Garnier hair mask (FR, fragrance allergens)",
  "3337875598996": "CeraVe moisturising cream (FR, French INCI)",
  "4005900964441": "Nivea Soft (DE)",
  "0037000123439": "Secret antiperspirant (US, cyclopentasiloxane)",
};

const DBS = [
  { host: "https://world.openfoodfacts.org", dir: "src/data/fixtures", list: FIXTURES, obf: false },
  {
    host: "https://world.openbeautyfacts.org",
    dir: "src/data/fixtures/obf",
    list: COSMETIC_FIXTURES,
    obf: true,
  },
];

const only = process.argv.slice(2);
for (const db of DBS) {
  const fields = `${fieldsFor("en", db.obf ? "obf" : "off")},product_name_fr,product_name_de,ingredients_text_fr,ingredients_text_de`;
  for (const [code, label] of Object.entries(db.list)) {
    if (only.length && !only.includes(code)) continue;
    const res = await fetch(`${db.host}/api/v3/product/${code}?fields=${fields}&lc=en`, {
      headers: { "User-Agent": USER_AGENT },
    });
    const body = (await res.json()) as { status: string; product?: unknown };
    if (body.product) {
      await Bun.write(`${db.dir}/${code}.json`, `${JSON.stringify(body.product, null, 2)}\n`);
      console.log(`${code} ${label}: saved`);
    } else {
      console.log(`${code} ${label}: ${res.status} ${body.status}`);
    }
    await Bun.sleep(5000);
  }
}
