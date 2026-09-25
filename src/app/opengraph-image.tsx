import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share image: the logo on white above the tagline on Pamar yellow. */
export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public/brand/pamar-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        borderTop: "24px solid #0094a5",
      }}
    >
      <div style={{ display: "flex", flex: 1, alignItems: "center", paddingLeft: 80 }}>
        <img src={logoSrc} alt="" width={643} height={204} />
      </div>
      <div
        style={{
          display: "flex",
          background: "#f7c92d",
          color: "#191919",
          padding: "40px 80px",
          fontSize: 60,
          fontWeight: 700,
          lineHeight: 1.1,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {site.tagline}
      </div>
    </div>,
    size,
  );
}
