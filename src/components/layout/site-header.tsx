import Link from "next/link";
import { Logo } from "@/components/logo";
import { navigation } from "@/config/site";
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
          <Logo width={136} priority />
        </Link>

        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-berry">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a href={`tel:${tel}`} className="hidden text-sm font-semibold hover:text-berry xl:inline">
            {settings.phone}
          </a>
          <a
            href={`tel:${tel}`}
            aria-label={`Позвонить: ${settings.phone}`}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#2a3a33] lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
          </a>
          <Link href="/#booking" className="btn btn-line btn-sm hidden lg:inline-flex">
            Забронировать стол
          </Link>
          <CartButton />
          <MobileNav phone={settings.phone} />
        </div>
      </div>
    </HeaderShell>
  );
}
