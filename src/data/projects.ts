import type { Project } from "@/types";

/**
 * PROJE VERİLERİ / PROJECT DATA
 *
 * Aşağıdaki üç kayıt ÖRNEK içeriktir (sample: true) ve sitede "ÖRNEK / SAMPLE"
 * etiketiyle gösterilir. Gerçek projelerini eklerken:
 *  1. Yeni bir nesne ekle, `sample: false` yap.
 *  2. `links.github` / `links.demo` alanlarına gerçek URL yaz (boşsa buton çıkmaz).
 *  3. Görselleri public/images/projects/ altına koy ve `images` alanına ekle.
 *     Görsel yoksa üretken (generative) kapak otomatik çizilir.
 */
export const projects: Project[] = [
  {
    slug: "sample-signal-atlas",
    sample: true,
    index: "01",
    title: "Signal Atlas",
    tagline: {
      tr: "Verinin şeklini hissettiren interaktif harita.",
      en: "An interactive map that lets you feel the shape of data.",
    },
    summary: {
      tr: "Örnek vaka çalışması: dağınık veri kümelerini tek bir sürüklenebilir yüzeyde keşfetmeye yarayan bir arayüz kurgusu.",
      en: "Sample case study: an interface concept for exploring scattered datasets on a single draggable surface.",
    },
    challenge: {
      tr: "Karmaşık veriyi, yavaşlamadan ve bunaltmadan okunabilir kılmak.",
      en: "Making complex data readable without slowing down or overwhelming the viewer.",
    },
    approach: {
      tr: "Canvas tabanlı çizim, kademeli detay seviyeleri ve hareketi anlam taşıyan bir dil olarak kullanma.",
      en: "Canvas-based rendering, progressive levels of detail, and motion used as a language that carries meaning.",
    },
    outcome: {
      tr: "Bu kayıt bir yer tutucudur. Gerçek sonuçları ve ölçümleri src/data/projects.ts içinde güncelle.",
      en: "This entry is a placeholder. Replace it with real results and metrics in src/data/projects.ts.",
    },
    tags: ["TypeScript", "Canvas", "React"],
    visual: { seed: 11, kind: "rings", tone: "coral" },
    links: {},
  },
  {
    slug: "sample-quiet-engine",
    sample: true,
    index: "02",
    title: "Quiet Engine",
    tagline: {
      tr: "Gürültüsüz, hızlı ve ölçeklenebilir bir servis iskeleti.",
      en: "A quiet, fast and scalable service skeleton.",
    },
    summary: {
      tr: "Örnek vaka çalışması: küçük ekipler için sade bir arka uç mimarisi kurgusu.",
      en: "Sample case study: a lean back-end architecture concept for small teams.",
    },
    challenge: {
      tr: "Az bakım gerektiren, kolay izlenebilir bir yapı kurmak.",
      en: "Building a structure that needs little maintenance and is easy to observe.",
    },
    approach: {
      tr: "Küçük modüller, net sınırlar ve otomatik doğrulama adımları.",
      en: "Small modules, clear boundaries and automated verification steps.",
    },
    outcome: {
      tr: "Bu kayıt bir yer tutucudur. Gerçek sonuçları src/data/projects.ts içinde güncelle.",
      en: "This entry is a placeholder. Replace it with real results in src/data/projects.ts.",
    },
    tags: ["Node.js", "TypeScript", "Vercel"],
    visual: { seed: 27, kind: "lines", tone: "lime" },
    links: {},
  },
  {
    slug: "sample-paper-motion",
    sample: true,
    index: "03",
    title: "Paper Motion",
    tagline: {
      tr: "Tipografiyi hareketle yeniden yazan bir deney.",
      en: "An experiment that rewrites typography through motion.",
    },
    summary: {
      tr: "Örnek vaka çalışması: kinetik tipografi ve scroll koreografisi üzerine bir prototip.",
      en: "Sample case study: a prototype about kinetic typography and scroll choreography.",
    },
    challenge: {
      tr: "Hareketi süs olmaktan çıkarıp okumanın bir parçası yapmak.",
      en: "Turning motion from decoration into part of the reading experience.",
    },
    approach: {
      tr: "GSAP zaman çizelgeleri, değişken fontlar ve erişilebilirlik odaklı azaltılmış hareket modu.",
      en: "GSAP timelines, variable fonts and an accessibility-first reduced motion mode.",
    },
    outcome: {
      tr: "Bu kayıt bir yer tutucudur. Gerçek sonuçları src/data/projects.ts içinde güncelle.",
      en: "This entry is a placeholder. Replace it with real results in src/data/projects.ts.",
    },
    tags: ["GSAP", "Three.js", "Next.js"],
    visual: { seed: 42, kind: "waves", tone: "ivory" },
    links: {},
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}
