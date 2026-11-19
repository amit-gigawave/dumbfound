import { join } from "node:path";
import sharp from "sharp";
import { getSculpture, sculptures } from "@/lib/sculptures";

/*
 * The link preview of an artwork page (WhatsApp, iMessage, LinkedIn, X …):
 * the work's own thumbnail, as shown on its page, on the card's light plate.
 *
 * A small square JPEG: chat apps then show it as a small picture beside the
 * title rather than a wide banner (WhatsApp does so for images under about
 * 300 px), and WhatsApp doesn't show WebP, the thumbnails' own format.
 */

export const alt = "Artwork";
export const size = { width: 300, height: 300 };
export const contentType = "image/jpeg";

// Every work's image is made at build time; an unknown address is a 404, so
// the deployed function never has to read a picture.
export const dynamicParams = false;

export function generateStaticParams() {
  return sculptures.map((s) => ({ slug: s.slug }));
}

/** The plate colour of the site's artwork cards. */
const PLATE = "#f0f0f0";
/** Space kept round the work (px). */
const MARGIN = 18;

export default async function ArtworkOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getSculpture(slug);
  if (!work) return new Response("Not found", { status: 404 });

  const jpeg = await sharp(
    // turbopackIgnore: a computed path under public/ would otherwise make
    // file tracing pack all of public/ (3D models, AR copies: far past
    // Vercel's 250 MB function limit) into this route's function.
    join(/* turbopackIgnore: true */ process.cwd(), "public", work.thumbnail.split("?")[0]),
  )
    // Cut the empty transparent edges, so the work fills the small square
    // (with a narrow margin), then put it on the plate.
    .trim({ threshold: 1 })
    .resize(size.width - 2 * MARGIN, size.height - 2 * MARGIN, {
      fit: "contain",
      background: PLATE,
    })
    .extend({ top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, background: PLATE })
    .flatten({ background: PLATE })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "content-type": "image/jpeg" },
  });
}
