'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
};

export default function Logo({ size = 'md', animated = true, className = '' }: LogoProps) {
  const dimensions = sizeMap[size];

  if (animated) {
    return (
      <motion.div
        className={`relative ${className}`}
        style={{ width: dimensions.width, height: dimensions.height }}
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Image
            src="/logo.svg"
            alt="Arvista Logo"
            width={dimensions.width}
            height={dimensions.height}
            priority
            className="drop-shadow-glow"
          />
        </motion.div>
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent-gold/30 to-accent-amethyst/30 rounded-full filter blur-xl opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  }

  return (
    <div className={className} style={{ width: dimensions.width, height: dimensions.height }}>
      <Image
        src="/logo.svg"
        alt="Arvista Logo"
        width={dimensions.width}
        height={dimensions.height}
        priority
      />
    </div>
  );
}
