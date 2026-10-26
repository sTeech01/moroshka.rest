import Image from "next/image";
import Link from "next/link";
import type { Img } from "@/lib/content";
import { HeroVideo } from "./hero-video";

type Action = { href: string; label: string; primary?: boolean };

type Props = {
  image: Img | null;
  /** Фоновое видео вместо фото: src — ролик, poster — его первый кадр (виден, пока видео грузится или отключено) */
  video?: { src: string; poster: string; alt: string };
  eyebrow: string;
  /** Знак над надписью — регалия ресторана (на главной: логотип Книги рекордов России + подпись) */
  badge?: { label: string; href: string; logo: { src: string; alt: string; width: number; height: number } };
  title: string;
  subtitle?: string | null;
  actions: Action[];
  /** Две колонки под кнопками, разделённые вертикальной чертой: слева — по правому краю, справа — по левому */
  info?: { left: React.ReactNode[]; right: React.ReactNode[] };
  phone: string;
};

/**
 * Первый экран страницы по раскладке референса: фото на всё окно, шапка прозрачная поверх
 * (секция заходит под неё отрицательным отступом на высоту шапки), заголовок по центру,
 * внизу кнопки и строка «инфо | инфо», справа внизу — круглая кнопка звонка.
 * Используется на главной и на банкетах, чтобы они выглядели одинаково.
 * Прозрачность шапки включается сама: HeaderShell реагирует на атрибут data-hero-overlay этой секции.
 */
export function PageHero({ image, video, eyebrow, badge, title, subtitle, actions, info, phone }: Props) {
  const tel = phone.replace(/[^\d+]/g, "");

  return (
    // data-hero-overlay — по нему шапка (HeaderShell) становится прозрачной, пока страница не прокручена
    <section data-hero-overlay className="relative isolate -mt-16 h-svh max-h-[1100px] min-h-[620px] overflow-hidden lg:-mt-[76px]">
      {video ? (
        <>
          {/* Ролик приглушён: заказчик просил «не так ярко и светло», и белый логотип терялся на светлом кадре */}
          <Image src={video.poster} alt={video.alt} fill priority sizes="100vw" className="-z-20 object-cover brightness-[0.8] saturate-[1.1]" />
          <HeroVideo src={video.src} className="absolute inset-0 -z-20 h-full w-full object-cover brightness-[0.8] saturate-[1.1]" />
        </>
      ) : (
        image && <Image src={image.url} alt={image.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[65%_center]" />
      )}
      <div className="hero-shade absolute inset-0 -z-10" />
      {/* Низ темнее — под кнопками и строкой информации */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-night/85 to-transparent" />
      {/* Верх темнее — под прозрачной шапкой */}
      <div className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-night/85 to-transparent" />

      <div className="hero-text container-site flex h-full flex-col items-center pt-16 pb-8 text-center lg:pt-[76px] lg:pb-10">
        {/* Заголовок — по центру свободной части экрана */}
        <div className="flex flex-1 flex-col items-center justify-center py-6">
          {/* Регалия как «Мишлен» у других: официальный логотип на светлой табличке — его цвета не трогаем */}
          {badge && (
            <Link href={badge.href} className="group mb-6 inline-flex items-center gap-3 lg:mb-7">
              <span className="rounded-md bg-white px-2.5 py-1.5 shadow-[0_6px_24px_rgba(0,0,0,0.35)] transition-transform group-hover:-translate-y-0.5">
                <Image src={badge.logo.src} alt={badge.logo.alt} width={badge.logo.width} height={badge.logo.height} className="h-9 w-auto lg:h-11" priority />
              </span>
              <span className="text-left text-[11px] leading-snug tracking-[0.14em] text-snow uppercase transition-colors group-hover:text-berry lg:text-xs">
                {badge.label}
              </span>
            </Link>
          )}
          <p className="eyebrow text-berry">{eyebrow}</p>
          {/* Размер зависит и от ширины, и от высоты окна — на невысоких экранах не наезжает на кнопки */}
          <h1 className="h-display mt-4 max-w-4xl text-[44px] lg:mt-5 lg:text-[clamp(3.25rem,min(6vw,9svh),5.75rem)] lg:leading-none">
            {title}
          </h1>
          {subtitle && <p className="mt-4 max-w-xl text-base leading-relaxed lg:mt-6 lg:text-lg">{subtitle}</p>}
        </div>

        {/* Кнопки: на телефоне — друг под другом на всю ширину */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
          {actions.map((a) => (
            <Link key={a.href} href={a.href} className={`btn h-12 px-8 lg:h-14 lg:min-w-60 ${a.primary ? "btn-berry" : "btn-line"}`}>
              {a.label}
            </Link>
          ))}
        </div>

        {/* Под кнопками: инфо | инфо */}
        {info && (
          // Телефон: колонки друг под другом по центру (длинные подписи залов не влезают в пол-экрана)
          <div className="mt-6 flex flex-col items-center gap-2 text-sm tracking-[0.12em] uppercase sm:flex-row sm:gap-6">
            <div className="space-y-0.5 text-center sm:text-right sm:whitespace-nowrap">
              {info.left.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-berry/80 sm:h-2 sm:w-2" aria-hidden />
            <div className="space-y-0.5 text-center sm:text-left sm:whitespace-nowrap">
              {info.right.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Круглая кнопка звонка справа внизу (на телефоне снизу плавающая корзина — там не показываем) */}
      <a
        href={`tel:${tel}`}
        aria-label={`Позвонить: ${phone}`}
        className="absolute right-6 bottom-8 hidden h-16 w-16 place-items-center rounded-full bg-snow/10 text-snow ring-1 ring-snow/30 backdrop-blur-sm transition-[background-color,color,box-shadow] duration-300 hover:bg-berry hover:text-night hover:ring-berry lg:grid xl:right-10 xl:bottom-10"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
        </svg>
      </a>
    </section>
  );
}
