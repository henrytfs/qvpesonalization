import { NextRequest, NextResponse } from "next/server";
import { getTemplateAdjustment, saveTemplateAdjustment } from "@/lib/store/templateAdjustmentRepository";
import type { TemplateAdjustment } from "@/lib/types";

export async function GET(request: NextRequest) {
  const sku = request.nextUrl.searchParams.get("sku");
  if (!sku) return NextResponse.json({ error: "Missing sku." }, { status: 400 });
  return NextResponse.json({ adjustment: (await getTemplateAdjustment(sku)) ?? null });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<TemplateAdjustment>;
  if (!body.sku || !body.templateId) {
    return NextResponse.json({ error: "Missing sku or templateId." }, { status: 400 });
  }
  if (!body.surfaces?.length || !body.fields?.length) {
    return NextResponse.json({ error: "Adjustment must include at least one surface and one field." }, { status: 400 });
  }
  const adjustment = await saveTemplateAdjustment({
    sku: body.sku,
    templateId: body.templateId,
    mockupImageUrl: body.mockupImageUrl,
    previewCanvas: body.previewCanvas,
    surfaces: body.surfaces,
    fields: body.fields,
  });
  return NextResponse.json({ adjustment });
}
