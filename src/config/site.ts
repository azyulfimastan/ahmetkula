/**
 * MERKEZİ SİTE AYARLARI / CENTRAL SITE CONFIG
 *
 * Kişisel bilgileri buradan düzenle. Boş ("") bırakılan alanlar sitede
 * bağlantı olarak GÖSTERİLMEZ (sahte link üretilmez).
 */
export const siteConfig = {
  name: "Ahmet Kula",
  brand: "AHMET KULA",
  /** Yayın alan adı. Boşsa NEXT_PUBLIC_SITE_URL, o da yoksa localhost kullanılır. */
  domain: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /** Canlı saat için IANA saat dilimi. Örn: "Europe/Istanbul", "Europe/Warsaw" */
  timeZone: "Europe/Istanbul",
  contact: {
    /** Örn: "merhaba@ornek.com" */
    email: "",
    /** Örn: "https://github.com/kullanici" */
    github: "",
    /** Örn: "https://www.linkedin.com/in/kullanici" */
    linkedin: "",
    /** İsteğe bağlı diğer platformlar: { label: "X", href: "https://..." } */
    other: [] as { label: string; href: string }[],
  },
  /** Profil fotoğrafı: public/images/portrait/ahmet-kula-portrait.webp koyunca otomatik kullanılır. */
  portrait: {
    enabled: false,
    src: "/images/portrait/ahmet-kula-portrait.webp",
    width: 1200,
    height: 1500,
  },
  /** AK logosuna kaç kez tıklanınca alternatif palet açılır */
  logoClicksForEgg: 5,
} as const;

export type SiteConfig = typeof siteConfig;
