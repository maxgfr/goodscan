/**
 * Every model call goes through llm-connect: the model from the saved
 * settings, the provider options for it, a check of what it accepts before any
 * request, and errors described without the key.
 */
import { generateText, type LanguageModel, type ModelMessage, Output } from "ai";
import {
  type Capabilities,
  callOptions,
  callProblem,
  describeError,
  type LlmErrorCode,
  type LlmSettings,
  loadModel,
  webSearchTools,
} from "llm-connect";
import type { z } from "zod";
import { capabilitiesOf } from "./settings";

export interface CallContext {
  settings: LlmSettings;
  signal?: AbortSignal;
  /** Replaces the model the settings point to (tests). */
  model?: LanguageModel;
  /** Replaces what the catalog says the model takes (tests). */
  capabilities?: Capabilities;
}

export class AiError extends Error {
  constructor(
    message: string,
    readonly retryable = false,
  ) {
    super(message);
  }
}

/** What each kind of failure means for the user, ahead of the provider's own words. */
const FAILURES: Record<LlmErrorCode, string> = {
  auth: "The provider refused the key. Check it in Settings.",
  "auth-or-network":
    "No answer from the provider: the key was refused, or the network or the provider's CORS policy blocked the request.",
  "rate-limit": "Too many requests for now: wait a moment.",
  overloaded: "The provider is overloaded right now.",
  "context-length": "This is more than the model can read at once.",
  "invalid-request": "The provider refused the request.",
  "not-found": "The provider does not know this model. Pick another one in Settings.",
  server: "The provider ran into an error.",
  unknown: "The model call failed.",
};

/** A readable error for any failed call: what it means, then the provider's message. */
export function aiError(err: unknown, settings: LlmSettings): AiError {
  if (err instanceof AiError) return err;
  const e = describeError(err, settings.apiKey);
  const detail = e.message.trim();
  return new AiError(
    detail ? `${FAILURES[e.code]} (${detail.replace(/\.$/, "")}.)` : FAILURES[e.code],
    e.retryable,
  );
}

export function hasImage(messages: ModelMessage[]): boolean {
  return messages.some(
    (m) =>
      Array.isArray(m.content) &&
      m.content.some(
        (p) => p.type === "image" || (p.type === "file" && p.mediaType.startsWith("image")),
      ),
  );
}

export interface CallOptions {
  /** Let the model search the web with its provider's own tool. */
  webSearch?: boolean;
}

/** Does the connected model have its provider's web search? */
export function canSearchWeb(ctx: Pick<CallContext, "settings" | "capabilities">): boolean {
  return Boolean((ctx.capabilities ?? capabilitiesOf(ctx.settings)).webSearch);
}

/** Checks the call against the model before any request; returns its capabilities. */
export function preflight(
  ctx: CallContext,
  messages: ModelMessage[],
  opts: CallOptions = {},
): Capabilities {
  const capabilities = ctx.capabilities ?? capabilitiesOf(ctx.settings);
  if (hasImage(messages) && !capabilities.vision) {
    throw new AiError(
      "This model does not accept photos. Pick a vision model in Settings (GPT, Claude, Gemini…).",
    );
  }
  if (opts.webSearch && !capabilities.webSearch) {
    throw new AiError(
      "This model cannot search the web. Pick one that can in Settings (Claude, GPT, Gemini…).",
    );
  }
  const problem = callProblem(
    ctx.settings,
    { messages, ...(opts.webSearch ? { webSearch: true } : {}) },
    capabilities,
  );
  if (problem) throw new AiError(problem.message);
  return capabilities;
}

export interface Answer {
  text: string;
  /** The pages a web search read, when there was one. */
  sources: { url: string; title?: string }[];
}

/** A plain-text answer, with the pages its web search read. */
export async function answer(
  ctx: CallContext,
  instructions: string,
  messages: ModelMessage[],
  opts: CallOptions = {},
): Promise<Answer> {
  const capabilities = preflight(ctx, messages, opts);
  try {
    const tools = opts.webSearch
      ? await webSearchTools(capabilities.webSearch, { maxUses: 5 })
      : undefined;
    const res = await generateText({
      model: ctx.model ?? (await loadModel(ctx.settings)),
      instructions,
      messages,
      ...(tools ? { tools } : {}),
      maxRetries: 1,
      ...(ctx.signal ? { abortSignal: ctx.signal } : {}),
      ...callOptions(ctx.settings, { capabilities }),
    });
    const seen = new Set<string>();
    const sources: Answer["sources"] = [];
    for (const s of res.steps.flatMap((step) => step.sources)) {
      if (s.sourceType !== "url" || !/^https?:\/\//.test(s.url) || seen.has(s.url)) continue;
      seen.add(s.url);
      sources.push(s.title ? { url: s.url, title: s.title } : { url: s.url });
    }
    return { text: res.text.trim(), sources };
  } catch (err) {
    if (ctx.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    throw aiError(err, ctx.settings);
  }
}

/** A plain-text answer. */
export async function text(
  ctx: CallContext,
  instructions: string,
  messages: ModelMessage[],
): Promise<string> {
  return (await answer(ctx, instructions, messages)).text;
}

/** One structured answer, checked against `schema`. */
export async function structured<S extends z.ZodType>(
  ctx: CallContext,
  schema: S,
  name: string,
  instructions: string,
  messages: ModelMessage[],
): Promise<z.infer<S>> {
  const capabilities = preflight(ctx, messages);
  try {
    const res = await generateText({
      model: ctx.model ?? (await loadModel(ctx.settings)),
      instructions,
      messages,
      output: Output.object({ schema, name }),
      maxRetries: 1,
      ...(ctx.signal ? { abortSignal: ctx.signal } : {}),
      ...callOptions(ctx.settings, { capabilities }),
    });
    return res.output as z.infer<S>;
  } catch (err) {
    if (ctx.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    throw aiError(err, ctx.settings);
  }
}
