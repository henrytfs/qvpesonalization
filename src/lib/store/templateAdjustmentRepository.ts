import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Template, TemplateAdjustment } from "@/lib/types";
import { templateAdjustmentDir, templateAdjustmentPath } from "@/lib/utils/filePaths";

function now() {
  return new Date().toISOString();
}

async function readAdjustmentFile(sku: string): Promise<TemplateAdjustment | undefined> {
  try {
    const file = await fs.readFile(path.join(process.cwd(), templateAdjustmentPath(sku)), "utf8");
    const adjustment = JSON.parse(file) as TemplateAdjustment;
    return adjustment.sku === sku ? adjustment : undefined;
  } catch {
    return undefined;
  }
}

function applyTemplateAdjustment(template: Template, adjustment: TemplateAdjustment | undefined): Template {
  if (!adjustment || adjustment.templateId !== template.id) return template;
  return {
    ...template,
    mockupImageUrl: adjustment.mockupImageUrl ?? template.mockupImageUrl,
    previewCanvas: adjustment.previewCanvas ?? template.previewCanvas,
    surfaces: adjustment.surfaces ?? template.surfaces,
    fields: adjustment.fields ?? template.fields,
  };
}

export async function applyTemplateAdjustments(templates: Template[]): Promise<Template[]> {
  return Promise.all(
    templates.map(async (template) => {
      const adjustment = await readAdjustmentFile(template.sku);
      return applyTemplateAdjustment(template, adjustment);
    }),
  );
}

export async function getTemplateAdjustment(sku: string): Promise<TemplateAdjustment | undefined> {
  return readAdjustmentFile(sku);
}

export async function saveTemplateAdjustment(input: Omit<TemplateAdjustment, "version" | "updatedAt">): Promise<TemplateAdjustment> {
  const adjustment: TemplateAdjustment = {
    ...input,
    version: 1,
    updatedAt: now(),
  };
  await fs.mkdir(path.join(process.cwd(), templateAdjustmentDir), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), templateAdjustmentPath(input.sku)), JSON.stringify(adjustment, null, 2));
  return adjustment;
}
