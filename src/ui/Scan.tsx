/** The home screen: the camera, a photo, or the digits typed in; then the recent scans. */
import { useCallback, useEffect, useRef, useState } from "react";
import { cleanCode } from "../data/barcode";
import { type Camera, type CameraError, detectInFile, startCamera } from "../scan/scanner";
import { HistoryList } from "./History";
import { Button, Icon, Notice, PageTitle } from "./kit";
import { go, href } from "./router";
import { useApp } from "./state";

/** One product per market, to try without a package in hand (shown until the first scan). */
const SAMPLES = [
  { code: "3017620422003", market: "FR", label: "Nutella" },
  { code: "4000417025005", market: "DE", label: "Ritter Sport" },
  { code: "0016000275287", market: "US", label: "Cheerios" },
  { code: "3274080005003", market: "FR", label: "Cristaline" },
];

export function Scan() {
  const { t, history } = useApp();
  const video = useRef<HTMLVideoElement>(null);
  const camera = useRef<Camera | null>(null);
  const [on, setOn] = useState(false);
  const [starting, setStarting] = useState(false);
  const [torch, setTorch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busyPhoto, setBusyPhoto] = useState(false);

  const stop = useCallback(() => {
    camera.current?.stop();
    camera.current = null;
    setOn(false);
    setTorch(false);
  }, []);
  useEffect(() => stop, [stop]);

  async function start() {
    if (!video.current) return;
    setError(null);
    setStarting(true);
    try {
      camera.current = await startCamera(video.current, (found) => {
        navigator.vibrate?.(40);
        stop();
        go({ name: "product", code: found });
      });
      setOn(true);
    } catch (err) {
      const kind = (err as { kind?: CameraError }).kind;
      setError(kind === "insecure" ? t("scanInsecure") : t("scanNoCamera"));
    } finally {
      setStarting(false);
    }
  }

  async function fromPhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusyPhoto(true);
    try {
      const found = await detectInFile(file);
      if (found) go({ name: "product", code: found });
      else setError(t("scanPhotoNone"));
    } catch {
      setError(t("scanPhotoNone"));
    } finally {
      setBusyPhoto(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = cleanCode(code);
    if (!clean) {
      setError(t("scanInvalid"));
      return;
    }
    go({ name: "product", code: clean });
  }

  return (
    <>
      <PageTitle title={t("scanTitle")} subtitle={t("scanSubtitle")} />

      <div className="relative mb-4 aspect-[3/2] overflow-hidden rounded-2xl bg-stone-900 sm:aspect-video">
        <video
          ref={video}
          className={`size-full object-cover ${on ? "" : "invisible"}`}
          playsInline
          muted
          aria-label={t("scanLooking")}
        />
        {on ? (
          <>
            <div className="pointer-events-none absolute inset-x-[12%] top-1/2 h-[38%] -translate-y-1/2 rounded-xl border-2 border-white/80 shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]">
              <div className="scanline absolute inset-x-2 h-0.5 rounded bg-brand-400" />
            </div>
            <p
              className="absolute inset-x-0 bottom-3 text-center text-sm font-medium text-white"
              role="status"
            >
              {t("scanLooking")}
            </p>
            <div className="absolute top-3 right-3 flex gap-2">
              {camera.current?.hasTorch ? (
                <Button
                  variant="secondary"
                  icon="bulb"
                  aria-pressed={torch}
                  onClick={async () => {
                    if (await camera.current?.torch(!torch)) setTorch(!torch);
                  }}
                >
                  {t("scanTorch")}
                </Button>
              ) : null}
              <Button variant="secondary" icon="stop" onClick={stop}>
                {t("scanStop")}
              </Button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Button
              onClick={() => void start()}
              busy={starting}
              icon="camera"
              className="px-6 py-3 text-base"
            >
              {t("scanStart")}
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <div className="mb-4">
          <Notice tone="warn">{error}</Notice>
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <form onSubmit={submit} className="flex gap-2">
          <label className="sr-only" htmlFor="code">
            {t("scanManual")}
          </label>
          <input
            id="code"
            className="input font-mono"
            inputMode="numeric"
            autoComplete="off"
            placeholder={t("scanManualPlaceholder")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button type="submit" className="shrink-0 whitespace-nowrap">
            {t("scanManualGo")}
          </Button>
        </form>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 focus-within:outline-2 focus-within:outline-brand-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800">
          <Icon name="image" className="size-4" />
          {busyPhoto ? t("scanLooking") : t("scanPhoto")}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void fromPhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {history.length ? (
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-semibold">{t("scanRecent")}</h2>
            <a
              className="text-sm font-medium text-brand-700 underline dark:text-brand-400"
              href={href({ name: "history" })}
            >
              {t("navHistory")}
            </a>
          </div>
          <HistoryList items={history.slice(0, 5)} />
        </section>
      ) : (
        <section aria-labelledby="try">
          <h2 id="try" className="mb-2 text-sm font-semibold">
            {t("scanTry")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <li key={s.code}>
                <a
                  className="chip inline-flex items-center gap-2 py-1.5 text-sm"
                  href={href({ name: "product", code: s.code })}
                >
                  <span className="num rounded bg-stone-100 px-1 text-[10px] font-semibold tracking-wide text-muted dark:bg-stone-800">
                    {s.market}
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
