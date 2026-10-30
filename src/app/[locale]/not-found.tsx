import { useTranslations } from "next-intl";
import { NotFoundActions } from "@/components/sections/NotFoundActions";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main data-tone="dark" className="flex min-h-[100svh] flex-col justify-center px-5 py-32 md:px-8">
      <p className="mono-label text-[0.7rem] text-accent">AK/ERR</p>
      <h1 className="display text-[clamp(9rem,36vw,40rem)]">{t("title")}</h1>
      <p className="mt-6 max-w-lg text-[clamp(1.1rem,2vw,1.6rem)]">{t("text")}</p>
      <NotFoundActions label={t("home")} />
    </main>
  );
}
