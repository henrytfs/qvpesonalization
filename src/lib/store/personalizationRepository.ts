import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { PersonalizationState, RenderOutput } from "@/lib/types";
import { createSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin-client";
import { createPersonalizationId } from "@/lib/utils/ids";
import { extensionForMime } from "@/lib/utils/fileNames";
import { localStorePath, renderOutputPath, uploadLogoPath } from "@/lib/utils/filePaths";

type PersonalizationPatch = Partial<Pick<PersonalizationState, "paletteId" | "fieldValues" | "fieldFontOverrides" | "fieldSizeOverrides" | "fieldColorTokenOverrides" | "selectedAssets" | "status" | "staffNotes">>;

function now() {
  return new Date().toISOString();
}

function mapRow(row: Record<string, unknown>): PersonalizationState {
  return {
    id: String(row.id),
    sku: String(row.sku),
    templateId: String(row.template_id),
    paletteId: String(row.palette_id),
    fieldValues: (row.field_values ?? {}) as Record<string, string>,
    fieldFontOverrides: (row.field_font_overrides ?? {}) as Record<string, string>,
    fieldSizeOverrides: (row.field_size_overrides ?? {}) as Record<string, number>,
    fieldColorTokenOverrides: (row.field_color_token_overrides ?? {}) as PersonalizationState["fieldColorTokenOverrides"],
    logoStoragePath: row.logo_storage_path ? String(row.logo_storage_path) : undefined,
    logoOriginalFilename: row.logo_original_filename ? String(row.logo_original_filename) : undefined,
    logoMimeType: row.logo_mime_type ? String(row.logo_mime_type) : undefined,
    logoSizeBytes: row.logo_size_bytes ? Number(row.logo_size_bytes) : undefined,
    selectedAssets: (row.selected_assets ?? []) as PersonalizationState["selectedAssets"],
    status: (row.status as PersonalizationState["status"]) ?? "draft",
    staffNotes: row.staff_notes ? String(row.staff_notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    submittedAt: row.submitted_at ? String(row.submitted_at) : undefined,
  };
}

function toRow(state: PersonalizationState) {
  return {
    id: state.id,
    sku: state.sku,
    template_id: state.templateId,
    palette_id: state.paletteId,
    field_values: state.fieldValues,
    field_font_overrides: state.fieldFontOverrides,
    field_size_overrides: state.fieldSizeOverrides,
    field_color_token_overrides: state.fieldColorTokenOverrides,
    selected_assets: state.selectedAssets,
    status: state.status,
    staff_notes: state.staffNotes,
    submitted_at: state.submittedAt,
  };
}

async function readLocal(): Promise<PersonalizationState[]> {
  try {
    const file = await fs.readFile(path.join(process.cwd(), localStorePath), "utf8");
    return JSON.parse(file) as PersonalizationState[];
  } catch {
    return [];
  }
}

async function writeLocal(records: PersonalizationState[]) {
  await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), localStorePath), JSON.stringify(records, null, 2));
}

export async function createPersonalization(input: Omit<PersonalizationState, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<PersonalizationState> {
  const timestamp = now();
  const state: PersonalizationState = { ...input, id: input.id ?? createPersonalizationId(), createdAt: timestamp, updatedAt: timestamp };
  if (hasSupabaseAdminEnv()) {
    const { data, error } = await createSupabaseAdminClient().from("personalizations").insert(toRow(state)).select("*").single();
    if (error) throw error;
    return mapRow(data);
  }
  // TODO: Local JSON persistence is only a development fallback until Supabase env vars are configured.
  const records = await readLocal();
  records.unshift(state);
  await writeLocal(records);
  return state;
}

export async function updatePersonalization(id: string, patch: PersonalizationPatch): Promise<PersonalizationState> {
  if (hasSupabaseAdminEnv()) {
    const rowPatch: Record<string, unknown> = {};
    if (patch.paletteId) rowPatch.palette_id = patch.paletteId;
    if (patch.fieldValues) rowPatch.field_values = patch.fieldValues;
    if (patch.fieldFontOverrides) rowPatch.field_font_overrides = patch.fieldFontOverrides;
    if (patch.fieldSizeOverrides) rowPatch.field_size_overrides = patch.fieldSizeOverrides;
    if (patch.fieldColorTokenOverrides) rowPatch.field_color_token_overrides = patch.fieldColorTokenOverrides;
    if (patch.selectedAssets) rowPatch.selected_assets = patch.selectedAssets;
    if (patch.status) rowPatch.status = patch.status;
    if (patch.staffNotes !== undefined) rowPatch.staff_notes = patch.staffNotes;
    if (patch.status === "submitted") rowPatch.submitted_at = now();
    const { data, error } = await createSupabaseAdminClient().from("personalizations").update(rowPatch).eq("id", id).select("*").single();
    if (error) throw error;
    return mapRow(data);
  }
  const records = await readLocal();
  const index = records.findIndex((item) => item.id === id);
  if (index === -1) throw new Error(`Personalization ${id} not found.`);
  records[index] = { ...records[index], ...patch, updatedAt: now(), submittedAt: patch.status === "submitted" ? now() : records[index].submittedAt };
  await writeLocal(records);
  return records[index];
}

export async function getPersonalization(id: string): Promise<PersonalizationState | undefined> {
  if (hasSupabaseAdminEnv()) {
    const { data, error } = await createSupabaseAdminClient().from("personalizations").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : undefined;
  }
  return (await readLocal()).find((item) => item.id === id);
}

export async function listPersonalizations(): Promise<PersonalizationState[]> {
  if (hasSupabaseAdminEnv()) {
    const { data, error } = await createSupabaseAdminClient().from("personalizations").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  }
  return readLocal();
}

export async function saveLogoFile(personalizationId: string, file: File): Promise<PersonalizationState> {
  const extension = extensionForMime(file.type);
  const storagePath = uploadLogoPath(personalizationId, extension);
  if (!hasSupabaseAdminEnv()) {
    const records = await readLocal();
    const index = records.findIndex((item) => item.id === personalizationId);
    if (index === -1) throw new Error(`Personalization ${personalizationId} not found.`);
    records[index] = { ...records[index], logoStoragePath: `local-fallback://${storagePath}`, logoOriginalFilename: file.name, logoMimeType: file.type, logoSizeBytes: file.size, updatedAt: now() };
    await writeLocal(records);
    return records[index];
  }
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_UPLOADS || "customer-uploads";
  const body = Buffer.from(await file.arrayBuffer());
  const supabase = createSupabaseAdminClient();
  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, body, { contentType: file.type, upsert: true });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase
    .from("personalizations")
    .update({ logo_storage_path: `${bucket}/${storagePath}`, logo_original_filename: file.name, logo_mime_type: file.type, logo_size_bytes: file.size })
    .eq("id", personalizationId)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function saveRenderOutput(personalizationId: string, kind: RenderOutput["kind"], body: string, mimeType: string, extension: string): Promise<RenderOutput | undefined> {
  if (!hasSupabaseAdminEnv()) return undefined;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_OUTPUTS || "render-outputs";
  const storagePath = renderOutputPath(personalizationId, extension);
  const supabase = createSupabaseAdminClient();
  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, body, { contentType: mimeType, upsert: true });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase
    .from("render_outputs")
    .insert({ personalization_id: personalizationId, kind, storage_path: `${bucket}/${storagePath}`, mime_type: mimeType, size_bytes: Buffer.byteLength(body) })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: String(data.id),
    personalizationId,
    kind,
    storagePath: String(data.storage_path),
    mimeType,
    sizeBytes: Number(data.size_bytes),
    createdAt: String(data.created_at),
  };
}
