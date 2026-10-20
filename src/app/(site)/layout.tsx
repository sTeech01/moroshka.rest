import type { Metadata, Viewport } from "next";
import { Manrope, Tenor_Sans } from "next/font/google";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { DeliveryProvider } from "@/components/delivery-context";
import { FloatingCart } from "@/components/layout/cart-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RestaurantJsonLd } from "@/components/restaurant-json-ld";
import { siteConfig } from "@/config/site";
import { getDelivery } from "@/lib/content";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

// Заголовки: широкий спокойный гротеск, перекликается с буквами логотипа
const tenor = Tenor_Sans({
  variable: "--font-tenor",
  subsets: ["latin", "cyrillic"],
  weight: "400",
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
  const delivery = await getDelivery();

  return (
    <html lang="ru" className={`${manrope.variable} ${tenor.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <DeliveryProvider value={delivery}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <FloatingCart />
        </DeliveryProvider>
        <CartHydrator />
        <RestaurantJsonLd />
      </body>
    </html>
  );
}
