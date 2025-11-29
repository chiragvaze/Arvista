'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useEffect } from 'react'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'glass' | 'premium' | 'art-gallery'
}

export default function PremiumModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
}: PremiumModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          backdrop: 'backdrop-blur-xl bg-black/30',
          container: 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl',
          border: 'border-gradient-gold'
        }
      case 'premium':
        return {
          backdrop: 'backdrop-blur-md bg-gradient-to-br from-black/50 via-purple-900/20 to-black/50',
          container: 'bg-gradient-to-br from-gray-900/95 via-purple-900/10 to-gray-900/95 backdrop-blur-xl border-2 border-gradient-gold shadow-premium',
          border: 'border-gradient-premium'
        }
      case 'art-gallery':
        return {
          backdrop: 'backdrop-blur-lg bg-gradient-to-r from-black/60 via-gray-900/40 to-black/60',
          container: 'bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90 backdrop-blur-xl border border-gold/30 shadow-gold-glow',
          border: 'border-gallery-frame'
        }
      default:
        return {
          backdrop: 'backdrop-blur-sm bg-black/50',
          container: 'bg-white border border-gray-200 shadow-xl',
          border: ''
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${styles.backdrop}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={onClose}
        >
          {/* Backdrop particles for premium variants */}
          {variant === 'premium' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gold rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}

          {/* Modal container */}
          <motion.div
            className={`relative w-full ${sizeClasses[size]} ${styles.container} rounded-2xl overflow-hidden ${styles.border}`}
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 50,
              rotateX: -15 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              rotateX: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9, 
              y: 20,
              rotateX: 15 
            }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Premium border animation */}
            {variant === 'premium' && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(45deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}

            {/* Header */}
            {title && (
              <motion.div
                className={`flex items-center justify-between p-6 border-b ${
                  variant === 'default' ? 'border-gray-200' : 'border-white/10'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <h2 className={`text-xl font-bold ${
                  variant === 'default' 
                    ? 'text-gray-900' 
                    : 'text-white premium-text-glow'
                }`}>
                  {variant === 'premium' && (
                    <Sparkles className="inline w-5 h-5 mr-2 text-gold" />
                  )}
                  {title}
                </h2>
                
                <motion.button
                  className={`p-2 rounded-full transition-all duration-300 ${
                    variant === 'default'
                      ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                      : 'hover:bg-white/10 text-white/70 hover:text-white hover:shadow-glow'
                  }`}
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              className={`p-6 ${size === 'full' ? 'max-h-[calc(95vh-140px)] overflow-y-auto' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {children}
            </motion.div>

            {/* Premium floating elements */}
            {variant === 'premium' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-gold to-amethyst rounded-full opacity-20"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      x: [0, Math.random() * 40 - 20, 0],
                      y: [0, Math.random() * 40 - 20, 0],
                      opacity: [0.2, 0.6, 0.2],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: Math.random() * 6 + 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Specialized modal for artwork display
export function ArtworkModal({
  isOpen,
  onClose,
  artwork,
}: {
  isOpen: boolean
  onClose: () => void
  artwork: {
    title: string
    artist: string
    image: string
    description?: string
    price?: string
    dimensions?: string
    medium?: string
  }
}) {
  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      variant="art-gallery"
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div
          className="relative group"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-xl border-2 border-gold/30 shadow-gold-glow">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-auto object-cover"
            />
            
            {/* Premium overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div>
            <h3 className="text-3xl font-bold text-white premium-text-glow mb-2">
              {artwork.title}
            </h3>
            <p className="text-gold text-lg font-medium">
              by {artwork.artist}
            </p>
          </div>

          {artwork.description && (
            <div className="text-gray-300 leading-relaxed">
              {artwork.description}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {artwork.medium && (
              <div>
                <h4 className="text-gold font-semibold mb-1">Medium</h4>
                <p className="text-gray-300">{artwork.medium}</p>
              </div>
            )}
            
            {artwork.dimensions && (
              <div>
                <h4 className="text-gold font-semibold mb-1">Dimensions</h4>
                <p className="text-gray-300">{artwork.dimensions}</p>
              </div>
            )}
          </div>

          {artwork.price && (
            <motion.div
              className="pt-6 border-t border-gold/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="text-2xl font-bold text-gold mb-4">
                {artwork.price}
              </div>
              
              <div className="flex gap-4">
                <motion.button
                  className="flex-1 premium-button-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Inquire About Purchase
                </motion.button>
                
                <motion.button
                  className="px-6 py-3 border border-gold/50 text-gold rounded-xl hover:bg-gold/10 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add to Wishlist
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PremiumModal>
  )
}