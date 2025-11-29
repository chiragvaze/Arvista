'use client'

import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Calendar, Layers } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import ArtworkCard from '@/components/artwork/ArtworkCard'
import { collections } from '@/lib/data/collections'
import { allArtworks } from '@/lib/data/sampleArtworks'
import { fadeInUpVariants, gridVariants } from '@/lib/animations'

interface CollectionDetailPageProps {
  params: {
    slug: string
  }
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const collection = collections.find((c) => c.slug === params.slug)

  if (!collection) {
    notFound()
  }

  const artworks = allArtworks.filter((artwork) =>
    collection.artworkIds.includes(artwork.id)
  )

  return (
    <div className="min-h-screen bg-neutral-0">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Collections</span>
          </Link>

          {/* Collection Header */}
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <div className="flex items-center gap-3 text-primary-600 mb-4">
              <Layers className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wide">Collection</span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              {collection.title}
            </h1>

            <p className="text-xl text-neutral-700 leading-relaxed max-w-3xl mb-6">
              {collection.description}
            </p>

            <div className="flex items-center gap-6 text-neutral-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{collection.year}</span>
              </div>
              <div>
                <span className="font-semibold text-neutral-900">{artworks.length}</span>{' '}
                {artworks.length === 1 ? 'Artwork' : 'Artworks'}
              </div>
            </div>
          </motion.div>

          {/* Artworks Grid */}
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </motion.div>

          {artworks.length === 0 && (
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              className="text-center py-20"
            >
              <p className="text-2xl text-neutral-400 mb-4">No artworks in this collection yet</p>
              <p className="text-neutral-500">Check back soon for new additions</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
