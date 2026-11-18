/*
 * PlanBium payment service.
 *
 * When VITE_DEMO_MODE is "true", delegates to the demo payment adapter.
 * When "false", keeps the existing throw-on-use behavior.
 */

import { appConfig } from '@/lib/config/env';
import { demoPayment } from './demo/payment';

export interface PaymentInitResponse {
  orderId: string;
  paymentId: string;
  provider: string;
  redirectUrl: string | null;
  status: string;
}

const emptyService = {
  async initiatePayment(_sessionId: string, _methodId: string): Promise<PaymentInitResponse> {
    throw new Error('backend_unavailable');
  },
  async verifyPayment(_orderId: string): Promise<{ orderStatus: string; paymentStatus: string }> {
    throw new Error('backend_unavailable');
  },
};

export const paymentService = appConfig.isDemo ? demoPayment : emptyService;
