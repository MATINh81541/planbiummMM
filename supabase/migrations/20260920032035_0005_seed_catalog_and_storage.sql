/*
# PlanBium: Seed catalog data + private storage bucket

## Purpose
1. Creates a private storage bucket `product-assets` for digital planner files.
2. Inserts seed/demo catalog data: 3 products with prices, translations, and assets.

## Storage
- Creates bucket `product-assets` as private (public = false).
- No public read policy — all access via signed URLs from the download edge function.

## Seed Data
Products (all status='active'):
1. "planbium-essential" — Essential Planner
2. "planbium-pro" — Pro Planner
3. "planbium-student" — Student Planner

Each product gets:
- Prices in USD, EUR, and IRR (minor units).
- Translations in en, fa, ar, zh-Hans, nl, es.
- One active asset with a placeholder storage_path.

## Important Notes
1. This is development/demo data only — clearly separated from production business data.
2. No fake payment success is created.
3. Storage paths are placeholders; real files will be uploaded via admin in later prompts.
4. IRR amounts use minor units (rials). USD/EUR use cents.
*/

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-assets', 'product-assets', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED PRODUCTS
-- ============================================================
INSERT INTO products (slug, status, metadata) VALUES
  ('planbium-essential', 'active', '{"highlights":["daily","weekly","monthly"]}'::jsonb),
  ('planbium-pro', 'active', '{"highlights":["daily","weekly","monthly","goal-tracking","habit-tracker"]}'::jsonb),
  ('planbium-student', 'active', '{"highlights":["class-schedule","assignments","semester-goals"]}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED PRICES (amount_minor: USD/EUR in cents, IRR in rials)
-- ============================================================
INSERT INTO prices (product_id, currency, amount_minor, active)
SELECT p.id, c.currency, c.amount_minor, true
FROM products p
JOIN (VALUES
  ('planbium-essential', 'USD', 1900),
  ('planbium-essential', 'EUR', 1800),
  ('planbium-essential', 'IRR', 990000),
  ('planbium-pro', 'USD', 3900),
  ('planbium-pro', 'EUR', 3600),
  ('planbium-pro', 'IRR', 1980000),
  ('planbium-student', 'USD', 1200),
  ('planbium-student', 'EUR', 1100),
  ('planbium-student', 'IRR', 590000)
) AS c(slug, currency, amount_minor) ON p.slug = c.slug
WHERE NOT EXISTS (
  SELECT 1 FROM prices pr
  WHERE pr.product_id = p.id AND pr.currency = c.currency AND pr.active = true
);

-- ============================================================
-- SEED TRANSLATIONS
-- ============================================================
INSERT INTO product_translations (product_id, locale, name, tagline, description, features)
SELECT p.id, t.locale, t.name, t.tagline, t.description, t.features
FROM products p
JOIN (VALUES
  -- Essential
  ('planbium-essential','en','Essential Planner','Your daily life, organized','A clean daily, weekly, and monthly planner to keep you focused.', '["Daily pages","Weekly review","Monthly calendar"]'::jsonb),
  ('planbium-essential','fa','برنامه‌ریز ضروری','زندگی روزمره‌ات را سازماندهی کن','یک برنامه‌ریز تمیز برای روز، هفته و ماه که تمرکزت را حفظ می‌کند.', '["صفحات روزانه","بازبینی هفتگی","تقویم ماهانه"]'::jsonb),
  ('planbium-essential','ar','المخطط الأساسي','نظّم حياتك اليومية','مخطط نظيف يومي وأسبوعي وشهري للحفاظ على تركيزك.', '["صفحات يومية","مراجعة أسبوعية","تقويم شهري"]'::jsonb),
  ('planbium-essential','zh-Hans','基础规划本','整理你的日常生活','简洁的日、周、月规划本，助你保持专注。', '["每日页面","每周回顾","每月日历"]'::jsonb),
  ('planbium-essential','nl','Essentiële Planner','Organiseer je dagelijkse leven','Een overzichtelijke dag-, week- en maandplanner om je gefocust te houden.', '["Dagelijkse pagina''s","Wekelijks overzicht","Maandkalender"]'::jsonb),
  ('planbium-essential','es','Planificador Esencial','Organiza tu vida diaria','Un planificador limpio de día, semana y mes para mantenerte enfocado.', '["Páginas diarias","Revisión semanal","Calendario mensual"]'::jsonb),
  -- Pro
  ('planbium-pro','en','Pro Planner','Everything you need to plan like a pro','Advanced planner with goal tracking, habit tracker, and full lifecycle planning.', '["Daily pages","Weekly review","Monthly calendar","Goal tracking","Habit tracker"]'::jsonb),
  ('planbium-pro','fa','برنامه‌ریز حرفه‌ای','همه چیز برای برنامه‌ریزی حرفه‌ای','برنامه‌ریز پیشرفته با رهگیری اهداف، ردیاب عادت و برنامه‌ریزی کامل.', '["صفحات روزانه","بازبینی هفتگی","تقویم ماهانه","رهگیری اهداف","ردیاب عادت"]'::jsonb),
  ('planbium-pro','ar','المخطط الاحترافي','كل ما تحتاجه للتخطيط كمحترف','مخطط متقدم مع تتبع الأهداف ومتتبع العادات وتخطيط كامل.', '["صفحات يومية","مراجعة أسبوعية","تقويم شهري","تتبع الأهداف","متتبع العادات"]'::jsonb),
  ('planbium-pro','zh-Hans','专业规划本','专业规划所需的一切','高级规划本，包含目标追踪、习惯追踪和全生命周期规划。', '["每日页面","每周回顾","每月日历","目标追踪","习惯追踪"]'::jsonb),
  ('planbium-pro','nl','Pro Planner','Alles wat je nodig hebt om als een pro te plannen','Geavanceerde planner met doeltracking, gewoontetracker en volledige levenscyclusplanning.', '["Dagelijkse pagina''s","Wekelijks overzicht","Maandkalender","Doeltracking","Gewoontetracker"]'::jsonb),
  ('planbium-pro','es','Planificador Pro','Todo lo que necesitas para planificar como un profesional','Planificador avanzado con seguimiento de objetivos, rastreador de hábitos y planificación completa.', '["Páginas diarias","Revisión semanal","Calendario mensual","Seguimiento de objetivos","Rastreador de hábitos"]'::jsonb),
  -- Student
  ('planbium-student','en','Student Planner','Plan your semester, ace your goals','A planner built for students: class schedules, assignments, and semester goals.', '["Class schedule","Assignment tracker","Semester goals"]'::jsonb),
  ('planbium-student','fa','برنامه‌ریز دانشجویی','ترم خود را برنامه‌ریزی کن، اهدافت را محقق کن','برنامه‌ریز ساخته‌شده برای دانشجویان: برنامه کلاس، تکالیف و اهداف ترم.', '["برنامه کلاس","رهگیری تکالیف","اهداف ترم"]'::jsonb),
  ('planbium-student','ar','مخطط الطالب','خطط لفصلك الدراسي وحقق أهدافك','مخطط مصمم للطلاب: جداول الفصول والواجبات وأهداف الفصل الدراسي.', '["جدول الحصص","متتبع الواجبات","أهداف الفصل الدراسي"]'::jsonb),
  ('planbium-student','zh-Hans','学生规划本','规划你的学期，实现你的目标','专为学生设计的规划本：课程表、作业和学期目标。', '["课程表","作业追踪","学期目标"]'::jsonb),
  ('planbium-student','nl','Studenten Planner','Plan je semester en behaal je doelen','Een planner gebouwd voor studenten: lessenroosters, opdrachten en semesterdoelen.', '["Lessenrooster","Opdracht-tracker","Semesterdoelen"]'::jsonb),
  ('planbium-student','es','Planificador para Estudiantes','Planifica tu semestre y logra tus metas','Un planificador diseñado para estudiantes: horarios, tareas y metas del semestre.', '["Horario de clases","Rastreador de tareas","Metas del semestre"]'::jsonb)
) AS t(slug, locale, name, tagline, description, features) ON p.slug = t.slug
WHERE NOT EXISTS (
  SELECT 1 FROM product_translations pt
  WHERE pt.product_id = p.id AND pt.locale = t.locale
);

-- ============================================================
-- SEED ASSETS (placeholder storage paths)
-- ============================================================
INSERT INTO product_assets (product_id, storage_path, asset_type, version, active, metadata)
SELECT p.id, 'product-assets/' || p.slug || '/planner-v1.pdf', 'planner', '1', true, '{"format":"pdf"}'::jsonb
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_assets pa WHERE pa.product_id = p.id AND pa.asset_type = 'planner' AND pa.active = true
);
