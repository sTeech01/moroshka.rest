import type { Metadata } from "next";
import { ContactsShowcase } from "@/components/contacts-showcase";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Адрес, телефон и часы работы ресторана «Морошка» в Губкинском.",
  alternates: { canonical: "/contacts" },
};

/** Контакты — тот же блок, что на главной, на том же фоне зала; помещается в один экран ноутбука */
export default async function ContactsPage() {
  const settings = await getSettings();

  return (
    <div className="stage-bg-hall -mt-16 flex min-h-svh items-center pt-24 pb-14 lg:-mt-[76px] lg:pt-[108px]">
      <ContactsShowcase settings={settings} heading="h1" />
    </div>
  );
}
