import type { SelectHTMLAttributes } from "react";

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`w-full rounded-md border border-[#cfc7b8] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[#c49a4f33] ${className}`} {...props} />;
}
