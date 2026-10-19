import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getEvents } from "@/lib/content";
import { getMenu } from "@/lib/menu/get-menu";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [menu, events] = await Promise.all([getMenu(), getEvents()]);
  const url = (path: string) => `${siteConfig.url}${path}`;

  const pages = ["", "/menu", "/banquets", "/business-lunch", "/events", "/about", "/delivery", "/contacts"].map((p) => ({
    url: url(p),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const dishes = menu.categories.flatMap((c) =>
    c.dishes.map((d) => ({ url: url(`/delivery/${d.slug}`), changeFrequency: "weekly" as const, priority: 0.6 })),
  );

  const eventPages = events.map((e) => ({ url: url(`/events/${e.slug}`), changeFrequency: "monthly" as const, priority: 0.5 }));

  return [...pages, ...dishes, ...eventPages];
}
