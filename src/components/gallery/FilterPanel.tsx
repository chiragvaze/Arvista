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
    <div className="w-full">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search artworks by title or description..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-neutral-50 rounded-lg space-y-6 mb-8">
              {/* Category Filter */}
              <div>
                <h3 className="font-display font-semibold text-lg mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleArrayFilter('category', cat)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        filters.category.includes(cat)
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100'
                      )}
                    >
                      {cat}
                    </button>
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
