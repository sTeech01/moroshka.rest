import Image from "next/image";

/** Показывается, когда у блюда в iiko нет фото */
export const DISH_PLACEHOLDER = "/images/dish-placeholder.webp";

/** Фото блюда из iiko или плейсхолдер, если фото нет */
export function DishImage({
  src,
  alt,
  sizes,
  priority,
  aspect = "aspect-[4/3]",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  aspect?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-card bg-fill ${aspect}`}>
      <Image
        src={src ?? DISH_PLACEHOLDER}
        alt={src ? alt : `${alt} — фото скоро появится`}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-(--ease-soft) group-hover:scale-[1.03]"
        priority={priority}
      />
    </div>
  );
}
