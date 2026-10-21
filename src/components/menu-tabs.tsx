import Link from "next/link";

/** Переключатель «Кухня / Бар» в шапке меню */
export function MenuTabs({ active }: { active: "kitchen" | "bar" }) {
  const tabs = [
    { key: "kitchen", label: "Кухня", href: "/menu" },
    { key: "bar", label: "Бар", href: "/bar-menu" },
  ] as const;
  return (
    <nav aria-label="Меню" className="mt-6 flex gap-6 text-lg">
      {tabs.map((t) =>
        t.key === active ? (
          <span key={t.key} aria-current="page" className="border-b-2 border-berry pb-1 font-semibold">
            {t.label}
          </span>
        ) : (
          <Link key={t.key} href={t.href} className="border-b-2 border-transparent pb-1 text-muted hover:text-text">
            {t.label}
          </Link>
        ),
      )}
    </nav>
  );
}
