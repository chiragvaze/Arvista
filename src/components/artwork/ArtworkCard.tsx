'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Artwork } from '@/lib/types'

interface ArtworkCardProps {
  artwork: Artwork
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    setMousePosition({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  return (
    <Link href={`/artwork/${artwork.slug}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative group cursor-pointer overflow-hidden rounded-2xl bg-neutral-50 shadow-base"
        whileHover="hover"
        initial="idle"
        variants={{
          idle: {
            scale: 1,
            boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.08)',
          },
          hover: {
            scale: 1.02,
            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.18)',
            transition: {
              type: 'spring',
              stiffness: 400,
              damping: 20,
            },
          },
        }}
      >
        {/* Image Container */}
        <motion.div
          className="relative aspect-[4/3] overflow-hidden"
          animate={{
            rotateY: mousePosition.x * 8,
            rotateX: mousePosition.y * -8,
          }}
          transition={{
            type: 'spring',
            stiffness: 150,
            damping: 15,
          }}
          style={{ transformPerspective: 1000 }}
        >
          <Image
            src={artwork.images.thumbnail}
            alt={artwork.title}
            fill
            className="object-cover group-hover:brightness-105 transition-all duration-300"
          />

          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
          >
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-xl font-display font-semibold mb-2 line-clamp-1">
                {artwork.title}
              </h3>
              <p className="text-sm opacity-80">
                {artwork.year} · {artwork.medium}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </Link>
  )
}
