import type { Product } from "../lib/types";

export const products = [
  {
    id: "prod-plaque-6233g",
    sku: "PLAQUE-6233G",
    name: "Modern Gold Plaque 6233G",
    productType: "plaque",
    mockupImageUrl: "/products/plaque-6233G.jpg",
    defaultTemplateId: "tpl-plaque-6233g-classic",
  },
  {
    id: "prod-award-cma-ag",
    sku: "AWARD-CMA-AG",
    name: "Acrylic Award CMA-AG",
    productType: "award",
    mockupImageUrl: "/products/award-CMA-AG.jpg",
    defaultTemplateId: "tpl-award-cma-ag-modern",
  },
  {
    id: "prod-trophy-football-001",
    sku: "TROPHY-FOOTBALL-001",
    name: "Football Trophy Base Plate",
    productType: "trophy",
    mockupImageUrl: "/products/trophy-football-001.jpg",
    defaultTemplateId: "tpl-trophy-football-base",
  },
  {
    id: "prod-medal-46870",
    sku: "MEDAL-46870",
    name: "Round Medal 46870",
    productType: "medal",
    mockupImageUrl: "/products/medal-46870.jpg",
    defaultTemplateId: "tpl-medal-46870-sports",
  },
] satisfies Product[];
