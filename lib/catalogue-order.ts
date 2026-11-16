import type { Sculpture } from "./sculptures";
import { getArtist } from "./artists";
import { hasValue } from "./sculptures";

/** The collection's lead artist, whose works open the catalogue. */
const LEAD_ARTIST = "thota-vaikuntam";

/** A work whose medium or size is known reads as a finished catalogue entry. */
const hasDetails = (w: Sculpture) => hasValue(w.material) || hasValue(w.dimensions);

/**
 * Catalogue order: Thota Vaikuntam's works first, then the other artists A–Z
 * by name; within an artist, works with known details first. Otherwise the
 * order of lib/sculptures.ts is kept (the sort is stable).
 */
export function catalogueOrder(works: Sculpture[]): Sculpture[] {
  const lead = (w: Sculpture) => (w.artistSlug === LEAD_ARTIST ? 0 : 1);
  const name = (w: Sculpture) => getArtist(w.artistSlug)?.name ?? "￿";
  return [...works].sort(
    (a, b) =>
      lead(a) - lead(b) ||
      name(a).localeCompare(name(b)) ||
      Number(hasDetails(b)) - Number(hasDetails(a)),
  );
}
