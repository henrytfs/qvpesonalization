import type { FontOption } from "../lib/types";

export const fonts = [
  {
    id: "formal-serif",
    name: "Formal Serif",
    cssFamily: 'Georgia, "Times New Roman", serif',
    category: "serif",
    supportsVietnamese: true,
    recommendedFor: ["plaque", "award", "medal"],
  },
  {
    id: "modern-sans",
    name: "Modern Sans",
    cssFamily: "Arial, Helvetica, sans-serif",
    category: "sans",
    supportsVietnamese: true,
    recommendedFor: ["plaque", "award", "medal", "trophy"],
  },
  {
    id: "elegant-serif",
    name: "Elegant Serif",
    cssFamily: '"Palatino Linotype", Palatino, serif',
    category: "serif",
    supportsVietnamese: true,
    recommendedFor: ["plaque", "award"],
  },
  {
    id: "bold-sans",
    name: "Bold Sans",
    cssFamily: 'Impact, "Arial Black", sans-serif',
    category: "display",
    supportsVietnamese: true,
    recommendedFor: ["medal", "trophy"],
  },
  {
    id: "clean-vietnamese",
    name: "Clean Vietnamese",
    cssFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    category: "system",
    supportsVietnamese: true,
    recommendedFor: ["plaque", "award", "medal", "trophy"],
  },
  {
    id: "script-placeholder",
    name: "Script Placeholder",
    cssFamily: '"Brush Script MT", cursive',
    category: "script",
    supportsVietnamese: false,
    recommendedFor: ["plaque", "award"],
    isScript: true,
  },
] satisfies FontOption[];
