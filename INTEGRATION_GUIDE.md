# Quick Integration Guide

## Running the Project

### 1. Start Backend Server
```bash
cd backend
node server.js
# Should see: 🚀 Backend API running on http://localhost:3003
```

### 2. Start Frontend Dev Server
```bash
cd vanilla
npm run dev
# Opens on http://localhost:3002
```

## Testing New Features

### Test Authentication
1. Click "Sign In" button in navigation
2. Click "Sign Up" to create account
3. Fill form: Name, Email, Password
4. See success notification
5. User menu appears in nav with avatar

### Test Shopping Cart
1. Click cart icon in navigation
2. Cart panel slides in from right
3. Add items via API (gallery integration pending)
4. See item count badge on cart icon

### Test 3D Features (Manual Integration Required)

#### Add Interactive Particles to Hero
```javascript
// In vanilla/js/main.js, add:
import { InteractiveParticles } from './3d/InteractiveParticles.js';

// After DOMContentLoaded:
const particles = new InteractiveParticles();
```

#### Add 3D Viewer to Gallery
```javascript
// Replace lightbox with 3D viewer:
import { ArtworkViewer3D } from './3d/ArtworkViewer3D.js';

const viewer = new ArtworkViewer3D(lightboxContainer);
viewer.loadArtwork(artwork);
```

#### Add Shader Effects to Images
```javascript
import { ShaderEffectManager } from './3d/ShaderEffects.js';

const manager = new ShaderEffectManager(container);

// On hover:
galleryImage.addEventListener('mouseenter', () => {
  manager.applyShader(galleryImage, 'ripple');
});
```

### Test Page Transitions
- Click any navigation link
- See split-panel transition animation
- Page fades out/in smoothly

### Test Custom Cursor
- Move mouse around page
- See custom cursor with trail
- Hover over buttons/links for scale effect
- Click to see shrink animation

### Test Loading Screen
- Refresh page
- See animated logo with rotating circles
- Progress bar fills 0% → 100%
- Auto-hides when complete

### Test Advanced Parallax
Add these attributes to HTML elements:

```html
<!-- Multi-layer parallax -->
<div data-parallax-layer data-parallax-speed="0.5">
  Content moves at 50% scroll speed
</div>

<!-- Scroll reveal -->
<div data-scroll-reveal="bottom">
  Reveals from bottom when scrolling
</div>

<!-- 3D depth -->
<div data-depth-3d="1">
  3D perspective effect on scroll
</div>

<!-- Animated counter -->
<span data-counter-target="1000" data-counter-duration="2">0</span>
```

## API Testing

### Register User
```bash
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
# Returns: {"token":"...","user":{...}}
```

### Get Artworks
```bash
curl http://localhost:3003/api/artworks
# Returns 3 seed artworks
```

### Add to Cart (requires token)
```bash
curl -X POST http://localhost:3003/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"artworkId":"1","quantity":1}'
```

## Common Issues

### Backend not starting
- Check if port 3003 is available
- Verify dependencies: `npm install` in backend folder

### Frontend not loading
- Check Vite is running on port 3002
- Clear browser cache
- Check console for module errors

### Custom cursor not showing
- Only works on desktop (hover: hover) devices
- Touch devices automatically hide cursor

### 3D features not visible
- Need manual integration (see sections above)
- Check Three.js is loaded
- Verify WebGL support in browser

## File Locations

- **Auth Modal CSS**: `vanilla/css/auth.css`
- **Cart UI CSS**: `vanilla/css/cart.css`
- **Cursor CSS**: `vanilla/css/cursor.css`
- **Loading CSS**: `vanilla/css/loading.css`
- **3D Components**: `vanilla/js/3d/`
- **API Client**: `vanilla/js/api/client.js`
- **Auth Manager**: `vanilla/js/auth/AuthManager.js`
- **Cart Manager**: `vanilla/js/components/ShoppingCart.js`
- **Backend API**: `backend/server.js`

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

Requires:
- ES6 Modules
- WebGL (for 3D features)
- LocalStorage (for auth)

## Performance Tips

1. **3D Features**: Initialize only when needed
2. **Particles**: Use single instance per page
3. **Shaders**: Apply on hover, not by default
4. **API Calls**: Cache responses where possible
5. **Animations**: Use `will-change` sparingly

## Security Notes

⚠️ **Current Authentication**: Simple token (userId-timestamp)
- Replace with JWT for production
- Add token expiration
- Implement refresh tokens
- Use HTTPS in production

⚠️ **Password Storage**: Currently plain text
- Implement bcrypt hashing (bcryptjs included)
- Add password requirements
- Rate limit login attempts

⚠️ **CORS**: Currently allows all origins
- Restrict to specific domains in production
- Update CORS config in server.js

## Next Development Steps

1. **Complete Gallery Integration**
   - Add 3D viewer to lightbox
   - Apply shader effects to images
   - Add particles to hero section

2. **Database Setup**
   - Install MongoDB
   - Create Mongoose schemas
   - Migrate in-memory data

3. **User Profiles**
   - Create profile page
   - Add order history
   - Implement favorites display

4. **Payment Integration**
   - Add Stripe SDK
   - Create checkout flow
   - Implement webhook handlers

5. **Admin Panel**
   - Artwork management
   - Order processing
   - User administration

Enjoy your premium art gallery! 🎨✨
