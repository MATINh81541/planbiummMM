/*
 * Demo data adapter — shared localStorage helpers.
 *
 * All demo state persists under "planbium_demo_" prefixed keys.
 * localStorage access is wrapped in try/catch so the app degrades
 * gracefully in environments where storage is unavailable.
 */

const PREFIX = 'planbium_demo_';

export function demoGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function demoSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function demoRemove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export function demoId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const DEMO_USER_ID = 'demo-user';
export const DEMO_USER_EMAIL = 'demo@planbium.ir';
export const DEMO_CREATED_AT = '2026-01-01T00:00:00.000Z';
