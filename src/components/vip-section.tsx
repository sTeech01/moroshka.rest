import Image from "next/image";
import Link from "next/link";
import type { Img } from "@/lib/content";
import { AccentTitle, WavePhoto } from "./wave-photo";

// Подписи под тремя фото галереи (Главная → «Галерея» в админке, первые три фото)
const GALLERY_CAPTIONS = ["Уютная атмосфера", "Природные материалы", "Стиль в деталях"];

type Props = {
  title: string | null;
  text: string | null;
  capacity: string | null;
  phone: string;
  image: Img | null;
  gallery: Img[];
};

/** Главная: VIP-зал и банкеты. Фото слева до края экрана с волнистой кромкой, текст справа, три фото с подписями снизу */
export function VipSection({ title, text, capacity, phone, image, gallery }: Props) {
  const tel = phone.replace(/[^\d+]/g, "");

  return (
    <section className="relative isolate overflow-hidden bg-velvet">
      {/* Гравюра морошки в правом верхнем углу, 10% — как раньше */}
      <Image
        src="/images/decor/cloudberry-engraving.png"
        alt=""
        aria-hidden
        width={1254}
        height={1254}
        sizes="(min-width: 1280px) 560px, 440px"
        className="pointer-events-none absolute -top-24 -right-10 -z-10 hidden h-auto w-[440px] opacity-[0.1] select-none lg:block xl:w-[560px]"
      />

      <div className="grid items-center lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {image && (
          <WavePhoto
            id="wave-vip"
            image={image}
            edge="left"
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="aspect-[4/3] lg:aspect-auto lg:h-[560px] xl:h-[600px]"
          />
        )}

        <div className="px-4 py-14 sm:px-8 lg:py-16 lg:pr-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pl-10 xl:pl-14">
          <p className="eyebrow text-[11px] text-berry">VIP-зал и банкеты</p>
          <AccentTitle title={title} className="mt-5" />
          {text && <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-[#d9ded6]">{text}</p>}

          <div className="mt-8 grid max-w-md grid-cols-2 border-t border-snow/15 pt-5">
            <div className="flex gap-3 pr-4">
              <PeopleIcon />
              <div>
                <div className="eyebrow text-[10px] text-soft">Вместимость</div>
                <div className="mt-1 text-sm">{capacity || "уточняйте по телефону"}</div>
              </div>
            </div>
            <div className="flex gap-3 border-l border-snow/15 pl-4">
              <PhoneIcon />
              <div>
                <div className="eyebrow text-[10px] text-soft">Телефон банкетов</div>
                <a href={`tel:${tel}`} className="mt-1 block text-sm whitespace-nowrap hover:text-berry">
                  {phone}
                </a>
              </div>
            </div>
          </div>

          <Link href="/banquets#request" className="btn btn-berry mt-9 h-12 gap-3 px-7 text-[15px]">
            Оставить заявку <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="container-site grid gap-6 pt-4 pb-16 sm:grid-cols-3 lg:pb-20">
          {gallery.slice(0, 3).map((img, i) => (
            <figure key={img.url}>
              <div className="relative h-52 overflow-hidden rounded-[3px] border border-berry/35 lg:h-[200px] xl:h-[220px]">
                <Image src={img.url} alt={img.alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-4 flex items-center gap-4">
                <span className="h-display text-2xl text-berry">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-px w-12 bg-berry/40" aria-hidden />
                <span className="eyebrow text-[10px] text-soft">{GALLERY_CAPTIONS[i] ?? img.alt}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

function PeopleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--berry)" strokeWidth="1.3" className="mt-0.5 shrink-0" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16.5 14.2c2.3.2 4 1.7 4.5 4.3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--berry)" strokeWidth="1.3" className="mt-0.5 shrink-0" aria-hidden>
      <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z" />
    </svg>
  );
}
