import "server-only";
import { iikoMenuSource } from "./menu/iiko-cloud";
import { mockMenuSource } from "./menu/mock";
import { iikoOrderSink } from "./order/iiko-cloud";
import { telegramOrderSink } from "./order/telegram";
import { mockPaymentGateway } from "./payment/mock";
import type { MenuSource, OrderSink, PaymentGateway } from "./types";

// Выбор реализации по переменным окружения (см. .env.example)

export function getMenuSource(): MenuSource {
  return process.env.MENU_PROVIDER === "iiko" ? iikoMenuSource : mockMenuSource;
}

export function getOrderSink(): OrderSink {
  return process.env.ORDER_PROVIDER === "iiko" ? iikoOrderSink : telegramOrderSink;
}

export function getPaymentGateway(): PaymentGateway {
  switch (process.env.PAYMENT_PROVIDER) {
    // case "yookassa": return yookassaGateway;
    // case "tbank": return tbankGateway;
    default:
      return mockPaymentGateway;
  }
}
