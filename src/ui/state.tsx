/** What every view shares: language, region, food preferences, the AI model, the history. */
import type { LlmSettings } from "llm-connect";
import { useLlmSettings } from "llm-connect/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { llm, loadLlmSettings, savedSettings } from "../ai/settings";
import { type HistoryItem, history as readHistory } from "../data/db";
import { searchAvailable } from "../data/search";
import {
  detectLang,
  detectRegion,
  type Lang,
  type Region,
  type Translate,
  translator,
} from "../i18n";
import { DEFAULT_PREFERENCES, type Preferences } from "../score/match";

const KEY = "goodscan-prefs";

interface Stored {
  lang?: Lang | undefined;
  region?: Region | "auto";
  preferences?: Preferences;
}

function readStored(): Stored {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Stored;
  } catch {
    return {};
  }
}

interface App {
  ready: boolean;
  lang: Lang;
  /** "auto" follows the browser (English when it speaks none of ours). */
  langSetting: Lang | "auto";
  setLang(lang: Lang | "auto"): void;
  region: Region;
  regionSetting: Region | "auto";
  setRegion(region: Region | "auto"): void;
  preferences: Preferences;
  setPreferences(p: Preferences): void;
  t: Translate;
  settings: LlmSettings | null;
  history: HistoryItem[];
  refreshHistory(): Promise<void>;
  /** Name search answers from this page (see data/search.ts). */
  searchOn: boolean;
}

const Ctx = createContext<App | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(readStored);
  const [ready, setReady] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchOn, setSearchOn] = useState(false);
  const llmState = useLlmSettings(llm);
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-read when the saved settings change
  const settings = useMemo(() => savedSettings(), [llmState.saved]);

  const lang = stored.lang ?? detectLang();
  const regionSetting = stored.region ?? "auto";
  const region = regionSetting === "auto" ? detectRegion() : regionSetting;
  const preferences = stored.preferences ?? DEFAULT_PREFERENCES;

  const update = useCallback((patch: Stored) => {
    setStored((s) => {
      const next: Stored = { ...s, ...patch };
      for (const k of Object.keys(next) as (keyof Stored)[])
        if (next[k] === undefined) delete next[k];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const refreshHistory = useCallback(async () => {
    setHistory(await readHistory().catch(() => []));
  }, []);

  useEffect(() => {
    // Start even if a store never answers (another tab holding it): the views cope with nothing.
    void Promise.race([
      Promise.all([loadLlmSettings(), refreshHistory()]),
      new Promise((r) => setTimeout(r, 5000)),
    ]).finally(() => setReady(true));
  }, [refreshHistory]);

  useEffect(() => {
    void searchAvailable().then(setSearchOn);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<App>(
    () => ({
      ready,
      lang,
      langSetting: stored.lang ?? "auto",
      setLang: (l) => update({ lang: l === "auto" ? undefined : l }),
      region,
      regionSetting,
      setRegion: (r) => update({ region: r }),
      preferences,
      setPreferences: (p) => update({ preferences: p }),
      t: translator(lang),
      settings,
      history,
      refreshHistory,
      searchOn,
    }),
    [
      ready,
      lang,
      stored.lang,
      region,
      regionSetting,
      preferences,
      settings,
      history,
      refreshHistory,
      update,
      searchOn,
    ],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): App {
  const app = useContext(Ctx);
  if (!app) throw new Error("useApp outside AppProvider");
  return app;
}
