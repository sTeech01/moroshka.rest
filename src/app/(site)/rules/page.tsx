import { CmsPage, cmsPageMetadata } from "@/components/cms-page";

export const generateMetadata = () => cmsPageMetadata("rules");

export default function Page() {
  return <CmsPage slug="rules" />;
}
