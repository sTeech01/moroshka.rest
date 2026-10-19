import type { TextField } from "payload";
import { slugify } from "../../lib/slugify";

/** Адрес страницы: заполняется из названия, если не указан вручную */
export function slugField(from = "title", description?: string): TextField {
  return {
    name: "slug",
    label: "Адрес (slug)",
    type: "text",
    unique: true,
    index: true,
    admin: {
      position: "sidebar",
      description: description ?? "Латиницей через дефис. Если оставить пустым — заполнится из названия",
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          const source = typeof value === "string" && value.trim() ? value : (data?.[from] as string | undefined);
          return source ? slugify(source) : value;
        },
      ],
    },
  };
}
