import { deliveryConfig } from "@/config/site";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** Подсказки улиц Губкинского через DaData. Без ключа возвращает пустой список */
export async function GET(req: Request) {
  const query = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  const key = process.env.DADATA_API_KEY;
  if (!key || query.length < 2 || !rateLimit(`addr:${clientIp(req)}`, 120, 60_000)) {
    return Response.json({ suggestions: [] });
  }

  const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Token ${key}` },
    body: JSON.stringify({
      query,
      count: 7,
      locations: [{ city: deliveryConfig.city }],
      restrict_value: true,
      from_bound: { value: "street" },
      to_bound: { value: "street" },
    }),
    cache: "no-store",
  });
  if (!res.ok) return Response.json({ suggestions: [] });

  const data = (await res.json()) as { suggestions: { data: { street_with_type: string | null } }[] };
  const streets = [...new Set(data.suggestions.map((s) => s.data.street_with_type).filter(Boolean))];
  return Response.json({ suggestions: streets });
}
