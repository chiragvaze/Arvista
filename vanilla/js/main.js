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
import { Navigation } from './components/navigation.js';
import { Hero } from './components/hero.js';
import { Gallery } from './components/gallery.js';

/**
 * Arvista Premium - Vanilla JS + GSAP + Three.js
 */
class App {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    console.log('🎨 Arvista Premium - Loading...');
    console.log('🚀 Features: Three.js 3D, GLSL Shaders, Lenis Smooth Scroll');

    // Initialize core animations
    this.initAnimations();

    // Initialize premium effects
    this.initPremiumEffects();

    // Initialize components based on current page
    this.initComponents();

    // Setup page transitions
    this.setupPageTransitions();

    // Initialize WebGL effects after images load
    window.addEventListener('load', () => {
      this.initWebGLEffects();
    });

    console.log('✨ Premium animations initialized successfully!');
  }

  initAnimations() {
    // Smooth scrolling with Lenis
    this.lenis = initSmoothScroll();

    // Custom magnetic cursor
    this.cursor = initCursor();

    // Parallax effects
    initParallax();

    // Image reveals
    initImageReveal();

    // Text animations
    initTextReveal();
  }

  initPremiumEffects() {
    // Advanced GSAP effects
    initPremiumCards();
    initAdvancedReveals();
    initElasticScroll();
    initMagneticElements();
  }

  initWebGLEffects() {
    // Three.js shader effects on gallery images
    try {
      initShaderEffects();
      console.log('🎮 WebGL shader effects loaded!');
    } catch (error) {
      console.warn('WebGL not supported, falling back to CSS effects');
    }
  }

  initComponents() {
    // Navigation (on all pages)
    new Navigation();

    // Hero with 3D background
    const heroContainer = document.querySelector('.hero');
    if (heroContainer) {
      this.hero = new Hero(heroContainer);
    }

    // Gallery with premium effects
    const galleryContainer = document.querySelector('.gallery-grid');
    if (galleryContainer) {
      this.gallery = new Gallery(galleryContainer);
    }
  }

  setupPageTransitions() {
    // Using native View Transitions API with premium effects
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

