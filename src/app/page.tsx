'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'
import FeaturedGallery from '@/components/home/FeaturedGallery'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturedGallery />
      <Footer />
    </main>
  )
}
