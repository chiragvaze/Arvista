import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import SmoothScroll from '@/components/ui/SmoothScroll'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://arvista.art'),
  title: {
    default: 'Arvista - Where Art Meets Vision',
    template: '%s | Arvista',
  },
  description: 'Original artworks spanning oil paintings, watercolors, pencil sketches, and concept art. Explore contemporary visual art from a California-based artist.',
  keywords: [
    'art',
    'artist',
    'paintings',
    'drawings',
    'contemporary art',
    'fine art',
    'art gallery',
    'original artwork',
    'oil paintings',
    'watercolor',
    'digital art',
    'California artist',
  ],
  authors: [{ name: 'Arvista' }],
  creator: 'Arvista',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://arvista.art',
    siteName: 'Arvista',
    title: 'Arvista - Where Art Meets Vision',
    description: 'Original artworks spanning oil paintings, watercolors, pencil sketches, and concept art',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Arvista - Contemporary Art Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arvista - Where Art Meets Vision',
    description: 'Original artworks spanning oil paintings, watercolors, pencil sketches, and concept art',
    images: ['/og-image.jpg'],
    creator: '@arvista',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${cormorant.variable} ${inter.variable} ${jetbrains.variable} antialiased scroll-performance gpu-accelerated`}>
        <Providers>
          <SmoothScroll />
          <div className="scroll-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
