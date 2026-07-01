"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ImportResult {
  editorUrl: string;
  product: {
    sku: string;
    name: string;
    mockupImageUrl: string;
  };
  files: {
    image: string;
    adjustment: string;
  };
}

export function ProductImportForm() {
  const [result, setResult] = useState<ImportResult>();
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsImporting(true);
    setError("");
    setResult(undefined);

    const response = await fetch("/api/admin/import-product", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const body = await response.json();
    setIsImporting(false);

    if (!response.ok) {
      setError(body.error ?? "Import failed.");
      return;
    }
    setResult(body as ImportResult);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-[#d8d0c2] bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-[#251f18]">
            SKU
            <Input className="mt-1" name="sku" placeholder="PLAQUE-6014" required />
          </label>
          <label className="text-sm font-bold text-[#251f18]">
            Product type
            <Select className="mt-1" name="productType" defaultValue="plaque" required>
              <option value="plaque">Plaque</option>
              <option value="award">Acrylic award</option>
              <option value="medal">Medal</option>
              <option value="trophy">Trophy</option>
            </Select>
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-[#251f18]">
          Product name
          <Input className="mt-1" name="name" placeholder="Bảng vinh danh 6014" required />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-[#251f18]">
            Product image
            <Input className="mt-1" name="image" type="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          <label className="block text-sm font-bold text-[#251f18]">
            Illustrator JSON
            <Input className="mt-1" name="templateJson" type="file" accept="application/json,.json" required />
          </label>
        </div>

        <Button type="submit" className="mt-5" disabled={isImporting}>
          {isImporting ? "Importing..." : "Import Product"}
        </Button>

        {error ? <p className="mt-3 rounded-md border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-sm font-semibold text-[#be123c]">{error}</p> : null}
      </form>

      <aside className="space-y-4">
        <section className="rounded-lg border border-[#d8d0c2] bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#74695c]">Import Package</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#4f463d]">
            <li>1. Product image from Quaviet product page or studio photo.</li>
            <li>2. Real-size Illustrator JSON exported from the script.</li>
            <li>3. Exact SKU used by Quaviet.com.</li>
          </ul>
        </section>

        {result ? (
          <section className="rounded-lg border border-[#bbd7bd] bg-[#f0fdf4] p-4">
            <h2 className="text-base font-bold text-[#166534]">Imported</h2>
            <p className="mt-1 text-sm font-semibold text-[#14532d]">{result.product.name}</p>
            <p className="font-mono text-xs text-[#166534]">{result.product.sku}</p>
            <div className="mt-3 space-y-1 text-xs text-[#14532d]">
              <p>Image: {result.files.image}</p>
              <p>JSON: {result.files.adjustment}</p>
            </div>
            <Link href={result.editorUrl} className="mt-4 inline-flex rounded-md bg-[#166534] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#14532d]">
              Open Editor
            </Link>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
