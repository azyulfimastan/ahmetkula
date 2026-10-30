import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { projects } from "@/data/projects";
import { absoluteUrl, localizedPath } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/projects", ...projects.map((p) => `/projects/${p.slug}`)];
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      lastModified: new Date(),
      changeFrequency: path === "" ? ("monthly" as const) : ("yearly" as const),
      priority: path === "" ? 1 : path === "/projects" ? 0.8 : 0.6,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(localizedPath(l, path))])),
      },
    })),
  );
}
