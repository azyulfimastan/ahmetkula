import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing, isLocale } from "@/i18n/routing";
import { getNextProject, getProject, projects } from "@/data/projects";
import { alternates, absoluteUrl } from "@/lib/seo";
import { ProjectDetail } from "@/components/sections/ProjectDetail";
import { Footer } from "@/components/layout/Footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(locale) || !project) return {};
  const title = project.title;
  const description = project.summary[locale];
  return {
    title,
    description,
    alternates: alternates(locale, `/projects/${slug}`),
    openGraph: { title, description, url: absoluteUrl(`/${locale}/projects/${slug}`) },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const project = getProject(slug);
  if (!project) notFound();
  return (
    <main>
      <ProjectDetail project={project} next={getNextProject(slug)} />
      <Footer />
    </main>
  );
}
