import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Число параллельных процессов сборки. По умолчанию — ядра минус одно (на 16-ядерной машине 15):
    // на Windows при запуске через `npm run build` очередной процесс упирался в отказ системы
    // (`spawn EPERM` на шаге «Collecting page data»). Для 68 страниц 4 процессов достаточно.
    cpus: 4,
  },
  // Демо на Vercel: база и фото из demo/ должны попасть в серверные функции (см. payload.config.ts)
  outputFileTracingIncludes: process.env.VERCEL ? { "/**": ["./demo/**/*"] } : undefined,
  cacheLife: {
    // Структура меню и цены из iiko
    menu: { stale: 300, revalidate: 600, expire: 86400 },
    // Меню со стоп-листом — на сервере обновляется раз в 2 минуты.
    // stale (кэш в браузере) не меньше 5 минут, иначе Next не включает меню в мгновенный каркас страницы.
    // Актуальность при заказе гарантирует серверная перепроверка (getMenuFresh)
    stopList: { stale: 300, revalidate: 120, expire: 86400 },
    // Контент из CMS. После правки в админке кэш сбрасывается сразу (хуки Payload)
    content: { stale: 300, revalidate: 3600, expire: 604800 },
  },
  turbopack: {
    rules: {
      // Только стили сайта: CSS админки Payload Tailwind не трогает
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // AVIF на 20–30% легче WebP при том же качестве; браузеры без AVIF получают WebP
    formats: ["image/avif", "image/webp"],
    // Готовые уменьшенные копии хранятся месяц (по умолчанию — 4 часа, и первый посетитель после
    // этого снова ждёт пережатия). Заменённое фото получает новый адрес, так что устаревшее не покажется
    minimumCacheTTL: 2678400,
    // Ширины для телефонов (карточки в две колонки ≈ 180–200 px, экраны с плотностью 2–3)
    deviceSizes: [384, 480, 640, 750, 828, 1080, 1200, 1920, 2560],
    localPatterns: [
      { pathname: "/images/**" },
      // Кадр-заставка видео первого экрана (public/video/hero-poster.webp)
      { pathname: "/video/**" },
      // Файлы, загруженные в админке Payload
      { pathname: "/api/media/file/**" },
    ],
    // Хосты, с которых iiko отдаёт фото блюд. Уточнить после подключения API.
    remotePatterns: [
      { protocol: "https", hostname: "**.iiko.ru" },
      { protocol: "https", hostname: "**.iiko.services" },
      { protocol: "https", hostname: "**.iiko.it" },
      { protocol: "https", hostname: "**.syrve.online" },
    ],
  },
  // Фото, фоны и видео из public/ — кэш в браузере на неделю, потом ещё месяц показываем
  // сохранённое и тихо проверяем обновление. При замене картинки ей даём новое имя файла
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }];
    return [
      { source: "/images/:path*", headers: cache },
      { source: "/video/:path*", headers: cache },
    ];
  },
  async redirects() {
    // Онлайн-заказы выключены целиком (NEXT_PUBLIC_ONLINE_ORDERS_ENABLED=false, см. src/config/site.ts):
    // разделы заказа временно ведут в меню. Не permanent — чтобы браузеры не запомнили редирект
    const ordersOff =
      process.env.NEXT_PUBLIC_ONLINE_ORDERS_ENABLED !== "false"
        ? []
        : ["/delivery", "/delivery/:slug", "/cart", "/checkout", "/order/:id"].map((source) => ({
            source,
            destination: "/menu",
            permanent: false,
          }));
    return [
      // Старые адреса сайта на Tilda
      { source: "/menu-kitchen", destination: "/menu", permanent: true },
      // Страницы блюд для заказа переехали в раздел «Доставка»
      { source: "/menu/:slug", destination: "/delivery/:slug", permanent: true },
      // Адрес соглашения зафиксирован в его тексте — короткий вариант ведёт туда же
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      // Раздела «Афиша» больше нет (страницы отдельных событий остались) — не permanent, если вернут
      { source: "/events", destination: "/", permanent: false },
      ...ordersOff,
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
