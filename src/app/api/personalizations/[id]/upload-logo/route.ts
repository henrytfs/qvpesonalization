import { NextRequest, NextResponse } from "next/server";
import { getPersonalization, saveLogoFile } from "@/lib/store/personalizationRepository";
import { validateLogoFile } from "@/lib/utils/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const current = await getPersonalization(id);
    if (!current) return NextResponse.json({ error: "Personalization not found." }, { status: 404 });
    const formData = await request.formData();
    const file = formData.get("logo");
    if (!(file instanceof File)) return NextResponse.json({ error: "Missing logo file." }, { status: 400 });
    const errors = validateLogoFile(file);
    if (errors.length) return NextResponse.json({ error: "Validation failed.", errors }, { status: 400 });
    const personalization = await saveLogoFile(id, file);
    return NextResponse.json({ personalization });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload logo." }, { status: 500 });
  }
}
