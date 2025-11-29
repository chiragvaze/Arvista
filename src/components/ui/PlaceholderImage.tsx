'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface PlaceholderImageProps {
  width: number
  height: number
  seed?: string | number
  className?: string
}

export default function PlaceholderImage({ width, height, seed = 1, className = '' }: PlaceholderImageProps) {
  const [gradientId, setGradientId] = useState('')

  useEffect(() => {
    setGradientId(`gradient-${Math.random().toString(36).substr(2, 9)}`)
  }, [])

  const colors = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    ['#96CEB4', '#FFEAA7', '#DDA0DD'],
    ['#74B9FF', '#0984E3', '#6C5CE7'],
    ['#FD79A8', '#FDCB6E', '#E17055'],
    ['#00B894', '#00CEC9', '#6C5CE7'],
    ['#A29BFE', '#FD79A8', '#FDCB6E'],
  ]

  const seedNum = typeof seed === 'string' ? seed.length : seed
  const colorSet = colors[seedNum % colors.length]
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <radialGradient
            id={gradientId}
            cx="30%"
            cy="30%"
            r="70%"
          >
            <stop offset="0%" stopColor={colorSet[0]} stopOpacity="0.8" />
            <stop offset="50%" stopColor={colorSet[1]} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colorSet[2]} stopOpacity="0.4" />
          </radialGradient>
          
          <pattern
            id={`noise-${gradientId}`}
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.1)" />
            <circle cx="75" cy="75" r="1.5" fill="rgba(255,255,255,0.08)" />
            <circle cx="50" cy="10" r="1" fill="rgba(255,255,255,0.05)" />
            <circle cx="10" cy="50" r="1.5" fill="rgba(255,255,255,0.07)" />
          </pattern>
        </defs>
        
        <rect
          width="100%"
          height="100%"
          fill={`url(#${gradientId})`}
        />
        <rect
          width="100%"
          height="100%"
          fill={`url(#noise-${gradientId})`}
          opacity="0.3"
        />
      </svg>
      
      {/* Animated overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

// Generate a data URL for use in img src
export function generatePlaceholderDataUrl(width: number, height: number, seed: number = 1): string {
  const colors = [
    ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    ['#96CEB4', '#FFEAA7', '#DDA0DD'],
    ['#74B9FF', '#0984E3', '#6C5CE7'],
    ['#FD79A8', '#FDCB6E', '#E17055'],
    ['#00B894', '#00CEC9', '#6C5CE7'],
    ['#A29BFE', '#FD79A8', '#FDCB6E'],
  ]

  const colorSet = colors[seed % colors.length]
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="${colorSet[0]}" stop-opacity="0.8" />
          <stop offset="50%" stop-color="${colorSet[1]}" stop-opacity="0.6" />
          <stop offset="100%" stop-color="${colorSet[2]}" stop-opacity="0.4" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="${width * 0.2}" cy="${height * 0.3}" r="20" fill="rgba(255,255,255,0.1)" />
      <circle cx="${width * 0.7}" cy="${height * 0.6}" r="15" fill="rgba(255,255,255,0.08)" />
      <circle cx="${width * 0.5}" cy="${height * 0.8}" r="10" fill="rgba(255,255,255,0.05)" />
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}