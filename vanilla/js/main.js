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
    } catch (error) {
      console.warn('Component init warning:', error);
    }
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

