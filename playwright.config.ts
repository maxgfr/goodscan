import { defineConfig, devices } from "@playwright/test";
import { writeBarcodeVideo } from "./e2e/barcode-video";

// Nutella's barcode, filmed by Chromium's fake camera in the camera test.
const video = writeBarcodeVideo(
  "node_modules/.cache/goodscan-e2e/3017620422003.y4m",
  "3017620422003",
);

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4318/",
    trace: "retain-on-failure",
    locale: "en-US",
    // page.route does not see requests a service worker makes: only the offline test lets it run.
    serviceWorkers: "block",
  },
  webServer: {
    command: "bunx vite preview",
    url: "http://localhost:4318/",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      grepInvert: /@camera/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "camera",
      grep: /@camera/,
      use: {
        ...devices["Desktop Chrome"],
        permissions: ["camera"],
        launchOptions: {
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            `--use-file-for-fake-video-capture=${video}`,
          ],
        },
      },
    },
  ],
});
