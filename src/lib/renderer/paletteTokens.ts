import { palettes } from "@/data/palettes";
import type { ColorPalette, PaletteToken } from "@/lib/types";

export function getPalette(paletteId: string): ColorPalette {
  return palettes.find((palette) => palette.id === paletteId) ?? palettes[0];
}

export function tokenColor(palette: ColorPalette, token?: PaletteToken): string {
  return palette.tokens[token ?? "primaryText"] ?? palette.tokens.primaryText;
}
