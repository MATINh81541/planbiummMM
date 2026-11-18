/*
 * Demo entitlements adapter.
 *
 * Entitlements persist in localStorage. Downloads return a data: URL
 * containing a small generated placeholder PDF.
 */

import type { Entitlement } from '@/lib/types';
import { demoGet, demoSet, demoId, DEMO_USER_ID } from './shared';
import { demoCatalog } from './catalog';

const KEY = 'entitlements';

function loadEntitlements(): Entitlement[] {
  return demoGet<Entitlement[]>(KEY, []);
}

function saveEntitlements(items: Entitlement[]): void {
  demoSet(KEY, items);
}

export const demoEntitlements = {
  async listEntitlements(): Promise<Entitlement[]> {
    return loadEntitlements().filter((e) => e.status === 'active');
  },

  async hasEntitlement(productId: string): Promise<boolean> {
    return loadEntitlements().some((e) => e.product_id === productId && e.status === 'active');
  },

  grantEntitlementsForOrder(orderId: string, productIds: string[]): Entitlement[] {
    const existing = loadEntitlements();
    const granted: Entitlement[] = [];
    for (const productId of productIds) {
      if (existing.some((e) => e.product_id === productId && e.status === 'active')) continue;
      const ent: Entitlement = {
        id: demoId('ent'),
        user_id: DEMO_USER_ID,
        product_id: productId,
        order_id: orderId,
        status: 'active',
        granted_at: new Date().toISOString(),
        revoked_at: null,
        metadata: {},
      };
      existing.push(ent);
      granted.push(ent);
    }
    saveEntitlements(existing);
    return granted;
  },
};

/**
 * Generate a small placeholder PDF as a data: URL.
 * The PDF contains the product name and a short message.
 */
export function generateDownloadUrl(entitlementId: string): { url: string; expiresAt: string } {
  const entitlements = loadEntitlements();
  const ent = entitlements.find((e) => e.id === entitlementId);
  const product = ent ? demoCatalog.getProductById(ent.product_id) : null;
  const productName = product?.slug ?? 'planner';

  const translation = ent ? demoCatalog.getBestTranslation(ent.product_id, 'en') : null;
  const displayName = translation?.name ?? productName;

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 24 Tf
50 760 Td
(${displayName.replace(/[()\\]/g, '')}) Tj
/F1 14 Tf
0 -30 Td
(Demo placeholder planner - PlanBium) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000411 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
480
%%EOF`;

  const url = `data:application/pdf;filename=${encodeURIComponent(productName)}.pdf;base64,${btoa(unescape(encodeURIComponent(pdfContent)))}`;
  const expiresAt = new Date(Date.now() + 180_000).toISOString();

  return { url, expiresAt };
}
