import Link from "next/link";
import { Logo } from "@/components/logo";
import { features, navigation } from "@/config/site";
import { getSettings } from "@/lib/content";
import { CartButton } from "./cart-button";
import { HeaderShell } from "./header-shell";
import { MobileNav } from "./mobile-nav";

/** Шапка тёмная на всех страницах; на главной до прокрутки — прозрачная поверх фото (HeaderShell) */
export async function SiteHeader() {
  const settings = await getSettings();
  const tel = settings.phone.replace(/[^\d+]/g, "");

  return (
    <HeaderShell>
      <div className="container-site flex h-16 items-center gap-10 lg:h-[76px]">
        <Link href="/" aria-label="На главную" className="shrink-0">
          <Logo width={136} priority className="w-28 sm:w-[136px]" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-berry">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Номер виден сразу на всех экранах (просьба заказчика): нажал — позвонил */}
          <a
            href={`tel:${tel}`}
            aria-label={`Позвонить: ${settings.phone}`}
            className="flex items-center gap-2 text-[13px] font-semibold whitespace-nowrap hover:text-berry sm:text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden shrink-0 text-berry sm:block" aria-hidden>
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
            {settings.phone}
          </a>
          <Link href="/#booking" className="btn btn-line btn-sm hidden xl:inline-flex">
            Забронировать стол
          </Link>
          {features.onlineOrders && <CartButton />}
          <MobileNav phone={settings.phone} />
        </div>
      </div>
    </HeaderShell>
  );
}
