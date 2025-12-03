import { gsap } from 'gsap';
import { scrambleText } from '../animations/textEffects.js';

/**
 * Hero section with advanced animations
 */
export class Hero {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.animateTitle();
    this.animateSubtitle();
    this.animateCTA();
    this.createParticles();
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
        duration: 1,
        delay: i * 0.1,
        ease: 'back.out(1.7)',
      });
    });
  }

  animateSubtitle() {
    const subtitle = this.container.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const originalText = subtitle.textContent;
    scrambleText(subtitle, originalText);
  }

  animateCTA() {
    const cta = this.container.querySelector('.hero-cta');
    if (!cta) return;

    gsap.from(cta, {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      delay: 0.8,
      ease: 'back.out(1.7)',
    });

    // Pulse animation
    gsap.to(cta, {
      scale: 1.05,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'hero-particles';
    this.container.appendChild(particlesContainer);

    // Create floating particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particlesContainer.appendChild(particle);

      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
      });

      gsap.to(particle, {
        y: '-=100',
        x: '+=50',
        duration: Math.random() * 10 + 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(particle, {
        opacity: Math.random() * 0.5 + 0.3,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
      });
    }
  }
}
