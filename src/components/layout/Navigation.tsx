'use client'

import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Sparkles, Palette, User, Mail } from 'lucide-react'

const navItems = [
  { name: 'Gallery', href: '/gallery', icon: Palette },
  { name: 'Collections', href: '/collections', icon: Sparkles },
  { name: 'About', href: '/about', icon: User },
  { name: 'Contact', href: '/contact', icon: Mail },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeItem, setActiveItem] = useState('')
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  const navVariants = {
    top: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "1rem 0",
    },
    scrolled: {
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(40px)",
      borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
      padding: "0.75rem 0",
    },
  }

  const logoVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      textShadow: "0 0 20px rgba(212, 175, 55, 0.6)",
    },
  }

  const itemVariants = {
    initial: { y: 0, opacity: 0.8 },
    hover: { 
      y: -2, 
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        ...navVariants[isScrolled ? 'scrolled' : 'top']
      }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 premium-border"
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-amethyst/5 opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="flex items-center justify-between">
          {/* Premium Logo */}
          <Link href="/">
            <motion.div
              variants={logoVariants}
              initial="initial"
              whileHover="hover"
              className="relative"
            >
              <h1 className="text-3xl font-display font-light tracking-tight text-gradient-lux relative z-10">
                ARVISTA
              </h1>
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-accent-gold/20 to-accent-amethyst/20 rounded-lg filter blur-lg opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              {/* Decorative elements */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-accent-gold rounded-full opacity-60" />
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-accent-amethyst rounded-full opacity-60" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    variants={itemVariants}
                    initial="initial"
                    whileHover="hover"
                    onMouseEnter={() => setActiveItem(item.name)}
                    onMouseLeave={() => setActiveItem('')}
                    className="relative px-6 py-3 rounded-full group"
                  >
                    {/* Background glow on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent-gold/10 to-accent-amethyst/10 rounded-full opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Active indicator */}
                    <motion.div
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-accent-gold to-accent-amethyst rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: activeItem === item.name ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="flex items-center gap-2 relative z-10">
                      <Icon size={16} className="text-accent-gold group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Premium Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative p-3 rounded-full premium-border glass-panel"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? (
                <X size={20} className="text-white" />
              ) : (
                <Menu size={20} className="text-white" />
              )}
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 to-accent-amethyst/20 rounded-full filter blur-sm opacity-60" />
          </motion.button>
        </div>

        {/* Premium Mobile Menu */}
        <motion.div
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={{
            open: {
              opacity: 1,
              height: "auto",
              transition: {
                duration: 0.4,
                ease: [0.04, 0.62, 0.23, 0.98],
                staggerChildren: 0.1,
              },
            },
            closed: {
              opacity: 0,
              height: 0,
              transition: {
                duration: 0.3,
                ease: [0.04, 0.62, 0.23, 0.98],
              },
            },
          }}
          className="md:hidden overflow-hidden"
        >
          <motion.div className="pt-6 pb-4 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.name}
                  variants={{
                    open: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.3,
                        delay: index * 0.1,
                      },
                    },
                    closed: {
                      opacity: 0,
                      y: -20,
                    },
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group"
                  >
                    <motion.div
                      className="flex items-center gap-3 p-4 rounded-xl glass-panel premium-border hover:bg-white/5 transition-colors"
                      whileHover={{ x: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Icon size={20} className="text-accent-gold group-hover:rotate-12 transition-transform duration-300" />
                      <span className="text-white/90 font-medium group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                      <motion.div
                        className="ml-auto w-2 h-2 bg-gradient-to-r from-accent-gold to-accent-amethyst rounded-full opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation Ambient Light */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent" />
    </motion.nav>
  )
}
