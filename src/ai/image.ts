/** A label photo, made small enough for a model: 1600 px on the long side keeps small print readable. */

export interface ModelImage {
  data: Uint8Array;
  mediaType: string;
}

const MODEL_SIDE = 1600;

export async function preparePhoto(file: Blob): Promise<ModelImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MODEL_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot read images.");
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
    return { data: new Uint8Array(await blob.arrayBuffer()), mediaType: "image/jpeg" };
  } finally {
    bitmap.close();
  }
}
