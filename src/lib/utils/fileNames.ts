const extensionByMime: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "application/json": "json",
};

export function extensionForMime(mimeType: string, fallback = "bin"): string {
  return extensionByMime[mimeType] ?? fallback;
}

export function safeDownloadName(value: string): string {
  return value.replace(/[^a-z0-9_.-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}
