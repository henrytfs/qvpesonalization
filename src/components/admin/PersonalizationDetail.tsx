import { Card } from "@/components/ui/Card";
import type { PersonalizationState } from "@/lib/types";

export function PersonalizationDetail({ item }: { item: PersonalizationState }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-sm font-bold">{item.id}</h2>
          <p className="text-sm text-[#706658]">{item.sku} · {item.templateId} · {item.paletteId}</p>
        </div>
        <div className="flex gap-2 text-sm font-semibold text-[var(--brand-dark)]">
          <a href={`/api/personalizations/${item.id}/production-svg`}>Production SVG</a>
          <a href={`/api/personalizations/${item.id}/layout-json`}>Layout JSON</a>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-4">
        <div><dt className="font-bold">Status</dt><dd>{item.status}</dd></div>
        <div><dt className="font-bold">Logo</dt><dd>{item.logoStoragePath ? "Yes" : "No"}</dd></div>
        <div><dt className="font-bold">Created</dt><dd>{new Date(item.createdAt).toLocaleString()}</dd></div>
        <div><dt className="font-bold">Updated</dt><dd>{new Date(item.updatedAt).toLocaleString()}</dd></div>
      </dl>
      <pre className="mt-4 max-h-64 overflow-auto rounded-md bg-[#f7f3eb] p-3 text-xs">{JSON.stringify(item.fieldValues, null, 2)}</pre>
    </Card>
  );
}
