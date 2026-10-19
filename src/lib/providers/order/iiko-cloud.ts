import { iikoPost, requireEnv } from "@/lib/iiko/client";
import type { OrderInput, OrderSink, OrderStatus } from "../types";

// Заказ на доставку в iikoCloud. Включается ORDER_PROVIDER=iiko.
// Черновик по документации: проверить на тестовой организации до запуска.

const paymentTypeEnv = {
  cash: "IIKO_PAYMENT_TYPE_CASH_ID",
  card: "IIKO_PAYMENT_TYPE_CARD_ID",
  online: "IIKO_PAYMENT_TYPE_ONLINE_ID",
} as const;

const paymentKind = { cash: "Cash", card: "Card", online: "Card" } as const;

function toIikoOrder(order: OrderInput) {
  const a = order.address;
  return {
    phone: order.customer.phone,
    customer: { name: order.customer.name, type: "regular" },
    orderServiceType: order.serviceType === "delivery" ? "DeliveryByCourier" : "DeliveryByClient",
    // iiko ожидает локальное время организации в формате "yyyy-MM-dd HH:mm:ss.fff"
    completeBefore: order.deliverAt ? formatIikoDate(order.deliverAt) : null,
    comment: order.comment ?? null,
    deliveryPoint:
      order.serviceType === "delivery" && a
        ? {
            address: {
              type: "legacy",
              street: { name: a.street, city: a.city },
              house: a.house,
              flat: a.flat || null,
              entrance: a.entrance || null,
              floor: a.floor || null,
            },
          }
        : null,
    items: order.lines.map((l) => ({
      type: "Product",
      productId: l.productId,
      productSizeId: l.sizeId,
      amount: l.quantity,
      price: l.unitPrice - l.modifiers.reduce((s, m) => s + m.price * m.quantity, 0),
      modifiers: l.modifiers.map((m) => ({
        productId: m.id,
        productGroupId: m.groupId,
        amount: m.quantity,
        price: m.price,
      })),
    })),
    payments: [
      {
        paymentTypeKind: paymentKind[order.payment],
        paymentTypeId: requireEnv(paymentTypeEnv[order.payment]),
        sum: order.total,
        isProcessedExternally: order.payment === "online",
      },
    ],
  };
}

function formatIikoDate(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Yekaterinburg" }));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${local.getFullYear()}-${p(local.getMonth() + 1)}-${p(local.getDate())} ${p(local.getHours())}:${p(local.getMinutes())}:00.000`;
}

export const iikoOrderSink: OrderSink = {
  async createOrder(order) {
    const res = await iikoPost<{ orderInfo: { id: string; externalNumber?: string | null } }>(
      "/api/1/deliveries/create",
      {
        organizationId: requireEnv("IIKO_ORGANIZATION_ID"),
        terminalGroupId: requireEnv("IIKO_TERMINAL_GROUP_ID"),
        order: toIikoOrder(order),
      },
    );
    // Номер заказа iiko присваивает асинхронно — до его появления показываем короткий ID
    return { id: res.orderInfo.id, number: res.orderInfo.externalNumber ?? res.orderInfo.id.slice(0, 8) };
  },

  async getOrderStatus(id) {
    const res = await iikoPost<{ orders: { order: { status: string } | null }[] }>(
      "/api/1/deliveries/by_id",
      { organizationId: requireEnv("IIKO_ORGANIZATION_ID"), orderIds: [id] },
    );
    const status = res.orders[0]?.order?.status;
    const map: Record<string, OrderStatus> = {
      Unconfirmed: "accepted",
      WaitCooking: "accepted",
      ReadyForCooking: "cooking",
      CookingStarted: "cooking",
      CookingCompleted: "cooking",
      Waiting: "cooking",
      OnWay: "on_way",
      Delivered: "delivered",
      Closed: "delivered",
      Cancelled: "cancelled",
    };
    return (status && map[status]) || "unknown";
  },
};
