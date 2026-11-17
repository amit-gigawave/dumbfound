import type { Sculpture } from "./sculptures";
import { getArtist } from "./artists";
import { hasValue } from "./sculptures";

/** The collection's lead artist, whose works open the catalogue. */
const LEAD_ARTIST = "thota-vaikuntam";

/** A work whose medium or size is known reads as a finished catalogue entry. */
const hasDetails = (w: Sculpture) =>
  hasValue(w.material) || hasValue(w.dimensions);

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

/** Order of the groups on the artworks grid (see Sculpture.form). */
const FORM_RANK = { head: 0, figure: 1, other: 2 } as const;

/**
 * Groups works by what they show, for the artworks grid: the heads together,
 * then the full figures, then animals and objects. Within each group the
 * order given is kept (the sort is stable), so pass catalogueOrder() first.
 */
export function groupByForm(works: Sculpture[]): Sculpture[] {
  const rank = (w: Sculpture) => FORM_RANK[w.form ?? "figure"];
  return [...works].sort((a, b) => rank(a) - rank(b));
}
