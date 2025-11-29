/**
 * Framer Motion Animation Variants Library
 * 
 * Reusable animation patterns for consistent motion across Arvista
 */

import { Variants } from 'framer-motion'

// =============================================================================
// PAGE TRANSITIONS
// =============================================================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(10px)',
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(10px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1],
    },
  },
}

// =============================================================================
// CONTAINER VARIANTS
// =============================================================================

export const sectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

export const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
      when: 'beforeChildren',
    },
  },
}

// =============================================================================
// CARD VARIANTS
// =============================================================================

export const cardVariants: Variants = {
  idle: {
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.08)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.18)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
  pressed: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: 'easeOut',
    },
  },
}

export const cardEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
      mass: 0.8,
    },
  },
}

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

export const buttonVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: '0 8px 24px -4px rgba(139, 71, 38, 0.3)',
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 12px 32px -4px rgba(139, 71, 38, 0.4)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15,
    },
  },
  pressed: {
    scale: 0.96,
    transition: {
      duration: 0.1,
      ease: 'easeOut',
    },
  },
}

export const iconButtonVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 12,
    },
  },
  pressed: {
    scale: 0.9,
    rotate: -5,
    transition: { duration: 0.1 },
  },
}

// =============================================================================
// MODAL / LIGHTBOX VARIANTS
// =============================================================================

export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(40px)',
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  },
}

// =============================================================================
// OVERLAY VARIANTS
// =============================================================================

export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    backdropFilter: 'blur(0px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    backdropFilter: 'blur(24px)',
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

// =============================================================================
// FADE VARIANTS
// =============================================================================

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
}

// =============================================================================
// CUSTOM EASING CURVES
// =============================================================================

export const easingCurves = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInExpo: [0.7, 0, 0.84, 0],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  easeOutCubic: [0.33, 1, 0.68, 1],
}

// =============================================================================
// SPRING CONFIGS
// =============================================================================

export const springConfigs = {
  gentle: { stiffness: 100, damping: 15, mass: 1 },
  bouncy: { stiffness: 400, damping: 20, mass: 0.8 },
  snappy: { stiffness: 500, damping: 25, mass: 0.5 },
}

// =============================================================================
// PREMIUM 3D VARIANTS
// =============================================================================

export const premium3DCardVariants: Variants = {
  idle: {
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    z: 0,
    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  hover: {
    scale: 1.05,
    z: 100,
    boxShadow: '0 30px 60px -10px rgba(212, 175, 55, 0.4), 0 0 80px rgba(124, 58, 237, 0.3)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
}

export const magneticVariants: Variants = {
  idle: { x: 0, y: 0, scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17,
    },
  },
}

export const holographicVariants: Variants = {
  idle: {
    backgroundPosition: '0% 50%',
    filter: 'hue-rotate(0deg)',
  },
  hover: {
    backgroundPosition: '100% 50%',
    filter: 'hue-rotate(30deg)',
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
}

// =============================================================================
// PARTICLE SYSTEM VARIANTS
// =============================================================================

export const particleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    y: 0,
  },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    y: [-20, -100, -20],
    transition: {
      duration: 4 + i * 0.5,
      repeat: Infinity,
      delay: i * 0.2,
      ease: 'easeOut',
    },
  }),
}

export const floatingOrbVariants: Variants = {
  animate: {
    y: [-20, 20, -20],
    x: [-10, 10, -10],
    scale: [1, 1.1, 1],
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// =============================================================================
// GLASS MORPHISM VARIANTS
// =============================================================================

export const glassMorphVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    background: 'rgba(255, 255, 255, 0)',
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(40px)',
    background: 'rgba(255, 255, 255, 0.1)',
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

// =============================================================================
// PREMIUM TEXT VARIANTS
// =============================================================================

export const gradientTextVariants: Variants = {
  hidden: {
    backgroundPosition: '0% 50%',
    opacity: 0,
  },
  visible: {
    backgroundPosition: '100% 50%',
    opacity: 1,
    transition: {
      backgroundPosition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse',
      },
      opacity: {
        duration: 0.8,
      },
    },
  },
}

export const typewriterVariants: Variants = {
  hidden: { width: 0 },
  visible: {
    width: '100%',
    transition: {
      duration: 2,
      ease: 'easeInOut',
    },
  },
}

// =============================================================================
// ADVANCED LOADING VARIANTS
// =============================================================================

export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

export const pulseGlowVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(212, 175, 55, 0.5)',
      '0 0 40px rgba(212, 175, 55, 0.8)',
      '0 0 20px rgba(212, 175, 55, 0.5)',
    ],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
}

// =============================================================================
// SCROLL-TRIGGERED VARIANTS
// =============================================================================

export const parallaxVariants: Variants = {
  offscreen: {
    y: 100,
    opacity: 0,
    scale: 0.8,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 1.5,
    },
  },
}

export const staggeredFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}
