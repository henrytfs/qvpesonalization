"use client";

import { Select } from "@/components/ui/Select";
import type { FontOption } from "@/lib/types";

export function FontPicker({ fonts, value, onChange }: { fonts: FontOption[]; value: string; onChange: (id: string) => void }) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value)}>
      {fonts.map((font) => (
        <option key={font.id} value={font.id}>
          {font.name}{font.supportsVietnamese ? "" : " (limited Vietnamese)"}
        </option>
      ))}
    </Select>
  );
}
