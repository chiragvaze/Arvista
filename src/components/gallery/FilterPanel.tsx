'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  search: string
  category: string[]
  medium: string[]
  availability: string[]
  priceRange: [number, number]
  year: string[]
}

const categories = ['Painting', 'Drawing', 'Abstract', 'Sketch', 'Concept Art', 'Collage']
const mediums = [
  'Oil on Canvas',
  'Acrylic on Canvas',
  'Watercolor',
  'Charcoal on Paper',
  'Pencil on Paper',
  'Ink on Paper',
  'Digital Art',
  'Mixed Media',
  'Mixed Media Collage',
]
const availabilityOptions = ['available', 'sold', 'not-for-sale']
const years = ['2024', '2023', '2022', '2021']

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: [],
    medium: [],
    availability: [],
    priceRange: [0, 5000],
    year: [],
  })

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleArrayFilter = (key: 'category' | 'medium' | 'availability' | 'year', value: string) => {
    const currentArray = filters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]
    handleFilterChange(key, newArray)
  }

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      category: [],
      medium: [],
      availability: [],
      priceRange: [0, 5000],
      year: [],
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    count += filters.category.length
    count += filters.medium.length
    count += filters.availability.length
    count += filters.year.length
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++
    return count
  }, [filters])

  return (
    <div className="w-full mb-12">
      {/* Premium Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-gold z-10" />
        <input
          type="text"
          placeholder="Search artworks by title, description, or tags..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-16 pr-6 py-5 glass-panel premium-border rounded-2xl backdrop-blur-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent-gold/50 text-lg transition-all"
        />
      </div>

      {/* Premium Filter Toggle Button */}
      <div className="flex items-center justify-between mb-8">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-6 py-4 glass-panel premium-border rounded-2xl backdrop-blur-xl text-white hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="w-5 h-5 text-accent-gold" />
          <span className="font-medium text-lg">Filters</span>
          {activeFilterCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-gradient-to-r from-accent-gold to-accent-amber text-black text-sm rounded-full font-semibold"
            >
              {activeFilterCount}
            </motion.span>
          )}
        </motion.button>

        {activeFilterCount > 0 && (
          <motion.button
            onClick={clearFilters}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-5 py-3 glass-panel premium-border rounded-xl text-white/80 hover:text-white hover:bg-red-500/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-4 h-4" />
            Clear all
          </motion.button>
        )}
      </div>

      {/* Premium Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden mb-12"
          >
            <div className="p-8 glass-panel premium-border rounded-3xl backdrop-blur-xl space-y-8">
              {/* Category Filter */}
              <div>
                <h3 className="font-display font-semibold text-xl mb-4 text-gradient-lux flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🎨
                  </motion.div>
                  Category
                </h3>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat}
                      onClick={() => toggleArrayFilter('category', cat)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'px-5 py-3 rounded-xl text-sm font-medium transition-all backdrop-blur-sm',
                        filters.category.includes(cat)
                          ? 'bg-gradient-to-r from-accent-gold to-accent-amber text-black shadow-glow'
                          : 'glass-panel text-white/80 hover:text-white border border-white/20 hover:border-accent-gold/50'
                      )}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Medium Filter */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3">Medium</h3>
                <div className="flex flex-wrap gap-2">
                  {mediums.map((med) => (
                    <button
                      key={med}
                      onClick={() => toggleArrayFilter('medium', med)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        filters.medium.includes(med)
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      )}
                    >
                      {med}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3">Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {availabilityOptions.map((avail) => (
                    <button
                      key={avail}
                      onClick={() => toggleArrayFilter('availability', avail)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium capitalize transition-all',
                        filters.availability.includes(avail)
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      )}
                    >
                      {avail.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3">Year</h3>
                <div className="flex flex-wrap gap-2">
                  {years.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => toggleArrayFilter('year', yr)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        filters.year.includes(yr)
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      )}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
