/** Language and region, food preferences (Open Food Facts' own), the AI model, your data. */
import { ENDPOINT_PRESETS } from "llm-connect";
import { useLlmSettings } from "llm-connect/react";
import { useEffect, useState } from "react";
import { llm, proxySettings } from "../ai/settings";
import { clearAll } from "../data/db";
import { detectLang, detectRegion, LANGS, type Lang, type MessageKey, type Region } from "../i18n";
import {
  ATTRIBUTE_GROUPS,
  DEFAULT_PREFERENCES,
  IMPORTANCE,
  IMPORTANCES,
  type Importance,
  PRESETS,
} from "../score/match";
import { Button, Icon, Notice, PageTitle, Section } from "./kit";
import { useApp } from "./state";

export function Settings() {
  const { t, langSetting, setLang, regionSetting, setRegion, refreshHistory } = useApp();
  const [erased, setErased] = useState(false);
  return (
    <>
      <PageTitle title={t("settingsTitle")} />
      <div className="grid gap-4">
        <Section title={`${t("settingsLanguage")} · ${t("settingsRegion")}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">{t("settingsLanguage")}</span>
              <select
                className="input"
                value={langSetting}
                onChange={(e) => setLang(e.target.value as Lang | "auto")}
              >
                <option value="auto">{t("langAuto", { lang: LANGS[detectLang()] })}</option>
                {Object.entries(LANGS).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">{t("settingsRegion")}</span>
              <select
                className="input"
                value={regionSetting}
                onChange={(e) => setRegion(e.target.value as Region | "auto")}
              >
                <option value="auto">
                  {t("regionAuto", { region: t(`region_${detectRegion()}`) })}
                </option>
                <option value="us">{t("region_us")}</option>
                <option value="eu">{t("region_eu")}</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-muted">{t("settingsRegionNote")}</p>
        </Section>

        <Preferences />
        <AiSettings />

        <Section title={t("settingsData")}>
          <p className="mb-3 text-sm text-soft">{t("settingsDataNote")}</p>
          <div className="flex items-center gap-3">
            <Button
              variant="danger"
              onClick={async () => {
                await clearAll();
                await refreshHistory();
                setErased(true);
              }}
            >
              {t("settingsErase")}
            </Button>
            {erased ? <span className="text-sm text-muted">{t("settingsErased")}</span> : null}
          </div>
        </Section>
      </div>
    </>
  );
}

function Preferences() {
  const { t, lang, preferences, setPreferences } = useApp();
  const set = (id: string, importance: Importance) =>
    setPreferences({ ...preferences, [id]: importance });
  const name = (n: Record<string, string>) => n[lang] ?? n.en ?? "";
  return (
    <Section title={t("settingsPreferences")}>
      <p className="mb-3 text-sm text-soft">{t("settingsPreferencesNote")}</p>
      <p className="label">{t("settingsPresets")}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([id, preset]) => {
          const active = Object.entries(preset).every(([k, v]) => preferences[k] === v);
          return (
            <button
              key={id}
              type="button"
              className="chip"
              aria-pressed={active}
              onClick={() => {
                if (!active) return setPreferences({ ...preferences, ...preset });
                const next = { ...preferences };
                for (const k of Object.keys(preset)) {
                  if (DEFAULT_PREFERENCES[k]) next[k] = DEFAULT_PREFERENCES[k];
                  else delete next[k];
                }
                setPreferences(next);
              }}
            >
              {t(`preset_${id}` as MessageKey)}
            </button>
          );
        })}
      </div>
      <div className="grid gap-2">
        {ATTRIBUTE_GROUPS.map((g, gi) => {
          const active = g.attributes.filter(
            (a) => (preferences[a.id] ?? "not_important") !== "not_important",
          ).length;
          return (
            <details
              key={g.id}
              open={gi === 0}
              className="group rounded-xl border border-stone-200 dark:border-stone-800"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                {name(g.name)}
                <span className="flex items-center gap-2 text-xs font-medium text-muted">
                  {active ? <span className="num">{active}</span> : null}
                  <Icon name="right" className="size-4 transition-transform group-open:rotate-90" />
                </span>
              </summary>
              <div className="border-t border-stone-200 px-3 pb-2 dark:border-stone-800">
                {g.warning ? <p className="pt-2 text-xs text-muted">{name(g.warning)}</p> : null}
                <ul className="divide-y divide-stone-100 dark:divide-stone-800/70">
                  {g.attributes.map((a) => {
                    const value = preferences[a.id] ?? "not_important";
                    return (
                      <li key={a.id} className="flex items-center gap-3 py-2">
                        <label htmlFor={`pref-${a.id}`} className="min-w-0 flex-1 text-sm">
                          {name(a.name)}
                        </label>
                        <select
                          id={`pref-${a.id}`}
                          className={`input w-36 shrink-0 py-1.5 sm:w-44 ${value === "not_important" ? "text-muted" : "font-medium"}`}
                          value={value}
                          onChange={(e) => set(a.id, e.target.value as Importance)}
                        >
                          {IMPORTANCES.map((i) => (
                            <option key={i} value={i}>
                              {name(IMPORTANCE[i])}
                            </option>
                          ))}
                        </select>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
      <div className="mt-4">
        <Button variant="ghost" onClick={() => setPreferences(DEFAULT_PREFERENCES)}>
          {t("settingsReset")}
        </Button>
      </div>
    </Section>
  );
}

function AiSettings() {
  const { t } = useApp();
  const state = useLlmSettings(llm);
  const [saved, setSaved] = useState<string | null>(null);
  const d = state.draft;

  useEffect(() => {
    void llm.load().then(() => llm.open());
  }, []);

  async function save() {
    const r = await llm.save();
    setSaved(
      r.ok
        ? t("aiSaved")
        : r.reason === "incomplete"
          ? t("aiIncomplete")
          : r.reason === "insecure-endpoint"
            ? t("aiInsecure")
            : t("aiInvalid"),
    );
  }

  const models = state.models.slice(0, 200);
  const vision = (input?: string[]) => (input ? input.includes("image") : undefined);

  return (
    <Section title={t("settingsAi")}>
      <p className="mb-3 text-sm text-soft">{t("settingsAiNote")}</p>
      {proxySettings() ? <Notice>{t("aiProxy")}</Notice> : null}
      <div className="grid gap-4">
        <div
          className="grid w-fit grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 text-sm dark:bg-stone-800"
          role="tablist"
        >
          {[false, true].map((custom) => (
            <button
              key={String(custom)}
              type="button"
              role="tab"
              aria-selected={d.custom === custom}
              onClick={() => llm.toggleCustom(custom)}
              className={`rounded-lg px-3 py-1 font-medium ${d.custom === custom ? "bg-white shadow-sm dark:bg-stone-950" : "text-muted"}`}
            >
              {custom ? t("aiCustom") : t("aiProvider")}
            </button>
          ))}
        </div>

        {d.custom ? (
          <>
            <div className="flex flex-wrap gap-2">
              {Object.values(ENDPOINT_PRESETS).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="chip"
                  aria-pressed={d.customEndpoint === p.endpoint}
                  onClick={() => llm.applyPreset(p)}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <label>
              <span className="label">{t("aiEndpoint")}</span>
              <input
                className="input"
                placeholder="http://localhost:11434/v1"
                value={d.customEndpoint}
                onChange={(e) => llm.setEndpoint(e.target.value)}
              />
            </label>
            <label>
              <span className="label">{t("aiModel")}</span>
              <input
                className="input"
                placeholder="qwen2.5vl"
                value={d.customModel}
                onChange={(e) => llm.setCustomModel(e.target.value)}
              />
            </label>
          </>
        ) : (
          <>
            <label>
              <span className="label">{t("aiProvider")}</span>
              <select
                className="input"
                value={d.providerId}
                onChange={(e) => llm.selectProvider(e.target.value)}
                disabled={state.catalogStatus === "loading"}
              >
                {state.catalogStatus === "loading" ? <option>{t("aiLoading")}</option> : null}
                <optgroup label={t("aiRecommended")}>
                  {state.providers.recommended.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t("aiOthers")}>
                  {state.providers.others.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            {state.catalogStatus === "error" ? (
              <Notice tone="error">
                {t("aiCatalogError")}{" "}
                <button type="button" className="underline" onClick={() => llm.retryCatalog()}>
                  {t("aiRetry")}
                </button>
              </Notice>
            ) : null}
            <div>
              <span className="label">{t("aiModel")}</span>
              <input
                className="input mb-2"
                placeholder={t("aiSearch")}
                value={state.search}
                onChange={(e) => llm.setSearch(e.target.value)}
                aria-label={t("aiSearch")}
              />
              <div
                className="max-h-56 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-800"
                role="listbox"
                aria-label={t("aiModels")}
              >
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={d.model === m.id}
                    onClick={() => llm.selectModel(m.id)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                      d.model === m.id
                        ? "bg-brand-50 font-semibold text-brand-900 dark:bg-brand-900/40 dark:text-brand-100"
                        : "hover:bg-stone-50 dark:hover:bg-stone-800"
                    }`}
                  >
                    <span className="truncate">
                      {m.name}
                      {state.recommendedModel?.id === m.id ? (
                        <span className="ml-2 text-xs text-brand-700 dark:text-brand-400">
                          {t("aiRecommended")}
                        </span>
                      ) : null}
                    </span>
                    {vision(m.input) ? (
                      <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                        {t("aiPhotos")}
                      </span>
                    ) : null}
                  </button>
                ))}
                {models.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted">{t("aiNoModel")}</p>
                ) : null}
              </div>
            </div>
          </>
        )}

        <label>
          <span className="label">{d.custom ? t("aiKeyOptional") : t("aiKey")}</span>
          <input
            className="input font-mono"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={state.apiKey}
            onChange={(e) => llm.setApiKey(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-brand-600"
            checked={d.rememberKey}
            onChange={(e) => llm.setRememberKey(e.target.checked)}
          />
          {t("aiRemember")}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => void save()} disabled={!state.canSave}>
            {t("aiSave")}
          </Button>
          <Button
            variant="secondary"
            busy={state.testing}
            disabled={!state.canTest}
            onClick={() => void llm.test()}
          >
            {t("aiTest")}
          </Button>
          <Button variant="ghost" onClick={() => void llm.clear().then(() => setSaved(null))}>
            {t("aiForget")}
          </Button>
          {saved ? (
            <span className="text-sm text-soft" role="status">
              {saved}
            </span>
          ) : null}
        </div>
        {state.testResult ? (
          state.testResult.ok ? (
            <Notice>{t("aiTestOk")}</Notice>
          ) : (
            <Notice tone="error">
              {t("aiError", {
                message: `${state.testResult.reason}${state.testResult.message ? ` — ${state.testResult.message}` : ""}`,
              })}
            </Notice>
          )
        ) : null}
      </div>
    </Section>
  );
}
