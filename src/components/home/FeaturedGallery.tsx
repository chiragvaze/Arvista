'use client'

import { motion } from 'framer-motion'
import ArtworkCard from '@/components/artwork/ArtworkCard'
import { featuredArtworks } from '@/lib/data/sampleArtworks'

export default function FeaturedGallery() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-display font-medium mb-4">
          Featured Works
        </h2>
        <p className="text-neutral-600 text-lg">
          Handpicked pieces that define the Arvista vision
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {featuredArtworks.map((artwork) => (
          <motion.div key={artwork.id} variants={itemVariants}>
            <ArtworkCard artwork={artwork} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
