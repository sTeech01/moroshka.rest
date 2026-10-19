import type { IikoExternalMenu } from "@/lib/iiko/types";

/**
 * Источник меню. И заглушка, и iikoCloud отдают данные в формате iiko,
 * а в доменную модель их переводит общий маппер (lib/menu/map-iiko.ts).
 */
export interface MenuSource {
  /** Меню доставки — то, что можно заказать на сайте */
  getExternalMenu(): Promise<IikoExternalMenu>;
  /** Меню зала — витрина без заказа. Те же itemId, что и в доставке, у общих блюд */
  getHallMenu(): Promise<IikoExternalMenu>;
  /** ID позиций и модификаторов в стоп-листе */
  getStopList(): Promise<string[]>;
  organizationId?: string;
}

export type OrderLine = {
  productId: string;
  name: string;
  sizeId: string | null;
  sizeName: string | null;
  quantity: number;
  /** Цена одной позиции с модификаторами, пересчитанная на сервере */
  unitPrice: number;
  modifiers: { id: string; groupId: string; name: string; quantity: number; price: number }[];
};

export type PaymentMethod = "cash" | "card" | "online";
export type ServiceType = "delivery" | "pickup";

export type OrderInput = {
  serviceType: ServiceType;
  customer: { name: string; phone: string };
  address?: {
    city: string;
    street: string;
    house: string;
    flat?: string;
    entrance?: string;
    floor?: string;
  };
  /** ISO-время «ко времени» или null — как можно скорее */
  deliverAt: string | null;
  comment?: string;
  payment: PaymentMethod;
  lines: OrderLine[];
  itemsSum: number;
  deliveryPrice: number;
  total: number;
};

export type CreatedOrder = { id: string; number: string };

export type OrderStatus = "accepted" | "cooking" | "on_way" | "delivered" | "cancelled" | "unknown";

export interface OrderSink {
  createOrder(order: OrderInput): Promise<CreatedOrder>;
  getOrderStatus(id: string): Promise<OrderStatus>;
}

export type PaymentStatus = "pending" | "succeeded" | "failed";

export interface PaymentGateway {
  /** Возвращает адрес страницы оплаты, куда перенаправить покупателя */
  createPayment(params: { orderId: string; orderNumber: string; amount: number; returnUrl: string }): Promise<{
    paymentId: string;
    redirectUrl: string;
  }>;
  getStatus(paymentId: string): Promise<PaymentStatus>;
}
