'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Ruler, Tag, Heart, Share2, ArrowLeft, Eye } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import ArtworkCard from '@/components/artwork/ArtworkCard'
import Lightbox from '@/components/ui/Lightbox'
import Button from '@/components/ui/Button'
import { allArtworks } from '@/lib/data/sampleArtworks'
import { formatPrice, formatDate } from '@/lib/utils'
import { fadeInUpVariants, pageVariants } from '@/lib/animations'

interface ArtworkDetailPageProps {
  params: {
    slug: string
  }
}

export default function ArtworkDetailPage({ params }: ArtworkDetailPageProps) {
  const artwork = allArtworks.find((a) => a.slug === params.slug)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  if (!artwork) {
    notFound()
  }

  const images = [
    artwork.images.large,
    artwork.images.original,
    artwork.images.medium,
  ]

  const relatedArtworks = allArtworks
    .filter(
      (a) =>
        a.id !== artwork.id &&
        (a.category === artwork.category || a.medium === artwork.medium)
    )
    .slice(0, 3)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork.title,
          text: artwork.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-neutral-0">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Gallery</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Image Gallery */}
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {/* Main Image */}
              <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <Image
                  src={artwork.images.large}
                  alt={artwork.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openLightbox(idx)}
                  >
                    <Image src={img} alt={`${artwork.title} view ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Artwork Details */}
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Title & Price */}
              <div>
                <h1 className="font-display text-4xl lg:text-5xl font-bold text-neutral-900 mb-2">
                  {artwork.title}
                </h1>
                <div className="flex items-center gap-4">
                  {artwork.price ? (
                    <p className="text-3xl font-bold text-primary-600">
                      {formatPrice(artwork.price, artwork.currency)}
                    </p>
                  ) : (
                    <p className="text-xl text-neutral-600 capitalize">
                      {artwork.availability.replace('-', ' ')}
                    </p>
                  )}
                  {artwork.availability === 'sold' && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                      Sold
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-neutral-700 leading-relaxed">{artwork.description}</p>

              {/* Metadata */}
              <div className="space-y-4 border-t border-b border-neutral-200 py-6">
                <div className="flex items-center gap-3 text-neutral-700">
                  <Tag className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Medium:</span>
                  <span>{artwork.medium}</span>
                </div>

                {artwork.dimensions && (
                  <div className="flex items-center gap-3 text-neutral-700">
                    <Ruler className="w-5 h-5 text-primary-600" />
                    <span className="font-medium">Dimensions:</span>
                    <span>
                      {artwork.dimensions.width} × {artwork.dimensions.height}{' '}
                      {artwork.dimensions.unit}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-neutral-700">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Year:</span>
                  <span>{artwork.year}</span>
                </div>

                <div className="flex items-center gap-3 text-neutral-700">
                  <Eye className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Views:</span>
                  <span>{artwork.views?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-medium text-neutral-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                {artwork.availability === 'available' && (
                  <Button size="lg" className="flex-1">
                    Inquire to Purchase
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={isFavorite ? 'bg-red-50 border-red-500 text-red-600' : ''}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Related Artworks */}
          {relatedArtworks.length > 0 && (
            <motion.section
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold text-neutral-900 mb-8">
                Related Artworks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedArtworks.map((related) => (
                  <ArtworkCard key={related.id} artwork={related} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          alt={artwork.title}
        />
      )}
    </div>
  )
}
