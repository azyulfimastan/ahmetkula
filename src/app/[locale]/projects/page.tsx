import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale } from "@/i18n/routing";
import { alternates, absoluteUrl } from "@/lib/seo";
import { ProjectsIndex } from "@/components/sections/ProjectsIndex";
import { Footer } from "@/components/layout/Footer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("projectsTitle"),
    description: t("projectsDescription"),
    alternates: alternates(locale, "/projects"),
    openGraph: { title: t("projectsTitle"), description: t("projectsDescription"), url: absoluteUrl(`/${locale}/projects`) },
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main>
      <ProjectsIndex />
      <Footer />
    </main>
  );
}
