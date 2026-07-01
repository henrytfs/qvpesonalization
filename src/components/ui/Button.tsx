import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border border-transparent bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
