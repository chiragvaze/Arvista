'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Star } from 'lucide-react'

interface PremiumDividerProps {
  text?: string
  variant?: 'default' | 'ornate' | 'minimal' | 'glow'
  className?: string
}

export default function PremiumDivider({ text, variant = 'default', className = '' }: PremiumDividerProps) {
  const renderDefault = () => (
    <div className={`relative flex items-center justify-center py-16 ${className}`}>
      <motion.div
        className="absolute inset-0 flex items-center"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <div className="w-full border-t border-gradient-to-r from-transparent via-accent-gold to-transparent" />
      </motion.div>
      
      {text && (
        <motion.div
          className="relative px-8 bg-black"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <span className="text-accent-gold font-display text-lg tracking-wider uppercase">
            {text}
          </span>
        </motion.div>
      )}
    </div>
  )

  const renderOrnate = () => (
    <div className={`relative flex items-center justify-center py-20 ${className}`}>
      {/* Central ornament */}
      <motion.div
        className="relative flex items-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        {/* Left decorations */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-accent-gold/60" />
          </motion.div>
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-accent-gold" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-4 h-4 text-accent-amethyst/80" />
          </motion.div>
        </motion.div>

        {/* Center content */}
        {text && (
          <motion.div
            className="px-6 py-2 glass-panel premium-border rounded-full"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          >
            <span className="text-gradient-lux font-display text-lg tracking-wider uppercase">
              {text}
            </span>
          </motion.div>
        )}

        {/* Right decorations */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 15, 0, -15, 0],
              scale: [1, 1.1, 1] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-accent-amethyst/80" />
          </motion.div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-accent-gold" />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-accent-gold/60" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )

  const renderMinimal = () => (
    <div className={`relative py-12 ${className}`}>
      <motion.div
        className="w-32 h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent mx-auto"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
      />
      {text && (
        <motion.p
          className="text-center text-white/60 text-sm font-light mt-4 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  const renderGlow = () => (
    <div className={`relative py-16 ${className}`}>
      <motion.div
        className="relative w-full max-w-md mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        {/* Animated glow line */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent relative overflow-hidden"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          {/* Moving glow effect */}
          <motion.div
            className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white to-transparent filter blur-sm"
            animate={{ x: ['-80px', '400px', '-80px'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {text && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-black"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <span className="text-accent-gold font-display text-sm tracking-wider uppercase">
              {text}
            </span>
          </motion.div>
        )}

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent-gold rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: '50%',
            }}
            animate={{
              y: [-10, -20, -10],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  )

  switch (variant) {
    case 'ornate':
      return renderOrnate()
    case 'minimal':
      return renderMinimal()
    case 'glow':
      return renderGlow()
    default:
      return renderDefault()
  }
}

// Geometric divider variant
export function GeometricDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative py-16 overflow-hidden ${className}`}>
      <motion.div
        className="flex items-center justify-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        {/* Diamond shapes */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-gradient-to-br from-accent-gold to-accent-amethyst rotate-45"
            initial={{ rotate: 0, scale: 0 }}
            whileInView={{ rotate: 45, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: i * 0.2,
              type: "spring",
              stiffness: 200
            }}
            animate={{
              rotate: [45, 60, 45],
            }}
            style={{
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </motion.div>

      {/* Background geometric pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <motion.svg
          width="200"
          height="60"
          viewBox="0 0 200 60"
          className="text-accent-gold"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
        >
          <motion.path
            d="M10,30 L50,10 L90,30 L130,10 L170,30"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
        </motion.svg>
      </div>
    </div>
  )
}