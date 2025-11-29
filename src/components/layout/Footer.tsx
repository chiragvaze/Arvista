'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Instagram, Twitter, Mail, Sparkles, Star, ArrowUp } from 'lucide-react'
import { useState } from 'react'

export default function Footer() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribing(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSubscribed(true)
        setEmail('')
        setTimeout(() => setSubscribed(false), 5000)
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
    } finally {
      setSubscribing(false)
    }
  }

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  const socialIcons = [
    { icon: Instagram, name: 'instagram', href: 'https://instagram.com', color: 'from-pink-500 to-purple-600' },
    { icon: Twitter, name: 'twitter', href: 'https://twitter.com', color: 'from-blue-400 to-blue-600' },
    { icon: Mail, name: 'email', href: 'mailto:hello@arvista.com', color: 'from-green-400 to-blue-500' },
  ]

  return (
    <footer className="relative mt-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-primary-900/50 to-transparent" />
      <div className="absolute inset-0 glass-panel" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent" />
      
      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent-gold/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-10, -50, -10],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Premium Brand Section */}
            <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
              <div className="relative">
                <motion.h3 
                  className="text-4xl font-display font-light text-gradient-lux mb-4 relative"
                  whileHover={{ scale: 1.05 }}
                >
                  ARVISTA
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-accent-gold/60" />
                  </motion.div>
                </motion.h3>
                
                <p className="text-white/80 text-lg mb-6 font-light tracking-wide">
                  Where Art Meets Vision
                </p>
                
                <p className="text-white/60 leading-relaxed mb-8 max-w-md">
                  Original masterpieces spanning oil paintings, watercolors, pencil sketches, 
                  and digital concept art. Each piece tells a story of vision, craft, and artistic dedication.
                </p>

                {/* Newsletter Signup */}
                <div className="space-y-4">
                  <p className="text-white/70 text-sm">Stay updated with our latest collections</p>
                  {subscribed ? (
                    <p className="text-accent-gold text-sm">✓ Successfully subscribed!</p>
                  ) : (
                    <form onSubmit={handleSubscribe} className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="w-full px-4 py-3 glass-panel premium-border rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
                        />
                      </div>
                      <motion.button
                        type="submit"
                        disabled={subscribing}
                        className="px-6 py-3 glass-panel premium-border rounded-xl text-white hover:bg-accent-gold/20 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {subscribing ? 'Subscribing...' : 'Subscribe'}
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Premium Navigation Links */}
            <motion.div variants={itemVariants}>
              <h4 className="font-display font-medium text-white mb-6 flex items-center gap-2">
                <Star className="w-4 h-4 text-accent-gold" />
                Explore
              </h4>
              <ul className="space-y-3">
                {['Gallery', 'Collections', 'About', 'Commissions'].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <Link 
                      href={`/${item.toLowerCase()}`} 
                      className="text-white/70 hover:text-accent-gold transition-colors group flex items-center gap-2"
                    >
                      <motion.div
                        className="w-1 h-1 bg-accent-gold rounded-full opacity-0 group-hover:opacity-100"
                        whileHover={{ scale: 1.5 }}
                      />
                      {item}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Premium Social Connect */}
            <motion.div variants={itemVariants}>
              <h4 className="font-display font-medium text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-amethyst" />
                Connect
              </h4>
              
              <div className="space-y-4 mb-6">
                <Link href="/contact" className="text-white/70 hover:text-accent-gold transition-colors block">
                  Get in Touch
                </Link>
                <a href="mailto:hello@arvista.com" className="text-white/70 hover:text-accent-gold transition-colors block">
                  hello@arvista.com
                </a>
              </div>

              {/* Premium Social Icons */}
              <div className="flex gap-4">
                {socialIcons.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target={social.name !== 'email' ? '_blank' : undefined}
                      rel={social.name !== 'email' ? 'noopener noreferrer' : undefined}
                      className="relative p-3 glass-panel premium-border rounded-xl group overflow-hidden"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onHoverStart={() => setHoveredSocial(social.name)}
                      onHoverEnd={() => setHoveredSocial(null)}
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${social.color} opacity-0 group-hover:opacity-20`}
                        transition={{ duration: 0.3 }}
                      />
                      <Icon className="w-5 h-5 text-white/70 group-hover:text-white relative z-10" />
                      
                      {/* Hover Glow */}
                      {hoveredSocial === social.name && (
                        <motion.div
                          className={`absolute -inset-2 bg-gradient-to-r ${social.color} rounded-xl filter blur-lg opacity-30`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        />
                      )}
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Premium Bottom Section */}
          <motion.div
            variants={itemVariants}
            className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center"
          >
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center text-white/50 text-sm">
              <p>© 2024 Arvista Gallery. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-accent-gold transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-accent-gold transition-colors">Terms</Link>
                <Link href="/cookies" className="hover:text-accent-gold transition-colors">Cookies</Link>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6 md:mt-0">
              <motion.p 
                className="flex items-center gap-2 text-white/50 text-sm"
                whileHover={{ scale: 1.05 }}
              >
                Made with <Heart size={14} className="text-red-400" /> for artists worldwide
              </motion.p>
              
              {/* Scroll to Top */}
              <motion.button
                onClick={scrollToTop}
                className="p-3 glass-panel premium-border rounded-xl text-white/70 hover:text-accent-gold transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowUp className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}
