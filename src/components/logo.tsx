import Image from "next/image";

/** Логотип «Морошка · ресторан» с ягодой вместо «о». Белый текст на прозрачном — для тёмного фона */
export function Logo({ width = 152, priority }: { width?: number; priority?: boolean }) {
  return (
    <Image
      src="/images/logo.webp"
      alt="Морошка, ресторан"
      width={width}
      height={Math.round((width * 159) / 605)}
      priority={priority}
    />
  );
}
