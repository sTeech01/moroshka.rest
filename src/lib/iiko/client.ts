import "server-only";

// Клиент iikoCloud API. Не проверен на реальном аккаунте — доступов пока нет.
// Перед запуском сверить эндпоинты и поля с документацией iiko.

const API_URL = process.env.IIKO_API_URL ?? "https://api-ru.iiko.services";

let token: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (token && token.expiresAt > Date.now()) return token.value;

  const apiLogin = process.env.IIKO_API_LOGIN;
  if (!apiLogin) throw new Error("IIKO_API_LOGIN не задан");

  const res = await fetch(`${API_URL}/api/1/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiLogin }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`iiko access_token: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { token: string };
  // Токен живёт ~60 минут, обновляем заранее
  token = { value: data.token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return token.value;
}

export async function iikoPost<T>(endpoint: string, body: unknown): Promise<T> {
  const send = async () =>
    fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await getToken()}` },
      body: JSON.stringify(body),
      cache: "no-store",
    });

  let res = await send();
  if (res.status === 401) {
    token = null;
    res = await send();
  }
  if (!res.ok) throw new Error(`iiko ${endpoint}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} не задан`);
  return value;
}
