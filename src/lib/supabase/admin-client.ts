import "server-only";
import { createClient } from "@supabase/supabase-js";

function optionalEnv(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function requireAny(names: string[]): string {
  for (const name of names) {
    const value = optionalEnv(name);
    if (value) return value;
  }
  throw new Error(`Missing required environment variable. Tried: ${names.join(", ")}`);
}

export function hasSupabaseAdminEnv(): boolean {
  return Boolean(optionalEnv("NEXT_PUBLIC_SUPABASE_URL") && (optionalEnv("SUPABASE_SECRET_KEY") || optionalEnv("SUPABASE_SERVICE_ROLE_KEY")));
}

export function createSupabaseAdminClient() {
  return createClient(
    requireAny(["NEXT_PUBLIC_SUPABASE_URL"]),
    requireAny(["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
