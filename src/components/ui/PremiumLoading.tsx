'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface PremiumLoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function PremiumLoading({ text = 'Loading...', size = 'md' }: PremiumLoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Loading Ring */}
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 border-accent-gold/20 relative`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {/* Animated Border */}
          <motion.div
            className={`${sizeClasses[size]} rounded-full border-2 border-transparent border-t-accent-gold absolute inset-0`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner Glow */}
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-accent-gold/20 to-accent-amethyst/20 absolute inset-0 filter blur-sm`}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-accent-gold" />
            </motion.div>
          </div>
        </motion.div>

        {/* Orbit Particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent-gold rounded-full"
            style={{
              top: '50%',
              left: '50%',
            }}
            animate={{
              rotate: 360,
              x: size === 'lg' ? 40 : size === 'md' ? 30 : 20,
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.6,
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.p
          className={`text-white/80 font-medium ${textSizeClasses[size]}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
        
        {/* Animated Dots */}
        <div className="flex justify-center mt-2 space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-accent-gold rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// Skeleton Loading Component for Cards
export function PremiumSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="aspect-[4/5] bg-gradient-to-br from-white/10 to-white/5 rounded-2xl relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded w-3/4" />
          <div className="h-3 bg-gradient-to-r from-white/15 to-white/5 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

// Full Screen Premium Loading
export function FullScreenLoading() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <PremiumLoading text="Loading Arvista Experience..." size="lg" />
        
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent-gold/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100, -20],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}