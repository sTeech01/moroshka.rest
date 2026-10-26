import Link from "next/link";

/** Переключатель «Кухня / Бар» в шапке меню */
export function MenuTabs({ active }: { active: "kitchen" | "bar" }) {
  const tabs = [
    { key: "kitchen", label: "Кухня", href: "/menu" },
    { key: "bar", label: "Бар", href: "/bar-menu" },
  ] as const;
  return (
    <nav aria-label="Меню" className="mt-6 inline-flex gap-1 rounded-full bg-fill/70 p-1 text-base">
      {tabs.map((t) =>
        t.key === active ? (
          <span key={t.key} aria-current="page" className="rounded-full bg-card px-5 py-2 font-semibold shadow-(--shadow-soft)">
            {t.label}
          </span>
        ) : (
          <Link key={t.key} href={t.href} className="rounded-full px-5 py-2 text-muted transition-colors hover:text-text">
            {t.label}
          </Link>
        ),
      )}
    </nav>
  );
}
