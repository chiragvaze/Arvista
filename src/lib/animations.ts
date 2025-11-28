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
