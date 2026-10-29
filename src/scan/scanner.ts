/**
 * Reads retail barcodes from the camera or a photo. The browser's own
 * BarcodeDetector when it has one for these formats (Chrome on Android and
 * macOS), else the same API over ZXing in WebAssembly (iOS, Firefox,
 * Windows…). The .wasm is served from this site, so it is cached for offline
 * use and the CSP needs no CDN.
 */
import wasmUrl from "zxing-wasm/reader/zxing_reader.wasm?url";

export const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"] as const;

interface Detected {
  rawValue: string;
  format: string;
}
interface Detector {
  detect(source: ImageBitmapSource): Promise<Detected[]>;
}
type DetectorClass = {
  new (options?: { formats: string[] }): Detector;
  getSupportedFormats(): Promise<string[]>;
};

let detector: Promise<Detector> | null = null;

/** Set before the first scan to force the WebAssembly reader (tests, comparisons). */
export const options = { forcePonyfill: false };

async function nativeDetector(): Promise<Detector | null> {
  const Native = (globalThis as { BarcodeDetector?: DetectorClass }).BarcodeDetector;
  if (!Native || options.forcePonyfill) return null;
  try {
    const supported = await Native.getSupportedFormats();
    const formats = FORMATS.filter((f) => supported.includes(f));
    return formats.length === FORMATS.length ? new Native({ formats: [...formats] }) : null;
  } catch {
    return null;
  }
}

export function getDetector(): Promise<Detector> {
  detector ??= (async () => {
    const native = await nativeDetector();
    if (native) return native;
    const { BarcodeDetector, prepareZXingModule } = await import("barcode-detector/ponyfill");
    prepareZXingModule({
      overrides: {
        locateFile: (path: string, prefix: string) =>
          path.endsWith(".wasm") ? new URL(wasmUrl, location.href).href : prefix + path,
      },
      fireImmediately: true,
    });
    return new BarcodeDetector({ formats: [...FORMATS] }) as Detector;
  })();
  detector.catch(() => {
    detector = null;
  });
  return detector;
}

/** The first retail barcode in an image, or null. */
export async function detectIn(source: ImageBitmapSource): Promise<string | null> {
  const found = await (await getDetector()).detect(source);
  return found.find((b) => /^\d{8,14}$/.test(b.rawValue))?.rawValue ?? null;
}

export async function detectInFile(file: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  try {
    return await detectIn(bitmap);
  } finally {
    bitmap.close();
  }
}

export type CameraError = "insecure" | "denied" | "none";

export interface Camera {
  stop(): void;
  /** Toggles the torch; false when the camera has none. */
  torch(on: boolean): Promise<boolean>;
  hasTorch: boolean;
}

/**
 * Starts the back camera into `video` and calls `onCode` once per code read
 * (the same code is not reported again for 3 s, so a held product does not
 * repeat).
 */
export async function startCamera(
  video: HTMLVideoElement,
  onCode: (code: string) => void,
): Promise<Camera> {
  if (!window.isSecureContext)
    throw Object.assign(new Error("insecure"), { kind: "insecure" as CameraError });
  if (!navigator.mediaDevices?.getUserMedia)
    throw Object.assign(new Error("none"), { kind: "none" as CameraError });
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
  } catch (err) {
    const kind: CameraError = (err as DOMException).name === "NotFoundError" ? "none" : "denied";
    throw Object.assign(new Error(kind), { kind });
  }
  video.srcObject = stream;
  video.muted = true;
  video.setAttribute("playsinline", "");
  await video.play().catch(() => undefined);
  const d = await getDetector();

  let stopped = false;
  let last = "";
  let lastAt = 0;
  const loop = async () => {
    if (stopped) return;
    if (video.readyState >= 2 && video.videoWidth > 0) {
      try {
        const found = await d.detect(video);
        const code = found.find((b) => /^\d{8,14}$/.test(b.rawValue))?.rawValue;
        if (code && (code !== last || Date.now() - lastAt > 3000)) {
          last = code;
          lastAt = Date.now();
          onCode(code);
        }
      } catch {
        // A frame that cannot be read: try the next one.
      }
    }
    if (!stopped) setTimeout(() => requestAnimationFrame(() => void loop()), 120);
  };
  void loop();

  const track = stream.getVideoTracks()[0];
  const caps = (track?.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean };
  return {
    hasTorch: Boolean(caps.torch),
    async torch(on) {
      if (!track || !caps.torch) return false;
      try {
        await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
        return true;
      } catch {
        return false;
      }
    },
    stop() {
      stopped = true;
      for (const t of stream.getTracks()) t.stop();
      video.srcObject = null;
    },
  };
}
