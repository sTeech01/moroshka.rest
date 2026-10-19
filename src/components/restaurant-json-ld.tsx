import { siteConfig } from "@/config/site";
import { getSettings } from "@/lib/content";

const dayMap: Record<string, string[]> = {
  "Пн–Сб": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "Пн–Вс": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  Вс: ["Sunday"],
};

/** Микроразметка schema.org/Restaurant для поисковиков */
export async function RestaurantJsonLd() {
  const s = await getSettings();

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Морошка",
    // Из карточки предприятия
    legalName: "ООО «Морошка»",
    taxID: "8911031960",
    url: siteConfig.url,
    telephone: s.phone,
    servesCuisine: ["Северная кухня", "Европейская кухня"],
    hasMenu: `${siteConfig.url}/menu`,
    acceptsReservations: true,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Губкинский",
      addressRegion: "Ямало-Ненецкий автономный округ",
      addressCountry: "RU",
      postalCode: "629832",
      streetAddress: s.address,
    },
    geo: s.geo.lat && s.geo.lng ? { "@type": "GeoCoordinates", latitude: s.geo.lat, longitude: s.geo.lng } : undefined,
    openingHoursSpecification: s.hours
      .filter((h) => dayMap[h.days])
      .map((h) => {
        const [opens, closes] = h.time.split("–");
        return { "@type": "OpeningHoursSpecification", dayOfWeek: dayMap[h.days], opens, closes };
      }),
    sameAs: [s.vk, s.telegram].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
