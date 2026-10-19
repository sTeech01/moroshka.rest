import { RichText } from "@payloadcms/richtext-lexical/react";
import type { RichTextData } from "@/lib/content";

/** Форматированный текст из админки Payload (редактор Lexical) */
export function CmsContent({ data }: { data: RichTextData | null }) {
  if (!data) return null;
  return <RichText data={data} className="prose-moroshka" />;
}
