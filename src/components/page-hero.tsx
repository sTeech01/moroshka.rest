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
export function PageHero({ image, video, eyebrow, title, subtitle, actions, info, phone }: Props) {
  const tel = phone.replace(/[^\d+]/g, "");

  return (
    // data-hero-overlay — по нему шапка (HeaderShell) становится прозрачной, пока страница не прокручена
    <section data-hero-overlay className="relative isolate -mt-16 h-svh max-h-[1100px] min-h-[620px] overflow-hidden lg:-mt-[76px]">
      {video ? (
        <>
          {/* Насыщенность и контраст подняты: ролик снят на телефон и под затемнением выглядит блёкло */}
          <Image src={video.poster} alt={video.alt} fill priority sizes="100vw" className="-z-20 object-cover saturate-[1.9] contrast-[1.12]" />
          <HeroVideo src={video.src} className="absolute inset-0 -z-20 h-full w-full object-cover saturate-[1.9] contrast-[1.12]" />
        </>
      ) : (
        image && <Image src={image.url} alt={image.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[65%_center]" />
      )}
      <div className={`${video ? "hero-shade-video" : "hero-shade"} absolute inset-0 -z-10`} />
      {/* Низ темнее — под кнопками и строкой информации */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-night/85 to-transparent" />
      {/* Верх темнее — под прозрачной шапкой */}
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-night/70 to-transparent" />

      <div className="hero-text container-site flex h-full flex-col items-center pt-16 pb-8 text-center lg:pt-[76px] lg:pb-10">
        {/* Заголовок — по центру свободной части экрана */}
        <div className="flex flex-1 flex-col items-center justify-center py-6">
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
          <div className="mt-6 flex items-center gap-4 text-sm tracking-[0.12em] uppercase sm:gap-6">
            <div className="space-y-0.5 text-right whitespace-nowrap">
              {info.left.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <span className="h-10 w-px shrink-0 bg-snow/50" aria-hidden />
            <div className="space-y-0.5 text-left whitespace-nowrap">
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
        className="absolute right-6 bottom-8 hidden h-16 w-16 place-items-center rounded-full border-2 border-snow text-snow transition-colors hover:border-berry hover:bg-berry hover:text-night lg:grid xl:right-10 xl:bottom-10"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
        </svg>
      </a>
    </section>
  );
}
