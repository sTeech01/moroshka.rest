import { CmsPage, cmsPageMetadata } from "@/components/cms-page";

export const generateMetadata = () => cmsPageMetadata("privacy-policy");

export default function Page() {
  return <CmsPage slug="privacy-policy" />;
}
