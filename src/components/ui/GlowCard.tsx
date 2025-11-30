'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

/**
 * Premium card with glow effect on hover
 * Optimized for 60fps performance
 */
export default function GlowCard({ 
  children, 
  className = '',
  glowColor = 'rgba(212, 175, 55, 0.4)'
}: GlowCardProps) {
  return (
    <motion.div
      className={`relative group ${className}`}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow effect */}
      <div 
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: glowColor }}
      />
      
      {/* Card content */}
      <div className="relative h-full">
        {children}
      </div>
    </motion.div>
  );
}
