import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  // Демо на Vercel не индексируется — иначе поисковики увидят дубль боевого сайта
  if (process.env.VERCEL) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/cart", "/checkout", "/order/"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
