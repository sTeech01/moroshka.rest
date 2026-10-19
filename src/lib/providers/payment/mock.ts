import type { PaymentGateway } from "../types";

/**
 * Заглушка эквайринга: «оплата» сразу считается успешной.
 * На проде онлайн-оплата скрыта флагом NEXT_PUBLIC_ONLINE_PAYMENT_ENABLED.
 */
export const mockPaymentGateway: PaymentGateway = {
  async createPayment({ orderId, returnUrl }) {
    const url = new URL(returnUrl);
    url.searchParams.set("paid", "1");
    return { paymentId: `mock-${orderId}`, redirectUrl: url.toString() };
  },
  async getStatus() {
    return "succeeded";
  },
};
