'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Layers } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { collections } from '@/lib/data/collections'
import { allArtworks } from '@/lib/data/sampleArtworks'
import { fadeInUpVariants, gridVariants, cardVariants } from '@/lib/animations'

export default function CollectionsPage() {
  const getCollectionArtworks = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId)
    if (!collection) return []
    return allArtworks.filter((artwork) => collection.artworkIds.includes(artwork.id))
  }

  return (
    <div className="min-h-screen bg-neutral-0">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-neutral-900 mb-4">
              Collections
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Curated series of artworks organized by theme, style, and creative exploration
            </p>
          </motion.div>

          {/* Collections Grid */}
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="space-y-20"
          >
            {collections.map((collection, idx) => {
              const artworks = getCollectionArtworks(collection.id)

              return (
                <motion.div
                  key={collection.id}
                  variants={cardVariants}
                  className={idx % 2 === 0 ? '' : 'lg:flex-row-reverse'}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Collection Info */}
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 text-primary-600 mb-3">
                          <Layers className="w-5 h-5" />
                          <span className="text-sm font-medium uppercase tracking-wide">
                            {collection.year}
                          </span>
                        </div>
                        <h2 className="font-display text-4xl font-bold text-neutral-900 mb-4">
                          {collection.title}
                        </h2>
                        <p className="text-lg text-neutral-700 leading-relaxed">
                          {collection.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                        <div className="text-neutral-600">
                          <span className="font-semibold text-neutral-900">
                            {artworks.length}
                          </span>{' '}
                          {artworks.length === 1 ? 'Artwork' : 'Artworks'}
                        </div>
                        <Link
                          href={`/collections/${collection.slug}`}
                          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                          View Collection
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>

                    {/* Collection Preview Grid */}
                    <div className="relative">
                      {artworks.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Main Image */}
                          <div className="col-span-2 relative aspect-[16/10] rounded-xl overflow-hidden">
                            <Image
                              src={collection.coverImage}
                              alt={collection.title}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          {/* Thumbnail Images */}
                          {artworks.slice(1, 3).map((artwork) => (
                            <div
                              key={artwork.id}
                              className="relative aspect-square rounded-lg overflow-hidden"
                            >
                              <Image
                                src={artwork.images.thumbnail}
                                alt={artwork.title}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Badge for Featured Collections */}
                      {collection.featured && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-gold-500 text-white text-xs font-semibold rounded-full shadow-lg">
                          Featured
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
