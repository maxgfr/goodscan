/** Small building blocks shared by the views. */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Grade } from "../data/product";
import type { Verdict } from "../score/score";

const ICONS = {
  scan: "M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3m-8 0H5a1 1 0 0 1-1-1v-3M8 8v8m3-8v8m3-8v8m3-8v8",
  history: "M12 8v4l3 2m6-2a9 9 0 1 1-2.6-6.4M21 3v5h-5",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.5 7.5 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.5 7.5 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5v-5m0-3h.01",
  camera:
    "M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  image: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01",
  spark:
    "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z",
  stop: "M7 7h10v10H7z",
  close: "M6 6l12 12M18 6 6 18",
  send: "M4 12 20 4l-4 16-4-7-8-1Z",
  check: "m5 12 5 5L20 7",
  left: "m15 18-6-6 6-6",
  right: "m9 18 6-6-6-6",
  trash: "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3",
  bulb: "M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.2 1 2V16h5v-.1c0-.8.4-1.6 1-2A6 6 0 0 0 12 3Z",
  external: "M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  warn: "M12 9v4m0 3h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 dark:bg-brand-500 dark:text-stone-950 dark:hover:bg-brand-400",
  secondary:
    "border border-stone-300 bg-white text-stone-800 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800",
  ghost:
    "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white",
  danger: "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950",
};

export function Button({
  variant = "primary",
  busy = false,
  icon,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  busy?: boolean;
  icon?: IconName;
}) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {busy ? <Spinner /> : icon ? <Icon name={icon} className="size-4" /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "warn";
  children: ReactNode;
}) {
  const tones = {
    info: "border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-100",
    warn: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-100",
    error:
      "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-100",
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-3 py-2 text-sm ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
      ) : null}
    </div>
  );
}

/** Verdict colours: the dial, the history dots and the chips use the same ones. */
export const VERDICT_TONE: Record<Verdict, { ring: string; text: string; bg: string }> = {
  excellent: {
    ring: "stroke-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-500",
  },
  good: { ring: "stroke-lime-500", text: "text-lime-700 dark:text-lime-400", bg: "bg-lime-500" },
  poor: {
    ring: "stroke-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-500",
  },
  bad: { ring: "stroke-rose-500", text: "text-rose-700 dark:text-rose-400", bg: "bg-rose-500" },
  unknown: { ring: "stroke-stone-400", text: "text-stone-500", bg: "bg-stone-400" },
  "not-food": { ring: "stroke-stone-400", text: "text-stone-500", bg: "bg-stone-400" },
};

/** The 0–100 score as a dial, coloured by verdict. */
export function ScoreDial({
  value,
  verdict,
  label,
  size = 132,
}: {
  value: number | null;
  verdict: Verdict;
  label: string;
  size?: number;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = VERDICT_TONE[verdict];
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={value === null ? label : `${value} / 100, ${label}`}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        width={size}
        height={size}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-stone-200 dark:stroke-stone-800"
        />
        {value !== null ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - value / 100)}
            className={`transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none ${tone.ring}`}
          />
        ) : null}
      </svg>
      <div className="absolute text-center" aria-hidden="true">
        <div className="num text-4xl font-bold tracking-tight" data-testid="score">
          {value ?? "?"}
        </div>
        <div className="text-xs text-stone-500 dark:text-stone-400">/ 100</div>
      </div>
    </div>
  );
}

const GRADE_COLORS: Record<Grade, string> = {
  a: "bg-emerald-700 text-white",
  b: "bg-lime-600 text-white",
  c: "bg-yellow-400 text-stone-900",
  d: "bg-orange-500 text-white",
  e: "bg-rose-600 text-white",
};

/** A plain letter grade (not the trademarked logos). */
export function GradeBadge({
  grade,
  label,
  note,
}: {
  grade: Grade | null;
  label: string;
  note?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid size-9 place-items-center rounded-lg text-lg font-bold uppercase ${grade ? GRADE_COLORS[grade] : "bg-stone-200 text-stone-500 dark:bg-stone-800"}`}
        aria-hidden="true"
      >
        {grade ?? "?"}
      </span>
      <span className="text-xs leading-tight text-stone-600 dark:text-stone-300">
        {label}
        <span className="sr-only"> {grade?.toUpperCase() ?? "?"}</span>
        {note ? <span className="block text-stone-400">{note}</span> : null}
      </span>
    </div>
  );
}

export function NovaBadge({ group, label }: { group: number | undefined; label: string }) {
  const colors = ["", "bg-emerald-700", "bg-yellow-500", "bg-orange-500", "bg-rose-600"];
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid size-9 place-items-center rounded-lg text-lg font-bold text-white ${group ? colors[group] : "bg-stone-200 text-stone-500 dark:bg-stone-800"}`}
        aria-hidden="true"
      >
        {group ?? "?"}
      </span>
      <span className="text-xs leading-tight text-stone-600 dark:text-stone-300">
        {label}
        <span className="sr-only"> {group ?? "?"}</span>
      </span>
    </div>
  );
}

export function Section({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="card">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}
