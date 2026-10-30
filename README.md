# AHMET KULA — Digital Playground

Next.js (App Router) + TypeScript (strict) + Tailwind + GSAP/ScrollTrigger + Lenis + Three.js / React Three Fiber + next-intl.
Çift dilli (TR varsayılan / EN), Vercel'e hazır kişisel portfolyo.

## Kurulum

```bash
npm install
npm run dev        # http://localhost:3000  (/ → /tr)
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run build` | Production build |
| `npm run start` | Production sunucusu |

## GitHub'a yükleme

```bash
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<kullanici>/<repo>.git
git push -u origin main
```

## Vercel'e bağlama

1. vercel.com → **Add New → Project** → GitHub reposunu seç (Framework: Next.js, ayar gerekmez).
2. (İsteğe bağlı) Environment Variables: `NEXT_PUBLIC_SITE_URL=https://alan-adin.com`
   (canonical, hreflang, sitemap ve OG için kullanılır).
3. **Deploy**.

## Neyi nereden düzenlersin

| Ne | Dosya |
| --- | --- |
| E-posta, GitHub, LinkedIn, diğer sosyaller, saat dilimi, portre aç/kapa | `src/config/site.ts` (boş alan = link gösterilmez) |
| Metinler (TR/EN), terminal çıktıları, SEO başlıkları | `src/messages/tr.json`, `src/messages/en.json` |
| Projeler | `src/data/projects.ts` |
| Teknoloji listesi | `src/data/tech.ts` |
| Renkler / tonlar | `src/lib/tones.ts`, `tailwind.config.ts` |

### Proje ekleme
`src/data/projects.ts` içine yeni bir nesne ekle (`sample: false`, gerçek `links`, dilersen `images`).
Mevcut 3 kayıt **örnektir** ve sitede "ÖRNEK / SAMPLE" etiketiyle görünür; silebilirsin.
Sayfa `/tr/projects/<slug>` ve `/en/projects/<slug>` olarak otomatik üretilir.

### Görsel ekleme
- Portre: `public/images/portrait/ahmet-kula-portrait.webp` koy, `siteConfig.portrait.enabled = true` yap (genişlik/yükseklik değerlerini güncelle).
- Proje görselleri: `public/images/projects/project-01.webp` …; projedeki `images` alanına `{ src, width, height, alt: { tr, en } }` ekle. Görsel yoksa üretken kapak çizilir.
- Görseller `next/image` ile otomatik optimize edilir (AVIF/WebP, responsive boyutlar).

### Dil dosyaları
Anahtarlar iki dosyada aynı yapıdadır. Yeni metin eklerken ikisini de güncelle.

## Kısayollar ve gizli detaylar
- `~` terminal · `Ctrl/Cmd + K` komut paleti · terminalde `help`
- Logoya art arda tıklama: alternatif palet · Konami kodu · terminalde `devmode`

## Notlar
- Tüm animasyonlar `prefers-reduced-motion` ile azalır; özel cursor yalnızca ince imleç cihazlarda ve hareket azaltma kapalıyken çalışır.
- WebGL2 yoksa 3D sahne yerine statik çizgisel bir heykel gösterilir.
- Dokunmatik cihazlarda Playground'daki çizim ve fizik alanları kaydırmayı yakalar; alanın dışına dokunarak kaydırılır.
