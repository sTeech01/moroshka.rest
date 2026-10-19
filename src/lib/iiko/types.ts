// Подмножество ответов iikoCloud API, которое использует сайт.
// Сверить с актуальной документацией при подключении: https://api-ru.iiko.services/

export type IikoPrice = {
  organizationId: string | null;
  price: number | null;
};

export type IikoRestrictions = {
  minQuantity: number;
  maxQuantity: number;
  freeQuantity: number;
  byDefault: number;
};

export type IikoModifierItem = {
  itemId: string;
  sku: string;
  name: string;
  description: string;
  prices: IikoPrice[];
  restrictions: IikoRestrictions;
  portionWeightGrams: number | null;
  isHidden: boolean;
  buttonImageUrl: string | null;
};

export type IikoModifierGroup = {
  itemGroupId: string | null;
  sku: string;
  name: string;
  description: string;
  restrictions: IikoRestrictions;
  items: IikoModifierItem[];
  canBeDivided: boolean;
  isHidden: boolean;
  childModifiersHaveMinMaxRestrictions: boolean;
};

export type IikoItemSize = {
  sizeId: string | null;
  sizeCode: string | null;
  sizeName: string | null;
  isDefault: boolean;
  portionWeightGrams: number | null;
  prices: IikoPrice[];
  itemModifierGroups: IikoModifierGroup[];
  buttonImageUrl: string | null;
};

export type IikoMenuItem = {
  itemId: string;
  sku: string;
  name: string;
  description: string;
  type: "DISH" | "MODIFIER" | "GOOD" | "SERVICE" | string;
  orderItemType: "Product" | "Compound" | string;
  measureUnit: string;
  isHidden: boolean;
  itemSizes: IikoItemSize[];
};

export type IikoItemCategory = {
  id: string;
  name: string;
  description: string;
  isHidden: boolean;
  buttonImageUrl: string | null;
  items: IikoMenuItem[];
};

/** POST /api/2/menu/by_id */
export type IikoExternalMenu = {
  id: number | string;
  name: string;
  description: string;
  itemCategories: IikoItemCategory[];
};

/** POST /api/1/stop_lists */
export type IikoStopListResponse = {
  correlationId?: string;
  terminalGroupStopLists: {
    organizationId: string;
    items: {
      terminalGroupId: string;
      items: { productId: string; balance: number; sku?: string; dateAdd?: string }[];
    }[];
  }[];
};
