import Image from "next/image";
import type { Img } from "@/lib/content";

type RowKind = "full" | "quad" | "wideLeft" | "wideRight" | "trio";

/** Сколько фото забирает ряд каждого вида */
const SIZE: Record<RowKind, number> = { full: 1, quad: 4, wideLeft: 2, wideRight: 2, trio: 3 };

/** Повторяющаяся схема, как в референсе: широкое фото → 4 в ряд → 2:1 → 1:2 */
const PATTERN: RowKind[] = ["full", "quad", "wideLeft", "wideRight"];

/** Раскладывает любое число фото по схеме; хвост, которому не хватает фото, — ряд подходящей формы */
function buildRows(images: Img[]): { kind: RowKind; items: Img[] }[] {
  const rows: { kind: RowKind; items: Img[] }[] = [];
  let i = 0;
  for (let r = 0; i < images.length; r++) {
    let kind = PATTERN[r % PATTERN.length];
    const left = images.length - i;
    // Последние 3 фото — одним рядом, чтобы не оставалось одинокого снимка на всю ширину
    if (left === 3) kind = "trio";
    else if (left < SIZE[kind]) kind = left === 1 ? "full" : "wideLeft";
    rows.push({ kind, items: images.slice(i, i + SIZE[kind]) });
    i += SIZE[kind];
  }
  return rows;
}

function Tile({ img, sizes, className = "" }: { img: Img; sizes: string; className?: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-card bg-velvet ${className}`}>
      <Image
        src={img.url}
        alt={img.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-1000 ease-(--ease-soft) group-hover:scale-[1.03]"
      />
    </div>
  );
}

/**
 * Фотогалерея «мозаикой» на всю ширину экрана: ряды разной формы со скруглёнными плитками и мягкими зазорами.
 * Телефон: «4 в ряд» → 2×2, пары — друг под другом.
 */
export function PhotoMosaic({ images }: { images: Img[] }) {
  if (images.length === 0) return null;
  const rows = buildRows(images);

  return (
    <div className="flex flex-col gap-2.5 px-2.5 lg:gap-4 lg:px-4">
      {rows.map(({ kind, items }, r) => {
        switch (kind) {
          case "full":
            return <Tile key={r} img={items[0]} sizes="100vw" className="h-[56vw] max-h-[600px] min-h-[240px]" />;
          case "quad":
            return (
              <div key={r} className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
                {items.map((img) => (
                  <Tile key={img.url} img={img} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-[4/5]" />
                ))}
              </div>
            );
          case "trio":
            return (
              <div key={r} className="grid gap-2.5 sm:grid-cols-3 lg:gap-4">
                {items.map((img) => (
                  <Tile key={img.url} img={img} sizes="(min-width: 640px) 33vw, 100vw" className="aspect-[4/3] sm:aspect-[4/5]" />
                ))}
              </div>
            );
          default: {
            // Пара: широкое (2/3) + узкое (1/3), в следующей паре — наоборот
            const [a, b] = items;
            const wideFirst = kind === "wideLeft";
            const wide = wideFirst ? a : b;
            const narrow = wideFirst ? b : a;
            const h = "h-[62vw] sm:h-[44vw] lg:h-[clamp(320px,32vw,520px)]";
            return (
              <div key={r} className={`grid gap-2.5 lg:gap-4 ${wideFirst ? "sm:grid-cols-[2fr_1fr]" : "sm:grid-cols-[1fr_2fr]"}`}>
                {wideFirst ? (
                  <>
                    <Tile img={wide} sizes="(min-width: 640px) 66vw, 100vw" className={h} />
                    <Tile img={narrow} sizes="(min-width: 640px) 33vw, 100vw" className={h} />
                  </>
                ) : (
                  <>
                    <Tile img={narrow} sizes="(min-width: 640px) 33vw, 100vw" className={h} />
                    <Tile img={wide} sizes="(min-width: 640px) 66vw, 100vw" className={h} />
                  </>
                )}
              </div>
            );
          }
        }
      })}
    </div>
  );
}
