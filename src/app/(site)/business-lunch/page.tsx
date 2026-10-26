import type { Metadata } from "next";
import Image from "next/image";
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

export default async function BusinessLunchPage() {
  const [lunch, settings] = await Promise.all([getBusinessLunch(), getSettings()]);
  if (!lunch.enabled) notFound();
  const tel = settings.phone.replace(/[^\d+]/g, "");

  return (
    <div className="container-site py-12 lg:py-20">
      {/* По центру экрана: колонка меню ~768px; с фото — фото слева, меню справа */}
      <div className={`mx-auto grid gap-10 ${lunch.image ? "max-w-6xl lg:grid-cols-[5fr_7fr] lg:gap-16" : "max-w-3xl"}`}>
        {lunch.image && (
          <div className="shape-leaf relative hidden min-h-[520px] overflow-hidden shadow-(--shadow-soft) lg:block">
            <Image src={lunch.image.url} alt={lunch.image.alt} fill sizes="40vw" className="object-cover" />
          </div>
        )}

        <div className="surface-moss rounded-panel px-5 py-10 shadow-(--shadow-soft) sm:px-10 lg:px-12">
          <div className="text-center">
            <p className="eyebrow text-berry">{lunch.schedule}</p>
            <h1 className="h-display mt-4 text-5xl lg:text-6xl">{lunch.title}</h1>
            {lunch.intro && <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-soft">{lunch.intro}</p>}
          </div>

          {/* Меню по дням: сегодняшний день выбирается в браузере */}
          <LunchWeekMenu week={lunch.week} />

          {lunch.note && <p className="mt-10 text-center text-sm text-muted italic">* {lunch.note}</p>}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/#booking" className="btn btn-berry">
              Забронировать стол
            </Link>
            <a href={`tel:${tel}`} className="btn btn-line">
              {settings.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
