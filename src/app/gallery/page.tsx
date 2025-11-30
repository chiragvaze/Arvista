'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import ArtworkCard from '@/components/artwork/ArtworkCard'
import FilterPanel, { FilterState } from '@/components/gallery/FilterPanel'
import { GallerySkeleton } from '@/components/ui/LoadingSkeleton'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { allArtworks } from '@/lib/data/sampleArtworks'
import { gridVariants, fadeInUpVariants } from '@/lib/animations'
import { Sparkles, Grid3x3, Filter } from 'lucide-react'

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

      <main className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-gold/10 to-transparent rounded-full filter blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-96 h-96 bg-gradient-to-br from-accent-amethyst/10 to-transparent rounded-full filter blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
              scale: [1.2, 1, 1.2],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Premium Page Header */}
          <ScrollReveal>
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              className="text-center mb-16"
            >
              <motion.div
                className="inline-block mb-6"
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Grid3x3 className="w-16 h-16 text-accent-gold mx-auto" />
              </motion.div>
              <h1 className="font-display text-6xl lg:text-8xl font-light text-gradient-lux mb-6 tracking-tight">
                Gallery
              </h1>
              <div className="h-1 w-48 bg-gradient-to-r from-transparent via-accent-gold to-transparent mx-auto mb-8" />
              <p className="text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                Explore the complete collection of artworks spanning various mediums and styles
              </p>
            </motion.div>
          </ScrollReveal>

          {/* Filter Panel */}
          <FilterPanel onFilterChange={setFilters} />

          {/* Premium Results Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="glass-panel premium-border rounded-2xl px-8 py-5 inline-flex items-center gap-3 backdrop-blur-xl">
              <Filter className="w-5 h-5 text-accent-gold" />
              <p className="text-white/90 text-lg">
                Showing <span className="font-semibold text-gradient-lux">{filteredArtworks.length}</span> of{' '}
                <span className="font-semibold text-gradient-lux">{allArtworks.length}</span> artworks
              </p>
              <motion.div
                className="w-2 h-2 bg-accent-gold rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Premium Gallery Grid with Page Transitions */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GallerySkeleton />
              </motion.div>
            ) : filteredArtworks.length > 0 ? (
              <motion.div
                key="grid"
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
              >
                {filteredArtworks.map((artwork, index) => (
                  <ScrollReveal key={artwork.id} delay={index * 0.05}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                    >
                      <ArtworkCard artwork={artwork} />
                    </motion.div>
                  </ScrollReveal>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <motion.div
                  className="inline-block mb-6"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-16 h-16 text-accent-gold/50 mx-auto" />
                </motion.div>
                <p className="text-3xl text-white/60 mb-4 font-display">No artworks found</p>
                <p className="text-white/40 text-lg">Try adjusting your filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  )
}
