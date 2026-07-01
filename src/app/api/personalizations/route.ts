import { NextRequest, NextResponse } from "next/server";
import { getTemplateById, listTemplates } from "@/lib/store/catalogRepository";
import { createPersonalization, listPersonalizations } from "@/lib/store/personalizationRepository";
import type { PersonalizationState } from "@/lib/types";
import { validatePersonalization } from "@/lib/utils/validation";

export async function GET() {
  return NextResponse.json({ personalizations: await listPersonalizations() });
}

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as Partial<PersonalizationState>;
    const template = input.templateId ? await getTemplateById(input.templateId) : undefined;
    if (!template) {
      const available = await listTemplates(input.sku);
      return NextResponse.json({ error: "Invalid templateId.", availableTemplateIds: available.map((item) => item.id) }, { status: 400 });
    }
    const state = {
      sku: template.sku,
      templateId: template.id,
      paletteId: input.paletteId ?? template.defaultPaletteId,
      fieldValues: input.fieldValues ?? {},
      fieldFontOverrides: input.fieldFontOverrides ?? {},
      fieldSizeOverrides: input.fieldSizeOverrides ?? {},
      fieldColorTokenOverrides: input.fieldColorTokenOverrides ?? {},
      selectedAssets: input.selectedAssets ?? [],
      status: "submitted",
      staffNotes: input.staffNotes,
      submittedAt: new Date().toISOString(),
    } satisfies Omit<PersonalizationState, "id" | "createdAt" | "updatedAt">;
    const errors = validatePersonalization(template, { ...state, id: "validation", createdAt: "", updatedAt: "" });
    if (errors.length) return NextResponse.json({ error: "Validation failed.", errors }, { status: 400 });
    const saved = await createPersonalization(state);
    return NextResponse.json({ personalization: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create personalization." }, { status: 500 });
  }
}
