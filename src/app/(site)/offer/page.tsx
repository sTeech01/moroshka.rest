import { CmsPage, cmsPageMetadata } from "@/components/cms-page";

export const generateMetadata = () => cmsPageMetadata("offer");

export default function Page() {
  return <CmsPage slug="offer" />;
}
