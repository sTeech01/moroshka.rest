import { formatPrice } from "@/lib/format";
import type { LunchGroup } from "@/lib/business-lunch";

/**
 * Позиции на странице /business-lunch: на компьютере в две колонки, чтобы меню дня помещалось
 * в экран без прокрутки. Строка — «название ……… выход / цена» (с 640 px; на телефоне выход под названием).
 */
export function LunchGroups({ groups }: { groups: LunchGroup[] }) {
  return (
    <div className="gap-x-16 lg:columns-2">
      {groups.map((g, gi) => (
        <section key={gi} className="mb-7 break-inside-avoid last:mb-0 lg:mb-8">
          {g.title && <h2 className="mb-3 text-[15px] font-semibold text-berry">{g.title}</h2>}
          <ul className="space-y-2.5">
            {g.items.map((item, ii) => (
              <li key={ii} className="flex items-baseline gap-x-2 text-[16px]">
                <span className="min-w-0 text-snow">
                  {item.name}
                  {item.weight && <span className="block text-sm text-lichen sm:hidden">{item.weight}</span>}
                </span>
                <span className="mb-1 hidden min-w-6 flex-1 border-b border-dotted border-snow/30 sm:block" aria-hidden />
                <span className="ml-auto shrink-0 pl-3 whitespace-nowrap sm:pl-0">
                  {item.weight && <span className="hidden text-lichen sm:inline">{item.weight} / </span>}
                  <span className="font-semibold text-snow">{formatPrice(item.price)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
