"use client";

import { FontPicker } from "@/components/editor/FontPicker";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { FontOption, PersonalizationState, Template } from "@/lib/types";

interface Props {
  template: Template;
  state: PersonalizationState;
  fonts: FontOption[];
  onChange: (state: PersonalizationState) => void;
}

export function FieldPanel({ template, state, fonts, onChange }: Props) {
  const availableFonts = fonts.filter((font) => template.allowedFontIds.includes(font.id));
  return (
    <div className="space-y-4">
      {template.fields.filter((field) => field.type !== "image").map((field) => {
        const value = state.fieldValues[field.id] ?? field.defaultValue ?? "";
        const fontValue = state.fieldFontOverrides[field.id] ?? field.fontFamilyId ?? availableFonts[0]?.id;
        const sizeValue = state.fieldSizeOverrides[field.id] ?? field.fontSize ?? 20;
        const input = (field.maxLength ?? 0) > 70 ? (
          <Textarea value={value} maxLength={field.maxLength} rows={3} onChange={(event) => onChange({ ...state, fieldValues: { ...state.fieldValues, [field.id]: event.target.value } })} />
        ) : (
          <Input value={value} maxLength={field.maxLength} onChange={(event) => onChange({ ...state, fieldValues: { ...state.fieldValues, [field.id]: event.target.value } })} />
        );
        return (
          <div key={field.id} className="space-y-2 rounded-md border border-[#e1dacd] bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-bold text-[#40382d]">{field.label}</label>
              <span className="text-xs text-[#7a7063]">{value.length}/{field.maxLength ?? "∞"}</span>
            </div>
            {input}
            <div className="grid grid-cols-[1fr_92px] gap-2">
              <FontPicker fonts={availableFonts} value={fontValue} onChange={(fontId) => onChange({ ...state, fieldFontOverrides: { ...state.fieldFontOverrides, [field.id]: fontId } })} />
              <Input type="number" min={8} max={72} value={sizeValue} onChange={(event) => onChange({ ...state, fieldSizeOverrides: { ...state.fieldSizeOverrides, [field.id]: Number(event.target.value) } })} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
