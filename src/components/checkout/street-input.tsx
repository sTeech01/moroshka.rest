"use client";

import { useRef, useState } from "react";

/** Поле улицы с подсказками DaData (через /api/address) */
export function StreetInput({ id, className = "field", placeholder }: { id?: string; className?: string; placeholder?: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  return (
    <>
      <input
        id={id}
        name="street"
        className={className}
        placeholder={placeholder}
        list="street-suggestions"
        autoComplete="address-line1"
        required
        onChange={(e) => {
          const q = e.target.value;
          clearTimeout(timer.current);
          timer.current = setTimeout(async () => {
            const res = await fetch(`/api/address?q=${encodeURIComponent(q)}`).catch(() => null);
            if (res?.ok) setSuggestions(((await res.json()) as { suggestions: string[] }).suggestions);
          }, 250);
        }}
      />
      <datalist id="street-suggestions">
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </>
  );
}
