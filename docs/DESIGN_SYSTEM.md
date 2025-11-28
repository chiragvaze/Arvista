# ARVISTA DESIGN SYSTEM SPECIFICATION

**Version 1.0 | November 2024**

---

## Table of Contents

1. [Brand Identity & Visual Language](#1-brand-identity--visual-language)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Components](#5-components)
6. [Animation Principles](#6-animation-principles)
7. [Accessibility](#7-accessibility)

---

## 1. Brand Identity & Visual Language

### Brand Essence
**Arvista** embodies sophisticated artistic expression meeting modern digital experience.

**Tagline**: "Where Art Meets Vision"

**Personality Traits**:
- Sophisticated yet Approachable
- Artistic yet Professional  
- Warm yet Contemporary
- Confident yet Humble

### Visual Direction
**Aesthetic**: Cinematic Gallery Minimalism

**Mood Keywords**:
- Elegant restraint
- Immersive depth
- Soft luxury
- Artistic reverence
- Timeless modernism

---

## 2. Color System

### Primary Palette (Warm Terracotta)

```css
--color-primary-50: #F9F2ED    /* Porcelain */
--color-primary-100: #EDD9CC   /* Cream */
--color-primary-200: #D9B19A   /* Linen */
--color-primary-300: #C18A67   /* Sandstone */
--color-primary-400: #A6643D   /* Clay */
--color-primary-500: #8B4726   /* Terracotta — BRAND COLOR */
--color-primary-600: #6B3620   /* Burnt Sienna */
--color-primary-700: #4A2618   /* Warm Brown */
--color-primary-800: #2D1810   /* Rich Chocolate */
--color-primary-900: #1A0E0A   /* Deep Umber */
```

### Secondary Palette (Azure Blue)

```css
--color-secondary-50: #F0F7FF   /* Ghost Blue */
--color-secondary-100: #DBE9FC  /* Ice Blue */
--color-secondary-200: #B5D4F7  /* Powder Blue */
--color-secondary-300: #87B7F0  /* Light Azure */
--color-secondary-400: #5C9AE6  /* Sky Blue */
--color-secondary-500: #3B7DD9  /* Bright Blue — ACCENT */
--color-secondary-600: #2557A0  /* Azure */
--color-secondary-700: #1A4270  /* Ocean Blue */
--color-secondary-800: #102B4A  /* Midnight Blue */
--color-secondary-900: #0A1A2E  /* Deep Navy */
```

### Accent Colors

```css
--color-accent-gold: #D4AF37      /* Gallery Gold */
--color-accent-amber: #F59E0B     /* Creative Amber */
--color-accent-emerald: #10B981   /* Success Green */
--color-accent-ruby: #DC2626      /* Alert Red */
--color-accent-amethyst: #8B5CF6  /* Premium Purple */
--color-accent-rose: #F43F5E      /* Artistic Rose */
```

### Usage Guidelines

**Primary Colors** → Brand elements, CTAs, headers  
**Secondary Colors** → Links, icons, accents  
**Neutrals** → Text, backgrounds, borders  
**Accents** → Status indicators, highlights, emotions

---

## 3. Typography

### Font Stack

**Display (Headings)**
```css
font-family: 'Cormorant Garamond', serif;
weights: 300, 400, 500, 600, 700
```

**Body (UI & Text)**
```css
font-family: 'Inter', sans-serif;
weights: 300, 400, 500, 600, 700
```

**Monospace (Metadata)**
```css
font-family: 'JetBrains Mono', monospace;
weights: 400, 500
```

### Type Scale

```css
/* Display */
text-display-xl: 96px / 1.05 / -0.02em / 300    /* Hero */
text-display-lg: 72px / 1.1 / -0.015em / 300   /* Sections */
text-display-md: 56px / 1.15 / -0.01em / 400   /* Pages */

/* Headings */
text-h1: 48px / 1.2 / -0.01em / 500
text-h2: 36px / 1.25 / -0.005em / 500
text-h3: 28px / 1.3 / 0 / 600
text-h4: 24px / 1.35 / 0 / 600

/* Body */
text-body-xl: 20px / 1.6 / 0 / 400
text-body-lg: 18px / 1.6 / 0 / 400
text-body-base: 16px / 1.65 / 0 / 400
text-body-sm: 14px / 1.65 / 0 / 400
text-body-xs: 12px / 1.5 / 0.01em / 500
```

---

## 4. Spacing & Layout

### Spacing Scale (8px baseline)

```
0: 0px
1: 4px
2: 8px      ← Baseline unit
3: 12px
4: 16px     ← Standard gap
6: 24px     ← Section padding
8: 32px     ← Component separation
12: 48px    ← Large gaps
16: 64px    ← Section margins
24: 96px    ← Hero padding
```

### Grid System

**12-column responsive grid**

```css
Container max-widths:
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px

Breakpoints:
xs: 480px
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Border Radius

```css
xs: 2px      /* Chips */
sm: 4px      /* Buttons */
base: 8px    /* Cards */
md: 12px     /* Modals */
lg: 16px     /* Large cards */
xl: 24px     /* Features */
2xl: 32px    /* Immersive */
full: 9999px /* Pills */
```

---

## 5. Components

### Artwork Card

**States**: Idle, Hover, Pressed

**Hover Effects**:
- Scale: 1 → 1.02
- Shadow: base → xl
- 3D Tilt: ±8° based on cursor
- Overlay: Fade in metadata

**Implementation**:
```tsx
<ArtworkCard artwork={data} />
```

### Button Variants

**Primary**
- Background: primary-600
- Hover: Scale 1.05, shadow-primary
- Active: Scale 0.96

**Secondary**
- Background: transparent
- Border: primary-600
- Hover: Background primary-50

**Ghost**
- Background: transparent
- Hover: Background neutral-100

---

## 6. Animation Principles

### Core Values
- **Purposeful**: Every animation serves a function
- **Organic**: Spring physics over linear
- **Performant**: GPU-accelerated only
- **Accessible**: Respect reduced-motion

### Timing

```javascript
// Standard durations
fast: 200ms
base: 300ms
slow: 600ms
slower: 1000ms

// Easing curves
easeOutExpo: [0.16, 1, 0.3, 1]
easeInOutQuart: [0.76, 0, 0.24, 1]

// Spring
stiffness: 200
damping: 20
```

### Motion Patterns

**Page Enter**: Fade up + blur out  
**Card Hover**: Scale + shadow + tilt  
**Modal Open**: Scale + fade + backdrop blur  
**List Reveal**: Stagger children (100ms delay)

---

## 7. Accessibility

### Requirements

✓ Color contrast ≥ 4.5:1 (text)  
✓ Focus indicators visible  
✓ Keyboard navigation  
✓ ARIA labels on icons  
✓ Alt text on images  
✓ Reduced motion support  
✓ Semantic HTML  

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

**For complete specification, see the full design document delivered in previous messages.**
