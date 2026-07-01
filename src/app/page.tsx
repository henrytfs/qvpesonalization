import { Card } from "@/components/ui/Card";
import { listProducts } from "@/lib/store/catalogRepository";
import Image from "next/image";

export default async function HomePage() {
  const products = await listProducts();
  return (
    <main className="min-h-screen bg-[#f6f3ec]">
      <header className="border-b border-[#ded6c8] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6">
          <h1 className="text-2xl font-bold text-[#251f18]">Quà Việt Personalization Studio</h1>
          <p className="mt-1 text-sm text-[#74695c]">Choose a locked product mockup and personalize only the approved text, logo, and decoration areas.</p>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <a key={product.id} href={`/editor/${product.sku}`}>
            <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="aspect-square bg-[#ebe4d8] p-4">
                <Image src={product.mockupImageUrl} alt={product.name} width={600} height={600} className="h-full w-full object-contain" />
              </div>
              <div className="p-4">
                <h2 className="text-base font-bold text-[#251f18]">{product.name}</h2>
                <p className="mt-1 font-mono text-xs text-[#74695c]">{product.sku}</p>
              </div>
            </Card>
          </a>
        ))}
      </section>
    </main>
  );
}
