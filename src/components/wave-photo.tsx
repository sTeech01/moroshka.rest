import Image from "next/image";
import type { Img } from "@/lib/content";

// Волнистая кромка: координаты 0…1 от размеров блока (clipPathUnits="objectBoundingBox").
// Нарисована для фото, прижатого к левому краю экрана (волна справа); для правого края — зеркалим.
const WAVE_FILL =
  "M0,0 H0.9 C0.97,0.12 0.89,0.3 0.95,0.48 C1,0.64 0.98,0.82 0.9,0.92 C0.82,1 0.66,0.97 0.5,0.985 C0.32,1 0.15,0.98 0,1 Z";
// Та же кривая без сторон у края экрана и сверху — тонкая линия вдоль кромки
const WAVE_LINE =
  "M0.9,0 C0.97,0.12 0.89,0.3 0.95,0.48 C1,0.64 0.98,0.82 0.9,0.92 C0.82,1 0.66,0.97 0.5,0.985 C0.32,1 0.15,0.98 0,1";

/**
 * Фото до края экрана с волнистой кромкой и тонкой линией цвета морошки вдоль неё.
 * edge — к какому краю экрана прижато фото. id — уникальный на странице (для clipPath).
 */
export function WavePhoto({ id, image, edge = "left", sizes, className = "" }: { id: string; image: Img; edge?: "left" | "right"; sizes: string; className?: string }) {
  const mirror = edge === "right";
  return (
    <div className={`relative ${className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <path d={WAVE_FILL} />
        </clipPath>
      </svg>
      {/* Зеркалим контейнер вместе с маской, а фото внутри — обратно */}
      <div className={`absolute inset-0 ${mirror ? "-scale-x-100" : ""}`}>
        <div className="absolute inset-0" style={{ clipPath: `url(#${id})` }}>
          <Image src={image.url} alt={image.alt} fill sizes={sizes} className={`object-cover ${mirror ? "-scale-x-100" : ""}`} />
        </div>
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <path d={WAVE_LINE} fill="none" stroke="var(--berry)" strokeOpacity="0.55" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}

/** Заголовок раздела: последние два слова — с новой строки цветом морошки («Отдельный зал / для своих») */
export function AccentTitle({ title, className = "" }: { title: string | null; className?: string }) {
  const words = (title ?? "").trim().split(/\s+/).filter(Boolean);
  const [lead, accent] = words.length >= 3 ? [words.slice(0, -2).join(" "), words.slice(-2).join(" ")] : [words.join(" "), ""];
  return (
    <h2 className={`h-display text-4xl leading-[1.05] lg:text-[52px] ${className}`}>
      {lead}
      {accent && <span className="block text-berry">{accent}</span>}
    </h2>
  );
}
