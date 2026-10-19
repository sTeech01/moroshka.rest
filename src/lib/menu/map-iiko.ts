import type { IikoExternalMenu, IikoPrice } from "@/lib/iiko/types";
import { slugify } from "@/lib/slugify";
import type { Category, Dish, DishSize, Menu } from "./types";

function pickPrice(prices: IikoPrice[], organizationId?: string): number {
  const own = organizationId ? prices.find((p) => p.organizationId === organizationId) : undefined;
  return (own ?? prices[0])?.price ?? 0;
}

/**
 * Преобразует внешнее меню iiko в доменную модель сайта.
 * Скрытые категории, позиции, модификаторы и позиции без цены отбрасываются.
 */
export function mapIikoMenu(
  raw: IikoExternalMenu,
  stopList: Set<string>,
  organizationId?: string,
): Menu {
  const usedSlugs = new Set<string>();
  const uniqueSlug = (name: string) => {
    const base = slugify(name) || "item";
    let slug = base;
    for (let i = 2; usedSlugs.has(slug); i++) slug = `${base}-${i}`;
    usedSlugs.add(slug);
    return slug;
  };

  const categories: Category[] = raw.itemCategories
    .filter((c) => !c.isHidden)
    .map((c) => {
      const dishes: Dish[] = c.items
        .filter((item) => !item.isHidden)
        .map((item): Dish | null => {
          const sizes: DishSize[] = item.itemSizes.map((s) => ({
            id: s.sizeId,
            name: s.sizeName,
            isDefault: s.isDefault,
            price: pickPrice(s.prices, organizationId),
            weight: s.portionWeightGrams,
            modifierGroups: s.itemModifierGroups
              .filter((g) => !g.isHidden)
              .map((g) => ({
                id: g.itemGroupId ?? g.sku ?? g.name,
                name: g.name,
                min: g.restrictions.minQuantity,
                max: g.restrictions.maxQuantity,
                options: g.items
                  .filter((m) => !m.isHidden && !stopList.has(m.itemId))
                  .map((m) => ({
                    id: m.itemId,
                    name: m.name,
                    price: pickPrice(m.prices, organizationId),
                    weight: m.portionWeightGrams,
                    min: m.restrictions.minQuantity,
                    max: m.restrictions.maxQuantity,
                    byDefault: m.restrictions.byDefault,
                  })),
              })),
          }));

          const priced = sizes.filter((s) => s.price > 0);
          if (priced.length === 0) return null;

          const image =
            item.itemSizes.find((s) => s.isDefault)?.buttonImageUrl ??
            item.itemSizes.find((s) => s.buttonImageUrl)?.buttonImageUrl ??
            null;

          // В iiko в названиях встречаются лишние пробелы
          const name = item.name.replace(/\s+/g, " ").trim();
          return {
            id: item.itemId,
            slug: uniqueSlug(name),
            categoryId: c.id,
            name,
            description: item.description.replace(/\s+/g, " ").trim(),
            image,
            measureUnit: item.measureUnit,
            sizes: priced,
            priceFrom: Math.min(...priced.map((s) => s.price)),
            requiresChoice:
              priced.length > 1 || priced.some((s) => s.modifierGroups.some((g) => g.min > 0)),
            inStock: !stopList.has(item.itemId),
          };
        })
        .filter((d): d is Dish => d !== null);

      return {
        id: c.id,
        slug: uniqueSlug(c.name),
        name: c.name.trim(),
        description: c.description,
        dishes,
      };
    })
    .filter((c) => c.dishes.length > 0);

  return { categories };
}
