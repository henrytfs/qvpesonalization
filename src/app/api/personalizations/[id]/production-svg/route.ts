import { NextRequest, NextResponse } from "next/server";
import { getPalette } from "@/lib/renderer/paletteTokens";
import { composeProductionSvg } from "@/lib/renderer/composeProductionSvg";
import { getTemplateById } from "@/lib/store/catalogRepository";
import { getPersonalization, saveRenderOutput } from "@/lib/store/personalizationRepository";
import { safeDownloadName } from "@/lib/utils/fileNames";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const personalization = await getPersonalization(id);
    if (!personalization) return NextResponse.json({ error: "Personalization not found." }, { status: 404 });
    const template = await getTemplateById(personalization.templateId);
    if (!template) return NextResponse.json({ error: "Template not found." }, { status: 404 });
    const svg = composeProductionSvg(template, personalization, { palette: getPalette(personalization.paletteId) });
    await saveRenderOutput(id, "production_svg", svg, "image/svg+xml", "svg");
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeDownloadName(id)}-production.svg"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create production SVG." }, { status: 500 });
  }
}
