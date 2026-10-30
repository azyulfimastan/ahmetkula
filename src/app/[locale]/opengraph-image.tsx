import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";

export const alt = "Ahmet Kula — Digital Playground";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tag = locale === "en" ? "THINK. DESIGN. BUILD." : "DUSUN. TASARLA. GELISTIR.";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#101F1C",
          color: "#EDE9DF",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 4, color: "#8E948C" }}>
          <span>AK / DIGITAL PLAYGROUND</span>
          <span style={{ color: "#D6F46A" }}>SYSTEM ONLINE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.85 }}>
          <span style={{ fontSize: 210, fontWeight: 700, letterSpacing: -10 }}>AHMET</span>
          <span style={{ fontSize: 210, fontWeight: 700, letterSpacing: -10, marginLeft: 150 }}>
            KULA<span style={{ color: "#FF6542" }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
          <span>{tag}</span>
          <span style={{ color: "#FF6542" }}>SOFTWARE ENGINEER · CREATIVE DEVELOPER</span>
        </div>
      </div>
    ),
    size,
  );
}
