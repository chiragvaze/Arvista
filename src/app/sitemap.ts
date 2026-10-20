import type { MetadataRoute } from "next";
import { SITE_URL } from "@/content/site";

/** The gallery is a single page; the collection and artist sections are anchors within it. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/` }];
}
