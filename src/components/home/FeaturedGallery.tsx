'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import ArtworkCard from '@/components/artwork/ArtworkCard'
import { featuredArtworks } from '@/lib/data/sampleArtworks'
import { Sparkles, Star, Zap } from 'lucide-react'
import { useRef } from 'react'

export default function FeaturedGallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.1])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 60, 
      rotateX: 45,
      scale: 0.8 
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <motion.section 
      ref={sectionRef}
      className="relative py-32 px-6 max-w-7xl mx-auto overflow-hidden"
      style={{ opacity }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-accent-gold/10 to-accent-amber/5 rounded-full filter blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-accent-amethyst/10 to-aurora-purple/5 rounded-full filter blur-3xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPC9zdmc+')] opacity-20" />
      </div>

      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-20 relative"
      >
        <motion.div
          variants={titleVariants}
          className="relative inline-block"
        >
          {/* Decorative Icons */}
          <motion.div
            className="absolute -top-8 -left-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6 text-accent-gold/60" />
          </motion.div>
          <motion.div
            className="absolute -top-6 -right-6"
            animate={{ 
              rotate: [0, 15, 0, -15, 0],
              scale: [1, 1.1, 1, 1.1, 1] 
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Star className="w-5 h-5 text-accent-amethyst/60" />
          </motion.div>
          <motion.div
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-accent-gold/80" />
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-light text-gradient-lux mb-6 tracking-tight">
            Featured Works
          </h2>
          
          {/* Accent Line */}
          <motion.div
            className="h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: "200px" }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
        </motion.div>
        
        <motion.p
          variants={titleVariants}
          className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed"
        >
          Handpicked masterpieces that define the{" "}
          <span className="text-gradient-lux font-medium">Arvista</span> vision
        </motion.p>
      </motion.div>

      {/* Gallery Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-150px' }}
        style={{ y, scale }}
        className="relative"
      >
        {/* Premium Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {featuredArtworks.map((artwork, index) => (
            <motion.div 
              key={artwork.id} 
              variants={itemVariants}
              className="group relative"
            >
              {/* Card Container with 3D Effect */}
              <motion.div
                className="relative perspective-1000"
                whileHover={{ 
                  rotateY: index % 2 === 0 ? 5 : -5,
                  rotateX: 3,
                  z: 50,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Floating Card Shadow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-accent-gold/20 to-accent-amethyst/20 rounded-2xl filter blur-xl translate-y-8 opacity-0 group-hover:opacity-60"
                  transition={{ duration: 0.4 }}
                />
                
                {/* Main Card */}
                <motion.div
                  className="relative transform-gpu"
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <ArtworkCard artwork={artwork} />
                </motion.div>

                {/* Premium Hover Glow */}
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-accent-gold/0 via-accent-gold/20 to-accent-amethyst/0 rounded-3xl opacity-0 group-hover:opacity-100 filter blur-xl"
                  transition={{ duration: 0.5 }}
                />
              </motion.div>

              {/* Index Number */}
              <motion.div
                className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-accent-gold to-accent-amber rounded-full flex items-center justify-center font-display font-semibold text-white text-sm opacity-60 group-hover:opacity-100 z-10"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: index * 0.1 + 0.5,
                  type: "spring",
                  stiffness: 400,
                  damping: 15 
                }}
                whileHover={{ scale: 1.1, rotate: 360 }}
              >
                {(index + 1).toString().padStart(2, '0')}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Premium Divider */}
      <motion.div
        className="lux-divider mt-24"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.5 }}
      />
    </motion.section>
  )
}
