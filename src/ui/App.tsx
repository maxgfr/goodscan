/** The shell: header, navigation (a bottom bar on phones), and the current view. */
import { modelLabel } from "../ai/settings";
import type { MessageKey } from "../i18n";
import { About } from "./About";
import { History } from "./History";
import { Icon, type IconName, Spinner } from "./kit";
import { ProductPage } from "./Product";
import { href, type Route, useRoute } from "./router";
import { Scan } from "./Scan";
import { Settings } from "./Settings";
import { useApp } from "./state";

const NAV: { route: Route; label: MessageKey; icon: IconName; match: Route["name"][] }[] = [
  { route: { name: "scan" }, label: "navScan", icon: "scan", match: ["scan", "product"] },
  { route: { name: "history" }, label: "navHistory", icon: "history", match: ["history"] },
  { route: { name: "settings" }, label: "navSettings", icon: "gear", match: ["settings"] },
  { route: { name: "about" }, label: "navAbout", icon: "info", match: ["about"] },
];

function View({ route }: { route: Route }) {
  switch (route.name) {
    case "product":
      return <ProductPage key={route.code} code={route.code} />;
    case "history":
      return <History />;
    case "settings":
      return <Settings />;
    case "about":
      return <About />;
    default:
      return <Scan />;
  }
}

export function App() {
  const route = useRoute();
  const { ready, settings, t } = useApp();

  return (
    <div className="min-h-dvh pb-24 sm:pb-8">
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-stone-50/85 backdrop-blur dark:border-stone-800/70 dark:bg-stone-950/85">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
          <a
            href={href({ name: "scan" })}
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <img src="./icon.svg" alt="" className="size-7" />
            <span>
              good<span className="text-brand-700 dark:text-brand-400">scan</span>
            </span>
          </a>
          <nav className="hidden flex-1 items-center gap-1 sm:flex" aria-label="Main">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={href(n.route)}
                aria-current={n.match.includes(route.name) ? "page" : undefined}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-200/70 aria-[current=page]:bg-stone-900 aria-[current=page]:text-white dark:text-stone-300 dark:hover:bg-stone-800 dark:aria-[current=page]:bg-white dark:aria-[current=page]:text-stone-900"
              >
                {t(n.label)}
              </a>
            ))}
          </nav>
          <a
            href={href({ name: "settings" })}
            className="ml-auto flex max-w-[45%] items-center gap-2 rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-600 transition hover:border-brand-500 dark:border-stone-700 dark:text-stone-300"
          >
            <span
              className={`size-2 shrink-0 rounded-full ${settings ? "bg-brand-500" : "bg-stone-400"}`}
            />
            <span className="truncate">{settings ? modelLabel(settings) : t("aiConnect")}</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        {ready ? (
          <View route={route} />
        ) : (
          <div className="grid place-items-center py-24 text-stone-400">
            <Spinner className="size-6" />
          </div>
        )}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden dark:border-stone-800 dark:bg-stone-950/95"
        aria-label="Main"
      >
        <div className="grid grid-cols-4">
          {NAV.map((n) => {
            const active = n.match.includes(route.name);
            return (
              <a
                key={n.label}
                href={href(n.route)}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-brand-700 dark:text-brand-400" : "text-stone-500"}`}
              >
                <Icon name={n.icon} />
                {t(n.label)}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
