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
  lang?: Lang;
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
  setLang(lang: Lang): void;
  region: Region;
  regionSetting: Region | "auto";
  setRegion(region: Region | "auto"): void;
  preferences: Preferences;
  setPreferences(p: Preferences): void;
  t: Translate;
  settings: LlmSettings | null;
  history: HistoryItem[];
  refreshHistory(): Promise<void>;
}

const Ctx = createContext<App | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(readStored);
  const [ready, setReady] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const llmState = useLlmSettings(llm);
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-read when the saved settings change
  const settings = useMemo(() => savedSettings(), [llmState.saved]);

  const lang = stored.lang ?? detectLang();
  const regionSetting = stored.region ?? "auto";
  const region = regionSetting === "auto" ? detectRegion() : regionSetting;
  const preferences = stored.preferences ?? DEFAULT_PREFERENCES;

  const update = useCallback((patch: Stored) => {
    setStored((s) => {
      const next = { ...s, ...patch };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const refreshHistory = useCallback(async () => {
    setHistory(await readHistory().catch(() => []));
  }, []);

  useEffect(() => {
    void Promise.all([loadLlmSettings(), refreshHistory()]).finally(() => setReady(true));
  }, [refreshHistory]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<App>(
    () => ({
      ready,
      lang,
      setLang: (l) => update({ lang: l }),
      region,
      regionSetting,
      setRegion: (r) => update({ region: r }),
      preferences,
      setPreferences: (p) => update({ preferences: p }),
      t: translator(lang),
      settings,
      history,
      refreshHistory,
    }),
    [ready, lang, region, regionSetting, preferences, settings, history, refreshHistory, update],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): App {
  const app = useContext(Ctx);
  if (!app) throw new Error("useApp outside AppProvider");
  return app;
}
