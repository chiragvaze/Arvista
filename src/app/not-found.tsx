'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import { fadeInUpVariants } from '@/lib/animations'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-0 to-secondary-50 flex items-center justify-center px-6">
      <motion.div
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-2xl"
      >
        <div className="mb-8">
          <h1 className="font-display text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Artwork Not Found
          </h2>
          <p className="text-xl text-neutral-600">
            The page you're looking for doesn't exist or has been moved to a new gallery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/gallery">
            <Button variant="outline" size="lg">
              <Search className="w-5 h-5 mr-2" />
              Browse Gallery
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-12 border-t border-neutral-200">
          <p className="text-sm text-neutral-500">
            Lost? Try exploring our{' '}
            <Link href="/collections" className="text-primary-600 hover:underline">
              collections
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="text-primary-600 hover:underline">
              contact us
            </Link>{' '}
            for assistance.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
