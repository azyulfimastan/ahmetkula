import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, isLocale } from "@/i18n/routing";
import { ClientShell } from "@/components/layout/ClientShell";
import { siteConfig } from "@/config/site";
import { absoluteUrl, alternates, baseUrl } from "@/lib/seo";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#101F1C",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(baseUrl),
    title: { default: t("title"), template: `%s · ${siteConfig.name}` },
    description: t("description"),
    alternates: alternates(locale),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: t("title"),
      description: t("description"),
      url: absoluteUrl(`/${locale}`),
      locale: locale === "tr" ? "tr_TR" : "en_US",
      alternateLocale: locale === "tr" ? ["en_US"] : ["tr_TR"],
    },
    twitter: { card: "summary_large_image", title: t("title"), description: t("description") },
    authors: [{ name: siteConfig.name }],
    icons: { icon: "/icon.svg" },
  };
}

/** Boyamadan önce tema/palet ve intro durumunu uygular (yanıp sönmeyi önler). */
const BOOT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('ak-theme');if(t==='ivory'||t==='forest')d.dataset.theme=t;var p=localStorage.getItem('ak-palette');if(p==='alt'||p==='default')d.dataset.palette=p;if(sessionStorage.getItem('ak-intro')==='1')d.dataset.intro='skip';}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "meta" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: t("jobTitle"),
    url: absoluteUrl(`/${locale}`),
    sameAs: [siteConfig.contact.github, siteConfig.contact.linkedin, ...siteConfig.contact.other.map((o) => o.href)].filter(Boolean),
  };

  return (
    <html lang={locale} data-theme="forest" data-palette="default" data-dev="false" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientShell>{children}</ClientShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
