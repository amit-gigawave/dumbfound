import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { ImageResponse } from "next/og";
import { getSculpture, sculptures } from "@/lib/sculptures";
import { getArtist } from "@/lib/artists";
import { site } from "@/lib/site";

/*
 * The link preview of an artwork page (WhatsApp, iMessage, LinkedIn, X …):
 * the work on its plate beside the site name, artist and title, in the same
 * layout as the site's default preview (app/opengraph-image.tsx).
 *
 * Sent as a JPEG of about 50-120 KB: WhatsApp only shows previews from small
 * images, and doesn't show WebP (the format of the works' thumbnails).
 */

export const alt = "Artwork";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export function generateStaticParams() {
  return sculptures.map((s) => ({ slug: s.slug }));
}

/** The plate colour of the site's artwork cards. */
const PLATE = "#f0f0f0";

export default async function ArtworkOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getSculpture(slug);
  const artist = work ? getArtist(work.artistSlug) : undefined;

  const font = await readFile(join(process.cwd(), "assets/fonts/Marcellus-Regular.ttf"));
  // The thumbnail is a transparent WebP: put it on the plate as a PNG, the
  // format the image renderer reads.
  const art = work
    ? await sharp(join(process.cwd(), "public", work.thumbnail.split("?")[0]))
        .resize(504, 630, { fit: "contain", background: PLATE })
        .flatten({ background: PLATE })
        .png()
        .toBuffer()
    : null;

  const details = work ? [work.year, work.material].filter(Boolean).join(" · ") : "";

  const png = new ImageResponse(
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
            padding: "72px 56px 72px 80px",
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 2 }}>{site.name}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {artist && (
              <div style={{ fontSize: 30, color: "#396046", marginBottom: 18 }}>
                {artist.name}
              </div>
            )}
            <div style={{ fontSize: (work?.title.length ?? 0) > 34 ? 52 : 64, lineHeight: 1.1 }}>
              {work?.title ?? site.name}
            </div>
            {details && (
              <div style={{ fontSize: 26, color: "#6b6b6b", marginTop: 20 }}>{details}</div>
            )}
          </div>
          <div style={{ width: 96, height: 3, background: "#396046" }} />
        </div>
        {art && (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img
          <img
            src={`data:image/png;base64,${art.toString("base64")}`}
            width={504}
            height={630}
            alt=""
          />
        )}
      </div>
    ),
    { ...size, fonts: [{ name: "Marcellus", data: font, weight: 400 }] },
  );

  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "content-type": "image/jpeg" },
  });
}
