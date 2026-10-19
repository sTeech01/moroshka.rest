import Image from "next/image";
import Link from "next/link";
import type { PromoItem } from "@/lib/content";

function PromoLink({ promo, className }: { promo: PromoItem; className: string }) {
  if (!promo.linkUrl) return null;
  const external = /^https?:\/\//.test(promo.linkUrl);
  return external ? (
    <a href={promo.linkUrl} className={className} target="_blank" rel="noopener noreferrer">
      {promo.linkLabel}
    </a>
  ) : (
    <Link href={promo.linkUrl} className={className}>
      {promo.linkLabel}
    </Link>
  );
}

/** Промо на главной: фото + текст, тёмная тема */
export function HomePromos({ promos }: { promos: PromoItem[] }) {
  if (promos.length === 0) return null;
  return (
    <section className="container-site mt-20 grid gap-4 lg:mt-30">
      {promos.map((p) => (
        <article key={p.id} className="grid overflow-hidden border border-border md:grid-cols-[5fr_7fr]">
          {p.image && (
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-80">
              <Image src={p.image.url} alt={p.image.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          )}
          <div className={`flex flex-col justify-center gap-4 p-7 lg:p-12 ${p.image ? "" : "md:col-span-2"}`}>
            <p className="eyebrow text-berry">Предложение</p>
            <h2 className="h-display text-3xl lg:text-[44px]">{p.title}</h2>
            {p.text && <p className="max-w-xl text-[17px] leading-relaxed text-soft">{p.text}</p>}
            <PromoLink promo={p} className="btn btn-berry mt-2 self-start" />
          </div>
        </article>
      ))}
    </section>
  );
}

/** Промо в меню: компактная полоса над категориями, светлая тема */
export function MenuPromos({ promos }: { promos: PromoItem[] }) {
  if (promos.length === 0) return null;
  return (
    <div className="mt-8 grid gap-3">
      {promos.map((p) => (
        <article key={p.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 border border-border bg-[#fffdf9] p-5 lg:px-7">
          {p.image && (
            <div className="relative hidden h-16 w-24 shrink-0 sm:block">
              <Image src={p.image.url} alt={p.image.alt} fill sizes="96px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1 basis-60">
            <h2 className="text-lg font-bold">{p.title}</h2>
            {p.text && <p className="mt-0.5 text-sm text-muted">{p.text}</p>}
          </div>
          <PromoLink promo={p} className="btn btn-ink btn-sm" />
        </article>
      ))}
    </div>
  );
}
