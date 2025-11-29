'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowUp, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ScrollIndicatorProps {
  variant?: 'minimal' | 'premium' | 'circular' | 'full'
  showScrollTop?: boolean
  color?: string
}

export default function ScrollIndicator({ 
  variant = 'premium', 
  showScrollTop = true,
  color = '#D4AF37' 
}: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  
  // Smooth spring animation for scroll progress
  const springScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setIsVisible(latest > 0.1)
    })
    
    return () => unsubscribe()
  }, [scrollYProgress])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const renderMinimalIndicator = () => (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-gold via-amethyst to-gold origin-left"
      style={{ scaleX: springScrollYProgress }}
    />
  )

  const renderCircularIndicator = () => {
    const circumference = 2 * Math.PI * 20
    const strokeDasharray = useTransform(
      springScrollYProgress,
      [0, 1],
      [0, circumference]
    )

    return (
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          scale: isVisible ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 50 50">
            {/* Background circle */}
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="25"
              cy="25"
              r="20"
              stroke={color}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: useTransform(
                  springScrollYProgress,
                  [0, 1],
                  [circumference, 0]
                )
              }}
            />
          </svg>
          
          {/* Center button */}
          <motion.button
            className="absolute inset-0 rounded-full bg-gray-900/80 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-gray-800/90 transition-colors duration-300"
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-4 h-4 text-gold" />
          </motion.button>
        </div>
      </motion.div>
    )
  }

  const renderPremiumIndicator = () => (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* Main progress bar */}
      <div className="relative h-2 bg-gradient-to-r from-transparent via-gray-900/50 to-transparent">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold via-amethyst to-gold origin-left"
          style={{ scaleX: springScrollYProgress }}
        />
        
        {/* Animated particles */}
        <motion.div
          className="absolute top-1/2 w-3 h-3 bg-gold rounded-full shadow-glow transform -translate-y-1/2"
          style={{
            left: useTransform(springScrollYProgress, [0, 1], ['0%', '100%']),
            x: '-50%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Trailing sparkles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 w-1 h-1 bg-gold rounded-full transform -translate-y-1/2"
            style={{
              left: useTransform(
                springScrollYProgress, 
                [0, 1], 
                [`${-5 - i * 3}%`, `${95 - i * 3}%`]
              ),
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Floating scroll to top button */}
      {showScrollTop && (
        <motion.button
          className="absolute bottom-8 right-8 p-4 bg-gradient-to-br from-gray-900/90 via-purple-900/30 to-gray-900/90 backdrop-blur-xl border-2 border-gold/50 rounded-2xl shadow-premium-glow pointer-events-auto group"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 100, rotate: -180 }}
          animate={{ 
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : 100,
            rotate: isVisible ? 0 : -180
          }}
          transition={{ 
            type: 'spring',
            damping: 20,
            stiffness: 300
          }}
          whileHover={{ 
            scale: 1.1,
            rotateY: 10,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Premium border animation */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <div className="relative flex items-center gap-2">
            <motion.div
              animate={{
                y: [-2, 2, -2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <ArrowUp className="w-5 h-5 text-gold" />
            </motion.div>
            
            <span className="text-white text-sm font-medium group-hover:text-gold transition-colors duration-300">
              Back to Top
            </span>
            
            <Sparkles className="w-4 h-4 text-amethyst opacity-60" />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-gold rounded-full"
                style={{
                  left: `${25 + Math.random() * 50}%`,
                  top: `${25 + Math.random() * 50}%`,
                }}
                animate={{
                  x: [0, Math.random() * 10 - 5, 0],
                  y: [0, Math.random() * 10 - 5, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: Math.random() * 2 + 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </motion.button>
      )}
    </div>
  )

  const renderFullIndicator = () => {
    const percentage = useTransform(springScrollYProgress, [0, 1], [0, 100])
    
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <div className="relative">
          {/* Vertical progress line */}
          <div className="w-1 h-32 bg-gray-800 rounded-full">
            <motion.div
              className="w-full bg-gradient-to-t from-gold to-amethyst rounded-full origin-bottom"
              style={{ height: useTransform(springScrollYProgress, [0, 1], ['0%', '100%']) }}
            />
          </div>

          {/* Percentage indicator */}
          <motion.div
            className="absolute -right-12 top-0 bg-gray-900/90 backdrop-blur-sm border border-gold/30 rounded-lg px-2 py-1 text-xs text-gold font-semibold"
            style={{
              top: useTransform(springScrollYProgress, [0, 1], ['0%', '100%']),
              y: '-50%'
            }}
          >
            <motion.span>
              {Math.round(percentage.get())}%
            </motion.span>
          </motion.div>

          {/* Section markers */}
          {[0.25, 0.5, 0.75].map((position, index) => (
            <motion.div
              key={index}
              className="absolute w-3 h-3 bg-gray-700 rounded-full border-2 border-gray-600 -left-1"
              style={{ top: `${position * 100}%`, y: '-50%' }}
              animate={{
                borderColor: useTransform(
                  springScrollYProgress,
                  [position - 0.05, position, position + 0.05],
                  ['rgb(75, 85, 99)', '#D4AF37', 'rgb(75, 85, 99)']
                ),
                scale: useTransform(
                  springScrollYProgress,
                  [position - 0.05, position, position + 0.05],
                  [1, 1.3, 1]
                ),
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  switch (variant) {
    case 'minimal':
      return renderMinimalIndicator()
    case 'circular':
      return renderCircularIndicator()
    case 'full':
      return renderFullIndicator()
    default:
      return renderPremiumIndicator()
  }
}

// Hook for scroll progress
export function useScrollProgress() {
  const { scrollYProgress } = useScroll()
  return scrollYProgress
}