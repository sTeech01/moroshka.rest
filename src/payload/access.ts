import type { Access, FieldAccess } from "payload";

type Role = "admin" | "editor";
type WithRole = { role?: Role | null } | null | undefined;

export const anyone: Access = () => true;
export const loggedIn: Access = ({ req }) => Boolean(req.user);
export const isAdmin: Access = ({ req }) => (req.user as WithRole)?.role === "admin";
export const isAdminField: FieldAccess = ({ req }) => (req.user as WithRole)?.role === "admin";

/** Администратор — любой пользователь, остальные — только себя */
export const adminOrSelf: Access = ({ req }) => {
  const user = req.user as (WithRole & { id: number | string }) | null;
  if (!user) return false;
  if (user.role === "admin") return true;
  return { id: { equals: user.id } };
};
