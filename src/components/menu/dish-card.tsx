import Link from "next/link";
import { formatPrice, formatWeight } from "@/lib/format";
import type { Dish } from "@/lib/menu/types";
import { DishImage } from "./dish-image";
import { PlusIcon, QuickAdd } from "./quick-add";

type Props = {
  dish: Dish;
  /** «berry» — для тёмной главной, «ink» — для светлого меню */
  tone?: "ink" | "berry";
  aspect?: string;
};

export function DishCard({ dish, tone = "ink", aspect }: Props) {
  const size = dish.sizes.find((s) => s.isDefault) ?? dish.sizes[0];
  const weight = formatWeight(size.weight, dish.measureUnit);

  return (
    <article className={`flex flex-col gap-3 ${dish.inStock ? "" : "opacity-55"}`}>
      <Link href={`/delivery/${dish.slug}`} className="group block" tabIndex={-1} aria-hidden>
        <DishImage
          src={dish.image}
          alt={dish.name}
          aspect={aspect}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </Link>
      <div className="flex-1">
        <Link href={`/delivery/${dish.slug}`} className="text-[17px] font-semibold hover:text-berry">
          {dish.name}
        </Link>
        {dish.description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{dish.description}</p>}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[17px] font-bold">
            {dish.sizes.length > 1 ? "от " : ""}
            {formatPrice(dish.priceFrom)}
          </div>
          {weight && <div className="text-xs text-muted">{dish.sizes.length > 1 ? "" : weight}</div>}
        </div>
        {!dish.inStock ? (
          <span className="text-sm text-muted">Нет в наличии</span>
        ) : dish.requiresChoice ? (
          <Link href={`/delivery/${dish.slug}`} className="btn btn-line btn-sm">
            Выбрать
          </Link>
        ) : (
          <QuickAdd dish={dish} tone={tone} />
        )}
      </div>
    </article>
  );
}

/** Минималистичная карточка для главной: фото, название, «выход · цена» и тонкий «+» */
export function DishCardMinimal({ dish }: { dish: Dish }) {
  const size = dish.sizes.find((s) => s.isDefault) ?? dish.sizes[0];
  const weight = dish.sizes.length > 1 ? null : formatWeight(size.weight, dish.measureUnit);
  const price = `${dish.sizes.length > 1 ? "от " : ""}${formatPrice(dish.priceFrom)}`;

  return (
    <article className="group">
      <Link href={`/delivery/${dish.slug}`} className="block" tabIndex={-1} aria-hidden>
        <DishImage src={dish.image} alt={dish.name} aspect="aspect-[4/3]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/delivery/${dish.slug}`} className="line-clamp-2 text-[15px] leading-snug transition-colors hover:text-berry">
            {dish.name}
          </Link>
          <div className="mt-1.5 text-[13px] tracking-wide text-muted">
            {weight && <>{weight} · </>}
            <span className="text-soft">{price}</span>
          </div>
        </div>
        {dish.requiresChoice ? (
          <Link
            href={`/delivery/${dish.slug}`}
            aria-label={`Выбрать: ${dish.name}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card text-soft ring-1 ring-border ring-inset transition-[color,box-shadow] duration-200 hover:text-berry hover:ring-berry"
          >
            <PlusIcon />
          </Link>
        ) : (
          <QuickAdd dish={dish} variant="icon" />
        )}
      </div>
    </article>
  );
}
