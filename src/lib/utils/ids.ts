export function createPersonalizationId(): string {
  return `psn_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

export function createPlacedAssetId(): string {
  return `asset_${crypto.randomUUID().replaceAll("-", "").slice(0, 10)}`;
}
