// Photos are redrawn onto a canvas before they go anywhere. Re-encoding drops
// all EXIF metadata, including the GPS location phones embed in camera shots.

export interface AnalysisImage {
  data: string; // base64, no data: prefix
  mediaType: "image/jpeg";
}

async function render(bitmap: ImageBitmap, maxSide: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", quality),
  );
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function prepareImage(file: File): Promise<{ analysis: AnalysisImage; thumb: Blob }> {
  const bitmap = await createImageBitmap(file);
  try {
    const [large, thumb] = await Promise.all([render(bitmap, 1280, 0.85), render(bitmap, 480, 0.8)]);
    const dataUrl = await blobToDataUrl(large);
    return { analysis: { data: dataUrl.split(",")[1], mediaType: "image/jpeg" }, thumb };
  } finally {
    bitmap.close();
  }
}
