"use client";

import { useMemo, useState } from "react";
import { AssetLibraryPanel } from "@/components/editor/AssetLibraryPanel";
import { ExportPanel } from "@/components/editor/ExportPanel";
import { FieldPanel } from "@/components/editor/FieldPanel";
import { LogoUploader } from "@/components/editor/LogoUploader";
import { PalettePicker } from "@/components/editor/PalettePicker";
import { ProductMockupPreview } from "@/components/editor/ProductMockupPreview";
import { SafeAreaToggle } from "@/components/editor/SafeAreaToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import type { ColorPalette, DesignAsset, FontOption, PersonalizationState, Product, Template } from "@/lib/types";
import { createPersonalizationId } from "@/lib/utils/ids";

interface Props {
  product: Product;
  templates: Template[];
  palettes: ColorPalette[];
  fonts: FontOption[];
  assets: DesignAsset[];
}

function createInitialState(template: Template): PersonalizationState {
  return {
    id: createPersonalizationId(),
    sku: template.sku,
    templateId: template.id,
    paletteId: template.defaultPaletteId,
    fieldValues: Object.fromEntries(template.fields.map((field) => [field.id, field.defaultValue ?? ""])),
    fieldFontOverrides: {},
    fieldSizeOverrides: {},
    fieldColorTokenOverrides: {},
    selectedAssets: [],
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function PersonalizationEditor({ product, templates, palettes, fonts, assets }: Props) {
  const [templateId, setTemplateId] = useState(product.defaultTemplateId);
  const template = templates.find((item) => item.id === templateId) ?? templates[0];
  const [state, setState] = useState(() => createInitialState(template));
  const [showSafeAreas, setShowSafeAreas] = useState(true);
  const [savedId, setSavedId] = useState<string | undefined>();
  const [logoFile, setLogoFile] = useState<File | undefined>();
  const [message, setMessage] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const palette = palettes.find((item) => item.id === state.paletteId) ?? palettes[0];
  const allowedPalettes = useMemo(() => palettes.filter((item) => template.allowedPaletteIds.includes(item.id)), [palettes, template.allowedPaletteIds]);

  function changeTemplate(nextTemplateId: string) {
    const nextTemplate = templates.find((item) => item.id === nextTemplateId);
    if (!nextTemplate) return;
    setTemplateId(nextTemplateId);
    setState(createInitialState(nextTemplate));
    setSavedId(undefined);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const endpoint = savedId ? `/api/personalizations/${savedId}` : "/api/personalizations";
      const method = savedId ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state, templateId: template.id, sku: template.sku, status: "submitted" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.errors?.join(" ") || payload.error || "Unable to save personalization.");
      const saved = payload.personalization as PersonalizationState;
      setState((current) => ({ ...current, ...saved }));
      setSavedId(saved.id);

      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        const uploadResponse = await fetch(`/api/personalizations/${saved.id}/upload-logo`, { method: "POST", body: formData });
        const uploadPayload = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadPayload.errors?.join(" ") || uploadPayload.error || "Logo upload failed.");
        setState((current) => ({ ...current, ...uploadPayload.personalization }));
      }

      const completed = {
        type: "quaviet.personalization.completed",
        version: "1.0",
        personalizationId: saved.id,
        sku: template.sku,
        templateId: template.id,
        paletteId: state.paletteId,
        productionSvgUrl: `/api/personalizations/${saved.id}/production-svg`,
        layoutJsonUrl: `/api/personalizations/${saved.id}/layout-json`,
      };
      window.parent?.postMessage(completed, "*");
      setMessage(`Saved personalization ${saved.id}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f3ec]">
      <header className="border-b border-[#ded6c8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <h1 className="text-xl font-bold text-[#251f18]">Quà Việt Personalization Studio</h1>
            <p className="text-sm text-[#74695c]">{product.name} · {product.sku}</p>
          </div>
          <a href="/admin" className="text-sm font-semibold text-[var(--brand-dark)]">Admin</a>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-3">
          <ProductMockupPreview template={template} state={state} palette={palette} showSafeAreas={showSafeAreas} />
          <Card className="p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#6d6254]">Template</label>
                <Select value={templateId} onChange={(event) => changeTemplate(event.target.value)}>
                  {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              </div>
              <div className="flex items-end"><SafeAreaToggle checked={showSafeAreas} onChange={setShowSafeAreas} /></div>
              <div className="flex items-end justify-start md:justify-end"><ExportPanel personalizationId={savedId} /></div>
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="p-4">
            <PalettePicker palettes={allowedPalettes} value={state.paletteId} onChange={(paletteId) => setState({ ...state, paletteId })} />
          </Card>
          <Card className="p-4">
            <FieldPanel template={template} state={state} fonts={fonts} onChange={setState} />
          </Card>
          <Card className="p-4">
            <LogoUploader onSelect={(file, dataUrl) => {
              setLogoFile(file);
              setState({ ...state, logoDataUrl: dataUrl || state.logoDataUrl });
            }} />
          </Card>
          <Card className="p-4">
            <AssetLibraryPanel
              assets={assets}
              productType={template.productType}
              selectedAssets={state.selectedAssets}
              surfaceId={template.surfaces[0]?.id ?? "surface"}
              onChange={(selectedAssets) => setState({ ...state, selectedAssets })}
            />
          </Card>
          <Card className="space-y-3 p-4">
            <Button type="button" disabled={saving} onClick={save} className="w-full">
              {saving ? "Saving..." : savedId ? "Update personalization" : "Submit personalization"}
            </Button>
            {message && <p className="text-sm font-semibold text-[#5b5145]">{message}</p>}
            {savedId && <p className="text-xs text-[#74695c]">personalizationId: <span className="font-mono">{savedId}</span></p>}
          </Card>
        </aside>
      </div>
    </main>
  );
}
