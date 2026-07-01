"use client";

import { Button } from "@/components/ui/Button";
import type { DesignAsset, PlacedAsset, ProductType } from "@/lib/types";
import { createPlacedAssetId } from "@/lib/utils/ids";

interface Props {
  assets: DesignAsset[];
  productType: ProductType;
  selectedAssets: PlacedAsset[];
  surfaceId: string;
  onChange: (assets: PlacedAsset[]) => void;
}

export function AssetLibraryPanel({ assets, productType, selectedAssets, surfaceId, onChange }: Props) {
  const available = assets.filter((asset) => asset.allowedProductTypes.includes(productType));
  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-wide text-[#6d6254]">Decorations</label>
      <div className="grid grid-cols-2 gap-2">
        {available.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() =>
              onChange([
                ...selectedAssets,
                { id: createPlacedAssetId(), assetId: asset.id, surfaceId, x: 420, y: 705, width: 160, height: 38, rotation: 0, colorToken: asset.defaultColorToken },
              ])
            }
            className="rounded-md border border-[#ddd6ca] bg-white p-2 text-left text-xs font-semibold hover:border-[var(--brand)]"
          >
            {asset.name}
          </button>
        ))}
      </div>
      {selectedAssets.length > 0 && (
        <div className="space-y-2">
          {selectedAssets.map((placed) => (
            <div key={placed.id} className="flex items-center justify-between rounded-md bg-[#f7f3eb] px-3 py-2 text-sm">
              <span>{assets.find((asset) => asset.id === placed.assetId)?.name ?? placed.assetId}</span>
              <Button type="button" className="px-2 py-1 text-xs" onClick={() => onChange(selectedAssets.filter((item) => item.id !== placed.id))}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
