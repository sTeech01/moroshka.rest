"use client";

import Link from "next/link";
import { useState } from "react";
import type { BookingPayload } from "@/lib/order/schema";

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Бронь стола или заявка на банкет → /api/booking → Telegram */
export function BookingForm({ kind }: { kind: "table" | "banquet" }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "done") {
    return (
      <div className="border border-border p-10 text-center">
        <p className="h-display text-3xl">Заявка отправлена</p>
        <p className="mt-2 text-muted">Мы перезвоним, чтобы подтвердить {kind === "table" ? "бронь" : "детали"}.</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const str = (k: string) => (f.get(k) as string | null)?.trim() || undefined;

    const payload: BookingPayload = {
      kind,
      name: str("name") ?? "",
      phone: str("phone") ?? "",
      date: str("date") ?? "",
      time: str("time"),
      guests: Number(str("guests") ?? 0),
      format: str("format"),
      comment: str("comment"),
      consent: f.get("consent") === "on",
      website: str("website"),
    };

    setState("sending");
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    if (res?.ok) return setState("done");
    setError((await res?.json().catch(() => null))?.error ?? "Не удалось отправить заявку");
    setState("idle");
  }

  return (
    // Компактная форма: имя и телефон | дата, время/формат, гости | комментарий | согласие и кнопка в одну строку
    <form onSubmit={onSubmit} className="grid gap-x-4 gap-y-3.5 sm:grid-cols-6">
      <label className="sm:col-span-3">
        <span className="label-compact">Имя</span>
        <input name="name" className="field field-compact" placeholder="Введите имя" required minLength={2} autoComplete="given-name" />
      </label>
      <label className="sm:col-span-3">
        <span className="label-compact">Телефон</span>
        <input name="phone" type="tel" className="field field-compact" required autoComplete="tel" placeholder="+7 (___) ___-__-__" />
      </label>
      <label className="sm:col-span-2">
        <span className="label-compact">Дата</span>
        <input
          name="date"
          type="date"
          className="field field-compact"
          required
          onFocus={(e) => (e.currentTarget.min = todayLocal())}
        />
      </label>
      {kind === "table" ? (
        <label className="sm:col-span-2">
          <span className="label-compact">Время</span>
          <input name="time" type="time" className="field field-compact" required min="12:00" max="23:00" step={900} />
        </label>
      ) : (
        <label className="sm:col-span-2">
          <span className="label-compact">Формат</span>
          <input name="format" className="field field-compact" placeholder="День рождения…" />
        </label>
      )}
      <label className="sm:col-span-2">
        <span className="label-compact">Гостей</span>
        <input name="guests" type="number" className="field field-compact" required min={1} max={kind === "table" ? 30 : 300} defaultValue={2} />
      </label>
      <label className="sm:col-span-6">
        <span className="label-compact">Комментарий</span>
        <textarea name="comment" rows={2} className="field field-compact" maxLength={500} placeholder="Например, столик у окна или детский стул" />
      </label>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {error && <p className="text-sm text-danger sm:col-span-6">{error}</p>}

      <div className="mt-1 flex flex-col gap-4 sm:col-span-6 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-start gap-2.5 text-[13px] text-muted">
          <input type="checkbox" name="consent" required className="mt-0.5 accent-berry" />
          <span>
            Согласен с{" "}
            <Link href="/privacy-policy" className="text-text underline">
              обработкой персональных данных
            </Link>
          </span>
        </label>
        <button type="submit" className="btn btn-berry btn-sm shrink-0 px-7" disabled={state === "sending"}>
          {state === "sending" ? "Отправляем…" : kind === "table" ? "Забронировать стол" : "Отправить заявку"}
        </button>
      </div>
    </form>
  );
}
