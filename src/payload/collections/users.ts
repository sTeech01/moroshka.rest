import type { CollectionConfig } from "payload";
import { adminOrSelf, isAdmin, isAdminField } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Пользователь", plural: "Пользователи" },
  auth: true,
  admin: { useAsTitle: "email", group: "Администрирование", defaultColumns: ["email", "name", "role"] },
  access: {
    read: adminOrSelf,
    create: isAdmin,
    update: adminOrSelf,
    delete: isAdmin,
  },
  fields: [
    { name: "name", label: "Имя", type: "text" },
    {
      name: "role",
      label: "Роль",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Администратор — всё, включая пользователей", value: "admin" },
        { label: "Редактор — контент сайта", value: "editor" },
      ],
      access: { update: isAdminField },
    },
  ],
  hooks: {
    beforeChange: [
      // Первый пользователь (экран «Создать первого пользователя») становится администратором
      async ({ req, operation, data }) => {
        if (operation === "create") {
          const { totalDocs } = await req.payload.count({ collection: "users", req });
          if (totalDocs === 0) return { ...data, role: "admin" };
        }
        return data;
      },
    ],
  },
};
