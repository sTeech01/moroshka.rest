// Доменная модель меню сайта. Компоненты работают только с ней,
// а не с форматом iiko.

export type ModifierOption = {
  id: string;
  name: string;
  price: number;
  weight: number | null;
  min: number;
  max: number;
  byDefault: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  min: number;
  max: number;
  options: ModifierOption[];
};

export type DishSize = {
  id: string | null;
  name: string | null;
  isDefault: boolean;
  price: number;
  weight: number | null;
  modifierGroups: ModifierGroup[];
};

export type Dish = {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  description: string;
  image: string | null;
  measureUnit: string;
  sizes: DishSize[];
  /** Минимальная цена среди размеров — для карточки «от N ₽» */
  priceFrom: number;
  /** Есть ли обязательный выбор (размер или модификатор) */
  requiresChoice: boolean;
  inStock: boolean;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  dishes: Dish[];
};

export type Menu = {
  categories: Category[];
};
