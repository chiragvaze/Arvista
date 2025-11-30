'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Award, Palette, Users, Heart } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import GlowCard from '@/components/ui/GlowCard'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { fadeInUpVariants, gridVariants } from '@/lib/animations'

const timeline = [
  { year: '2024', event: 'Featured in Modern Art Quarterly Magazine' },
  { year: '2023', event: 'Solo Exhibition at Azure Gallery, New York' },
  { year: '2023', event: 'Winner - Emerging Artist Award, Contemporary Art Foundation' },
  { year: '2022', event: 'Group Exhibition - "Coastal Visions", San Francisco' },
  { year: '2021', event: 'MFA in Fine Arts, Rhode Island School of Design' },
]

const values = [
  {
    icon: Palette,
    title: 'Authentic Expression',
    description: 'Every piece is a genuine exploration of emotion, experience, and the human condition.',
  },
  {
    icon: Heart,
    title: 'Emotional Connection',
    description: 'Art should speak to the soul, creating bridges between artist and viewer.',
  },
  {
    icon: Users,
    title: 'Community Engagement',
    description: 'Supporting local art communities and mentoring emerging artists.',
  },
  {
    icon: Award,
    title: 'Excellence in Craft',
    description: 'Commitment to technical mastery and continuous artistic growth.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-0">
      <Navigation />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
          <ScrollReveal>
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
              className="text-center mb-16"
            >
              <motion.div
                className="inline-block mb-6"
                animate={{ 
                  rotateY: [0, 360],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Palette className="w-16 h-16 text-accent-gold mx-auto" />
              </motion.div>
              <h1 className="font-display text-6xl lg:text-8xl font-light text-gradient-lux mb-6 tracking-tight">
                About the Artist
              </h1>
              <div className="h-1 w-48 bg-gradient-to-r from-transparent via-accent-gold to-transparent mx-auto mb-8" />
              <p className="text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Exploring the intersection of light, emotion, and memory through contemporary visual art
              </p>
            </motion.div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Artist Photo */}
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden"
            >
              <Image
                src="/images/artist-portrait.jpg"
                alt="Artist Portrait"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Artist Bio */}
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl font-bold text-neutral-900">
                Creating Visual Stories
              </h2>
              <div className="space-y-4 text-lg text-neutral-700 leading-relaxed">
                <p>
                  Based in California, I create artwork that explores the delicate interplay between
                  light, color, and emotion. My work draws inspiration from coastal landscapes, urban
                  environments, and the quiet moments of everyday life.
                </p>
                <p>
                  With a background in both traditional and digital media, I approach each piece as an
                  opportunity to capture fleeting moments and transform them into lasting impressions.
                  My process involves extensive observation, experimentation with various mediums, and a
                  deep commitment to authentic expression.
                </p>
                <p>
                  Over the past decade, my work has been featured in galleries across the United States
                  and has found homes in private collections worldwide. I continue to push the
                  boundaries of my craft while staying true to the core principles of honesty, beauty,
                  and emotional resonance.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="relative py-24 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-accent-gold/10 to-transparent rounded-full filter blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-amethyst/10 to-transparent rounded-full filter blur-3xl"
              animate={{
                x: [0, -50, 0],
                y: [0, 30, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal>
              <motion.div
                variants={fadeInUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="font-display text-5xl lg:text-6xl font-light text-gradient-lux mb-6">
                  Artistic Philosophy
                </h2>
                <div className="h-1 w-64 bg-gradient-to-r from-transparent via-accent-gold to-transparent mx-auto mb-6" />
                <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                  The principles that guide my creative process and artistic journey
                </p>
              </motion.div>
            </ScrollReveal>

            <motion.div
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {values.map((value, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.1}>
                  <GlowCard glowColor="rgba(212, 175, 55, 0.3)">
                    <div className="p-8 glass-panel premium-border rounded-2xl h-full backdrop-blur-xl">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="inline-block"
                      >
                        <value.icon className="w-12 h-12 text-accent-gold mb-6" />
                      </motion.div>
                      <h3 className="font-display text-2xl font-semibold text-gradient-lux mb-4">
                        {value.title}
                      </h3>
                      <p className="text-white/80 leading-relaxed text-lg">{value.description}</p>
                    </div>
                  </GlowCard>
                </ScrollReveal>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold text-neutral-900 mb-4">
              Exhibitions & Awards
            </h2>
            <p className="text-xl text-neutral-600">
              Milestones in my artistic journey
            </p>
          </motion.div>

          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="font-display text-2xl font-bold text-primary-600">
                    {item.year}
                  </span>
                </div>
                <div className="flex-shrink-0 w-px bg-neutral-300 relative">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary-600 group-hover:scale-150 transition-transform" />
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-lg text-neutral-900 font-medium">{item.event}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Process Section */}
        <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl font-bold text-neutral-900 mb-4">
                Creative Process
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                From initial inspiration to finished artwork, each piece follows a deliberate journey
                of exploration and refinement
              </p>
            </motion.div>

            <motion.div
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">
                  Observation
                </h3>
                <p className="text-neutral-700">
                  Immersing in environments, capturing moments through sketches and photography
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">
                  Experimentation
                </h3>
                <p className="text-neutral-700">
                  Testing compositions, colors, and techniques through studies and iterations
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">
                  Refinement
                </h3>
                <p className="text-neutral-700">
                  Building layers, adjusting details, and bringing the vision to life
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
