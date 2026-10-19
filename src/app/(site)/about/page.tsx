import { CmsPage, cmsPageMetadata } from "@/components/cms-page";

export const generateMetadata = () => cmsPageMetadata("about");

export default function Page() {
  return <CmsPage slug="about" />;
}
