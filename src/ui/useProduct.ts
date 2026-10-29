/** A barcode's product: from this device when it is fresh, else from the databases, else the old copy offline. */
import { useEffect, useState } from "react";
import { addHistory, cachedProduct, cacheProduct } from "../data/db";
import { LookupError, lookup } from "../data/off";
import type { Product } from "../data/product";
import type { Lang } from "../i18n";
import { scoreProduct } from "../score/score";

export type ProductState =
  | { status: "loading" }
  | { status: "found"; product: Product; offline: boolean }
  | { status: "missing" }
  | { status: "error"; kind: LookupError["kind"]; wait?: number };

export async function remember(code: string, product: Product) {
  const score = scoreProduct(product);
  await addHistory({
    code,
    name: product.name,
    ...(product.brands ? { brands: product.brands } : {}),
    ...(product.image ? { image: product.image } : {}),
    score: score.value,
    verdict: score.verdict,
    scannedAt: Date.now(),
  }).catch(() => undefined);
}

export function useProduct(code: string, lang: Lang, onSaved: () => void): ProductState {
  const [state, setState] = useState<ProductState>({ status: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    (async () => {
      const fresh = await cachedProduct(code, lang).catch(() => undefined);
      if (fresh !== undefined) {
        if (fresh) {
          setState({ status: "found", product: fresh, offline: false });
          await remember(code, fresh);
          onSaved();
        } else setState({ status: "missing" });
        return;
      }
      try {
        const product = await lookup(code, { lang, signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        await cacheProduct(code, lang, product).catch(() => undefined);
        if (product) {
          setState({ status: "found", product, offline: false });
          await remember(code, product);
          onSaved();
        } else setState({ status: "missing" });
      } catch (err) {
        if (ctrl.signal.aborted) return;
        const stale = await cachedProduct(code, lang, { stale: true }).catch(() => undefined);
        if (stale) {
          setState({ status: "found", product: stale, offline: true });
          return;
        }
        const kind = err instanceof LookupError ? err.kind : "network";
        const wait =
          err instanceof LookupError ? Number(/(\d+) s/.exec(err.message)?.[1]) : Number.NaN;
        setState(
          Number.isFinite(wait) ? { status: "error", kind, wait } : { status: "error", kind },
        );
      }
    })();
    return () => ctrl.abort();
  }, [code, lang, onSaved]);

  return state;
}
