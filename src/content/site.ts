/**
 * Gallery and artist identity, used by the entrance, painting panels, the
 * collection and the closing section. ARVISTA is the gallery; Chirag Vaze is
 * the artist. Edit the statement freely; it is draft copy.
 */
/** Production origin: the base for canonical, Open Graph, robots and sitemap URLs. */
export const SITE_URL = "https://arvista.vercel.app";

export const GALLERY = {
  name: "ARVISTA",
  subtitle: "The Art Gallery",
  tagline: "Every painting tells a story.",
} as const;

export const ARTIST = {
  name: "Chirag Vaze",
  attribution: "An artistic collection by Chirag Vaze",
  /** Draft artist statement: replace with your own words. */
  statement: "An artist exploring character, emotion, and expression through colour and detail.",
} as const;
