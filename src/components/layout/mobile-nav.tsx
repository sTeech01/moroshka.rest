"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavItem } from "@/config/site";

export function MobileNav({ phone, items }: { phone: string; items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-full border border-border"
        aria-expanded={open}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        // Клик по любой ссылке закрывает меню
        <nav
          className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col gap-1 overflow-y-auto bg-night px-4 py-8 text-snow"
          onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        >
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="h-display border-b border-border py-4 text-3xl">
              {item.label}
            </Link>
          ))}
          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="mt-8 text-lg font-semibold">
            {phone}
          </a>
          <Link href="/#booking" className="btn btn-berry mt-4">
            Забронировать стол
          </Link>
        </nav>
      )}
    </div>
  );
}
