import { registerSW } from "virtual:pwa-register";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./ui/App";
import { AppProvider } from "./ui/state";

const root = document.getElementById("root");
if (!root) throw new Error("No #root element");

createRoot(root).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);

// Offline from the second visit. A new version is found as the page loads, takes
// over at once and reloads it, before the old one could ask for files gone from
// the server.
if (import.meta.env.PROD) registerSW({ immediate: true });

// The runtime caches' names before they carried the app's: the photos one held opaque
// responses, each counted as megabytes of the origin's quota, shared by every maxgfr.github.io page.
if ("caches" in window)
  for (const name of ["off-images", "alternatives"]) void caches.delete(name).catch(() => false);
