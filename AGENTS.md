# AGENTS.md

## Project
Build a standalone layout-only personalization app for Quaviet.com.

Quà Việt sells plaques, trophies, acrylic awards, medals, and similar recognition products. The app must NOT design the physical product shape. It only lets customers personalize predefined text/logo areas on fixed product mockups.

## Architecture principles
- Build as a separate app with its own API.
- Design it so it can later be embedded into Quaviet.com via iframe or JavaScript widget.
- Quaviet.com should eventually pass `sku` or `productId` to this app and receive a `personalizationId` back.
- The layout editor source of truth is JSON + SVG.
- Use SVG for live customer preview and production artwork.
- Do not rely only on screenshots.
- PDF proof can be added later, but structure renderer code so PDF generation can be added cleanly.
- Do not use proprietary fonts, copyrighted artwork, or external image URLs.

## Product rules
- Product mockup/shape is locked.
- Only editable surfaces are customizable:
  - Plaque main plate
  - Acrylic award front print/engraving area
  - Medal face
  - Trophy base plate
- Customer should mostly edit via form controls, not a full free-form design canvas.
- Allow limited adjustment: logo size, text size, alignment, font selection, color palette, optional decorative assets.

## Design rules
- Use controlled color palettes, not a free color picker.
- Use curated font options only.
- Fonts must be Vietnamese-friendly or use safe fallbacks.
- Design elements must come from an online SVG asset library.
- Design elements should use tokenized colors/currentColor where possible.
- Enforce safe areas visually.
- Preview colors are approximate; metallic colors are screen simulations.

## Coding standards
- Use TypeScript.
- Keep renderer logic separate from React components.
- Prefer clear types and small functions.
- Add comments only where they explain business or rendering rules.
- Run lint/build before finishing.
- Do not fake success; if something is not implemented, leave a clear TODO and explain it.

## MVP stack preference
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- File-backed JSON persistence for MVP
- No real auth, no real payment, no checkout in MVP
