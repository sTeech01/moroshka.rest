import type { Media } from "@/payload-types";
import { type Img, type RichTextData, toImg } from "./content";

type Node = RichTextData["root"]["children"][number];
type TextNode = { type: "text"; text: string; format?: number };

export type EventStory = {
  /** Абзацы до карточек — вступление */
  intro: RichTextData | null;
  /** Абзацы вида «**Название** — описание» подряд: превращаются в карточки */
  features: { title: string; text: string }[];
  /** Картинки, вставленные в текст: выносятся из потока в отдельный блок */
  images: Img[];
  /** Всё, что после карточек, — заключение */
  outro: RichTextData | null;
};

const BOLD = 1;
const isText = (n: unknown): n is TextNode => typeof n === "object" && n !== null && (n as { type?: string }).type === "text";

/** Абзац «**Название** — описание» → карточка; иначе null */
function asFeature(node: Node): { title: string; text: string } | null {
  if (node.type !== "paragraph") return null;
  const children = ((node as { children?: unknown[] }).children ?? []).filter(isText);
  const boldCount = children.findIndex((c) => !((c.format ?? 0) & BOLD));
  if (boldCount <= 0) return null;
  const title = children.slice(0, boldCount).map((c) => c.text).join("").trim();
  const rest = children.slice(boldCount).map((c) => c.text).join("");
  const match = rest.match(/^\s*[—–:-]\s*([\s\S]+)$/);
  if (!title || !match) return null;
  // Описание в карточке — отдельной фразой, с заглавной буквы («про краба…» → «Про краба…»)
  const text = match[1].trim();
  return { title, text: text.charAt(0).toUpperCase() + text.slice(1) };
}

const wrap = (root: RichTextData["root"], children: Node[]): RichTextData | null =>
  children.length ? { root: { ...root, children } } : null;

/**
 * Разбирает текст события из админки на части для страницы события: вступление, карточки,
 * картинки и заключение. Ничего не требует от редактора — достаточно писать как обычно:
 * абзацы, начинающиеся с жирного названия и тире, становятся карточками (например, новые меню).
 * Если таких абзацев нет, весь текст остаётся во вступлении.
 */
export function splitEventStory(data: RichTextData | null): EventStory {
  if (!data) return { intro: null, features: [], images: [], outro: null };
  const intro: Node[] = [];
  const outro: Node[] = [];
  const features: EventStory["features"] = [];
  const images: Img[] = [];

  for (const node of data.root.children) {
    if (node.type === "upload") {
      const img = toImg((node as { value?: number | Media }).value);
      if (img) images.push(img);
      continue;
    }
    const feature = outro.length === 0 ? asFeature(node) : null;
    if (feature) features.push(feature);
    else (features.length ? outro : intro).push(node);
  }

  return { intro: wrap(data.root, intro), features, images, outro: wrap(data.root, outro) };
}
