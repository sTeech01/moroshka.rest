import { notFound } from "next/navigation";

// У сайта и админки разные корневые layout, поэтому общего app/not-found нет.
// Любой неизвестный адрес сайта отдаёт оформленную 404 из (site)/not-found.tsx.
export function generateStaticParams() {
  // Cache Components требует хотя бы один параметр
  return [{ missing: ["__404__"] }];
}

export default function MissingPage() {
  notFound();
}
