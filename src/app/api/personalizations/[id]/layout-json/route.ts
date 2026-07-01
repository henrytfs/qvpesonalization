import { NextRequest, NextResponse } from "next/server";
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
    const body = JSON.stringify(personalization, null, 2);
    await saveRenderOutput(id, "layout_json", body, "application/json", "json");
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeDownloadName(id)}-layout.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create layout JSON." }, { status: 500 });
  }
}
