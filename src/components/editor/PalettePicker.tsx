"use client";

import type { ColorPalette } from "@/lib/types";

export function PalettePicker({ palettes, value, onChange }: { palettes: ColorPalette[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wide text-[#6d6254]">Palette</label>
      <div className="grid grid-cols-1 gap-2">
        {palettes.map((palette) => (
          <button
            key={palette.id}
            type="button"
            onClick={() => onChange(palette.id)}
            className={`flex items-center justify-between rounded-md border p-2 text-left text-sm ${value === palette.id ? "border-[var(--brand)] bg-[#fff8ea]" : "border-[#ddd6ca] bg-white"}`}
          >
            <span className="font-semibold">{palette.name}</span>
            <span className="flex gap-1">
              {(["background", "primaryText", "accent", "highlightName"] as const).map((token) => (
                <span key={token} className="h-4 w-4 rounded-full border border-black/10" style={{ background: palette.tokens[token] }} />
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
