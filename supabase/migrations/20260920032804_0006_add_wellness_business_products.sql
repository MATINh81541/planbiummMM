/*
# PlanBium: Add 2 additional products to reach 5 pricing cards

## Purpose
The pricing page requires exactly 5 product cards. Currently only 3 exist.
This adds:
4. "planbium-wellness" — Wellness Planner
5. "planbium-business" — Business Planner

## New Data
Products, prices (USD/EUR/IRR), translations (6 locales), and placeholder assets.

## Important Notes
1. Development/demo data only.
2. No fake payment success.
3. IRR amounts use rials, USD/EUR use cents.
*/

INSERT INTO products (slug, status, metadata) VALUES
  ('planbium-wellness', 'active', '{"highlights":["mood-tracker","meal-planner","self-care"]}'::jsonb),
  ('planbium-business', 'active', '{"highlights":["projects","meetings","finance","team-goals"]}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO prices (product_id, currency, amount_minor, active)
SELECT p.id, c.currency, c.amount_minor, true
FROM products p
JOIN (VALUES
  ('planbium-wellness', 'USD', 2500),
  ('planbium-wellness', 'EUR', 2300),
  ('planbium-wellness', 'IRR', 1290000),
  ('planbium-business', 'USD', 4900),
  ('planbium-business', 'EUR', 4500),
  ('planbium-business', 'IRR', 2490000)
) AS c(slug, currency, amount_minor) ON p.slug = c.slug
WHERE NOT EXISTS (
  SELECT 1 FROM prices pr
  WHERE pr.product_id = p.id AND pr.currency = c.currency AND pr.active = true
);

INSERT INTO product_translations (product_id, locale, name, tagline, description, features)
SELECT p.id, t.locale, t.name, t.tagline, t.description, t.features
FROM products p
JOIN (VALUES
  ('planbium-wellness','en','Wellness Planner','Nurture your mind and body','Track moods, plan meals, and build self-care habits that last.', '["Mood tracker","Meal planner","Self-care routines","Habit tracker"]'::jsonb),
  ('planbium-wellness','fa','برنامه‌ریز سلامتی','از ذهن و بدنت مراقبت کن','رهگیری خلق، برنامه‌ریزی وعده‌های غذایی و ساختن عادت‌های مراقبت از خود.', '["رهگیری خلق","برنامه غذایی","روال‌های مراقبت از خود","ردیاب عادت"]'::jsonb),
  ('planbium-wellness','ar','مخطط العافية','اعتنِ بعقلك وجسدك','تتبع المزاج وتخطيط الوجبات وبناء عادات الرعاية الذاتية.', '["متتبع المزاج","مخطط الوجبات","روتين الرعاية الذاتية","متتبع العادات"]'::jsonb),
  ('planbium-wellness','zh-Hans','健康规划本','呵护你的身心','追踪情绪、规划饮食、养成持久的自我关怀习惯。', '["情绪追踪","饮食规划","自我关怀习惯","习惯追踪"]'::jsonb),
  ('planbium-wellness','nl','Wellness Planner','Zorg voor je hoofd en lichaam','Volg je stemming, plan je maaltijden en bouw blijvende self-care gewoonten.', '["Stemming-tracker","Maaltijdplanner","Self-care routines","Gewoontetracker"]'::jsonb),
  ('planbium-wellness','es','Planificador de Bienestar','Cuida tu mente y cuerpo','Registra tu estado de ánimo, planifica comidas y crea hábitos de autocuidado.', '["Rastreador de ánimo","Planificador de comidas","Rutinas de autocuidado","Rastreador de hábitos"]'::jsonb),
  ('planbium-business','en','Business Planner','Run your business with clarity','Plan projects, track meetings, manage finances, and align your team.', '["Project planning","Meeting tracker","Finance overview","Team goals"]'::jsonb),
  ('planbium-business','fa','برنامه‌ریز کسب‌وکار','کسب‌وکارت را با وضوح مدیریت کن','برنامه‌ریزی پروژه‌ها، رهگیری جلسات، مدیریت مالی و هم‌راستایی تیم.', '["برنامه‌ریزی پروژه","رهگیری جلسات","نمای کلی مالی","اهداف تیم"]'::jsonb),
  ('planbium-business','ar','مخطط الأعمال','أدر عملك بوضوح','خطط للمشاريع وتتبع الاجتماعات وأدر الماليات ووحّد فريقك.', '["تخطيط المشاريع","متتبع الاجتماعات","نظرة مالية","أهداف الفريق"]'::jsonb),
  ('planbium-business','zh-Hans','商业规划本','清晰地经营你的业务','规划项目、追踪会议、管理财务，并协调你的团队。', '["项目规划","会议追踪","财务概览","团队目标"]'::jsonb),
  ('planbium-business','nl','Business Planner','Leid je bedrijf met helderheid','Plan projecten, volg vergaderingen, beheer financiën en stem je team af.', '["Projectplanning","Vergadering-tracker","Financieel overzicht","Teamdoelen"]'::jsonb),
  ('planbium-business','es','Planificador de Negocios','Dirige tu negocio con claridad','Planifica proyectos, registra reuniones, gestiona finanzas y alinea tu equipo.', '["Planificación de proyectos","Rastreador de reuniones","Resumen financiero","Metas del equipo"]'::jsonb)
) AS t(slug, locale, name, tagline, description, features) ON p.slug = t.slug
WHERE NOT EXISTS (
  SELECT 1 FROM product_translations pt
  WHERE pt.product_id = p.id AND pt.locale = t.locale
);

INSERT INTO product_assets (product_id, storage_path, asset_type, version, active, metadata)
SELECT p.id, 'product-assets/' || p.slug || '/planner-v1.pdf', 'planner', '1', true, '{"format":"pdf"}'::jsonb
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_assets pa WHERE pa.product_id = p.id AND pa.asset_type = 'planner' AND pa.active = true
);
