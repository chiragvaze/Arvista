# GETTING STARTED WITH ARVISTA

Step-by-step guide to running and customizing the Arvista portfolio platform.

---

## 📦 Installation

### 1. Clone or Download

```bash
cd Arvista
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React (icons)
- And all other dependencies

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the Arvista homepage with:
- Animated hero section
- Featured gallery with sample artworks
- Navigation and footer

---

## 🎨 Customization

### Change Brand Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#8B4726', // ← Change this to your brand color
    // ... other shades
  }
}
```

### Update Fonts

Edit `src/app/layout.tsx`:

```typescript
import { YourFont } from 'next/font/google'

const yourFont = YourFont({ subsets: ['latin'] })
```

### Add Your Artworks

Edit `src/lib/data/sampleArtworks.ts`:

```typescript
export const featuredArtworks: Artwork[] = [
  {
    id: '1',
    slug: 'your-artwork-slug',
    title: 'Your Artwork Title',
    description: 'Description...',
    medium: 'Oil on Canvas',
    year: 2024,
    images: {
      thumbnail: '/images/your-image.jpg',
      // ... other sizes
    },
    // ... more fields
  }
]
```

### Add Your Images

Place images in `public/images/`:

```
public/
  images/
    artwork-1-thumb.jpg
    artwork-1-medium.jpg
    artwork-1-large.jpg
```

Then reference them:

```typescript
images: {
  thumbnail: '/images/artwork-1-thumb.jpg'
}
```

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              ← Homepage
│   ├── layout.tsx            ← Root layout
│   ├── globals.css           ← Global styles
│   └── gallery/              ← Add gallery page here
│
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx    ← Top navbar
│   │   └── Footer.tsx        ← Footer
│   ├── home/
│   │   ├── HeroSection.tsx   ← Hero animation
│   │   └── FeaturedGallery.tsx
│   └── artwork/
│       └── ArtworkCard.tsx   ← Card component
│
└── lib/
    ├── types/
    │   └── index.ts          ← TypeScript types
    └── data/
        └── sampleArtworks.ts ← Sample data
```

---

## 🚀 Next Steps

### Create More Pages

1. **Gallery Page** (`src/app/gallery/page.tsx`)
2. **Artwork Detail** (`src/app/artwork/[slug]/page.tsx`)
3. **About Page** (`src/app/about/page.tsx`)
4. **Contact Page** (`src/app/contact/page.tsx`)

### Add Database

Integrate Prisma + PostgreSQL or use a headless CMS like:
- Sanity
- Contentful
- Strapi

### Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel (recommended for Next.js)
vercel

# Or deploy to Netlify, AWS, etc.
```

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

## 🆘 Common Issues

### Images not loading

Make sure images are in `public/images/` and referenced without the `public/` prefix:

```typescript
// ✅ Correct
src="/images/artwork-1.jpg"

// ❌ Wrong
src="public/images/artwork-1.jpg"
```

### Animations not working

Check that Framer Motion is installed:

```bash
npm install framer-motion
```

### TypeScript errors

Run type checking:

```bash
npx tsc --noEmit
```

---

## 💡 Tips

1. **Use placeholder images** initially (via placeholder services like Unsplash)
2. **Start with sample data**, then replace with real content
3. **Test responsive** on mobile/tablet/desktop
4. **Check accessibility** with Lighthouse
5. **Optimize images** before deploying (WebP format, compress)

---

**Need help? Check the full design specification in `docs/DESIGN_SYSTEM.md`**

Happy building! 🎨
