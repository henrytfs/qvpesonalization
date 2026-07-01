import { notFound } from "next/navigation";
import { PersonalizationEditor } from "@/components/editor/PersonalizationEditor";
import { listDesignAssets, listFonts, listPalettes, listProducts, listTemplates } from "@/lib/store/catalogRepository";

interface Props {
  params: Promise<{ sku: string }>;
}

export default async function EditorPage({ params }: Props) {
  const { sku } = await params;
  const [products, templates, palettes, fonts, assets] = await Promise.all([
    listProducts(),
    listTemplates(sku),
    listPalettes(),
    listFonts(),
    listDesignAssets(),
  ]);
  const product = products.find((item) => item.sku === sku);
  if (!product || templates.length === 0) notFound();
  return <PersonalizationEditor product={product} templates={templates} palettes={palettes} fonts={fonts} assets={assets} />;
}
