/*
 * PlanBium pending purchase hook.
 *
 * Preserves the selected product through navigation/authentication.
 * Uses sessionStorage (not localStorage) so it clears when the session ends.
 * This is NOT authoritative cart state — it's a UX bridge so the selected
 * product isn't lost when an unauthenticated user is sent to login.
 * The real cart is server-backed via cartService.
 */

import { useCallback, useState } from 'react';

const STORAGE_KEY = 'planbium.pendingPurchase';

export function usePendingPurchase() {
  const [pendingProductId, setPendingProductId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const setPending = useCallback((productId: string | null) => {
    setPendingProductId(productId);
    try {
      if (productId) {
        sessionStorage.setItem(STORAGE_KEY, productId);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const clearPending = useCallback(() => {
    setPending(null);
  }, [setPending]);

  return { pendingProductId, setPending, clearPending };
}
