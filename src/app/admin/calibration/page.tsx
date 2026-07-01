import Link from "next/link";
import { TemplateCalibrator } from "@/components/admin/TemplateCalibrator";
import { listProducts, listTemplates } from "@/lib/store/catalogRepository";

export const dynamic = "force-dynamic";

export default async function CalibrationPage() {
  const [products, templates] = await Promise.all([listProducts(), listTemplates()]);
  return (
    <main className="min-h-screen bg-[#f6f3ec]">
      <header className="border-b border-[#ded6c8] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#251f18]">Template Calibrator</h1>
              <p className="mt-1 text-sm font-semibold text-[#74695c]">Scan product image size, adjust overlay boxes, and save one JSON adjustment per SKU.</p>
            </div>
            <Link href="/admin" className="rounded-md border border-[#cfc7b8] bg-white px-4 py-2 text-sm font-bold text-[#251f18] transition hover:border-[#b08a3e]">
              Back to Admin
            </Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-6">
        <TemplateCalibrator products={products} templates={templates} />
      </section>
    </main>
  );
}
