import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, Playfair_Display } from "next/font/google";
import { GALLERY, SITE_URL } from "@/content/site";
import "./globals.css";

// Typography system: Cinzel for the architectural inscription and small capitals, Playfair Display for
// titles and headings, Inter for descriptions, metadata and controls.
const display = Cinzel({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-display", display: "swap" });
const serif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const title = "ARVISTA — The Art Gallery · Paintings by Chirag Vaze";
const description =
  "ARVISTA is an immersive virtual gallery presenting an artistic collection by Chirag Vaze. Every painting tells a story.";

// The share image is opengraph-image.jpg (a capture of the entrance) with its alt text, added to these tags by Next.js,
// which also copies the Open Graph title, description and image into the X card.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: { type: "website", url: "/", siteName: GALLERY.name, title, description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#110c08",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable}`}>
      <body id="top">{children}</body>
    </html>
  );
}
