/*
 * PlanBium environment configuration.
 *
 * CLIENT-SAFE variables are prefixed with VITE_ and are safe to import in browser code.
 * SERVER-ONLY secrets are never exposed to the client — they are used only by edge functions
 * which read them from the Supabase secret store (Deno.env).
 *
 * Never commit secrets into source control.
 */

/** Client-safe environment variables (safe for browser code). */
export const clientEnv = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
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
  signedUrlExpirySeconds: 180, // 3 minutes — short-lived download access
} as const;

/**
 * Server-only environment keys used by edge functions.
 * These are read from Deno.env in edge function context, NOT from import.meta.env.
 * Listed here for documentation and contract purposes only.
 */
export const serverEnvKeys = {
  supabaseUrl: 'SUPABASE_URL',
  supabaseServiceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY',
  supabaseAnonKey: 'SUPABASE_ANON_KEY',
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
