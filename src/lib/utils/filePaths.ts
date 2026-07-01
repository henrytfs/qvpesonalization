export const localStorePath = "data/personalizations.json";

export function uploadLogoPath(personalizationId: string, extension: string): string {
  return `personalizations/${personalizationId}/logo-original.${extension}`;
}

export function renderOutputPath(personalizationId: string, extension: string): string {
  const filename = extension === "json" ? "layout.json" : `production.${extension}`;
  return `personalizations/${personalizationId}/${filename}`;
}
