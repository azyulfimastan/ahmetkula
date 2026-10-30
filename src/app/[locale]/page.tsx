import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Work } from "@/components/sections/Work";
import { Toolbox } from "@/components/sections/Toolbox";
import { Playground } from "@/components/sections/Playground";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/layout/Footer";
import { HashScroll } from "@/components/sections/HashScroll";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main>
      <HashScroll />
      <Hero />
      <About />
      <Work />
      <Toolbox />
      <Playground />
      <Contact />
      <Footer />
    </main>
  );
}
