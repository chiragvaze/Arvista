'use client'

import Link from 'next/link'
import { Heart, Instagram, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-display font-semibold mb-3">ARVISTA</h3>
            <p className="text-neutral-600 text-sm mb-4">
              Where Art Meets Vision
            </p>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Original artworks spanning oil paintings, watercolors, pencil sketches, 
              and concept art. Each piece tells a story of vision, craft, and artistic dedication.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/gallery" className="hover:text-primary-600 transition-colors">Gallery</Link></li>
              <li><Link href="/collections" className="hover:text-primary-600 transition-colors">Collections</Link></li>
              <li><Link href="/about" className="hover:text-primary-600 transition-colors">About</Link></li>
              <li><Link href="/commission" className="hover:text-primary-600 transition-colors">Commissions</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li><Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link></li>
              <li><a href="mailto:hello@arvista.com" className="hover:text-primary-600 transition-colors">hello@arvista.com</a></li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-primary-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-primary-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="mailto:hello@arvista.com" className="text-neutral-600 hover:text-primary-600 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
          <p>© 2024 Arvista. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-4 md:mt-0">
            Made with <Heart size={14} className="text-accent-rose" /> for artists
          </p>
        </div>
      </div>
    </footer>
  )
}
