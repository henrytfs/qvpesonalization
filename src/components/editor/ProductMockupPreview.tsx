"use client";

import type { ColorPalette, PersonalizationState, Template } from "@/lib/types";
import { composePreviewSvg } from "@/lib/renderer/composePreviewSvg";
import Image from "next/image";

interface Props {
  template: Template;
  state: PersonalizationState;
  palette: ColorPalette;
  showSafeAreas: boolean;
}

export function ProductMockupPreview({ template, state, palette, showSafeAreas }: Props) {
  const svg = composePreviewSvg(template, state, { palette, showSafeAreas });
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[760px] overflow-hidden rounded-lg border border-[#d8d0c2] bg-[#ece6db]">
      <Image src={template.mockupImageUrl} alt={template.name} fill sizes="(min-width: 1024px) 760px, 100vw" className="object-contain" priority />
      <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
