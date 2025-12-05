import { gsap } from 'gsap';
import { scrambleText } from '../animations/textEffects.js';
import { ThreeBackground } from '../animations/threeBackground.js';

/**
 * Hero section with premium 3D background and advanced animations
 */
export class Hero {
  constructor(container) {
    this.container = container;
    this.threeBackground = null;
    this.init();
  }

  init() {
    this.create3DBackground();
    this.animateTitle();
    this.animateSubtitle();
    this.animateCTA();
  }

  create3DBackground() {
    // Create 3D background container
    const bgContainer = document.createElement('div');
    bgContainer.className = 'hero-3d-background';
    bgContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 0;
    `;
    this.container.insertBefore(bgContainer, this.container.firstChild);

    // Initialize Three.js background
    this.threeBackground = new ThreeBackground(bgContainer);

    // Fade in 3D background
    gsap.to(bgContainer, {
      opacity: 1,
      duration: 2,
      ease: 'power2.inOut',
    });

    // Ensure content is above background
    const elements = this.container.querySelectorAll('.hero-title, .hero-subtitle, .hero-cta');
    elements.forEach(el => {
      el.style.position = 'relative';
      el.style.zIndex = '1';
    });
  }

  animateTitle() {
    const title = this.container.querySelector('.hero-title');
    if (!title) return;

    // Split into words
    const words = title.textContent.split(' ');
    title.innerHTML = '';
    
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline-block';
      span.style.marginRight = '0.3em';
      title.appendChild(span);

      gsap.from(span, {
        opacity: 0,
        y: 100,
        rotateX: -90,
        transformPerspective: 1000,
        duration: 1.2,
        delay: i * 0.15 + 0.5,
        ease: 'power3.out',
      });
    });

    // Add premium hover effect
    title.addEventListener('mouseenter', () => {
      gsap.to(title, {
        scale: 1.05,
        textShadow: '0 20px 40px rgba(212, 175, 55, 0.5), 0 0 60px rgba(124, 58, 237, 0.3)',
        duration: 0.6,
        ease: 'power2.out',
      });
    });

    title.addEventListener('mouseleave', () => {
      gsap.to(title, {
        scale: 1,
        textShadow: 'none',
        duration: 0.6,
        ease: 'power2.out',
      });
    });
  }

  animateSubtitle() {
    const subtitle = this.container.querySelector('.hero-subtitle');
    if (!subtitle) return;

    gsap.from(subtitle, {
      opacity: 0,
      y: 50,
      duration: 1.2,
      delay: 1.2,
      ease: 'power2.out',
      onComplete: () => {
        const originalText = subtitle.textContent;
        scrambleText(subtitle, originalText);
      }
    });
  }

  animateCTA() {
    const cta = this.container.querySelector('.hero-cta');
    if (!cta) return;

    gsap.from(cta, {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      delay: 1.5,
      ease: 'elastic.out(1, 0.5)',
    });

    // Magnetic hover effect
    cta.addEventListener('mousemove', (e) => {
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(cta, {
        x: x * 0.3,
        y: y * 0.3,
        scale: 1.1,
        boxShadow: '0 20px 40px rgba(212, 175, 55, 0.4)',
        duration: 0.6,
        ease: 'power2.out',
      });
    });

    cta.addEventListener('mouseleave', () => {
      gsap.to(cta, {
        x: 0,
        y: 0,
        scale: 1,
        boxShadow: 'none',
        duration: 0.8,
        ease: 'elastic.out(1, 0.3)',
      });
    });
  }

  destroy() {
    if (this.threeBackground) {
      this.threeBackground.destroy();
      this.threeBackground = null;
    }
  }
}

