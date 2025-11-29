'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function PremiumCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorVariant, setCursorVariant] = useState('default')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    // Add event listeners for hover effects
    const handleElementHover = (e: Event) => {
      const target = e.target as HTMLElement
      
      if (target.closest('button, a, .cursor-premium')) {
        setCursorVariant('hover')
      } else if (target.closest('.cursor-text')) {
        setCursorVariant('text')
      } else {
        setCursorVariant('default')
      }
    }

    // Mouse movement
    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseleave', handleMouseLeave)
    
    // Hover effects
    document.addEventListener('mouseover', handleElementHover)
    document.addEventListener('mouseout', () => setCursorVariant('default'))

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseover', handleElementHover)
      document.removeEventListener('mouseout', () => setCursorVariant('default'))
    }
  }, [])

  const variants = {
    default: {
      scale: 1,
      backgroundColor: 'rgba(212, 175, 55, 0.8)',
      mixBlendMode: 'difference' as const,
    },
    hover: {
      scale: 1.5,
      backgroundColor: 'rgba(124, 58, 237, 0.9)',
      mixBlendMode: 'difference' as const,
    },
    text: {
      scale: 0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      mixBlendMode: 'difference' as const,
    },
  }

  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return null // Don't show on mobile
  }

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        variants={variants}
        animate={cursorVariant}
        initial={false}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
      />

      {/* Trailing glow */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 rounded-full pointer-events-none z-[9998] opacity-30"
        style={{
          x: mousePosition.x - 24,
          y: mousePosition.y - 24,
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.6), transparent 70%)',
          filter: 'blur(8px)',
        }}
        animate={{
          x: mousePosition.x - 24,
          y: mousePosition.y - 24,
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
          mass: 0.8,
        }}
      />

      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-white/20 pointer-events-none z-[9997]"
        style={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
        }}
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: cursorVariant === 'hover' ? 1.2 : 1,
          opacity: isVisible ? 0.6 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
      />
    </>
  )
}