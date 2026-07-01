import { createClient } from "@supabase/supabase-js";

function requireAny(names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  throw new Error(`Missing required browser Supabase env. Tried: ${names.join(", ")}`);
}

export function createSupabaseBrowserClient() {
  return createClient(
    requireAny(["NEXT_PUBLIC_SUPABASE_URL"]),
    requireAny(["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]),
  );
}
