/*
 * PlanBium environment configuration.
 *
 * Supabase-specific variables have been removed while we prepare a custom
 * backend. Only generic app config remains. When the new backend is selected,
 * add its client-safe variables here (prefixed with VITE_).
 *
 * Never commit secrets into source control.
 */

/** Client-safe environment variables (safe for browser code). */
export const clientEnv = {
  appUrl: (import.meta.env.VITE_APP_URL as string) || 'http://localhost:5173',
  environment: (import.meta.env.VITE_APP_ENV as string) || 'development',
} as const;

/** Application configuration derived from environment. */
export const appConfig = {
  name: 'PlanBium',
  url: clientEnv.appUrl,
  environment: clientEnv.environment,
  isProduction: clientEnv.environment === 'production',
  defaultLocale: 'en' as const,
  defaultCurrency: 'USD' as const,
  checkoutSessionTtlMinutes: 30,
  signedUrlExpirySeconds: 180,
} as const;

/**
 * Server-only environment keys used by the future backend.
 * Listed here for documentation and contract purposes only — the frontend
 * never reads these. Populate when the custom backend is connected.
 */
export const serverEnvKeys = {
  // Payment providers
  zarinpalMerchantId: 'ZARINPAL_MERCHANT_ID',
  zarinpalEnabled: 'ZARINPAL_ENABLED',
  // Email
  smtpHost: 'SMTP_HOST',
  smtpPort: 'SMTP_PORT',
  smtpUsername: 'SMTP_USERNAME',
  smtpPassword: 'SMTP_PASSWORD',
  smtpFrom: 'SMTP_FROM',
  // Storage
  storageBucket: 'STORAGE_BUCKET',
  // App
  appUrl: 'APP_URL',
  appEnv: 'APP_ENV',
} as const;
