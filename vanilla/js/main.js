import { initSmoothScroll } from './animations/smoothScroll.js';
import { initCursor } from './animations/cursor.js';
import { initParallax, initImageReveal } from './animations/parallax.js';
import { initTextReveal } from './animations/textEffects.js';
import { Navigation } from './components/navigation.js';
import { Hero } from './components/hero.js';
import { Gallery } from './components/gallery.js';

/**
 * Main application initialization
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
    console.log('🎨 Arvista - Vanilla GSAP Version');

    // Initialize core animations
    this.initAnimations();

    // Initialize components based on current page
    this.initComponents();

    // Setup page transitions
    this.setupPageTransitions();
  }

  initAnimations() {
    // Smooth scrolling
    this.lenis = initSmoothScroll();

    // Custom cursor
    this.cursor = initCursor();

    // Parallax effects
    initParallax();

    // Image reveals
    initImageReveal();

    // Text animations
    initTextReveal();
  }

  initComponents() {
    // Navigation (on all pages)
    new Navigation();

    // Page-specific components
    const heroContainer = document.querySelector('.hero');
    if (heroContainer) {
      new Hero(heroContainer);
    }

    const galleryContainer = document.querySelector('.gallery-grid');
    if (galleryContainer) {
      new Gallery(galleryContainer);
    }
  }

  setupPageTransitions() {
    // Using native View Transitions API
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
