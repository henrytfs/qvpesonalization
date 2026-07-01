-- Seed data for Quà Việt Personalization Studio MVP.

insert into public.color_palettes (id, name, product_types, tokens, production_notes, is_active)
values
  ('classic-gold', 'Classic Gold', array['plaque','award','medal'], '{"background":"#FFFFFF","primaryText":"#111111","secondaryText":"#333333","accent":"#D4AF37","border":"#D4AF37","highlightName":"#B00020","metallic":"#D4AF37"}', 'Gold is a screen simulation; confirm actual material/foil/ink with production.', true),
  ('black-gold', 'Black & Gold', array['plaque','award'], '{"background":"#111111","primaryText":"#D4AF37","secondaryText":"#FFFFFF","accent":"#D4AF37","border":"#D4AF37","highlightName":"#FFFFFF","metallic":"#D4AF37"}', 'Ensure high contrast for small engraved text.', true),
  ('corporate-blue', 'Corporate Blue', array['plaque','award','medal'], '{"background":"#FFFFFF","primaryText":"#0B1F3A","secondaryText":"#333333","accent":"#1F5AA6","border":"#1F5AA6","highlightName":"#0B1F3A","metallic":"#C0C0C0"}', 'Use UV print for accurate blue accents.', true),
  ('red-ceremony', 'Red Ceremony', array['plaque','award','medal'], '{"background":"#FFFFFF","primaryText":"#111111","secondaryText":"#333333","accent":"#B00020","border":"#D4AF37","highlightName":"#B00020","metallic":"#D4AF37"}', 'Good for school, graduation, and formal recognition designs.', true),
  ('trophy-plate-basic', 'Trophy Plate Basic', array['trophy'], '{"background":"#D4AF37","primaryText":"#111111","secondaryText":"#111111","accent":"#111111","border":"#111111","highlightName":"#111111","metallic":"#D4AF37"}', 'Best for black engraving on gold/silver trophy plate.', true)
on conflict (id) do update set
  name = excluded.name,
  product_types = excluded.product_types,
  tokens = excluded.tokens,
  production_notes = excluded.production_notes,
  is_active = excluded.is_active;

insert into public.font_options (id, name, css_family, category, supports_vietnamese, recommended_for, is_script, is_active)
values
  ('formal-serif', 'Formal Serif', 'Georgia, "Times New Roman", serif', 'serif', true, array['plaque','award','medal'], false, true),
  ('modern-sans', 'Modern Sans', 'Arial, Helvetica, sans-serif', 'sans', true, array['plaque','award','medal','trophy'], false, true),
  ('elegant-serif', 'Elegant Serif', '"Palatino Linotype", Palatino, serif', 'serif', true, array['plaque','award'], false, true),
  ('bold-sans', 'Bold Sans', 'Impact, "Arial Black", sans-serif', 'display', true, array['medal','trophy'], false, true),
  ('clean-vietnamese', 'Clean Vietnamese', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 'system', true, array['plaque','award','medal','trophy'], false, true),
  ('script-placeholder', 'Script Placeholder', '"Brush Script MT", cursive', 'script', false, array['plaque','award'], true, true)
on conflict (id) do update set
  name = excluded.name,
  css_family = excluded.css_family,
  category = excluded.category,
  supports_vietnamese = excluded.supports_vietnamese,
  recommended_for = excluded.recommended_for,
  is_script = excluded.is_script,
  is_active = excluded.is_active;

insert into public.design_assets (id, name, category, svg, allowed_product_types, color_editable, default_color_token, production_safe, is_active)
values
  ('divider-simple', 'Simple Divider', 'divider', '<svg viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg"><path d="M10 6h180" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', array['plaque','award','medal','trophy'], true, 'accent', true, true),
  ('divider-double', 'Double Divider', 'divider', '<svg viewBox="0 0 200 18" xmlns="http://www.w3.org/2000/svg"><path d="M10 6h180M10 12h180" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>', array['plaque','award'], true, 'border', true, true),
  ('star-simple', 'Star', 'star', '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 6l13 29 31 3-23 21 7 31-28-16-28 16 7-31L6 38l31-3L50 6z" fill="currentColor"/></svg>', array['plaque','award','medal','trophy'], true, 'accent', true, true),
  ('laurel-simple', 'Simple Laurel', 'laurel', '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M70 105C35 80 28 38 58 12"/><path d="M130 105c35-25 42-67 12-93"/></g></svg>', array['plaque','award','medal'], true, 'accent', true, true),
  ('corner-classic', 'Classic Corner', 'corner', '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M12 88V12h76M25 75V25h50M38 62V38h24" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>', array['plaque','award'], true, 'border', true, true),
  ('border-thin-rect', 'Thin Rectangle Border', 'border', '<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="380" height="240" rx="6" fill="none" stroke="currentColor" stroke-width="4"/></svg>', array['plaque','award'], true, 'border', true, true),
  ('medal-ring-circular', 'Circular Medal Ring', 'medal', '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="8 8"/></svg>', array['medal'], true, 'border', true, true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  svg = excluded.svg,
  allowed_product_types = excluded.allowed_product_types,
  color_editable = excluded.color_editable,
  default_color_token = excluded.default_color_token,
  production_safe = excluded.production_safe,
  is_active = excluded.is_active;

insert into public.products (sku, name, product_type, mockup_image_url, default_template_id, is_active)
values
  ('PLAQUE-6233G', 'Modern Gold Plaque 6233G', 'plaque', '/products/plaque-6233G.jpg', null, true),
  ('AWARD-CMA-AG', 'Acrylic Award CMA-AG', 'award', '/products/award-CMA-AG.jpg', null, true),
  ('TROPHY-FOOTBALL-001', 'Football Trophy Base Plate', 'trophy', '/products/trophy-football-001.jpg', null, true),
  ('MEDAL-46870', 'Round Medal 46870', 'medal', '/products/medal-46870.jpg', null, true)
on conflict (sku) do update set
  name = excluded.name,
  product_type = excluded.product_type,
  mockup_image_url = excluded.mockup_image_url,
  is_active = excluded.is_active;

insert into public.templates (id, sku, name, product_type, config, is_active)
values
  ('tpl-plaque-6233g-classic', 'PLAQUE-6233G', 'Classic Plaque Layout', 'plaque', '{"id":"tpl-plaque-6233g-classic","sku":"PLAQUE-6233G","name":"Classic Plaque Layout","productType":"plaque","mockupImageUrl":"/products/plaque-6233G.jpg","previewCanvas":{"width":1000,"height":1000},"surfaces":[{"id":"main_plate","type":"rectangle","label":"Main Plate","x":260,"y":250,"width":480,"height":360,"realWidthMm":180,"realHeightMm":130,"safeMarginMm":8}],"fields":[{"id":"logo","surfaceId":"main_plate","type":"image","label":"Logo","x":390,"y":272,"width":220,"height":72,"editable":true,"optional":true},{"id":"organization","surfaceId":"main_plate","type":"text","label":"Organization name","defaultValue":"TRƯỜNG MẦM NON MẶT TRỜI NHỎ","x":500,"y":370,"width":420,"fontSize":26,"fontFamilyId":"clean-vietnamese","fontWeight":"700","align":"center","colorToken":"primaryText","editable":true,"maxLength":80,"required":true},{"id":"title","surfaceId":"main_plate","type":"text","label":"Award title","defaultValue":"TRI ÂN","x":500,"y":418,"width":420,"fontSize":40,"fontFamilyId":"formal-serif","fontWeight":"700","align":"center","colorToken":"accent","editable":true,"maxLength":40,"required":true},{"id":"recipient","surfaceId":"main_plate","type":"text","label":"Recipient name","defaultValue":"ĐOÀN THỊ TUẤN HƯƠNG","x":500,"y":470,"width":440,"fontSize":34,"fontFamilyId":"clean-vietnamese","fontWeight":"700","align":"center","colorToken":"highlightName","editable":true,"maxLength":60,"required":true},{"id":"message","surfaceId":"main_plate","type":"text","label":"Message","defaultValue":"Vì sự nghiệp 10 năm trồng người","x":500,"y":520,"width":430,"fontSize":21,"fontFamilyId":"formal-serif","fontWeight":"400","align":"center","colorToken":"secondaryText","editable":true,"maxLength":120,"optional":true},{"id":"date","surfaceId":"main_plate","type":"text","label":"Date","defaultValue":"2013 - 2023","x":500,"y":565,"width":400,"fontSize":22,"fontFamilyId":"clean-vietnamese","fontWeight":"600","align":"center","colorToken":"primaryText","editable":true,"maxLength":40,"optional":true}],"defaultPaletteId":"classic-gold","allowedPaletteIds":["classic-gold","black-gold","corporate-blue","red-ceremony"],"allowedFontIds":["formal-serif","modern-sans","elegant-serif","clean-vietnamese","script-placeholder"],"productionMethod":"uv_print_or_engraving_fill","productionNotes":["Confirm material and color method before production.","Vietnamese diacritics must be checked by staff."]}'::jsonb, true),
  ('tpl-award-cma-ag-modern', 'AWARD-CMA-AG', 'Modern Acrylic Award Layout', 'award', '{"id":"tpl-award-cma-ag-modern","sku":"AWARD-CMA-AG","name":"Modern Acrylic Award Layout","productType":"award","mockupImageUrl":"/products/award-CMA-AG.jpg","previewCanvas":{"width":1000,"height":1000},"surfaces":[{"id":"front_area","type":"rectangle","label":"Front Personalization Area","x":330,"y":160,"width":340,"height":600,"realWidthMm":120,"realHeightMm":210,"safeMarginMm":6}],"fields":[{"id":"logo","surfaceId":"front_area","type":"image","label":"Top logo","x":420,"y":190,"width":160,"height":80,"editable":true,"optional":true},{"id":"title","surfaceId":"front_area","type":"text","label":"Award title","defaultValue":"VINH DANH","x":500,"y":315,"width":300,"fontSize":38,"fontFamilyId":"modern-sans","fontWeight":"700","align":"center","colorToken":"accent","editable":true,"maxLength":40,"required":true},{"id":"recipient","surfaceId":"front_area","type":"text","label":"Recipient / company name","defaultValue":"CÔNG TY ABC","x":500,"y":390,"width":310,"fontSize":34,"fontFamilyId":"clean-vietnamese","fontWeight":"700","align":"center","colorToken":"highlightName","editable":true,"maxLength":60,"required":true},{"id":"description","surfaceId":"front_area","type":"text","label":"Description","defaultValue":"Ghi nhận thành tích xuất sắc","x":500,"y":470,"width":300,"fontSize":22,"fontFamilyId":"formal-serif","fontWeight":"400","align":"center","colorToken":"secondaryText","editable":true,"maxLength":120,"optional":true},{"id":"date","surfaceId":"front_area","type":"text","label":"Date / location","defaultValue":"TP. Hồ Chí Minh, 2026","x":500,"y":640,"width":300,"fontSize":20,"fontFamilyId":"clean-vietnamese","fontWeight":"500","align":"center","colorToken":"primaryText","editable":true,"maxLength":50,"optional":true}],"defaultPaletteId":"corporate-blue","allowedPaletteIds":["classic-gold","corporate-blue","red-ceremony"],"allowedFontIds":["formal-serif","modern-sans","elegant-serif","clean-vietnamese"],"productionMethod":"uv_print_or_laser_engraving","productionNotes":["Preview on transparent acrylic is approximate.","Confirm whether artwork is printed color or engraved single-color."]}'::jsonb, true),
  ('tpl-trophy-football-base', 'TROPHY-FOOTBALL-001', 'Trophy Base Plate Layout', 'trophy', '{"id":"tpl-trophy-football-base","sku":"TROPHY-FOOTBALL-001","name":"Trophy Base Plate Layout","productType":"trophy","mockupImageUrl":"/products/trophy-football-001.jpg","previewCanvas":{"width":1000,"height":1000},"surfaces":[{"id":"base_plate","type":"rectangle","label":"Base Plate","x":360,"y":790,"width":280,"height":90,"realWidthMm":85,"realHeightMm":25,"safeMarginMm":3}],"fields":[{"id":"title","surfaceId":"base_plate","type":"text","label":"Award title","defaultValue":"CHAMPION","x":500,"y":815,"width":250,"fontSize":20,"fontFamilyId":"bold-sans","fontWeight":"700","align":"center","colorToken":"primaryText","editable":true,"maxLength":28,"required":true},{"id":"recipient","surfaceId":"base_plate","type":"text","label":"Team / recipient","defaultValue":"TEAM ABC","x":500,"y":845,"width":250,"fontSize":18,"fontFamilyId":"modern-sans","fontWeight":"700","align":"center","colorToken":"primaryText","editable":true,"maxLength":30,"required":true},{"id":"eventDate","surfaceId":"base_plate","type":"text","label":"Event / date","defaultValue":"QUAViet Cup 2026","x":500,"y":870,"width":250,"fontSize":13,"fontFamilyId":"clean-vietnamese","fontWeight":"500","align":"center","colorToken":"secondaryText","editable":true,"maxLength":36,"optional":true}],"defaultPaletteId":"trophy-plate-basic","allowedPaletteIds":["trophy-plate-basic"],"allowedFontIds":["modern-sans","bold-sans","clean-vietnamese"],"productionMethod":"metal_plate_engraving","productionNotes":["Small base plate; keep text short and high contrast.","Script fonts are not allowed on trophy base plates."]}'::jsonb, true),
  ('tpl-medal-46870-sports', 'MEDAL-46870', 'Sports Medal Layout', 'medal', '{"id":"tpl-medal-46870-sports","sku":"MEDAL-46870","name":"Sports Medal Layout","productType":"medal","mockupImageUrl":"/products/medal-46870.jpg","previewCanvas":{"width":1000,"height":1000},"surfaces":[{"id":"medal_face","type":"circle","label":"Medal Face","centerX":500,"centerY":560,"radius":180,"realDiameterMm":50,"safeMarginMm":3}],"fields":[{"id":"topArc","surfaceId":"medal_face","type":"textArc","label":"Top curved text","defaultValue":"GIẢI GIAO LƯU THỂ THAO","x":500,"y":560,"fontSize":22,"fontFamilyId":"modern-sans","fontWeight":"700","align":"center","colorToken":"primaryText","editable":true,"maxLength":42,"required":true,"radius":145,"startAngle":205,"endAngle":335,"arcPosition":"top"},{"id":"logo","surfaceId":"medal_face","type":"image","label":"Center logo","x":425,"y":480,"width":150,"height":80,"editable":true,"optional":true},{"id":"rank","surfaceId":"medal_face","type":"text","label":"Award rank","defaultValue":"GIẢI NHẤT","x":500,"y":595,"width":250,"fontSize":34,"fontFamilyId":"bold-sans","fontWeight":"700","align":"center","colorToken":"highlightName","editable":true,"maxLength":24,"required":true},{"id":"bottomArc","surfaceId":"medal_face","type":"textArc","label":"Bottom curved text","defaultValue":"AITS - BAN TÀI CHÍNH KẾ TOÁN","x":500,"y":560,"fontSize":18,"fontFamilyId":"modern-sans","fontWeight":"600","align":"center","colorToken":"primaryText","editable":true,"maxLength":46,"optional":true,"radius":145,"startAngle":25,"endAngle":155,"arcPosition":"bottom"},{"id":"year","surfaceId":"medal_face","type":"text","label":"Year","defaultValue":"2026","x":500,"y":645,"width":160,"fontSize":24,"fontFamilyId":"clean-vietnamese","fontWeight":"700","align":"center","colorToken":"accent","editable":true,"maxLength":12,"optional":true}],"defaultPaletteId":"classic-gold","allowedPaletteIds":["classic-gold","corporate-blue","red-ceremony"],"allowedFontIds":["modern-sans","bold-sans","clean-vietnamese"],"productionMethod":"medal_insert_print_or_engraving","productionNotes":["Curved text should be reviewed for readability.","Medal body color is a material option, not a free palette color."]}'::jsonb, true)
on conflict (id) do update set
  sku = excluded.sku,
  name = excluded.name,
  product_type = excluded.product_type,
  config = excluded.config,
  is_active = excluded.is_active;

update public.products
set default_template_id = case sku
  when 'PLAQUE-6233G' then 'tpl-plaque-6233g-classic'
  when 'AWARD-CMA-AG' then 'tpl-award-cma-ag-modern'
  when 'TROPHY-FOOTBALL-001' then 'tpl-trophy-football-base'
  when 'MEDAL-46870' then 'tpl-medal-46870-sports'
  else default_template_id
end
where sku in ('PLAQUE-6233G', 'AWARD-CMA-AG', 'TROPHY-FOOTBALL-001', 'MEDAL-46870');
