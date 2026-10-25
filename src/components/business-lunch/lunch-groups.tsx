import { formatPrice } from "@/lib/format";
import type { LunchGroup } from "@/lib/business-lunch";

/** Позиции как в карточке ресторана: название ……… выход / цена. Общий для страницы и окна */
export function LunchGroups({ groups, compact = false }: { groups: LunchGroup[]; compact?: boolean }) {
  return (
    <div className={compact ? "space-y-5" : "space-y-8"}>
      {groups.map((g, gi) => (
        <section key={gi} className={compact ? "" : "border-t border-border pt-6"}>
          {g.title && <h2 className={`eyebrow ${compact ? "mb-2" : "mb-4 text-center"}`}>{g.title}</h2>}
          <ul className={compact ? "space-y-1.5" : "space-y-3"}>
            {g.items.map((item, ii) => (
              <li key={ii} className={`flex items-baseline gap-2 ${compact ? "text-[15px]" : "text-[17px]"}`}>
                <span>{item.name}</span>
                <span className="mb-1 min-w-6 flex-1 border-b border-dotted border-muted/50" aria-hidden />
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
