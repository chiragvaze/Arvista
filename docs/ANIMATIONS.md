# FRAMER MOTION ANIMATION LIBRARY

Complete animation variants and patterns for Arvista.

---

## Page Transitions

```typescript
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(10px)"
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(10px)",
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 1, 1]
    }
  }
}
```

---

## Card Animations

### Artwork Card

```typescript
export const cardVariants = {
  idle: {
    scale: 1,
    boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.08)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.18)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  },
  pressed: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
}
```

### 3D Tilt Effect

```typescript
export const imageTiltVariants = {
  idle: {
    rotateX: 0,
    rotateY: 0,
    transformPerspective: 1000,
  },
  hover: (mousePosition: { x: number; y: number }) => ({
    rotateX: mousePosition.y * 8,
    rotateY: mousePosition.x * -8,
    transformPerspective: 1000,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15
    }
  })
}
```

---

## Button Animations

```typescript
export const buttonVariants = {
  idle: {
    scale: 1,
    boxShadow: "0 8px 24px -4px rgba(139, 71, 38, 0.3)"
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 12px 32px -4px rgba(139, 71, 38, 0.4)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  },
  pressed: {
    scale: 0.96,
  }
}
```

---

## Modal/Lightbox

```typescript
export const backdropVariants = {
  hidden: { 
    opacity: 0,
    backdropFilter: "blur(0px)"
  },
  visible: { 
    opacity: 1,
    backdropFilter: "blur(40px)",
    transition: { duration: 0.4 }
  }
}

export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 40
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
}
```

---

## List/Grid Animations

```typescript
export const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
}

export const gridItemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 40
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
}
```

---

## Scroll Animations

### Parallax Layers

```typescript
const { scrollY } = useScroll()
const y1 = useTransform(scrollY, [0, 500], [0, 150])   // Slow
const y2 = useTransform(scrollY, [0, 500], [0, 250])   // Medium
const y3 = useTransform(scrollY, [0, 500], [0, 400])   // Fast
```

### Fade on Scroll

```typescript
const opacity = useTransform(scrollY, [0, 300], [1, 0])
const scale = useTransform(scrollY, [0, 300], [1, 1.1])
```

---

## Usage Examples

### Page Component

```tsx
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="enter"
  exit="exit"
>
  {children}
</motion.div>
```

### Card Component

```tsx
<motion.div
  variants={cardVariants}
  initial="idle"
  whileHover="hover"
  whileTap="pressed"
>
  <ArtworkCard />
</motion.div>
```

### Grid with Stagger

```tsx
<motion.div
  variants={gridContainerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {items.map(item => (
    <motion.div key={item.id} variants={gridItemVariants}>
      <Card data={item} />
    </motion.div>
  ))}
</motion.div>
```

---

## Performance Tips

✓ Use `transform` and `opacity` only  
✓ Add `will-change: transform` during animations  
✓ Limit concurrent animations  
✓ Use `viewport={{ once: true }}` for scroll animations  
✓ Implement reduced motion fallbacks  

---

**See DESIGN_SYSTEM.md for complete motion principles.**
