import type { ArtworkLook } from "@/lib/sculptures";

/** What the creative concepts need of a work (plain data, passed from the server page). */
export interface ConceptWork {
  slug: string;
  title: string;
  artist: string;
  artistSlug: string;
  /** The artist's portrait under /public, if there is one. */
  artistPortrait?: string;
  /** Has a 3D model (opens in 3D and AR). */
  hasModel: boolean;
  /** The 3D model, its turn to face front, and its light tuning (see lib/sculptures.ts). */
  modelUrl?: string;
  facing?: number;
  look?: ArtworkLook;
  thumbnail: string;
  /** Known details only; empty strings are left out by the page. */
  year?: string;
  material?: string;
  dimensions?: string;
  heightCm?: number;
}
