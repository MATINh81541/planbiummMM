/*
 * Demo catalog adapter.
 *
 * 5 realistic digital planner products with IRR pricing,
 * en + fa translations, and an is_popular flag on one product.
 * Other locales fall back to en.
 */

import type { Product, Price, ProductTranslation } from '@/lib/types';
import type { LocaleCode } from '@/lib/config/locales';
import { fallbackLocale } from '@/lib/config/locales';
import { DEMO_CREATED_AT } from './shared';

export interface DemoProduct extends Product {
  is_popular: boolean;
}

interface DemoCatalogEntry {
  product: DemoProduct;
  prices: Price[];
  translations: ProductTranslation[];
}

const FIXED_DATE = DEMO_CREATED_AT;

function makeProduct(
  id: string,
  slug: string,
  isPopular: boolean,
): DemoProduct {
  return {
    id,
    slug,
    status: 'active',
    metadata: { is_popular: isPopular },
    is_popular: isPopular,
    created_at: FIXED_DATE,
    updated_at: FIXED_DATE,
  };
}

function makePrice(productId: string, amountMinor: number): Price {
  return {
    id: `price_${productId}`,
    product_id: productId,
    currency: 'IRR',
    amount_minor: amountMinor,
    active: true,
    created_at: FIXED_DATE,
    updated_at: FIXED_DATE,
  };
}

function makeTranslation(
  productId: string,
  locale: string,
  name: string,
  tagline: string,
  description: string,
  features: string[],
): ProductTranslation {
  return {
    id: `tr_${productId}_${locale}`,
    product_id: productId,
    locale,
    name,
    tagline,
    description,
    features,
    created_at: FIXED_DATE,
    updated_at: FIXED_DATE,
  };
}

const catalog: DemoCatalogEntry[] = [
  {
    product: makeProduct('p_daily', 'daily-planner', false),
    prices: [makePrice('p_daily', 490000)],
    translations: [
      makeTranslation(
        'p_daily', 'en',
        'Daily Planner',
        'Plan each day with clarity',
        'A clean, structured daily planner with hourly slots, priorities, and a reflections section.',
        ['Hourly schedule grid', 'Top 3 priorities', 'Daily reflection', 'Habit tracker'],
      ),
      makeTranslation(
        'p_daily', 'fa',
        'برنامه‌ریز روزانه',
        'هر روز را با روشنی برنامه‌ریزی کنید',
        'برنامه‌ریز روزانه ساختاریافته با بازه‌های ساعتی، اولویت‌ها و بخش بازتاب.',
        ['جدول زمان‌بندی ساعتی', 'سه اولویت اصلی', 'بازتاب روزانه', 'ردیاب عادت'],
      ),
    ],
  },
  {
    product: makeProduct('p_weekly', 'weekly-planner', false),
    prices: [makePrice('p_weekly', 790000)],
    translations: [
      makeTranslation(
        'p_weekly', 'en',
        'Weekly Planner',
        'See your whole week at a glance',
        'A spacious weekly spread with goals, meal planning, and a review section.',
        ['7-day overview', 'Weekly goals', 'Meal planner', 'Weekly review', 'Task list'],
      ),
      makeTranslation(
        'p_weekly', 'fa',
        'برنامه‌ریز هفتگی',
        'کل هفته را در یک نگاه ببینید',
        'نمای هفتگی جادار با اهداف، برنامه غذایی و بخش بازبینی.',
        ['نمای ۷ روزه', 'اهداف هفتگی', 'برنامه غذایی', 'بازبینی هفتگی', 'فهرست کارها'],
      ),
    ],
  },
  {
    product: makeProduct('p_student', 'student-planner', false),
    prices: [makePrice('p_student', 590000)],
    translations: [
      makeTranslation(
        'p_student', 'en',
        'Student Planner',
        'Stay on top of every deadline',
        'A semester-aware planner with assignment tracking, exam prep, and study schedules.',
        ['Assignment tracker', 'Exam countdown', 'Study schedule', 'GPA calculator', 'Course notes'],
      ),
      makeTranslation(
        'p_student', 'fa',
        'برنامه‌ریز دانشجویی',
        'روی هر مهلت مسلط شوید',
        'برنامه‌ریز آگاه از نیمسال با ردیابی تکالیف، آمادگی امتحان و برنامه مطالعه.',
        ['ردیاب تکلیف', 'شمارش معکوس امتحان', 'برنامه مطالعه', 'محاسبه معدل', 'یادداشت درس'],
      ),
    ],
  },
  {
    product: makeProduct('p_wellness', 'wellness-tracker', true),
    prices: [makePrice('p_wellness', 690000)],
    translations: [
      makeTranslation(
        'p_wellness', 'en',
        'Wellness Tracker',
        'Nurture your body and mind',
        'A holistic wellness tracker for mood, hydration, movement, and self-care rituals.',
        ['Mood tracker', 'Hydration log', 'Exercise log', 'Sleep tracker', 'Self-care checklist'],
      ),
      makeTranslation(
        'p_wellness', 'fa',
        'ردیاب سلامت',
        'بدن و ذهن خود را پرورش دهید',
        'ردیاب سلامت جامع برای خلق، آبرسانی، حرکت و مراسم‌های مراقبت از خود.',
        ['ردیاب خلق', 'ثبت آب', 'ثبت ورزش', 'ردیاب خواب', 'چک‌لیست مراقبت از خود'],
      ),
    ],
  },
  {
    product: makeProduct('p_business', 'business-planner', false),
    prices: [makePrice('p_business', 1290000)],
    translations: [
      makeTranslation(
        'p_business', 'en',
        'Business Planner',
        'Run your business with intention',
        'A comprehensive business planner with OKRs, project tracking, and financial overview.',
        ['OKR tracker', 'Project milestones', 'Revenue tracker', 'Meeting notes', 'Team tasks'],
      ),
      makeTranslation(
        'p_business', 'fa',
        'برنامه‌ریز کسب‌وکار',
        'کسب‌وکار خود را با هدف‌گذاری اداره کنید',
        'برنامه‌ریز جامع کسب‌وکار با OKR، ردیابی پروژه و نمای مالی.',
        ['ردیاب OKR', 'نقاط عطف پروژه', 'ردیاب درآمد', 'یادداشت جلسه', 'وظایف تیم'],
      ),
    ],
  },
];

const catalogById = new Map(catalog.map((c) => [c.product.id, c]));
const catalogBySlug = new Map(catalog.map((c) => [c.product.slug, c]));

export const demoCatalog = {
  listProducts(): Product[] {
    return catalog.map((c) => c.product);
  },

  getProductBySlug(slug: string): Product | null {
    return catalogBySlug.get(slug)?.product ?? null;
  },

  getProductById(id: string): DemoProduct | null {
    return catalogById.get(id)?.product ?? null;
  },

  getTranslations(productId: string, locale: LocaleCode): ProductTranslation[] {
    const entry = catalogById.get(productId);
    if (!entry) return [];
    const exact = entry.translations.filter((t) => t.locale === locale);
    if (exact.length > 0) return exact;
    return entry.translations.filter((t) => t.locale === fallbackLocale);
  },

  getBestTranslation(productId: string, locale: LocaleCode): ProductTranslation | null {
    const translations = demoCatalog.getTranslations(productId, locale);
    const entry = catalogById.get(productId);
    if (entry) {
      const exact = entry.translations.find((t) => t.locale === locale);
      if (exact) return exact;
    }
    return translations[0] ?? null;
  },

  getPrices(productId: string): Price[] {
    return catalogById.get(productId)?.prices ?? [];
  },

  isPopular(productId: string): boolean {
    return catalogById.get(productId)?.product.is_popular ?? false;
  },
};
