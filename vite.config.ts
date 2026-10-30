/**
 * Relative paths (the site lives under /goodscan/), a CSP injected into the
 * built page, and the PWA: a manifest and a Workbox service worker that
 * precaches the app (the ZXing .wasm included) and keeps product photos.
 *
 * The CSP lets the page call any https API (Open Food Facts, your AI
 * provider, models.dev) and local model servers, show Open *Facts images,
 * and run the barcode reader's WebAssembly. It is left out of the dev
 * server, whose hot reload needs inline scripts.
 */
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const IMAGES = ["openfoodfacts", "openbeautyfacts", "openpetfoodfacts", "openproductsfacts"]
  .map((d) => `https://*.${d}.org`)
  .join(" ");

export const CSP = [
  "default-src 'none'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self'",
  "connect-src 'self' https: http://localhost:* http://127.0.0.1:* data: blob:",
  `img-src 'self' blob: data: ${IMAGES}`,
  "media-src 'self' blob: mediastream:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const DESCRIPTION =
  "Scan a food barcode and see if it is good for you: a clear 0–100 score from Open Food Facts (Nutri-Score, NOVA, EFSA additive risks), for the US, France, Germany and worldwide. Optional AI with your own model. No account, no server.";

/** The CSP and the page's meta tags, in the build only. */
function head(): Plugin {
  return {
    name: "head",
    apply: "build",
    transformIndexHtml(html) {
      const tags = [
        `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
        `<meta name="referrer" content="no-referrer" />`,
        `<meta name="description" content="${DESCRIPTION}" />`,
        `<meta property="og:title" content="goodscan" />`,
        `<meta property="og:description" content="${DESCRIPTION}" />`,
      ].join("\n    ");
      const charset = '<meta charset="UTF-8" />';
      return html.replace(charset, `${charset}\n    ${tags}`);
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    head(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["icon.svg", "favicon.ico", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "goodscan — is it good for you?",
        short_name: "goodscan",
        description: DESCRIPTION,
        lang: "en",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#0f766e",
        background_color: "#fafaf9",
        categories: ["health", "food", "lifestyle"],
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // The plugin only adds these itself when it injects the registration; this
        // app registers in main.tsx, so a new version would wait for every tab to close.
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,svg,png,ico,wasm,json}"],
        // The better-choice lists are fetched one shard at a time, not installed.
        globIgnores: ["alternatives/**"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes("/alternatives/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "alternatives",
              expiration: { maxEntries: 64, maxAgeSeconds: 7 * 24 * 3600 },
            },
          },
          {
            // Product photos: <img> loads are opaque, so status 0 is cached too.
            urlPattern: /^https:\/\/images\.open(food|beauty|petfood|products)facts\.org\//,
            handler: "CacheFirst",
            options: {
              cacheName: "off-images",
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: { target: "es2023", chunkSizeWarningLimit: 2000 },
  // Its own port, so a preview from another project is never mistaken for this one.
  preview: { port: 4318, strictPort: true },
});
