import { NextRequest, NextResponse } from "next/server";
import { getTemplateById } from "@/lib/store/catalogRepository";
import { getPersonalization, updatePersonalization } from "@/lib/store/personalizationRepository";
import { validatePersonalization } from "@/lib/utils/validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const personalization = await getPersonalization(id);
  if (!personalization) return NextResponse.json({ error: "Personalization not found." }, { status: 404 });
  return NextResponse.json({ personalization });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const current = await getPersonalization(id);
    if (!current) return NextResponse.json({ error: "Personalization not found." }, { status: 404 });
    const patch = await request.json();
    const next = { ...current, ...patch };
    const template = await getTemplateById(next.templateId);
    if (!template) return NextResponse.json({ error: "Invalid template." }, { status: 400 });
    const errors = validatePersonalization(template, next);
    if (errors.length) return NextResponse.json({ error: "Validation failed.", errors }, { status: 400 });
    const personalization = await updatePersonalization(id, patch);
    return NextResponse.json({ personalization });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update personalization." }, { status: 500 });
  }
}
