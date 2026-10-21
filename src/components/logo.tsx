import Image from "next/image";

/** Логотип «Морошка · ресторан» с ягодой вместо «о». Белый текст на прозрачном — для тёмного фона */
export function Logo({ width = 152, priority, className }: { width?: number; priority?: boolean; className?: string }) {
  return (
    <Image
      src="/images/logo.webp"
      alt="Морошка, ресторан"
      width={width}
      height={Math.round((width * 159) / 605)}
      priority={priority}
      // className меняет ширину на разных экранах; высота подстраивается (h-auto)
      className={className ? `h-auto ${className}` : undefined}
    />
  );
}
