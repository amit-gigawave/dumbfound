import type { Sculpture } from "./sculptures";
import { getArtist } from "./artists";
import { hasValue } from "./sculptures";

/** A work whose medium or size is known reads as a finished catalogue entry. */
const hasDetails = (w: Sculpture) => hasValue(w.material) || hasValue(w.dimensions);

/**
 * Catalogue order: grouped by artist (A–Z by name), and within an artist the
 * works with known details first. Otherwise the order of lib/sculptures.ts is
 * kept (the sort is stable).
 */
export function catalogueOrder(works: Sculpture[]): Sculpture[] {
  const name = (w: Sculpture) => getArtist(w.artistSlug)?.name ?? "￿";
  return [...works].sort(
    (a, b) =>
      name(a).localeCompare(name(b)) ||
      Number(hasDetails(b)) - Number(hasDetails(a)),
  );
}
