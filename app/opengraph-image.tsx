import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/*
 * Default link preview (WhatsApp, LinkedIn, X …) for pages without their own
 * image: the site name and home page headline beside the Dancing Shiva render.
 * Artwork pages use their own thumbnail instead.
 */

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [font, art] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Marcellus-Regular.ttf")),
    readFile(join(process.cwd(), "assets/og-dancing-shiva.png")),
  ]);
  const artSrc = `data:image/png;base64,${art.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#fafafa",
          fontFamily: "Marcellus",
          color: "#111111",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 0 72px 80px",
          }}
        >
          <div style={{ fontSize: 30, letterSpacing: 2 }}>{site.name}</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              lineHeight: 1.08,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            <span>Art, and the</span>
            <span>hands that</span>
            <span>made it.</span>
          </div>
          <div style={{ width: 96, height: 3, background: "#396046" }} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
        <img src={artSrc} width={504} height={630} alt="" />
      </div>
    ),
    { ...size, fonts: [{ name: "Marcellus", data: font, weight: 400 }] },
  );
}
