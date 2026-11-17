import { sculptures, hasValue } from "./sculptures";
import { catalogueOrder } from "./catalogue-order";
import { getArtist } from "./artists";
import type { ConceptWork } from "@/components/gallery/views/types";

/** The whole catalogue in catalogue order, as the plain data the Spotlight and True scale views take. */
export function conceptWorks(): ConceptWork[] {
  return catalogueOrder(sculptures).map((w) => ({
    slug: w.slug,
    title: w.title,
    artist: getArtist(w.artistSlug)?.name ?? "",
    artistSlug: w.artistSlug,
    hasModel: Boolean(w.modelUrl),
    ...(w.modelUrl && { modelUrl: w.modelUrl }),
    ...(w.facing !== undefined && { facing: w.facing }),
    ...(w.look && { look: w.look }),
    thumbnail: w.thumbnail,
    ...(hasValue(w.year) && { year: w.year }),
    ...(hasValue(w.material) && { material: w.material }),
    ...(hasValue(w.dimensions) && { dimensions: w.dimensions }),
    ...(w.heightCm && { heightCm: w.heightCm }),
  }));
}
