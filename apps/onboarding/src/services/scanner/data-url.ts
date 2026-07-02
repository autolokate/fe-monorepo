export type ParsedDataUrl = {
  blob: Blob;
  contentType: string;
  sizeBytes: number;
};

/** Decode a camera capture data URL into upload-ready bytes. */
export function parseDataUrl(dataUrl: string): ParsedDataUrl {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match?.[1] || !match[2]) {
    throw new Error('Invalid photo data.');
  }

  const contentType = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return {
    blob: new Blob([bytes], { type: contentType }),
    contentType,
    sizeBytes: bytes.length,
  };
}
