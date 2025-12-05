# Arvista - Art Gallery Platform

Premium art gallery platform with dual implementations.

## 🎯 Project Structure

```
Arvista/
├── vanilla/              ⭐ NEW - Premium Vanilla JS Implementation
│   ├── index.html        - Main page
│   ├── gallery.html      - Gallery with filters
│   ├── about.html        - About page with timeline
│   ├── contact.html      - Contact form
│   ├── css/              - Premium styles (2200+ lines)
│   ├── js/
│   │   ├── 3d/           - 3D Viewer, Particles, Shaders
│   │   ├── animations/   - Page Transitions, Parallax
│   │   ├── api/          - API Client
│   │   ├── auth/         - Authentication UI
│   │   └── components/   - Cart, Cursor, Loading
│   └── package.json      - Vite dev server
│
├── backend/              ⭐ NEW - Express REST API
│   ├── server.js         - 13 API endpoints
│   ├── package.json      - Dependencies
│   └── .env.example      - Environment template
│
├── src/                  📦 LEGACY - Old React Implementation
│   ├── app/              - Next.js 14 App Router
│   ├── components/       - React components
│   └── lib/              - Utilities
│
└── docs/                 📚 Documentation
    ├── FEATURES_IMPLEMENTATION.md
    ├── INTEGRATION_GUIDE.md
    └── ...
```

## 🚀 Quick Start

### Vanilla Implementation (Recommended)

**1. Start Backend API**
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3003
```

**2. Start Frontend**
```bash
cd vanilla
npm install
npm run dev
# Opens on http://localhost:3002
```

### React Implementation (Legacy)

```bash
npm install
npm run dev
# Opens on http://localhost:3000
```

## ✨ Features (Vanilla Implementation)

### Interactive 3D Features
- **3D Artwork Viewer** - OrbitControls, lighting, gold frames
- **Interactive Particles** - 3000 mouse-reactive particles
- **WebGL Shaders** - Ripple, glow, chromatic, holographic, pixelate

### Backend Integration
- **REST API** - 13 endpoints (auth, cart, orders, favorites)
- **Authentication** - JWT-style tokens, session management
- **Shopping Cart** - Full cart and checkout flow
- **Order Management** - Create and track orders

### Advanced Animations
- **Authentication UI** - Login/register modals
- **Shopping Cart UI** - Slide-out panel
- **Page Transitions** - 4 animation styles
- **Advanced Parallax** - 12+ scroll effects
- **Custom Cursor** - Trail effects
- **Loading Screen** - Progress bar with particles

## 📊 Technology Stack

### Vanilla Implementation
- **Bundler**: Vite 7.2.6
- **Animations**: GSAP 3.13.0 + ScrollTrigger
- **3D Graphics**: Three.js 0.181.2
- **Smooth Scroll**: Lenis 1.3.15
- **Backend**: Express.js 4.18.2
- **Database**: In-memory (ready for MongoDB)

### React Implementation (Legacy)
- **Framework**: Next.js 14.2.33
- **React**: 18+
- **TypeScript**: Full type safety
- **Styling**: Tailwind CSS

## 🎨 Design System

**Colors**
- Gold: #FFD700, #FFA500
- Purple: #7C3AED
- Dark: #0A0A0F, #14141E

**Typography**
- Headings: Cinzel (serif)
- Subheadings: Playfair Display (serif)
- Body: Montserrat (sans-serif)

## 📖 Documentation

- **[Features Implementation](FEATURES_IMPLEMENTATION.md)** - Complete feature breakdown
- **[Integration Guide](INTEGRATION_GUIDE.md)** - Setup and usage instructions
- **[Getting Started](docs/GETTING_STARTED.md)** - Original React docs

## 🔄 Migration Status

**Current State**: Dual implementation
- ✅ Vanilla JS version: **Complete** (3D, Backend, Animations)
- ⚠️ React version: **Legacy** (preserved for reference)

**Recommended Path**: Use vanilla implementation for production

## 🛠️ Development

### API Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
GET    /api/artworks
POST   /api/cart/add
GET    /api/cart
POST   /api/orders
GET    /api/favorites
```

### Environment Variables
```bash
# backend/.env
PORT=3003
NODE_ENV=development
JWT_SECRET=your-secret-key
```

## 📦 Deployment

### Vanilla Version
- Frontend: Vercel, Netlify, or any static host
- Backend: Heroku, Railway, or any Node.js host
- Database: MongoDB Atlas (when ready)

### React Version
- Deploy via Vercel (Next.js optimized)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

**Status**: ✅ Vanilla implementation complete and pushed to `vanilla-gsap` branch  
**Backend**: ✅ Running on port 3003  
**Next Steps**: See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for integration tasks
