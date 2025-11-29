'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import ArtworkCard from '@/components/artwork/ArtworkCard'
import FilterPanel, { FilterState } from '@/components/gallery/FilterPanel'
import { GallerySkeleton } from '@/components/ui/LoadingSkeleton'
import { allArtworks } from '@/lib/data/sampleArtworks'
import { gridVariants, fadeInUpVariants } from '@/lib/animations'

export default function GalleryPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: [],
    medium: [],
    availability: [],
    priceRange: [0, 5000],
    year: [],
  })
  const [isLoading, setIsLoading] = useState(false)

  const filteredArtworks = useMemo(() => {
    return allArtworks.filter((artwork) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          artwork.title.toLowerCase().includes(searchLower) ||
          artwork.description.toLowerCase().includes(searchLower) ||
          artwork.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(artwork.category)) {
        return false
      }

      // Medium filter
      if (filters.medium.length > 0 && !filters.medium.includes(artwork.medium)) {
        return false
      }

      // Availability filter
      if (filters.availability.length > 0 && !filters.availability.includes(artwork.availability)) {
        return false
      }

      // Year filter
      if (filters.year.length > 0 && !filters.year.includes(String(artwork.year))) {
        return false
      }

      // Price range filter
      if (artwork.price) {
        if (artwork.price < filters.priceRange[0] || artwork.price > filters.priceRange[1]) {
          return false
        }
      }

      return true
    })
  }, [filters])

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
              Gallery
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Explore the complete collection of artworks spanning various mediums and styles
            </p>
          </motion.div>

          {/* Filter Panel */}
          <FilterPanel onFilterChange={setFilters} />

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-neutral-600">
              Showing <span className="font-semibold">{filteredArtworks.length}</span> of{' '}
              <span className="font-semibold">{allArtworks.length}</span> artworks
            </p>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <GallerySkeleton />
          ) : filteredArtworks.length > 0 ? (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              className="text-center py-20"
            >
              <p className="text-2xl text-neutral-400 mb-4">No artworks found</p>
              <p className="text-neutral-500">Try adjusting your filters</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
