import { escapeHtml, isDemo, notifyStaff } from "@/lib/notify";
import { bookingSchema } from "@/lib/order/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Бронь стола и заявка на банкет → сотрудникам ресторана (Telegram и/или ВКонтакте) */
export async function POST(req: Request) {
  if (!rateLimit(`booking:${clientIp(req)}`, 5)) {
    return Response.json({ error: "Слишком много попыток. Позвоните нам, пожалуйста." }, { status: 429 });
  }

  const parsed = bookingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Проверьте форму" }, { status: 400 });
  }
  const d = parsed.data;
  if (d.website) return Response.json({ ok: true });

  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Yekaterinburg" });
  if (d.date < today) return Response.json({ error: "Выберите дату не раньше сегодняшней" }, { status: 400 });

  const e = escapeHtml;
  const date = new Date(`${d.date}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" });
  const message = [
    d.kind === "table" ? "🍽 <b>Бронь стола</b>" : "🎉 <b>Заявка на банкет</b>",
    "",
    `👤 ${e(d.name)}, ${e(d.phone)}`,
    `📅 ${date}${d.time ? `, ${d.time}` : ""}`,
    `👥 Гостей: ${d.guests}`,
    d.format ? `🎯 ${e(d.format)}` : null,
    d.comment ? `💬 ${e(d.comment)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await notifyStaff(message);
    // demo — заявка никуда не ушла (демо на Vercel без каналов уведомлений), форма об этом скажет
    return Response.json({ ok: true, demo: isDemo() });
  } catch (error) {
    console.error("[booking] send failed", error);
    return Response.json({ error: "Не удалось отправить заявку. Позвоните нам, пожалуйста." }, { status: 502 });
  }
}
