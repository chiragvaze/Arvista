'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'
import FeaturedGallery from '@/components/home/FeaturedGallery'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import PremiumCursor from '@/components/ui/PremiumCursor'
import Parallax from '@/components/ui/Parallax'
import ScrollReveal from '@/components/ui/ScrollReveal'

export default function HomePage() {
  return (
    <>
      <PremiumCursor />
      <main className="min-h-screen relative overflow-x-hidden">
        {/* Optimized Background Enhancement */}
        <div className="fixed inset-0 -z-10 gpu-accelerated">
          {/* Animated Grid - Lighter opacity for better performance */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPC9zdmc+')] opacity-20" />
          
          {/* Optimized Floating Orbs - Will-change only on hover */}
          <Parallax speed={0.2}>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-gold/5 rounded-full filter blur-3xl" />
          </Parallax>
          <Parallax speed={0.3}>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-amethyst/5 rounded-full filter blur-3xl" />
          </Parallax>
        </div>

        <Navigation />
        <HeroSection />
        
        <ScrollReveal delay={0.2}>
          <FeaturedGallery />
        </ScrollReveal>
        
        <Footer />
      </main>
    </>
  )
}
