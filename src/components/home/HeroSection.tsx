'use client'

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import MagneticButton from '@/components/ui/MagneticButton'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 200])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 1.1])
  const rotate = useTransform(scrollY, [0, 1000], [0, 360])
  
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 150 }
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)

  // Generate floating particles (reduced for better performance)
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      // Reduced from 30 to 10 particles for buttery smooth performance
      for (let i = 0; i < 10; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          duration: Math.random() * 30 + 25, // Even slower for smoother animation
          delay: Math.random() * 5
        })
      }
      setParticles(newParticles)
    }
    generateParticles()
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height
    
    mouseX.set(x * 20)
    mouseY.set(y * 20)
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 100, rotateX: 45 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <section 
      className="relative h-screen flex items-center justify-center overflow-hidden cursor-premium"
      onMouseMove={handleMouseMove}
    >
      {/* Advanced Background Layers */}
      <motion.div
        style={{ scale, rotate }}
        className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900"
      />
      
      {/* Optimized Aurora Background - Reduced complexity */}
      <div className="absolute inset-0 gpu-accelerated pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-aurora-pink/15 rounded-full filter blur-3xl gpu-accelerated"
          animate={{
            scale: [1, 1.08, 1],
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity, 
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-aurora-purple/12 rounded-full filter blur-3xl gpu-accelerated"
          animate={{
            scale: [1.08, 1, 1.08],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        />
      </div>

      {/* Optimized Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/50 rounded-full gpu-accelerated"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [-10, -80, -10],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop"
          }}
        />
      ))}

      {/* Optimized Interactive Orbs - Reduced count */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-accent-gold/25 to-accent-amber/10 filter blur-xl gpu-accelerated pointer-events-none"
        style={{
          x: mouseXSpring,
          y: mouseYSpring,
        }}
        animate={{
          scale: [1, 1.03, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: "reverse"
        }}
      />

      {/* Premium Grain Texture */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ opacity, y }}
        className="relative z-10 text-center px-6 max-w-6xl"
      >
        {/* Premium Title with 3D Effect */}
        <motion.div
          variants={titleVariants}
          className="relative mb-8"
        >
          <motion.h1
            className="text-7xl md:text-9xl lg:text-[12rem] font-display font-light text-transparent bg-gradient-to-br from-white via-accent-gold to-white bg-clip-text mb-6 tracking-tight leading-none"
            style={{
              textShadow: '0 0 60px rgba(212, 175, 55, 0.5), 0 0 100px rgba(255, 255, 255, 0.2)',
            }}
            animate={{
              textShadow: [
                '0 0 60px rgba(212, 175, 55, 0.5), 0 0 100px rgba(255, 255, 255, 0.2)',
                '0 0 80px rgba(212, 175, 55, 0.7), 0 0 120px rgba(255, 255, 255, 0.3)',
                '0 0 60px rgba(212, 175, 55, 0.5), 0 0 100px rgba(255, 255, 255, 0.2)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            ARVISTA
          </motion.h1>
          
          {/* Title Accent Lines */}
          <motion.div
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-accent-gold to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 1.2 }}
          />
          <motion.div
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-0.5 bg-gradient-to-r from-transparent via-accent-gold to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.8, duration: 1.2 }}
          />
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-2xl md:text-3xl text-white/90 mb-16 tracking-[0.3em] uppercase font-body font-light relative"
        >
          <span className="relative z-10">Where Art Meets Vision</span>
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-accent-gold/30 to-accent-amethyst/30 filter blur-sm"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 2 }}
          />
        </motion.p>

        {/* Premium CTA Button with Magnetic Effect */}
        <motion.div variants={itemVariants}>
          <Link href="/gallery">
            <MagneticButton>
              <motion.div
                className="group relative inline-flex items-center gap-4 px-12 py-5 premium-border glass-panel rounded-2xl font-semibold text-lg overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* Button Background Glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 to-accent-amethyst/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"
                />
                
                <Sparkles className="w-5 h-5 text-accent-gold" />
                <span className="relative z-10 text-white group-hover:text-accent-gold transition-colors duration-300">
                  Explore Gallery
                </span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight size={20} className="text-accent-gold group-hover:rotate-12 transition-transform duration-300" />
                </motion.div>
              </motion.div>
            </MagneticButton>
          </Link>
        </motion.div>
      </motion.div>

      {/* Premium Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="w-8 h-14 border-2 border-white/40 rounded-full p-1 premium-border">
            <motion.div 
              className="w-2 h-4 bg-gradient-to-b from-accent-gold to-white rounded-full mx-auto"
              animate={{ y: [0, 20, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="absolute -inset-4 bg-gradient-to-b from-accent-gold/20 to-transparent rounded-full filter blur-xl" />
        </motion.div>
      </motion.div>
    </section>
  )
}
