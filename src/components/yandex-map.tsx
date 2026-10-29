/**
 * Яндекс Карта с меткой ресторана (виджет-iframe, без ключа API).
 * tone="dark" — тёмная под стиль сайта: invert + hue-rotate(180°) меняет светлое на тёмное,
 * но сохраняет оттенки (оранжевая метка, зелень). tone="mono" — светлая монохромная, как в референсе
 * заказчика для блока контактов на главной. Ослабить/убрать — поправить класс фильтра.
 */
export function YandexMap({
  lat,
  lng,
  className = "",
  tone = "dark",
}: {
  lat: number;
  lng: number;
  className?: string;
  tone?: "dark" | "mono";
}) {
  const point = `${lng}%2C${lat}`;
  const filter = tone === "mono" ? "[filter:grayscale(1)_contrast(0.92)_brightness(1.04)]" : "[filter:invert(0.9)_hue-rotate(180deg)_saturate(0.7)_brightness(0.95)]";
  return (
    <div className={`relative overflow-hidden rounded-card bg-stone shadow-(--shadow-soft) ${className}`}>
      <iframe
        src={`https://yandex.ru/map-widget/v1/?ll=${point}&z=16&pt=${point}%2Cpm2orm`}
        title="Ресторан «Морошка» на карте"
        className={`absolute inset-0 h-full w-full border-0 ${filter}`}
        loading="lazy"
      />
    </div>
  );
}

/** Маршрут в Яндекс Картах от текущего местоположения до ресторана */
export const yandexRouteUrl = (lat: number, lng: number) => `https://yandex.ru/maps/?rtext=~${lat}%2C${lng}&rtt=auto`;
