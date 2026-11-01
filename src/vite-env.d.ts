/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** An OpenAI-compatible proxy holding the key server-side, for deployments that offer a model. */
  readonly VITE_LLM_ENDPOINT?: string;
  readonly VITE_LLM_MODEL?: string;
}
