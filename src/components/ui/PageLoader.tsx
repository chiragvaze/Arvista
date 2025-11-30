'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from '@/components/ui/Logo';

/**
 * Page loader that shows logo animation on every page load
 * Logo appears centered, then moves to top-left navigation position
 */
export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show loader for 1.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Calculate exit position only on client
  const getExitPosition = () => {
    if (typeof window === 'undefined') return { x: -400, y: -300 };
    return {
      x: -window.innerWidth / 2 + 100,
      y: -window.innerHeight / 2 + 80,
    };
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-black via-primary-900 to-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Animated background orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-accent-gold/20 to-transparent rounded-full filter blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-amethyst/20 to-transparent rounded-full filter blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Logo animation - centered then moves to top-left */}
          <motion.div
            className="relative z-10"
            initial={{ 
              scale: 0.5, 
              opacity: 0,
              x: 0,
              y: 0,
            }}
            animate={{ 
              scale: [0.5, 1.2, 1],
              opacity: [0, 1, 1],
              rotate: [0, 360, 360],
            }}
            exit={{
              scale: 0.3,
              opacity: 0,
              ...getExitPosition(),
            }}
            transition={{ 
              scale: { duration: 1, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.6 },
              rotate: { duration: 1, ease: "easeInOut" },
              exit: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
            }}
          >
            <Logo size="xl" animated={false} />
          </motion.div>

          {/* Pulsing glow effect */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-96 h-96 bg-gradient-to-r from-accent-gold/30 to-accent-amethyst/30 rounded-full filter blur-3xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
