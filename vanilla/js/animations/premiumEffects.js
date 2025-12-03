import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Premium card hover effects with 3D transforms and lighting
 */
export function initPremiumCards() {
  const cards = document.querySelectorAll('.gallery-item');

  cards.forEach((card) => {
    const inner = card.querySelector('.gallery-item-inner');
    const img = card.querySelector('img');
    const overlay = card.querySelector('.gallery-overlay');

    // Set initial 3D perspective
    gsap.set(inner, {
      transformStyle: 'preserve-3d',
      transformPerspective: 1000,
    });

    // Mouse enter - expand and glow
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.05,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.to(img, {
        scale: 1.2,
        filter: 'brightness(1.2) contrast(1.1)',
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.to(overlay, {
        opacity: 1,
        backdropFilter: 'blur(10px)',
        duration: 0.4,
      });

      // Add glow effect
      card.style.boxShadow = '0 30px 60px rgba(212, 175, 55, 0.4), 0 0 80px rgba(124, 58, 237, 0.3)';
    });

    // Mouse leave - reset
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });

      gsap.to(img, {
        scale: 1,
        filter: 'brightness(1) contrast(1)',
        duration: 0.8,
        ease: 'power2.out',
      });

      gsap.to(overlay, {
        opacity: 0,
        backdropFilter: 'blur(0px)',
        duration: 0.4,
      });

      gsap.to(inner, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: 'power2.out',
      });

      card.style.boxShadow = 'none';
    });

    // Mouse move - 3D tilt with depth
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angles
      const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
      const rotateY = ((x - centerX) / centerX) * 15;

      gsap.to(inner, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        duration: 0.5,
        ease: 'power2.out',
      });

      // Parallax effect on image
      const moveX = ((x - centerX) / centerX) * 10;
      const moveY = ((y - centerY) / centerY) * 10;

      gsap.to(img, {
        x: moveX,
        y: moveY,
        duration: 0.5,
        ease: 'power2.out',
      });
    });
  });
}

/**
 * Scroll-triggered reveals with advanced effects
 */
export function initAdvancedReveals() {
  // Fade + slide reveals
  gsap.utils.toArray('[data-reveal]').forEach((element) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 100,
      scale: 0.9,
      rotateX: -30,
      duration: 1.2,
      ease: 'power3.out',
    });
  });

  // Clip path reveals for images
  gsap.utils.toArray('[data-clip-reveal]').forEach((element) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      duration: 1.5,
      ease: 'power4.inOut',
    });
  });

  // Stagger reveals for lists
  gsap.utils.toArray('[data-stagger-reveal]').forEach((container) => {
    const items = container.children;
    
    gsap.from(items, {
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 60,
      rotateX: -45,
      stagger: 0.1,
      duration: 1,
      ease: 'back.out(1.7)',
    });
  });
}

/**
 * Morphing SVG shapes
 */
export function initSVGMorph() {
  const morphElements = document.querySelectorAll('[data-morph]');

  morphElements.forEach((el) => {
    const paths = el.querySelectorAll('path');
    
    paths.forEach((path) => {
      const originalD = path.getAttribute('d');
      
      gsap.to(path, {
        morphSVG: {
          shape: originalD,
          map: 'complexity',
        },
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
  });
}

/**
 * Elastic scroll animations
 */
export function initElasticScroll() {
  const sections = gsap.utils.toArray('section');

  sections.forEach((section) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // Parallax background
    const bg = section.querySelector('[data-parallax-bg]');
    if (bg) {
      tl.to(bg, {
        y: -200,
        scale: 1.1,
        ease: 'none',
      }, 0);
    }

    // Elastic content
    const content = section.querySelector('[data-elastic]');
    if (content) {
      tl.from(content, {
        scale: 0.8,
        opacity: 0.5,
        y: 100,
        ease: 'power1.out',
      }, 0);
    }
  });
}

/**
 * Magnetic hover effect with spring physics
 */
export function initMagneticElements() {
  const magnetic = document.querySelectorAll('[data-magnetic]');

  magnetic.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * 0.4,
        y: y * 0.4,
        duration: 0.8,
        ease: 'power3.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.3)',
      });
    });
  });
}
