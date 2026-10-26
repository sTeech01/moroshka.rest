import { formatPrice } from "@/lib/format";
import type { LunchGroup } from "@/lib/business-lunch";

/** Позиции на странице /business-lunch, как в карточке ресторана: название ……… выход / цена (с 640 px) */
export function LunchGroups({ groups }: { groups: LunchGroup[] }) {
  return (
    <div className="space-y-10">
      {groups.map((g, gi) => (
        <section key={gi}>
          {g.title && <h2 className="eyebrow mb-4 text-center">{g.title}</h2>}
          <ul className="space-y-3">
            {g.items.map((item, ii) => (
              // Телефон: выход — под названием, справа только цена, без отточия (иначе название сжимается в узкую колонку)
              <li key={ii} className="flex items-baseline gap-x-2 gap-y-0 text-[17px]">
                <span className="min-w-0">
                  {item.name}
                  {item.weight && <span className="block text-sm text-muted sm:hidden">{item.weight}</span>}
                </span>
                <span className="mb-1 hidden min-w-6 flex-1 border-b-2 border-dotted border-muted/25 sm:block" aria-hidden />
                <span className="ml-auto shrink-0 pl-3 whitespace-nowrap sm:pl-0">
                  {item.weight && <span className="hidden text-muted sm:inline">{item.weight} / </span>}
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
