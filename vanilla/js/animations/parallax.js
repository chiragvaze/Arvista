import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize parallax scrolling effects
 * Elements with data-speed attribute will move at different rates
 */
export function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-speed]');

  parallaxElements.forEach(el => {
    const speed = parseFloat(el.dataset.speed) || 0.5;

    gsap.to(el, {
      y: () => -(window.innerHeight * speed),
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

/**
 * Image reveal animation on scroll
 * Creates a clip-path reveal effect
 */
export function initImageReveal() {
  const images = document.querySelectorAll('[data-reveal]');

  images.forEach(img => {
    gsap.set(img, {
      clipPath: 'inset(100% 0% 0% 0%)',
      scale: 1.2,
    });

    ScrollTrigger.create({
      trigger: img,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(img, {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          duration: 1.2,
          ease: 'expo.out',
        });
      },
    });
  });
}
