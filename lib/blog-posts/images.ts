/** Share image from a work's thumbnail (800×1000, ours). */
export const thumb = (slug: string, alt: string) => ({
  src: `/thumbnails/${slug}.webp`,
  alt,
  width: 800,
  height: 1000,
});

/**
 * Share image from an artist's portrait (600×600). Only use portraits with an
 * open licence, and credit them: the credit is shown under the photo.
 */
export const portrait = (
  slug: string,
  alt: string,
  credit: { text: string; url: string },
) => ({
  src: `/artists/${slug}.webp`,
  alt,
  width: 600,
  height: 600,
  credit,
});
