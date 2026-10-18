/*
 * PlanBium admin route guard — temporary demo mode.
 *
 * Previously checked `profiles.role === 'admin'` via Supabase. With Supabase
 * removed, the admin area is gated by a simple demo flag so the UI stays
 * reachable for development. Reintroduce a real server-side role check when
 * the custom backend is connected.
 */

import { type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Demo mode: any signed-in demo user can view the admin UI.
  // Admin data is empty/mock until the backend exists.
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
