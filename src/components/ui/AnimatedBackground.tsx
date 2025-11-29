'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'mesh' | 'waves' | 'constellation'
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export default function AnimatedBackground({ 
  variant = 'particles', 
  intensity = 'medium',
  className = '' 
}: AnimatedBackgroundProps) {
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const particleCount = intensity === 'low' ? 20 : intensity === 'medium' ? 40 : 60
  
  const renderParticles = () => (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 
              ? 'rgba(212, 175, 55, 0.6)' 
              : i % 3 === 1 
                ? 'rgba(124, 58, 237, 0.4)' 
                : 'rgba(255, 255, 255, 0.3)',
            filter: 'blur(0.5px)',
          }}
          animate={{
            y: [-20, -windowSize.height - 100],
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeOut',
          }}
        />
      ))}
      
      {/* Larger floating orbs */}
      {[...Array(Math.floor(particleCount / 10))].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full filter blur-xl"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${
              i % 2 === 0 
                ? 'rgba(212, 175, 55, 0.1)' 
                : 'rgba(124, 58, 237, 0.08)'
            }, transparent 60%)`,
          }}
          animate={{
            x: [0, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 200 - 100, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )

  const renderMesh = () => (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0 opacity-20"
      >
        <defs>
          <pattern
            id="mesh-pattern"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <motion.path
              d="M0,0 L100,100 M100,0 L0,100"
              stroke="rgba(212, 175, 55, 0.3)"
              strokeWidth="0.5"
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </pattern>
          
          <radialGradient id="mesh-glow">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.2)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#mesh-pattern)" />
        
        {/* Animated mesh points */}
        {[...Array(12)].map((_, i) => (
          <motion.circle
            key={i}
            r="2"
            fill="url(#mesh-glow)"
            initial={{
              cx: Math.random() * windowSize.width,
              cy: Math.random() * windowSize.height,
            }}
            animate={{
              cx: [
                Math.random() * windowSize.width,
                Math.random() * windowSize.width,
                Math.random() * windowSize.width,
              ],
              cy: [
                Math.random() * windowSize.height,
                Math.random() * windowSize.height,
                Math.random() * windowSize.height,
              ],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  )

  const renderWaves = () => (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.1)" />
            <stop offset="50%" stopColor="rgba(124, 58, 237, 0.08)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0.1)" />
          </linearGradient>
        </defs>
        
        {[...Array(5)].map((_, i) => (
          <motion.path
            key={i}
            d={`M0,${200 + i * 150} Q${windowSize.width / 4},${150 + i * 150} ${windowSize.width / 2},${200 + i * 150} T${windowSize.width},${200 + i * 150}`}
            stroke="url(#wave-gradient)"
            strokeWidth="2"
            fill="none"
            opacity={0.3 - i * 0.05}
            animate={{
              d: [
                `M0,${200 + i * 150} Q${windowSize.width / 4},${150 + i * 150} ${windowSize.width / 2},${200 + i * 150} T${windowSize.width},${200 + i * 150}`,
                `M0,${220 + i * 150} Q${windowSize.width / 4},${170 + i * 150} ${windowSize.width / 2},${220 + i * 150} T${windowSize.width},${220 + i * 150}`,
                `M0,${200 + i * 150} Q${windowSize.width / 4},${150 + i * 150} ${windowSize.width / 2},${200 + i * 150} T${windowSize.width},${200 + i * 150}`,
              ],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  )

  const renderConstellation = () => (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg width="100%" height="100%" className="absolute inset-0">
        {[...Array(30)].map((_, i) => {
          const x = Math.random() * windowSize.width
          const y = Math.random() * windowSize.height
          
          return (
            <g key={i}>
              {/* Star */}
              <motion.circle
                cx={x}
                cy={y}
                r="1.5"
                fill="rgba(212, 175, 55, 0.8)"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
              
              {/* Constellation lines */}
              {i > 0 && Math.random() > 0.7 && (
                <motion.line
                  x1={x}
                  y1={y}
                  x2={Math.random() * windowSize.width}
                  y2={Math.random() * windowSize.height}
                  stroke="rgba(212, 175, 55, 0.2)"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{
                    duration: 3,
                    delay: i * 0.1,
                  }}
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )

  switch (variant) {
    case 'mesh':
      return renderMesh()
    case 'waves':
      return renderWaves()
    case 'constellation':
      return renderConstellation()
    default:
      return renderParticles()
  }
}

// Specialized background for hero sections
export function HeroAnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main particle system */}
      <AnimatedBackground variant="particles" intensity="high" />
      
      {/* Overlay mesh */}
      <AnimatedBackground variant="mesh" intensity="low" className="opacity-30" />
      
      {/* Central glow effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15), transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}