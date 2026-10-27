import { cacheLife } from "next/cache";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { features, getNavigation } from "@/config/site";
import { getDelivery, getSettings } from "@/lib/content";

export async function SiteFooter() {
  "use cache";
  cacheLife("content");

  const [settings, delivery] = await Promise.all([getSettings(), getDelivery()]);
  const year = new Date().getFullYear();

  return (
    <footer className="surface-stone rounded-t-panel text-snow">
      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-8 pt-10 pb-8 lg:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,1fr))] lg:gap-x-10 lg:pt-12 lg:pb-10">
        <div className="col-span-2 lg:col-span-1">
          <Logo width={160} />
        </div>

        <div className="space-y-1.5 text-[15px]">
          <div className="eyebrow mb-2.5 text-lichen">Контакты</div>
          <p>{settings.address}</p>
          <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="block font-semibold hover:text-berry">
            {settings.phone}
          </a>
          <div className="flex gap-4 pt-1">
            {settings.vk && (
              <a href={settings.vk} target="_blank" rel="noopener noreferrer" className="hover:text-berry">
                ВКонтакте
              </a>
            )}
            {settings.telegram && (
              <a href={settings.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-berry">
                Telegram
              </a>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-[15px]">
          <div className="eyebrow mb-2.5 text-lichen">Часы работы</div>
          {settings.hours.map((h) => (
            <p key={h.days}>
              {h.days}: {h.time}
            </p>
          ))}
          {features.onlineOrders && delivery.enabled && (
            <p className="text-lichen">
              Доставка: {delivery.acceptFrom}–{delivery.acceptUntil}
            </p>
          )}
        </div>

        {/* Телефон: разделы строкой с переносами на всю ширину, а не столбиком из шести строк */}
        <nav className="col-span-2 flex flex-wrap gap-x-5 gap-y-1.5 text-[15px] lg:col-span-1 lg:flex-col lg:gap-1.5">
          <div className="eyebrow mb-1 w-full text-lichen lg:mb-1">Разделы</div>
          {getNavigation(delivery).map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-berry">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="bg-night/30 pb-24 md:pb-0">
        <div className="container-site flex flex-col gap-3 py-5 text-[13px] text-lichen lg:flex-row lg:justify-between">
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
              className="hover:text-snow"
            >
              Разработка сайтов
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
