import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = { title: "Заказ принят", robots: { index: false } };

async function OrderInfo({ searchParams }: { searchParams: PageProps<"/order/[id]">["searchParams"] }) {
  const { n, paid } = await searchParams;
  const settings = await getSettings();
  const number = typeof n === "string" ? n : null;

  return (
    <>
      <p className="eyebrow text-berry">Заказ принят</p>
      <h1 className="h-display mt-4 text-5xl lg:text-6xl">Спасибо!</h1>
      {number && (
        <p className="mt-6 text-xl">
          Номер заказа: <b>{number}</b>
        </p>
      )}
      {paid === "1" && <p className="mt-2 font-semibold">Оплата прошла успешно</p>}
      <p className="mt-6 leading-relaxed text-muted">
        Администратор свяжется с вами для подтверждения. Если есть вопросы — звоните{" "}
        <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-text hover:text-berry">
          {settings.phone}
        </a>
        .
      </p>
    </>
  );
}

// Статус заказа из iiko (getOrderStatus) выводится здесь после подключения API
export default function OrderPage({ searchParams }: PageProps<"/order/[id]">) {
  return (
    <div className="theme-paper">
      <div className="container-site max-w-2xl py-20 text-center lg:py-28">
        <Suspense fallback={<div className="mx-auto h-40 animate-pulse bg-fill" />}>
          <OrderInfo searchParams={searchParams} />
        </Suspense>
        <Link href="/delivery" className="btn btn-line mt-10">
          Вернуться в меню
        </Link>
      </div>
    </div>
  );
}
