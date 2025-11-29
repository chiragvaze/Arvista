'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Eye, Sparkles, Star } from 'lucide-react'
import { Artwork } from '@/lib/types'

interface ArtworkCardProps {
  artwork: Artwork
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLiked, setIsLiked] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]))
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]))

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    mouseX.set(x)
    mouseY.set(y)
    setMousePosition({ x, y })
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setMousePosition({ x: 0, y: 0 })
  }

  return (
    <Link href={`/artwork/${artwork.slug}`}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative group cursor-premium perspective-1000 transform-gpu"
        whileHover="hover"
        initial="idle"
      >
        {/* Premium Card Container */}
        <motion.div
          className="relative overflow-hidden rounded-3xl premium-border glass-panel backdrop-blur-xl"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          variants={{
            idle: {
              scale: 1,
              z: 0,
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
            },
            hover: {
              scale: 1.05,
              z: 100,
              boxShadow: '0 30px 60px -10px rgba(212, 175, 55, 0.4), 0 0 80px rgba(124, 58, 237, 0.3)',
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 25,
              },
            },
          }}
        >
          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-accent-gold/60 rounded-full"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${20 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          {/* Image Container with 3D Effect */}
          <motion.div
            className="relative aspect-[4/5] overflow-hidden rounded-t-3xl"
            style={{
              transform: "translateZ(60px)",
            }}
          >
            <Image
              src={artwork.images.thumbnail}
              alt={artwork.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />

            {/* Premium Image Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />

            {/* Floating Action Icons */}
            <div className="absolute top-4 right-4 flex flex-col gap-3">
              <motion.button
                onClick={(e) => {
                  e.preventDefault()
                  setIsLiked(!isLiked)
                }}
                className="p-3 glass-panel rounded-full premium-border group/icon"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Heart 
                  className={`w-4 h-4 transition-colors ${
                    isLiked ? 'text-red-400 fill-red-400' : 'text-white group-hover/icon:text-red-400'
                  }`} 
                />
              </motion.button>
              
              <motion.div
                className="p-3 glass-panel rounded-full premium-border"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Eye className="w-4 h-4 text-white" />
              </motion.div>
            </div>

            {/* Premium Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 1.5,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          </motion.div>

          {/* Premium Content Section */}
          <motion.div
            className="p-6 space-y-4"
            style={{
              transform: "translateZ(30px)",
            }}
          >
            {/* Title with Gradient */}
            <motion.h3
              className="text-xl font-display font-semibold text-gradient-lux line-clamp-2 group-hover:line-clamp-none"
              initial={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
            >
              {artwork.title}
            </motion.h3>

            {/* Artist Info */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white/80 text-sm font-medium">
                  Arvista Gallery
                </p>
                <p className="text-white/60 text-xs">
                  {artwork.year} · {artwork.medium}
                </p>
              </div>
              
              {/* Premium Badge */}
              <motion.div
                className="flex items-center gap-1 px-3 py-1 glass-panel rounded-full premium-border"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-3 h-3 text-accent-gold" />
                <span className="text-xs text-white font-medium">Premium</span>
              </motion.div>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                >
                  <Star 
                    className={`w-4 h-4 ${
                      i < 4 ? 'text-accent-gold fill-accent-gold' : 'text-white/30'
                    }`} 
                  />
                </motion.div>
              ))}
              <span className="text-white/60 text-xs ml-2">4.8</span>
            </div>

            {/* Hover Preview Bar */}
            <motion.div
              className="h-1 bg-gradient-to-r from-accent-gold to-accent-amethyst rounded-full"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
              style={{ originX: 0 }}
            />
          </motion.div>

          {/* Interactive Glow */}
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-accent-gold/0 via-accent-gold/20 to-accent-amethyst/0 rounded-3xl filter blur-xl opacity-0 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(212, 175, 55, 0.4), transparent 60%)`,
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.div>
    </Link>
  )
}
