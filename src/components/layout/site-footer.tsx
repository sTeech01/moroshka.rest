import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { navigation } from "@/config/site";
import { getDelivery, getSettings } from "@/lib/content";

export async function SiteFooter() {
  "use cache";
  cacheLife("content");

  const [settings, delivery] = await Promise.all([getSettings(), getDelivery()]);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night pb-24 text-snow md:pb-0">
      <Image
        src="/images/berries.webp"
        alt=""
        aria-hidden
        width={2000}
        height={262}
        className="h-24 w-full object-cover object-top opacity-30"
      />
      <div className="container-site grid gap-10 border-t border-[#2a3a33] py-16 sm:grid-cols-2 lg:grid-cols-4">
        <Logo width={180} />

        <div className="space-y-2 text-[15px]">
          <div className="eyebrow mb-3 text-lichen">Контакты</div>
          <p>{settings.address}</p>
          <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="block font-semibold hover:text-berry">
            {settings.phone}
          </a>
          <div className="flex gap-4 pt-2">
            {settings.vk && <a href={settings.vk} className="hover:text-berry">ВКонтакте</a>}
            {settings.telegram && <a href={settings.telegram} className="hover:text-berry">Telegram</a>}
          </div>
        </div>

        <div className="space-y-2 text-[15px]">
          <div className="eyebrow mb-3 text-lichen">Часы работы</div>
          {settings.hours.map((h) => (
            <p key={h.days}>
              {h.days}: {h.time}
            </p>
          ))}
          {delivery.enabled && (
            <p className="text-lichen">
              Доставка: {delivery.acceptFrom}–{delivery.acceptUntil}
            </p>
          )}
        </div>

        <nav className="flex flex-col gap-2 text-[15px]">
          <div className="eyebrow mb-1 text-lichen">Разделы</div>
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-berry">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-[#2a3a33]">
        <div className="container-site flex flex-col gap-3 py-6 text-[13px] text-lichen lg:flex-row lg:justify-between">
          <span>
            © {year} Ресторан «Морошка». {settings.legal}
          </span>
          <span className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-snow">Политика конфиденциальности</Link>
            <Link href="/offer" className="hover:text-snow">Оферта</Link>
            <Link href="/rules" className="hover:text-snow">Правила посещения</Link>
            {/* Подпись разработчика — крайняя справа */}
            <a
              href="https://max.ru/u/f9LHodD0cOLzkiVx1TmN_TiEhBPCeRO5ZJDFZjgiE11NqLDOAMmzLZoS42g"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-snow lg:border-l lg:border-[#2a3a33] lg:pl-5"
            >
              Разработка сайтов
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
