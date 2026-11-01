/** Hash routes, so the app works from any folder of GitHub Pages. */
import { useEffect, useState } from "react";
import type { Source } from "../data/product";

/** The databases a product link may name (from a name search hit). */
const DBS: readonly Source[] = ["off", "obf", "opff", "opf"];

export type Route =
  | { name: "scan" }
  | { name: "product"; code: string; db?: Source }
  | { name: "search"; q: string }
  | { name: "history" }
  | { name: "settings" }
  | { name: "about" };

export function parseRoute(hash: string): Route {
  const [path = "", query = ""] = hash.replace(/^#\/?/, "").split("?");
  const [name, arg] = path.split("/");
  switch (name) {
    case "p": {
      if (!arg || !/^\d{8,14}$/.test(arg)) return { name: "scan" };
      const db = DBS.find((d) => d === new URLSearchParams(query).get("db"));
      return db ? { name: "product", code: arg, db } : { name: "product", code: arg };
    }
    case "search": {
      const q = new URLSearchParams(query).get("q")?.trim();
      return q ? { name: "search", q } : { name: "scan" };
    }
    case "history":
    case "settings":
    case "about":
      return { name };
    default:
      return { name: "scan" };
  }
}

export function href(route: Route): string {
  switch (route.name) {
    case "scan":
      return "#/";
    case "product":
      return `#/p/${route.code}${route.db && route.db !== "off" ? `?db=${route.db}` : ""}`;
    case "search":
      return `#/search?${new URLSearchParams({ q: route.q })}`;
    default:
      return `#/${route.name}`;
  }
}

export function go(route: Route): void {
  location.hash = href(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseRoute(location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
