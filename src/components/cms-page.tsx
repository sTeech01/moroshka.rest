import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";
import type { Page } from "@/payload-types";
import { CmsContent } from "./cms-content";
import { PageSections } from "./page-sections";

type Slug = Page["slug"];

/**
 * Страница из коллекции «Страницы» Payload (about, delivery, privacy-policy, offer, rules).
 * Без секций — узкая текстовая колонка (документы); с секциями — шире, под фото.
 */
export async function CmsPage({ slug }: { slug: Slug }) {
  const page = await getPage(slug);
  if (!page) notFound();
  const wide = page.sections.length > 0;

  return (
    <article className={`container-site py-12 lg:py-16 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
      <h1 className="h-display text-5xl lg:text-6xl">{page.title}</h1>
      {page.content && (
        <div className="mt-10 max-w-3xl">
          <CmsContent data={page.content} />
        </div>
      )}
      {wide && (
        <div className="mt-10 lg:mt-14">
          <PageSections sections={page.sections} />
        </div>
      )}
    </article>
  );
}

export async function cmsPageMetadata(slug: Slug): Promise<Metadata> {
  const page = await getPage(slug);
  return page ? { title: page.title, description: page.description ?? undefined, alternates: { canonical: `/${slug}` } } : {};
}
