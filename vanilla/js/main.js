import { initSmoothScroll } from './animations/smoothScroll.js';
import { initCursor } from './animations/cursor.js';
import { initParallax, initImageReveal } from './animations/parallax.js';
import { initTextReveal } from './animations/textEffects.js';
import { 
  initPremiumCards, 
  initAdvancedReveals, 
  initElasticScroll,
  initMagneticElements 
} from './animations/premiumEffects.js';
import { initShaderEffects } from './animations/shaderEffects.js';
import { initAllAdvancedEffects } from './animations/advancedEffects.js';
import { Navigation } from './components/navigation.js';
import { Hero } from './components/hero.js';
import { Gallery } from './components/gallery.js';

// NEW: Import all premium features
import { auth } from './auth/AuthManager.js';
import { cart } from './components/ShoppingCart.js';
import { customCursor } from './components/CustomCursor.js';
import { loadingScreen } from './components/LoadingScreen.js';
import { pageTransitions } from './animations/pageTransitions.js';
import { advancedParallax } from './animations/advancedParallax.js';
import { InteractiveParticles } from './3d/InteractiveParticles.js';

/**
 * Arvista Ultra Premium - Next Gen Animations
 * Three.js • GSAP • Lenis • WebGL Shaders
 */
class App {
  constructor() {
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    console.log('🎨 Arvista Ultra Premium - Initializing...');
    console.log('🚀 Three.js • GSAP • WebGL • Lenis');

    try {
      // NEW: Initialize premium features first
      this.initPremiumFeatures();

      // Core animations
      this.initAnimations();

      // Premium effects
      this.initPremiumEffects();

      // Advanced next-gen effects
      this.initAdvancedEffects();

      // Components
      this.initComponents();

      // Page transitions
      this.setupPageTransitions();

      // WebGL effects after load
      window.addEventListener('load', () => {
        this.initWebGLEffects();
      });

      console.log('✨ Ultra Premium animations loaded successfully!');
    } catch (error) {
      console.error('❌ Error initializing app:', error);
    }
  }

  initAnimations() {
    try {
      this.lenis = initSmoothScroll();
      this.cursor = initCursor();
      initParallax();
      initImageReveal();
      initTextReveal();
    } catch (error) {
      console.warn('Animation init warning:', error);
    }
  }

  initPremiumEffects() {
    try {
      initPremiumCards();
      initAdvancedReveals();
      initElasticScroll();
      initMagneticElements();
    } catch (error) {
      console.warn('Premium effects warning:', error);
    }
  }

  initAdvancedEffects() {
    try {
      initAllAdvancedEffects();
    } catch (error) {
      console.warn('Advanced effects warning:', error);
    }
  }

  initWebGLEffects() {
    try {
      initShaderEffects();
      console.log('🎮 WebGL shader effects loaded!');
    } catch (error) {
      console.warn('⚠️ WebGL not available, using CSS fallback');
    }
  }

  initComponents() {
    try {
      new Navigation();

      const heroContainer = document.querySelector('.hero');
      if (heroContainer) {
        this.hero = new Hero(heroContainer);
      }

      const galleryContainer = document.querySelector('.gallery-grid');
      if (galleryContainer) {
        this.gallery = new Gallery(galleryContainer);
      }

      // NEW: Setup event handlers for auth and cart
      this.setupEventHandlers();
    } catch (error) {
      console.warn('Component init warning:', error);
    }
  }

  // NEW: Initialize all premium features
  initPremiumFeatures() {
    console.log('✨ Initializing premium features...');
    
    // Interactive particles in hero
    try {
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        this.particles = new InteractiveParticles();
        console.log('🌟 Interactive particles initialized');
      }
    } catch (error) {
      console.warn('Particles initialization failed:', error);
    }

    // Auth, cart, cursor, loading already auto-initialized via their constructors
    console.log('🔐 Auth system ready');
    console.log('🛒 Shopping cart ready');
    console.log('🖱️ Custom cursor ready');
    console.log('⏳ Loading screen ready');
  }

  // NEW: Setup event handlers
  setupEventHandlers() {
    // Cart icon click
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.addEventListener('click', () => {
        cart.toggleCart();
      });
    }

    // Login button click
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        auth.showLoginModal();
      });
    }

    // User dropdown actions
    document.querySelectorAll('[data-action]').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        if (action === 'logout') {
          auth.logout();
        } else if (action === 'profile') {
          window.location.href = '/profile.html';
        } else if (action === 'orders') {
          window.location.href = '/orders.html';
        } else if (action === 'favorites') {
          window.location.href = '/favorites.html';
        }
      });
    });

    // Add "Add to Cart" buttons to gallery items
    this.setupGalleryCartButtons();
  }

  // NEW: Add cart functionality to gallery
  setupGalleryCartButtons() {
    const galleryItems = document.querySelectorAll('.gallery-item, .artwork-card');
    
    galleryItems.forEach((item, index) => {
      // Check if button already exists
      if (item.querySelector('.add-to-cart-btn')) return;

      const addToCartBtn = document.createElement('button');
      addToCartBtn.className = 'add-to-cart-btn';
      addToCartBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="21" r="1" stroke="currentColor" stroke-width="2"/>
          <circle cx="20" cy="21" r="1" stroke="currentColor" stroke-width="2"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" 
                stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Add to Cart</span>
      `;

      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Get artwork ID from data attribute or use index
        const artworkId = item.dataset.artworkId || (index + 1);
        cart.addToCart(artworkId, 1);
      });

      item.appendChild(addToCartBtn);
    });
  }

  setupPageTransitions() {
    if ('startViewTransition' in document) {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href && link.origin === location.origin && !link.target) {
          e.preventDefault();
          
          document.startViewTransition(() => {
            window.location.href = link.href;
          });
        }
      });
    }
  }
}

// Initialize app
new App();

// Export for debugging
window.app = App;

