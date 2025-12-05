# 🎨 ARVISTA PREMIUM - Advanced Animation Documentation

## 🚀 Premium Features Implemented

### **Three.js 3D Background**
- **Location:** `vanilla/js/animations/threeBackground.js`
- **Features:**
  - 2000 animated particles with gold/amethyst gradient colors
  - 3D geometric shapes (Torus, Icosahedron, Octahedron) with metallic materials
  - Dynamic lighting system (ambient + 2 point lights)
  - Mouse parallax camera movement
  - Continuous rotation and wave animations
  - Premium wireframe aesthetics

### **WebGL Shader Effects**
- **Location:** `vanilla/js/animations/shaderEffects.js`
- **Features:**
  - Custom GLSL vertex and fragment shaders
  - RGB color split effect on hover
  - Wave distortion emanating from mouse position
  - Perlin noise-based organic distortion
  - Dynamic vignette effect
  - Brightness boost on interaction
  - Real-time uniform updates

### **Premium GSAP Effects**
- **Location:** `vanilla/js/animations/premiumEffects.js`
- **Features:**
  - 3D card transforms with `preserve-3d` and perspective
  - Elastic hover animations with spring physics
  - Magnetic button effects
  - Advanced scroll-triggered reveals
  - Clip-path image reveals
  - Stagger animations for lists
  - Parallax background layers
  - Glow effects with box-shadow

### **Smooth Scrolling**
- **Location:** `vanilla/js/animations/smoothScroll.js`
- **Updated:** Now uses latest `lenis` package (v1.3.15)
- **Features:**
  - Buttery 60fps smooth scroll
  - Custom easing function
  - GSAP ScrollTrigger integration
  - Anchor link smooth scrolling
  - Touch gesture support

---

## 📁 File Structure

```
vanilla/
├── js/
│   ├── main.js                           # Premium app initialization
│   ├── animations/
│   │   ├── threeBackground.js           # ⭐ NEW: Three.js 3D scene
│   │   ├── shaderEffects.js             # ⭐ NEW: WebGL GLSL shaders
│   │   ├── premiumEffects.js            # ⭐ NEW: Advanced GSAP effects
│   │   ├── smoothScroll.js              # ✅ UPDATED: Latest Lenis
│   │   ├── cursor.js                    # Magnetic custom cursor
│   │   ├── parallax.js                  # Scroll-based parallax
│   │   └── textEffects.js               # Text reveals & scramble
│   └── components/
│       ├── hero.js                      # ✅ UPDATED: 3D background integration
│       ├── gallery.js                   # Gallery with premium effects
│       └── navigation.js                # Scroll-aware navigation
├── css/
│   └── main.css                         # ✅ UPDATED: Premium loader styles
├── index.html                           # Main HTML entry
└── package.json                         # Dependencies
```

---

## 🎭 Animation Showcase

### **1. Hero Section - 3D Background**
```javascript
// Creates a stunning Three.js particle field with:
- 2000 particles (gold & amethyst gradient)
- 3D wireframe shapes (torus, icosahedron, octahedron)
- Mouse-reactive camera parallax
- Continuous rotation and wave motion
- Premium metallic materials with transparency
```

**Visual Effect:**
- Depth perception with 100-unit Z-axis spread
- Additive blending for ethereal glow
- Real-time shader calculations at 60fps
- Perspective camera FOV 75°

### **2. WebGL Image Distortion**
```javascript
// Applied to all gallery images with:
- Custom vertex shader for wave distortion
- Fragment shader with RGB split
- Perlin noise for organic movement
- Hover-triggered liquid effects
- Dynamic vignette and brightness
```

**Visual Effect:**
- RGB channels shift ±0.02 on hover
- Circular waves emanate from mouse position
- Noise-based distortion (0.02 intensity)
- 1.0s smooth hover transition

### **3. Premium Card Hover**
```javascript
// 3D transform with physics:
- transformPerspective: 1000px
- rotateX/Y: ±15° based on mouse position
- scale: 1.05 on hover
- Image parallax: ±10px based on mouse
- Glow: dual box-shadow (gold + amethyst)
```

**Visual Effect:**
- Elastic ease-out for bounce-back
- preserve-3d for true 3D transforms
- Real-time mouse tracking
- 0.6s duration for smooth motion

### **4. Advanced Text Reveals**
```javascript
// Scroll-triggered with:
- opacity: 0 → 1
- y: 100px → 0
- scale: 0.9 → 1
- rotateX: -30° → 0°
- duration: 1.2s with power3.out easing
```

**Visual Effect:**
- Appears from below with depth rotation
- Scales up for emphasis
- Triggered at 85% viewport entry
- Reverses on scroll up

---

## ⚡ Performance Optimization

### **Rendering:**
- Three.js: `requestAnimationFrame` loop at 60fps
- WebGL: `setPixelRatio(Math.min(devicePixelRatio, 2))` to cap at 2x
- GSAP: `gsap.ticker.lagSmoothing(0)` for consistent animation

### **Bundle Size:**
- Three.js: ~580KB (gzipped: ~150KB)
- GSAP: ~47KB (gzipped: ~14KB)
- Lenis: ~12KB (gzipped: ~4KB)
- Total: ~170KB (3.4× smaller than Next.js + Framer Motion)

### **Memory Management:**
- WebGL context disposal on cleanup
- Geometry/material disposal methods
- Three.js scene cleanup in `destroy()`
- No memory leaks with proper lifecycle

---

## 🎨 Visual Effects Breakdown

### **Particle System**
```javascript
particleCount: 2000
positions: Float32Array(6000) // x, y, z per particle
colors: Float32Array(6000)    // r, g, b per particle
sizes: Float32Array(2000)     // individual particle sizes
blending: THREE.AdditiveBlending
opacity: 0.8
sizeAttenuation: true
```

### **Shader Uniforms**
```glsl
uniform sampler2D uTexture;  // Image texture
uniform float uTime;          // Animation time
uniform vec2 uMouse;          // Mouse position (0-1)
uniform float uHover;         // Hover state (0-1)
```

### **3D Shapes**
```javascript
Torus:        radius=10, tube=3, segments=16x100
Icosahedron:  radius=8, detail=0
Octahedron:   radius=6, detail=0
Materials:    metalness=0.8-0.9, roughness=0.1-0.2
Wireframe:    true (for premium aesthetic)
Opacity:      0.3-0.4 (transparent overlay)
```

---

## 🔧 Configuration Options

### **Three.js Background**
```javascript
// Edit: vanilla/js/animations/threeBackground.js

// Particle count (performance vs. visual density)
const particleCount = 2000; // Reduce to 1000 for mobile

// Camera position
this.camera.position.z = 50; // Adjust for zoom level

// Rotation speed
this.particles.rotation.y += 0.0005; // Lower = slower
```

### **Shader Intensity**
```javascript
// Edit: vanilla/js/animations/shaderEffects.js

// RGB split amount
float rgbShift = uHover * 0.02; // Increase for more distortion

// Wave intensity
float wave = sin(dist * 20.0 - uTime * 3.0) * 0.01 * uHover;
// Increase multiplier for stronger waves
```

### **GSAP Effects**
```javascript
// Edit: vanilla/js/animations/premiumEffects.js

// Card hover rotation angle
const rotateX = ((y - centerY) / centerY) * -15; // Change ±15

// Scale amount on hover
scale: 1.05, // Increase for more dramatic effect

// Animation duration
duration: 0.6, // Adjust for speed
```

---

## 📊 Animation Timeline

```
Page Load:
├─ 0.0s: Premium loader appears
├─ 0.5s: 3D background fades in (2s duration)
├─ 0.5s: Hero title words stagger (0.15s each)
├─ 1.2s: Subtitle reveals + scramble effect
├─ 1.5s: CTA button with elastic ease
├─ 2.0s: 3D background fully visible
└─ 3.0s: Loader fades out (0.6s)

Scroll Interactions:
├─ Navigation: Hide/show based on scroll direction
├─ Parallax: Background moves at -200px over scroll
├─ Reveals: Trigger at 85% viewport (1.2s each)
└─ Cards: Reveal with stagger (0.1s delay each)

Hover Effects:
├─ Cursor: 0.05s follow delay with magnetic pull
├─ Cards: 0.6s scale + 3D rotate
├─ Images: 0.8s WebGL shader activation
└─ Buttons: 0.8s elastic bounce-back
```

---

## 🎯 Browser Support

### **Three.js/WebGL:**
- ✅ Chrome 91+ (full support)
- ✅ Firefox 90+ (full support)
- ✅ Safari 15+ (full support)
- ✅ Edge 91+ (full support)
- ⚠️ Mobile: WebGL 2.0 required

### **GSAP:**
- ✅ All modern browsers
- ✅ IE 11+ (with polyfills)

### **Lenis:**
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ⚠️ Touch devices: limited support

---

## 🐛 Troubleshooting

### **WebGL not working:**
```javascript
// Check WebGL support in console:
console.log(document.createElement('canvas').getContext('webgl2'));

// If null, fallback to CSS animations
if (!WebGL2RenderingContext) {
  console.warn('WebGL not supported, using CSS fallback');
}
```

### **Performance issues:**
```javascript
// Reduce particle count
const particleCount = 1000; // Instead of 2000

// Disable WebGL on low-end devices
if (navigator.hardwareConcurrency < 4) {
  // Skip initShaderEffects()
}

// Reduce shader complexity
// Remove noise function from fragment shader
```

### **Animations not triggering:**
```javascript
// Check ScrollTrigger refresh
ScrollTrigger.refresh();

// Force Lenis update
lenis.scrollTo(0, { immediate: true });
```

---

## 📦 Dependencies

```json
{
  "three": "^0.181.2",          // 3D WebGL library
  "@types/three": "^0.181.0",   // TypeScript definitions
  "lenis": "^1.3.15",           // Smooth scroll (NEW)
  "gsap": "^3.13.0",            // Animation library
  "vite": "^7.2.6"              // Build tool
}
```

---

## 🚀 Next Steps

### **Planned Enhancements:**
1. **Post-Processing Effects**
   - Bloom for glow effects
   - Depth of field blur
   - Chromatic aberration

2. **Advanced Shaders**
   - Fluid simulation
   - Displacement maps
   - Refraction effects

3. **3D Gallery Mode**
   - Full WebGL gallery renderer
   - 3D carousel transitions
   - Interactive camera controls

4. **Performance Monitoring**
   - FPS counter
   - GPU stats
   - Automatic quality adjustment

---

## 💡 Tips & Best Practices

1. **Test on Real Devices:** WebGL performance varies significantly
2. **Progressive Enhancement:** Always provide CSS fallbacks
3. **Monitor FPS:** Use Chrome DevTools Performance tab
4. **Optimize Shaders:** Avoid complex calculations in fragment shader
5. **Dispose Resources:** Always clean up Three.js objects
6. **Lazy Load:** Load Three.js only when needed
7. **Reduce on Mobile:** Lower particle counts and disable effects

---

**Built with ❤️ using Three.js, GSAP, and Lenis**
**Performance: 60fps | Bundle: ~170KB (gzipped)**
