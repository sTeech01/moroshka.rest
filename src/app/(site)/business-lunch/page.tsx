import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LunchWeekMenu } from "@/components/business-lunch/lunch-week";
import { getBusinessLunch, getSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const lunch = await getBusinessLunch();
  return {
    title: lunch.title,
    description: `${lunch.title} в ресторане «Морошка», Губкинский: ${lunch.schedule.toLowerCase()}.`,
    alternates: { canonical: "/business-lunch" },
  };
}

/**
 * Бизнес-ланч: фон — «Лесная уха с морошкой»; сверху заголовок с расписанием и дни недели,
 * ниже карточка с меню дня в две колонки — помещается в экран без прокрутки.
 * Шапка над фото прозрачная, пока страница не прокручена.
 */
export default async function BusinessLunchPage() {
  const [lunch, settings] = await Promise.all([getBusinessLunch(), getSettings()]);
  if (!lunch.enabled) notFound();
  const tel = settings.phone.replace(/[^\d+]/g, "");

  return (
    <div data-hero-overlay className="lunch-page -mt-16 pt-[58vw] pb-16 text-snow sm:pt-28 lg:-mt-[76px] lg:pt-[116px] lg:pb-20">
      <LunchWeekMenu
        week={lunch.week}
        head={
          <div className="[text-shadow:0_2px_18px_rgb(0_0_0/0.7)]">
            <h1 className="h-display text-4xl lg:text-5xl">{lunch.title}</h1>
            <p className="mt-2 text-[17px] text-snow/80">{lunch.schedule}</p>
          </div>
        }
        footer={
          <div className="mt-8 flex flex-col gap-4 border-t border-snow/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
            {lunch.note && <p className="text-sm text-lichen">{lunch.note}</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/#booking" className="btn btn-berry">
                Забронировать стол
              </Link>
              <a href={`tel:${tel}`} className="btn gap-2.5 text-snow ring-1 ring-snow/25 ring-inset hover:ring-berry/70">
                {settings.phone}
              </a>
            </div>
          </div>
        }
      />
    </div>
  );
}
