import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, Playfair_Display } from "next/font/google";
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

export const metadata: Metadata = {
  title: "ARVISTA — The Art Gallery · Paintings by Chirag Vaze",
  description:
    "ARVISTA is an immersive virtual gallery presenting an artistic collection by Chirag Vaze. Every painting tells a story.",
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
