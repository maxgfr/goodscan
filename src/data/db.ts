/**
 * What stays on the device, in IndexedDB: products already looked up (a week,
 * so a second scan costs no request and works offline) and the scan history.
 */
import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { Product } from "./product";

export const PRODUCT_TTL_MS = 7 * 24 * 3600_000;

export interface HistoryItem {
  code: string;
  name: string;
  brands?: string;
  image?: string;
  score: number | null;
  verdict: string;
  scannedAt: number;
}

interface Schema extends DBSchema {
  products: {
    key: string;
    value: { code: string; lang: string; product: Product | null; fetchedAt: number };
  };
  history: { key: string; value: HistoryItem; indexes: { scannedAt: number } };
}

/** An open that has not settled by then is given up (and tried again next time). */
export const OPEN_TIMEOUT_MS = 4000;

let db: Promise<IDBPDatabase<Schema>> | null = null;
function open(): Promise<IDBPDatabase<Schema>> {
  if (!db) {
    const opening = openDB<Schema>("goodscan", 1, {
      upgrade(d) {
        d.createObjectStore("products", { keyPath: "code" });
        d.createObjectStore("history", { keyPath: "code" }).createIndex("scannedAt", "scannedAt");
      },
      // Another tab wants to delete or upgrade the database: let it, reopen later.
      blocking(_current, _blocked, event) {
        (event.target as IDBDatabase).close();
        db = null;
      },
      terminated() {
        db = null;
      },
    });
    // While another tab holds the database, an open can wait forever: never let it freeze the app.
    db = Promise.race([
      opening,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("The local database is busy.")), OPEN_TIMEOUT_MS),
      ),
    ]);
    db.catch(() => {
      db = null;
    });
  }
  return db;
}

const key = (code: string, lang: string) => `${lang}:${code}`;

/** A cached answer (null = known to be missing), undefined when there is none fresh enough. */
export async function cachedProduct(
  code: string,
  lang: string,
  { stale = false } = {},
): Promise<Product | null | undefined> {
  const hit = await (await open()).get("products", key(code, lang));
  if (!hit) return undefined;
  if (!stale && Date.now() - hit.fetchedAt > PRODUCT_TTL_MS) return undefined;
  // Unknown products are checked again after an hour: someone may have added them.
  if (!stale && hit.product === null && Date.now() - hit.fetchedAt > 3600_000) return undefined;
  return hit.product;
}

export async function cacheProduct(code: string, lang: string, product: Product | null) {
  await (await open()).put("products", {
    code: key(code, lang),
    lang,
    product,
    fetchedAt: Date.now(),
  });
}

export async function addHistory(item: HistoryItem) {
  await (await open()).put("history", item);
}

export async function history(): Promise<HistoryItem[]> {
  const items = await (await open()).getAllFromIndex("history", "scannedAt");
  return items.reverse();
}

export async function removeHistory(code: string) {
  await (await open()).delete("history", code);
}

export async function clearHistory() {
  await (await open()).clear("history");
}

export async function clearAll() {
  const d = await open();
  await Promise.all([d.clear("history"), d.clear("products")]);
}
