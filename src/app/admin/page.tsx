import Link from "next/link";
import { PersonalizationList } from "@/components/admin/PersonalizationList";
import { listPersonalizations } from "@/lib/store/personalizationRepository";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const items = await listPersonalizations();
  return (
    <main className="min-h-screen bg-[#f6f3ec]">
      <header className="border-b border-[#ded6c8] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-[#251f18]">Personalization Admin</h1>
            <Link href="/admin/calibration" className="rounded-md border border-[#cfc7b8] bg-white px-4 py-2 text-sm font-bold text-[#251f18] transition hover:border-[#b08a3e]">
              Template Calibrator
            </Link>
          </div>
          <p className="mt-2 rounded-md border border-[#d6a94d] bg-[#fff4d6] px-3 py-2 text-sm font-semibold text-[#6f4a00]">
            Admin page is unsecured in MVP. Add Supabase Auth or another access control before production.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-6">
        <PersonalizationList items={items} />
      </section>
    </main>
  );
}
