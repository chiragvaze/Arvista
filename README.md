# ARVISTA — Artist Portfolio Platform

**Where Art Meets Vision**

A modern, premium artist portfolio website with public gallery and admin CMS built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

---

## 🎨 Project Overview

Arvista is a complete end-to-end artist portfolio platform featuring:

- **Public Gallery Site**: Immersive, cinematic artwork browsing experience
- **Admin Dashboard**: Full CMS for artwork management, uploads, and analytics
- **Premium Design System**: Refined color palette, typography, and animations
- **Ultra-Smooth Animations**: Framer Motion-powered interactions and transitions
- **Fully Responsive**: Mobile-first design with adaptive layouts

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## 📁 Project Structure

```
arvista/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── layout.tsx          # Root layout with fonts
│   │   ├── page.tsx            # Homepage
│   │   ├── gallery/            # Gallery pages
│   │   ├── artwork/[slug]/     # Individual artwork pages
│   │   ├── admin/              # Admin dashboard
│   │   └── globals.css         # Global styles & CSS variables
│   │
│   ├── components/             # React components
│   │   ├── layout/             # Navigation, Footer
│   │   ├── home/               # Hero, Featured Gallery
│   │   ├── artwork/            # Artwork cards, lightbox
│   │   ├── admin/              # Admin components
│   │   └── ui/                 # Reusable UI components
│   │
│   └── lib/                    # Utilities & data
│       ├── types/              # TypeScript types
│       ├── data/               # Sample data
│       └── utils/              # Helper functions
│
├── public/                     # Static assets
│   ├── images/                 # Artwork images
│   └── animations/             # Lottie files
│
├── docs/                       # Design documentation
│   ├── DESIGN_SYSTEM.md        # Complete design spec
│   ├── COMPONENTS.md           # Component guidelines
│   └── ANIMATIONS.md           # Animation patterns
│
└── Configuration files
```

---

## 🎨 Design System

### Color Palette

**Primary (Warm Terracotta)**
- Primary-500: `#8B4726` — Main brand color
- Primary-600: `#6B3620` — CTA buttons
- Range: 50–900

**Secondary (Azure Blue)**
- Secondary-500: `#3B7DD9` — Links, accents
- Range: 50–900

**Neutrals**
- Neutral-0: Pure white
- Neutral-950: True black
- Range: 0, 50–950

### Typography

- **Display/Headings**: Cormorant Garamond (serif)
- **Body/UI**: Inter (sans-serif)
- **Monospace**: JetBrains Mono

### Key Features

✓ Glassmorphism effects  
✓ Soft shadows with depth  
✓ Spring-based animations  
✓ Reduced motion support  
✓ Dark mode ready  

---

## 🧩 Key Components

### User-Facing
- **HeroSection**: Cinematic landing with parallax
- **FeaturedGallery**: Masonry grid with stagger animations
- **ArtworkCard**: 3D tilt effect on hover
- **Lightbox**: Shared-element transitions
- **Navigation**: Sticky glass navbar
- **Footer**: Multi-column with social links

### Admin Dashboard
- **Dashboard**: Stats, activity feed, quick actions
- **ArtworkList**: Table with drag-drop reordering
- **ArtworkForm**: Auto-save, validation
- **ImageUpload**: Drag-drop zone with progress
- **ToastSystem**: Animated notifications

---

## 🎬 Animation System

Built with **Framer Motion** for premium feel:

- **Page Transitions**: Smooth route changes
- **Scroll Animations**: Parallax, reveal on scroll
- **Hover Effects**: 3D tilt, shadow elevation
- **Shared Elements**: Morphing between views
- **Spring Physics**: Natural, organic motion

See `docs/ANIMATIONS.md` for complete patterns.

---

## 📝 To-Do / Roadmap

- [ ] Add remaining page routes (About, Contact, Commission)
- [ ] Build complete admin dashboard
- [ ] Implement authentication (NextAuth.js)
- [ ] Add database integration (Prisma + PostgreSQL)
- [ ] Create API endpoints
- [ ] Add image optimization pipeline
- [ ] Implement search & filters
- [ ] Add lightbox component
- [ ] Create collections feature
- [ ] Build responsive artwork detail pages
- [ ] Add SEO optimization
- [ ] Implement analytics tracking

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion, GSAP
- **Icons**: Lucide React
- **Drag & Drop**: dnd-kit
- **Forms**: React Hook Form + Zod
- **State**: Zustand

---

## 📖 Documentation

Complete design specification with all patterns, components, animations, and microcopy is included in:

- `docs/DESIGN_SYSTEM.md` — Complete UI/UX specification
- `docs/GETTING_STARTED.md` — Setup and customization guide
- `docs/ANIMATIONS.md` — Animation variants library

---

## 🤝 Contributing

This is a portfolio project. Feel free to use as inspiration for your own artist portfolio platform!

---

## 📄 License

MIT License - See LICENSE file

---

## 👤 Author

Created with care for artists who deserve beautiful digital homes for their work.

**Arvista** — Where Art Meets Vision ✨
Arvista — A modern, immersive art portfolio platform with a user-facing gallery and a powerful admin dashboard for managing artworks, collections, and site content.
