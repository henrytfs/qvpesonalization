"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { EditableSurface, Product, Template, TemplateField } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface Props {
  products: Product[];
  templates: Template[];
}

type NumberKey = "x" | "y" | "width" | "height" | "fontSize";
type SurfaceNumberKey = "x" | "y" | "width" | "height";

function cloneFields(fields: TemplateField[]) {
  return fields.map((field) => ({ ...field }));
}

function cloneSurfaces(surfaces: EditableSurface[]) {
  return surfaces.map((surface) => ({ ...surface }));
}

function surfaceLabel(surface: EditableSurface) {
  if (surface.type === "circle") return `${surface.label}: center ${surface.centerX}, ${surface.centerY}, radius ${surface.radius}`;
  if (surface.type === "polygon") return `${surface.label}: polygon`;
  return `${surface.label}: ${surface.x}, ${surface.y}, ${surface.width} x ${surface.height}`;
}

function fieldRect(field: TemplateField) {
  const width = field.width ?? 160;
  const height = field.height ?? Math.max(32, field.fontSize ?? 24);
  return { x: field.x - width / 2, y: field.type === "image" ? field.y : field.y - height, width, height };
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function TemplateCalibrator({ products, templates }: Props) {
  const [sku, setSku] = useState(products[0]?.sku ?? "");
  const template = useMemo(() => templates.find((item) => item.sku === sku) ?? templates[0], [sku, templates]);
  const product = useMemo(() => products.find((item) => item.sku === sku), [sku, products]);
  const [canvas, setCanvas] = useState(template?.previewCanvas ?? { width: 1000, height: 1000 });
  const [surfaces, setSurfaces] = useState<EditableSurface[]>(cloneSurfaces(template?.surfaces ?? []));
  const [fields, setFields] = useState<TemplateField[]>(cloneFields(template?.fields ?? []));
  const [selectedFieldId, setSelectedFieldId] = useState(fields[0]?.id ?? "");
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function loadTemplate(nextSku: string) {
    const nextTemplate = templates.find((item) => item.sku === nextSku);
    setSku(nextSku);
    if (!nextTemplate) return;
    setCanvas(nextTemplate.previewCanvas);
    setSurfaces(cloneSurfaces(nextTemplate.surfaces));
    setFields(cloneFields(nextTemplate.fields));
    setSelectedFieldId(nextTemplate.fields[0]?.id ?? "");
    setSaveState("idle");
  }

  function updateFirstSurface(key: SurfaceNumberKey, value: string) {
    setSurfaces((current) =>
      current.map((surface, index) => {
        if (index !== 0 || surface.type !== "rectangle") return surface;
        return { ...surface, [key]: toNumber(value) };
      }),
    );
  }

  function updateSelectedField(key: NumberKey, value: string) {
    setFields((current) => current.map((field) => (field.id === selectedFieldId ? { ...field, [key]: toNumber(value) } : field)));
  }

  function useImageCanvas() {
    if (!imageSize) return;
    setCanvas(imageSize);
    const width = Math.round(imageSize.width * 0.42);
    const height = Math.round(imageSize.height * 0.28);
    setSurfaces((current) =>
      current.map((surface, index) => {
        if (index !== 0 || surface.type !== "rectangle") return surface;
        return {
          ...surface,
          x: Math.round((imageSize.width - width) / 2),
          y: Math.round(imageSize.height * 0.34),
          width,
          height,
        };
      }),
    );
  }

  async function saveAdjustment() {
    if (!template) return;
    setSaveState("saving");
    const response = await fetch("/api/admin/template-adjustments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: template.sku,
        templateId: template.id,
        mockupImageUrl: product?.mockupImageUrl ?? template.mockupImageUrl,
        previewCanvas: canvas,
        surfaces,
        fields,
      }),
    });
    setSaveState(response.ok ? "saved" : "error");
  }

  const selectedField = fields.find((field) => field.id === selectedFieldId);
  const firstSurface = surfaces[0];
  const imageUrl = product?.mockupImageUrl ?? template?.mockupImageUrl ?? "";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-lg border border-[#d8d0c2] bg-white p-4">
        <div className="relative mx-auto aspect-square w-full max-w-[780px] overflow-hidden rounded-md border border-[#d8d0c2] bg-[#ece6db]">
          {imageUrl ? (
            // Product mockups are admin-managed source artwork; keep the coordinate overlay in the same object-fit mode as the customer editor.
            <Image
              src={imageUrl}
              alt={template?.name ?? "Product image"}
              fill
              sizes="(min-width: 1024px) 780px, 100vw"
              className="absolute inset-0 h-full w-full object-contain"
              onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            />
          ) : null}
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${canvas.width} ${canvas.height}`} role="img" aria-label="Template calibration overlay">
            {surfaces.map((surface) => {
              if (surface.type === "circle") {
                return <circle key={surface.id} cx={surface.centerX} cy={surface.centerY} r={surface.radius} fill="rgba(255,255,255,0.18)" stroke="#d6a94d" strokeDasharray="10 8" strokeWidth="3" />;
              }
              if (surface.type === "polygon") {
                return <polygon key={surface.id} points={surface.points.map((point) => `${point.x},${point.y}`).join(" ")} fill="rgba(255,255,255,0.14)" stroke="#d6a94d" strokeDasharray="10 8" strokeWidth="3" />;
              }
              return <rect key={surface.id} x={surface.x} y={surface.y} width={surface.width} height={surface.height} fill="rgba(255,255,255,0.18)" stroke="#d6a94d" strokeDasharray="10 8" strokeWidth="3" />;
            })}
            {fields.map((field) => {
              const rect = fieldRect(field);
              const selected = field.id === selectedFieldId;
              return (
                <g key={field.id} onClick={() => setSelectedFieldId(field.id)} className="cursor-pointer">
                  <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={selected ? "rgba(190,18,60,0.16)" : "rgba(15,23,42,0.08)"} stroke={selected ? "#be123c" : "#0f172a"} strokeWidth={selected ? 3 : 2} />
                  <text x={rect.x + 8} y={rect.y + 22} fontSize="18" fontFamily="Arial, Helvetica, sans-serif" fill={selected ? "#be123c" : "#0f172a"}>
                    {field.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-lg border border-[#d8d0c2] bg-white p-4">
          <label className="text-xs font-bold uppercase tracking-wide text-[#74695c]">Product</label>
          <Select className="mt-2" value={sku} onChange={(event) => loadTemplate(event.target.value)}>
            {products.map((item) => (
              <option key={item.sku} value={item.sku}>
                {item.name} · {item.sku}
              </option>
            ))}
          </Select>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[#74695c]">
            <div>Canvas: {canvas.width} x {canvas.height}</div>
            <div>Image: {imageSize ? `${imageSize.width} x ${imageSize.height}` : "loading"}</div>
          </div>
          <Button type="button" className="mt-3 w-full" onClick={useImageCanvas} disabled={!imageSize}>
            Scan Image Size
          </Button>
        </section>

        <section className="rounded-lg border border-[#d8d0c2] bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#74695c]">Editable Surface</h2>
          <p className="mt-1 text-sm text-[#74695c]">{firstSurface ? surfaceLabel(firstSurface) : "No surface"}</p>
          {firstSurface?.type === "rectangle" ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["x", "y", "width", "height"] as SurfaceNumberKey[]).map((key) => (
                <label key={key} className="text-sm font-semibold text-[#251f18]">
                  {key}
                  <Input className="mt-1" type="number" value={firstSurface[key]} onChange={(event) => updateFirstSurface(key, event.target.value)} />
                </label>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-[#d8d0c2] bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#74695c]">Fields</h2>
          <Select className="mt-2" value={selectedFieldId} onChange={(event) => setSelectedFieldId(event.target.value)}>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.label}
              </option>
            ))}
          </Select>
          {selectedField ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["x", "y", "width", "height", "fontSize"] as NumberKey[]).map((key) => (
                <label key={key} className="text-sm font-semibold text-[#251f18]">
                  {key}
                  <Input className="mt-1" type="number" value={Number(selectedField[key] ?? 0)} onChange={(event) => updateSelectedField(key, event.target.value)} />
                </label>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-[#d8d0c2] bg-white p-4">
          <Button type="button" className="w-full" onClick={saveAdjustment} disabled={saveState === "saving"}>
            {saveState === "saving" ? "Saving..." : "Save Adjustment File"}
          </Button>
          {saveState === "saved" ? <p className="mt-2 text-sm font-semibold text-[#166534]">Saved. Refresh the editor to use this adjustment.</p> : null}
          {saveState === "error" ? <p className="mt-2 text-sm font-semibold text-[#be123c]">Save failed. Check the adjustment values.</p> : null}
        </section>
      </aside>
    </div>
  );
}
