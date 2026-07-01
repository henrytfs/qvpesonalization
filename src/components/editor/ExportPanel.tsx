"use client";

import { Button } from "@/components/ui/Button";

export function ExportPanel({ personalizationId }: { personalizationId?: string }) {
  if (!personalizationId) return null;
  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-[#ddd6ca] bg-[#fffaf0] p-3">
      <a href={`/api/personalizations/${personalizationId}/production-svg`}><Button type="button">Production SVG</Button></a>
      <a href={`/api/personalizations/${personalizationId}/layout-json`}><Button type="button" className="bg-[#514638] hover:bg-[#31291f]">Layout JSON</Button></a>
    </div>
  );
}
