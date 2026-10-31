import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import { LunchPopup } from "@/components/business-lunch/lunch-popup";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { DeliveryProvider } from "@/components/delivery-context";
import { FloatingCart } from "@/components/layout/cart-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LazyBackgrounds } from "@/components/lazy-backgrounds";
import { RestaurantJsonLd } from "@/components/restaurant-json-ld";
import { features, siteConfig } from "@/config/site";
import { getBusinessLunch, getDelivery } from "@/lib/content";
import "./globals.css";

// Шрифт всего сайта — Jost: свободная геометрическая гарнитура по мотивам Futura (Futura PT — в референсе
// заказчика; она платная и в Google Fonts её нет). Переменная — все начертания от 100 до 900 одним файлом
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Ресторан «Морошка» в Губкинском — северная кухня и доставка",
    template: "%s — ресторан «Морошка»",
  },
  description:
    "Ресторан «Морошка» в Губкинском: авторская северная кухня, VIP-зал, банкеты и доставка еды по городу.",
  openGraph: { type: "website", locale: siteConfig.locale, siteName: "Ресторан «Морошка»", images: ["/images/home/hero.webp"] },
  // Демо на Vercel — не индексировать (см. robots.ts)
  ...(process.env.VERCEL ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#0e1714",
};

// Корневой layout сайта. У админки Payload свой — в app/(payload)
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [delivery, lunch] = await Promise.all([getDelivery(), getBusinessLunch()]);

  return (
    // suppressHydrationWarning: атрибут data-lazy-bg ставит скрипт LazyBackgrounds до гидратации
    <html lang="ru" className={`${jost.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <LazyBackgrounds />
        <DeliveryProvider value={delivery}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          {features.onlineOrders && <FloatingCart />}
        </DeliveryProvider>
        {features.onlineOrders && <CartHydrator />}
        <LunchPopup lunch={lunch} />
        <RestaurantJsonLd />
      </body>
    </html>
  );
}
