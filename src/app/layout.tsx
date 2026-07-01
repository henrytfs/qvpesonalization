import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quà Việt Personalization Studio",
  description: "Layout-only personalization for Quaviet.com recognition products.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
