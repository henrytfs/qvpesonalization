"use client";

export function SafeAreaToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-[#40382d]">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
      Show safe areas
    </label>
  );
}
