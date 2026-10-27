import type { Metadata } from "next";
import { BookingForm } from "@/components/booking-form";
import { CmsContent } from "@/components/cms-content";
import { PageHero } from "@/components/page-hero";
import { PhotoMosaic } from "@/components/photo-mosaic";
import { getBanquets, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Банкеты и VIP-зал",
  description: "Банкеты, корпоративы и дни рождения в ресторане «Морошка» в Губкинском. Отдельный VIP-зал.",
  alternates: { canonical: "/banquets" },
};

export default async function BanquetsPage() {
  const [data, settings] = await Promise.all([getBanquets(), getSettings()]);
  const phone = settings.banquetPhone || settings.phone;
  const gallery = data.gallery;

  return (
    <>
      {/* Первый экран — тот же, что на главной (PageHero). Под кнопками: залы и вместимость | телефон */}
      <PageHero
        image={data.heroImage}
        eyebrow="VIP-зал и банкеты"
        title={data.title}
        subtitle={data.intro}
        actions={[
          { href: "#request", label: "Оставить заявку", primary: true },
          { href: "#gallery", label: "Посмотреть зал" },
        ]}
        info={{
          left: data.halls.length
            ? data.halls.map((h) => (h.capacity ? `${h.name}  ${h.capacity}` : h.name))
            : ["VIP-зал"],
          right: ["Телефон банкетов", phone],
        }}
        phone={phone}
      />

      <div className="container-site py-12 lg:py-16">
        {data.halls.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
            {data.halls.map((h, i) => (
              <div key={h.name} className={`surface-moss p-7 shadow-(--shadow-soft) lg:p-10 ${i % 2 ? "shape-leaf-alt" : "shape-leaf"}`}>
                <h2 className="h-display text-3xl">{h.name}</h2>
                {h.capacity && <div className="eyebrow mt-3 text-berry">{h.capacity}</div>}
                {h.description && <p className="mt-4 leading-relaxed text-soft">{h.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Галерея «мозаикой» на всю ширину экрана — вне контейнера */}
      {gallery.length > 0 && (
        <section id="gallery" aria-labelledby="gallery-title" className="pb-14 lg:pb-20">
          <div className="container-site mb-6 flex items-end justify-between gap-4 lg:mb-8">
            <h2 id="gallery-title" className="h-display text-3xl lg:text-4xl">
              Интерьер VIP-зала
            </h2>
            <span className="eyebrow">{gallery.length} фото</span>
          </div>
          <PhotoMosaic images={gallery} />
        </section>
      )}

      <div className="container-site pb-14 lg:pb-20">
        <div className="max-w-3xl">
          <CmsContent data={data.content} />
        </div>

        <section id="request" className="surface-stone mt-12 grid gap-10 rounded-panel px-5 py-10 shadow-(--shadow-soft) sm:px-10 lg:grid-cols-[5fr_7fr] lg:gap-20 lg:px-14 lg:py-14">
          <div>
            <h2 className="h-display text-4xl lg:text-[56px]">Заявка на банкет</h2>
            <p className="mt-6 text-muted">
              Оставьте заявку или позвоните:{" "}
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-text hover:text-berry">
                {phone}
              </a>
            </p>
          </div>
          <BookingForm kind="banquet" />
        </section>
      </div>
    </>
  );
}
