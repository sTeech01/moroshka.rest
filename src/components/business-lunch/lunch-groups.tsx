import { formatPrice } from "@/lib/format";
import type { LunchGroup } from "@/lib/business-lunch";

/**
 * Позиции на странице /business-lunch, как в бумажном меню: заголовок группы между тонкими
 * золотистыми линиями, строка «название ……… выход / цена» (с 640 px; на телефоне выход — под названием).
 */
export function LunchGroups({ groups }: { groups: LunchGroup[] }) {
  return (
    <div className="space-y-9 sm:space-y-10">
      {groups.map((g, gi) => (
        <section key={gi}>
          {g.title && (
            <h2 className="mb-5 flex items-center justify-center gap-4 text-[13px] tracking-[0.3em] text-berry/90 uppercase">
              <span aria-hidden className="h-px w-10 bg-linear-to-r from-transparent to-berry/50 sm:w-16" />
              {g.title}
              <span aria-hidden className="h-px w-10 bg-linear-to-l from-transparent to-berry/50 sm:w-16" />
            </h2>
          )}
          <ul className="space-y-3">
            {g.items.map((item, ii) => (
              <li key={ii} className="flex items-baseline gap-x-2 text-[16px] sm:text-[17px]">
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
