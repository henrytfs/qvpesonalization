import { PersonalizationDetail } from "@/components/admin/PersonalizationDetail";
import type { PersonalizationState } from "@/lib/types";

export function PersonalizationList({ items }: { items: PersonalizationState[] }) {
  if (items.length === 0) {
    return <div className="rounded-lg border border-dashed border-[#cabda9] bg-white p-8 text-center text-[#74695c]">No personalizations saved yet.</div>;
  }
  return (
    <div className="space-y-4">
      {items.map((item) => <PersonalizationDetail key={item.id} item={item} />)}
    </div>
  );
}
