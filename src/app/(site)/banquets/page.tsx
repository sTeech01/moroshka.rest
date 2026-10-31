import type { Metadata } from "next";
import { BookingForm } from "@/components/booking-form";
import { CmsContent } from "@/components/cms-content";
import { GalleryCarousel } from "@/components/gallery-carousel";
import { PageHero } from "@/components/page-hero";
import { getBanquets, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Банкеты и VIP-зал",
  description:
    "Банкеты, корпоративы и дни рождения в ресторане «Морошка» в Губкинском. Отдельный VIP-зал.",
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
            ? data.halls.map((h) =>
                h.capacity ? `${h.name}  ${h.capacity}` : h.name,
              )
            : ["VIP-зал"],
          right: ["Телефон банкетов", phone],
        }}
        phone={phone}
      />

      {/* Под первым экраном — общий фон: размытое фото VIP-зала (.stage-bg-vip) */}
      <div data-bg className="stage-bg-vip">
        {/* Галерея — карусель на всю ширину экрана, фото открываются во весь экран */}
        {gallery.length > 0 && (
          <section
            id="gallery"
            aria-labelledby="gallery-title"
            className="flex scroll-mt-16 flex-col justify-center py-12 lg:min-h-[calc(100svh-76px)] lg:scroll-mt-[76px] lg:py-8"
          >
            <GalleryCarousel images={gallery} title="Интерьер VIP-зала" />
          </section>
        )}

        <div className="container-site pb-14 lg:pb-20">
          {data.content && (
            <div className="mb-12 max-w-3xl">
              <CmsContent data={data.content} />
            </div>
          )}

          <section
            id="request"
            data-bg
            className="banquet-request grid gap-10 rounded-panel px-5 py-10 shadow-(--shadow-soft) sm:px-10 lg:grid-cols-[5fr_7fr] lg:gap-20 lg:px-14 lg:py-14"
          >
            <div>
              <h2 className="h-display text-4xl lg:text-[56px]">
                Заявка на банкет
              </h2>
              <p className="mt-6 text-muted">
                Оставьте заявку или позвоните:{" "}
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="font-semibold text-text hover:text-berry"
                >
                  {phone}
                </a>
              </p>
            </div>
            <BookingForm kind="banquet" />
          </section>
        </div>
      </div>
    </>
  );
}
