import type { Metadata } from "next";
import Image from "next/image";
import { getSettings } from "@/lib/content";
import { getVkPromos, type VkPromo } from "@/lib/vk-promos";

export const metadata: Metadata = {
  title: "Акции",
  description: "Акции и спецпредложения ресторана «Морошка» в Губкинском.",
  alternates: { canonical: "/akcii" },
};

const TZ = "Asia/Yekaterinburg";
const dayMonth = (iso: string) => new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: TZ });

/**
 * Акции — посты из группы ресторана ВКонтакте с хэштегом #акция_морошка (src/lib/vk-promos.ts).
 * Сотрудники публикуют акцию в ВК, сайт подхватывает её сам; полный пост — по ссылке на ВК.
 */
export default async function PromosPage() {
  const settings = await getSettings();
  const promos = await getVkPromos(settings.vk);

  return (
    <div className="container-site pt-10 pb-20 lg:pt-14 lg:pb-28">
      <h1 className="h-display text-5xl lg:text-7xl">Акции</h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-soft">
        Спецпредложения ресторана. Новые акции сначала выходят{" "}
        {settings.vk ? (
          <a href={settings.vk} target="_blank" rel="noopener noreferrer" className="text-berry hover:text-berry-hover">
            в нашей группе ВКонтакте
          </a>
        ) : (
          "в нашей группе ВКонтакте"
        )}{" "}
        и сразу появляются здесь.
      </p>

      {promos.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-8">
          {promos.map((p, i) => (
            <PromoCard key={p.id} promo={p} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="surface-moss mt-10 max-w-2xl rounded-panel px-7 py-10 sm:px-10 lg:mt-12">
          <h2 className="h-display text-3xl">Сейчас акций нет</h2>
          <p className="mt-3 text-soft">Загляните позже — или подпишитесь на группу, чтобы узнавать о новых акциях первыми.</p>
          {settings.vk && (
            <a href={settings.vk} target="_blank" rel="noopener noreferrer" className="btn btn-berry mt-7">
              Группа ВКонтакте ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function PromoCard({ promo, priority }: { promo: VkPromo; priority: boolean }) {
  const photo = promo.photos[0];
  return (
    // Без фото — фирменный фон с золотой гравюрой морошки (как у карточек события), чтобы карточка не была пустой
    <article data-bg={photo ? undefined : ""} className={`flex flex-col overflow-hidden rounded-panel ${photo ? "bg-card ring-1 ring-border" : "event-feature min-h-[320px]"}`}>
      {photo && (
        <a href={promo.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden className="group relative block aspect-[4/3] overflow-hidden bg-fill">
          <Image
            src={photo.url}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.03]"
          />
          {promo.until && (
            <span className="absolute top-4 left-4 rounded-full bg-berry px-3.5 py-1.5 text-[13px] font-semibold text-night">
              до {dayMonth(promo.until)}
            </span>
          )}
        </a>
      )}
      <div className="flex flex-1 flex-col p-6 lg:p-7">
        <p className="text-[13px] text-muted">
          {dayMonth(promo.date)}
          {!photo && promo.until && <span className="text-berry"> · до {dayMonth(promo.until)}</span>}
        </p>
        {promo.title && <h2 className="mt-2 text-xl leading-snug font-semibold">{promo.title}</h2>}
        {promo.text && <p className="mt-3 line-clamp-6 text-[15px] leading-relaxed whitespace-pre-line text-soft">{promo.text}</p>}
        <a href={promo.url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-5 text-sm font-semibold text-berry hover:text-berry-hover">
          Подробнее во ВКонтакте ↗
        </a>
      </div>
    </article>
  );
}
