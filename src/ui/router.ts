/** Hash routes, so the app works from any folder of GitHub Pages. */
import { useEffect, useState } from "react";

export type Route =
  | { name: "scan" }
  | { name: "product"; code: string }
  | { name: "search"; q: string }
  | { name: "history" }
  | { name: "settings" }
  | { name: "about" };

export function parseRoute(hash: string): Route {
  const [path = "", query = ""] = hash.replace(/^#\/?/, "").split("?");
  const [name, arg] = path.split("/");
  switch (name) {
    case "p":
      return arg && /^\d{8,14}$/.test(arg) ? { name: "product", code: arg } : { name: "scan" };
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
      return `#/p/${route.code}`;
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
