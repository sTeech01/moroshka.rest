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
    localPatterns: [
      { pathname: "/images/**" },
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
  // Старые адреса сайта на Tilda
  async redirects() {
    return [
      { source: "/menu-kitchen", destination: "/menu", permanent: true },
      { source: "/bar-menu", destination: "/menu", permanent: true },
      // Страницы блюд для заказа переехали в раздел «Доставка»
      { source: "/menu/:slug", destination: "/delivery/:slug", permanent: true },
      // Адрес соглашения зафиксирован в его тексте — короткий вариант ведёт туда же
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
