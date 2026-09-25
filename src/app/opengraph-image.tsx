import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share image. PLACEHOLDER styling until brand assets arrive. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#0d1013",
        color: "#ffffff",
        borderBottom: "24px solid #f2a900",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 16, height: 72, background: "#f2a900" }} />
        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: 2 }}>
          {site.name.toUpperCase()}
        </div>
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>
        {site.tagline}
      </div>
    </div>,
    size,
  );
}
