import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Ultra Premium Advanced Effects
 * Next-gen animations with complex interactions
 */

/**
 * Infinite scroll marquee effect
 */
export function initMarquee() {
  const marquees = document.querySelectorAll('[data-marquee]');
  
  marquees.forEach((marquee) => {
    const content = marquee.querySelector('[data-marquee-content]');
    if (!content) return;
    
    const clone = content.cloneNode(true);
    marquee.appendChild(clone);
    
    const speed = marquee.dataset.marqueeSpeed || 50;
    const width = content.offsetWidth;
    
    gsap.to(marquee.children, {
      x: -width,
      duration: width / speed,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % width)
      }
    });
  });
}

/**
 * Premium hover glow effect
 */
export function initHoverGlow() {
  const glowElements = document.querySelectorAll('[data-glow]');
  
  glowElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        boxShadow: '0 0 60px rgba(212, 175, 55, 0.6), 0 0 100px rgba(124, 58, 237, 0.4)',
        duration: 0.5,
        ease: 'power2.out',
      });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        boxShadow: 'none',
        duration: 0.5,
        ease: 'power2.out',
      });
    });
  });
}

/**
 * Text gradient animation
 */
export function initTextGradient() {
  const texts = document.querySelectorAll('[data-text-gradient]');
  
  texts.forEach((text) => {
    const gradient = 'linear-gradient(90deg, #D4AF37, #F4D03F, #7C3AED, #D4AF37)';
    text.style.background = gradient;
    text.style.backgroundSize = '200% 100%';
    text.style.webkitBackgroundClip = 'text';
    text.style.backgroundClip = 'text';
    text.style.webkitTextFillColor = 'transparent';
    
    gsap.to(text, {
      backgroundPosition: '200% 0',
      duration: 3,
      repeat: -1,
      ease: 'linear',
    });
  });
}

/**
 * Ripple effect on click
 */
export function initRippleEffect() {
  const rippleElements = document.querySelectorAll('[data-ripple]');
  
  rippleElements.forEach((el) => {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(212, 175, 55, 0.5), transparent);
        transform: translate(-50%, -50%);
        pointer-events: none;
      `;
      
      el.appendChild(ripple);
      
      gsap.to(ripple, {
        width: rect.width * 2,
        height: rect.width * 2,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
      });
    });
  });
}

/**
 * Floating animation
 */
export function initFloating() {
  const floatingElements = document.querySelectorAll('[data-float]');
  
  floatingElements.forEach((el, index) => {
    gsap.to(el, {
      y: '+=20',
      duration: 2 + Math.random(),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: index * 0.2,
    });
  });
}

/**
 * Number counter animation
 */
export function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  
  counters.forEach((counter) => {
    const target = parseInt(counter.dataset.counterTarget || counter.textContent);
    const duration = parseFloat(counter.dataset.counterDuration || 2);
    
    ScrollTrigger.create({
      trigger: counter,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.from({ value: 0 }, {
          value: target,
          duration,
          ease: 'power1.out',
          onUpdate: function() {
            counter.textContent = Math.floor(this.targets()[0].value);
          },
        });
      },
    });
  });
}

/**
 * Gradient border animation
 */
export function initGradientBorders() {
  const elements = document.querySelectorAll('[data-gradient-border]');
  
  elements.forEach((el) => {
    el.style.position = 'relative';
    
    const border = document.createElement('div');
    border.style.cssText = `
      position: absolute;
      inset: -2px;
      border-radius: inherit;
      background: linear-gradient(45deg, #D4AF37, #7C3AED, #D4AF37);
      background-size: 200% 200%;
      z-index: -1;
      filter: blur(10px);
      opacity: 0.6;
    `;
    
    el.appendChild(border);
    
    gsap.to(border, {
      backgroundPosition: '200% 200%',
      duration: 4,
      repeat: -1,
      ease: 'linear',
    });
  });
}

/**
 * Blob morph animation
 */
export function initBlobMorph() {
  const blobs = document.querySelectorAll('[data-blob]');
  
  blobs.forEach((blob) => {
    const paths = [
      'M 50,50 m -40,0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0',
      'M 50,50 m -45,5 a 35,45 0 1,0 90,-10 a 35,45 0 1,0 -90,10',
      'M 50,50 m -35,-10 a 45,35 0 1,0 70,20 a 45,35 0 1,0 -70,-20',
    ];
    
    let current = 0;
    
    setInterval(() => {
      current = (current + 1) % paths.length;
      gsap.to(blob, {
        attr: { d: paths[current] },
        duration: 2,
        ease: 'power1.inOut',
      });
    }, 2000);
  });
}

/**
 * Text split and reveal with advanced effects
 */
export function initAdvancedTextReveal() {
  const texts = document.querySelectorAll('[data-advanced-reveal]');
  
  texts.forEach((text) => {
    const words = text.textContent.split(' ');
    text.innerHTML = '';
    
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline-block';
      span.style.marginRight = '0.3em';
      span.style.opacity = '0';
      text.appendChild(span);
      
      ScrollTrigger.create({
        trigger: text,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(span, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            delay: i * 0.05,
            duration: 0.8,
            ease: 'back.out(1.5)',
          });
          
          gsap.from(span, {
            y: 50,
            rotateX: -90,
          });
        },
      });
    });
  });
}

/**
 * Initialize all advanced effects
 */
export function initAllAdvancedEffects() {
  initMarquee();
  initHoverGlow();
  initTextGradient();
  initRippleEffect();
  initFloating();
  initCounters();
  initGradientBorders();
  initBlobMorph();
  initAdvancedTextReveal();
}
