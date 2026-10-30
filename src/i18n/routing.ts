import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (routing.locales as readonly string[]).includes(value);
}
