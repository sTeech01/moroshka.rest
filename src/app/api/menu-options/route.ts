import { getMenu } from "@/lib/menu/get-menu";

/** Список блюд для виджета «Популярные блюда» в админке */
export async function GET() {
  const menu = await getMenu();
  return Response.json({
    categories: menu.categories.map((c) => ({
      name: c.name,
      dishes: c.dishes.map((d) => ({ id: d.id, name: d.name, inStock: d.inStock })),
    })),
  });
}
