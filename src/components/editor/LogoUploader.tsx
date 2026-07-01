"use client";

import { Input } from "@/components/ui/Input";

export function LogoUploader({ onSelect }: { onSelect: (file: File, dataUrl: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wide text-[#6d6254]">Logo</label>
      <Input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.type === "application/pdf") {
            onSelect(file, "");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => onSelect(file, String(reader.result ?? ""));
          reader.readAsDataURL(file);
        }}
      />
      <p className="text-xs leading-5 text-[#756b5d]">For best production quality, upload SVG, PDF, AI, or high-resolution PNG.</p>
    </div>
  );
}
