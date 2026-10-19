import path from "node:path";
import type { Payload } from "payload";
import type { Page } from "../../payload-types";
import { aboutSections } from "./content";

type Rich = (markdown: string) => NonNullable<Page["content"]>;

/**
 * Загружает фото из public/images/about и собирает секции страницы «О ресторане».
 * Общая для сида и разового обновления уже созданной базы.
 */
export async function buildAboutSections(payload: Payload, rich: Rich, context: Record<string, unknown>) {
  const upload = async (file: string, alt: string) =>
    (
      await payload.create({
        collection: "media",
        data: { alt },
        filePath: path.join(process.cwd(), "public", "images", "about", file),
        context,
      })
    ).id;

  const { entrance, record } = aboutSections;
  const entranceId = await upload(entrance.file, entrance.alt);
  const recordImageIds = [];
  for (const img of record.images) recordImageIds.push(await upload(img.file, img.alt));

  const sections: NonNullable<Page["sections"]> = [
    { blockType: "textImage", content: rich(aboutSections.textMarkdown), image: entranceId, imagePosition: "right" },
    {
      blockType: "highlight",
      eyebrow: record.eyebrow,
      title: record.title,
      stats: record.stats,
      content: rich(record.markdown),
      images: recordImageIds,
      linkUrl: record.linkUrl,
      linkLabel: record.linkLabel,
    },
  ];
  return sections;
}
