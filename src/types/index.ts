import type { Locale } from "@/i18n/routing";

export type Localized<T = string> = Record<Locale, T>;

export type Project = {
  slug: string;
  /** true ise arayüzde "ÖRNEK / SAMPLE" etiketi gösterilir (gerçek iş gibi sunulmaz). */
  sample: boolean;
  index: string;
  title: string;
  tagline: Localized;
  summary: Localized;
  challenge: Localized;
  approach: Localized;
  outcome: Localized;
  tags: string[];
  /** Üretken kapak için palet tohumu */
  visual: { seed: number; kind: "rings" | "lines" | "grid" | "waves"; tone: "coral" | "lime" | "ivory" };
  /** Gerçek görsel yüklendiğinde: public/images/projects/... */
  images?: { src: string; width: number; height: number; alt: Localized }[];
  links: { github?: string; demo?: string };
};

export type TechCategory = "frontend" | "backend" | "cloud" | "creative" | "tools";

export type Tech = {
  id: string;
  label: string;
  category: TechCategory;
  note: Localized;
};
