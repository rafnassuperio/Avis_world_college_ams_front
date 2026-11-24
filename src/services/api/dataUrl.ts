// Decode FileReader output locally. Fetching a data URL is subject to connect-src CSP.
export function dataUrlToBlob(value: string): Blob {
  const match = /^data:([^;,]+);base64,([\s\S]*)$/.exec(value);
  if (!match) throw new Error("Invalid image data. Select the image again.");
  const decoded = atob(match[2]);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
  return new Blob([bytes], { type: match[1] });
}
