import { formatPrice } from "@/lib/format";
import type { LunchGroup } from "@/lib/business-lunch";

/** Позиции на странице /business-lunch, как в карточке ресторана: название ……… выход / цена */
export function LunchGroups({ groups }: { groups: LunchGroup[] }) {
  return (
    <div className="space-y-10">
      {groups.map((g, gi) => (
        <section key={gi}>
          {g.title && <h2 className="eyebrow mb-4 text-center">{g.title}</h2>}
          <ul className="space-y-3">
            {g.items.map((item, ii) => (
              <li key={ii} className="flex items-baseline gap-2 text-[17px]">
                <span>{item.name}</span>
                <span className="mb-1 min-w-6 flex-1 border-b-2 border-dotted border-muted/25" aria-hidden />
                <span className="shrink-0 whitespace-nowrap">
                  {item.weight && <span className="text-muted">{item.weight} / </span>}
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
