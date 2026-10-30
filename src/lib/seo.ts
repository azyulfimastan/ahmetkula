import { siteConfig } from "@/config/site";
import { routing, type Locale } from "@/i18n/routing";

export const baseUrl = siteConfig.domain.replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return `${baseUrl}${path}`;
}

/** /tr/projects gibi yerelleştirilmiş yol. `path` "" veya "/projects" biçiminde. */
export function localizedPath(locale: Locale, path = "") {
  return `/${locale}${path}`;
}

export function alternates(locale: Locale, path = "") {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = absoluteUrl(localizedPath(l, path));
  languages["x-default"] = absoluteUrl(localizedPath(routing.defaultLocale, path));
  return { canonical: absoluteUrl(localizedPath(locale, path)), languages };
}
