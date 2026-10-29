/**
 * Builds src/data/attributes.json: the attributes Open Food Facts lets people
 * set preferences on (the ones its own apps use), with their names in English,
 * French and German, and the importance levels. Data © Open Food Facts, ODbL.
 */
const HEADERS = { "User-Agent": "goodscan/1.0 (https://github.com/maxgfr/goodscan)" };
const LANGS = ["en", "fr", "de"] as const;

type Group = {
  id: string;
  name: string;
  warning?: string | null;
  attributes: {
    id: string;
    name: string;
    setting_name?: string;
    setting_note?: string;
    default?: string;
  }[];
};
type Pref = { id: string; name: string };

async function get<T>(path: string, lang: string): Promise<T> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/${path}?lc=${lang}`, {
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`${path} ${lang}: ${res.status}`);
  return (await res.json()) as T;
}

const groups: Record<string, Group[]> = {};
const prefs: Record<string, Pref[]> = {};
for (const lang of LANGS) {
  groups[lang] = await get<Group[]>("attribute_groups", lang);
  await Bun.sleep(5000);
  prefs[lang] = await get<Pref[]>("preferences", lang);
  await Bun.sleep(5000);
}

const t = (pick: (lang: string) => string | null | undefined) =>
  Object.fromEntries(LANGS.map((l) => [l, pick(l) ?? ""]).filter(([, v]) => v));

const en = groups.en ?? [];
const out = {
  importance: Object.fromEntries(
    (prefs.en ?? []).map((p) => [p.id, t((l) => prefs[l]?.find((x) => x.id === p.id)?.name)]),
  ),
  groups: en.map((g) => ({
    id: g.id,
    name: t((l) => groups[l]?.find((x) => x.id === g.id)?.name),
    ...(g.warning ? { warning: t((l) => groups[l]?.find((x) => x.id === g.id)?.warning) } : {}),
    attributes: g.attributes.map((a) => {
      const find = (l: string) =>
        groups[l]?.find((x) => x.id === g.id)?.attributes.find((x) => x.id === a.id);
      return {
        id: a.id,
        name: t((l) => find(l)?.setting_name ?? find(l)?.name),
        ...(a.default ? { default: a.default } : {}),
      };
    }),
  })),
};
await Bun.write("src/data/attributes.json", `${JSON.stringify(out, null, 2)}\n`);
console.log(
  `${out.groups.length} groups, ${out.groups.flatMap((g) => g.attributes).length} attributes`,
);

export {};
