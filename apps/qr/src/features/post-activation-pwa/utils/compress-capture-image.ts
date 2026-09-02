const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.72;

export type CompressedCapture = {
  dataUrl: string;
  blob: Blob;
  originalBytes: number;
  compressedBytes: number;
};

/** Resize and compress camera captures so sessionStorage stays under quota on mobile. */
export async function compressCaptureImage(file: Blob): Promise<CompressedCapture> {
  const originalBytes = file.size;

  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return readBlobAsDataUrl(file, originalBytes);
  }

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return await readBlobAsDataUrl(file, originalBytes);
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    bitmap = null;

    const blob = await canvasToJpegBlob(canvas);
    const dataUrl = await blobToDataUrl(blob);
    return {
      dataUrl,
      blob,
      originalBytes,
      compressedBytes: blob.size,
    };
  } catch {
    bitmap?.close();
    return readBlobAsDataUrl(file, originalBytes);
  }
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas compression returned empty blob'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result) {
        reject(new Error('File readdataurl_empty'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => {
      reject(new Error('FileReader failed while encoding compressed photo'));
    };
    reader.readAsDataURL(blob);
  });
}

async function readBlobAsDataUrl(file: Blob, originalBytes: number): Promise<CompressedCapture> {
  const dataUrl = await blobToDataUrl(file);
  return {
    dataUrl,
    blob: file,
    originalBytes,
    compressedBytes: file.size,
  };
}
