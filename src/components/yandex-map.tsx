/** Карта ресторана из конструктора Яндекс Карт (метки и вид настраиваются там же, в аккаунте ресторана) */
const CONSTRUCTOR_MAP = "constructor%3Ad6c3fc579a33d32a9bca716bfc81a46ccdd9af953353aa00f64472eed9c00bef";

/**
 * Яндекс Карта ресторана: карта из конструктора Яндекс Карт, встроенная iframe (без ключа API;
 * вариант конструктора со скриптом вставляет карту фиксированного размера на место скрипта).
 * Тёмная под стиль сайта: invert + hue-rotate(180°) меняет светлое на тёмное,
 * но сохраняет оттенки (оранжевая метка, зелень). Ослабить/убрать — поправить класс фильтра.
 * Рекламу в виджете показывает Яндекс; без неё — только JavaScript API Яндекс Карт с ключом.
 */
export function YandexMap({ className = "" }: { lat: number; lng: number; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-card bg-stone shadow-(--shadow-soft) ${className}`}>
      <iframe
        src={`https://yandex.ru/map-widget/v1/?um=${CONSTRUCTOR_MAP}&source=constructor&scroll=true`}
        title="Ресторан «Морошка» на карте"
        className="absolute inset-0 h-full w-full border-0 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.7)_brightness(0.95)]"
        loading="lazy"
      />
    </div>
  );
}

/** Маршрут в Яндекс Картах от текущего местоположения до ресторана */
export const yandexRouteUrl = (lat: number, lng: number) => `https://yandex.ru/maps/?rtext=~${lat}%2C${lng}&rtt=auto`;
