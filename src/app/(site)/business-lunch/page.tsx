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
 * Бизнес-ланч — по референсу заказчика: фон всей страницы — «Лесная уха с морошкой»
 * (суп на мху сверху справа, морошка по углам); слева сверху — расписание,
 * заголовок и дни недели; ниже — полупрозрачная тёмно-зелёная карточка меню с золотистой
 * ботаникой по углам, сноска и кнопки. Шапка над фото прозрачная, пока страница не прокручена.
 */
export default async function BusinessLunchPage() {
  const [lunch, settings] = await Promise.all([getBusinessLunch(), getSettings()]);
  if (!lunch.enabled) notFound();
  const tel = settings.phone.replace(/[^\d+]/g, "");

  return (
    <div data-hero-overlay className="lunch-page -mt-16 pt-[78vw] pb-20 text-snow md:pt-40 lg:-mt-[76px] lg:pt-[210px] lg:pb-32">
      <LunchWeekMenu
        week={lunch.week}
        head={
          <div className="max-w-xl">
            <p className="eyebrow text-berry">{lunch.schedule}</p>
            <h1 className="h-display mt-4 text-[3rem] leading-none sm:text-6xl lg:text-[6.5rem]">{lunch.title}</h1>
            {lunch.intro && <p className="mt-5 max-w-md text-[17px] leading-relaxed text-snow/80 lg:text-lg">{lunch.intro}</p>}
          </div>
        }
        footer={
          <>
            {lunch.note && <p className="mt-10 text-center text-sm text-lichen italic">* {lunch.note}</p>}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link href="/#booking" className="btn btn-berry gap-3 sm:min-w-60">
                Забронировать стол
                <span aria-hidden>→</span>
              </Link>
              <a href={`tel:${tel}`} className="btn gap-2.5 text-snow ring-1 ring-berry/60 ring-inset hover:bg-berry/10 sm:min-w-60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                </svg>
                {settings.phone}
              </a>
            </div>
          </>
        }
      />
    </div>
  );
}
