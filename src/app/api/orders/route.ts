import { features, siteConfig } from "@/config/site";
import { buildOrder } from "@/lib/order/build-order";
import { checkoutSchema } from "@/lib/order/schema";
import { getOrderSink, getPaymentGateway } from "@/lib/providers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!features.onlineOrders) {
    return Response.json({ error: "Онлайн-заказы пока не принимаются. Позвоните нам, пожалуйста." }, { status: 403 });
  }
  if (!rateLimit(`order:${clientIp(req)}`, 5)) {
    return Response.json({ error: "Слишком много попыток. Позвоните нам, пожалуйста." }, { status: 429 });
  }

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Проверьте форму" }, { status: 400 });
  }
  // Сработала ловушка для ботов — делаем вид, что всё хорошо
  if (parsed.data.website) return Response.json({ id: "0", number: "0" });

  if (parsed.data.payment === "online" && !features.onlinePayment) {
    return Response.json({ error: "Онлайн-оплата временно недоступна" }, { status: 400 });
  }

  const built = await buildOrder(parsed.data);
  if (!built.ok) return Response.json({ error: built.error }, { status: 409 });

  try {
    const created = await getOrderSink().createOrder(built.order);
    const orderUrl = `${siteConfig.url}/order/${created.id}?n=${encodeURIComponent(created.number)}`;

    if (built.order.payment === "online") {
      const payment = await getPaymentGateway().createPayment({
        orderId: created.id,
        orderNumber: created.number,
        amount: built.order.total,
        returnUrl: orderUrl,
      });
      return Response.json({ ...created, redirectUrl: payment.redirectUrl });
    }

    return Response.json(created);
  } catch (error) {
    console.error("[orders] create failed", error);
    return Response.json(
      { error: "Не удалось отправить заказ. Попробуйте ещё раз или позвоните нам." },
      { status: 502 },
    );
  }
}
