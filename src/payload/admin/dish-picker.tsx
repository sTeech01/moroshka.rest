"use client";

import { useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import { useEffect, useMemo, useState } from "react";

type Option = { id: string; name: string; inStock: boolean };
type Category = { name: string; dishes: Option[] };

const MAX = 8;

/** Выбор популярных блюд из меню iiko. Хранит ID блюд в порядке выбора */
export const DishPicker: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField<string[] | null>({ path });
  const selected = useMemo(() => value ?? [], [value]);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/menu-options")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { categories: Category[] }) => setCategories(data.categories))
      .catch(() => setError("Не удалось загрузить меню. Проверьте подключение к iiko"));
  }, []);

  const names = useMemo(
    () => new Map((categories ?? []).flatMap((c) => c.dishes).map((d) => [d.id, d.name])),
    [categories],
  );

  const toggle = (id: string) =>
    setValue(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id].slice(0, MAX));

  const move = (index: number, delta: number) => {
    const next = [...selected];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setValue(next);
  };

  const label = typeof field.label === "string" ? field.label : "Блюда";

  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <p style={{ margin: "0 0 12px", opacity: 0.7, fontSize: 13 }}>
        Выбрано {selected.length} из {MAX}. Порядок на сайте — как в списке ниже.
      </p>

      {selected.length > 0 && (
        <ol style={{ margin: "0 0 16px", padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
          {selected.map((id, i) => (
            <li
              key={id}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", border: "1px solid var(--theme-elevation-150)", borderRadius: 4 }}
            >
              <span style={{ width: 20, opacity: 0.6 }}>{i + 1}.</span>
              <span style={{ flex: 1 }}>{names.get(id) ?? `Нет в меню (${id.slice(0, 8)}…)`}</span>
              <button type="button" className="btn btn--style-subtle btn--size-small" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Выше">↑</button>
              <button type="button" className="btn btn--style-subtle btn--size-small" disabled={i === selected.length - 1} onClick={() => move(i, 1)} aria-label="Ниже">↓</button>
              <button type="button" className="btn btn--style-subtle btn--size-small" onClick={() => toggle(id)} aria-label="Убрать">✕</button>
            </li>
          ))}
        </ol>
      )}

      {error && <p style={{ color: "var(--theme-error-500)" }}>{error}</p>}
      {!categories && !error && <p style={{ opacity: 0.7 }}>Загружаем меню…</p>}

      {categories?.map((c) => (
        <fieldset key={c.name} style={{ border: 0, padding: 0, margin: "0 0 12px" }}>
          <legend style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 6 }}>{c.name}</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
            {c.dishes.map((d) => (
              <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 6, opacity: d.inStock ? 1 : 0.55, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selected.includes(d.id)}
                  disabled={!selected.includes(d.id) && selected.length >= MAX}
                  onChange={() => toggle(d.id)}
                />
                {d.name}
                {!d.inStock && " (стоп-лист)"}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
};
