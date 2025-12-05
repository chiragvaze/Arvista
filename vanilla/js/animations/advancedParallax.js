// Advanced Parallax Effects
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class AdvancedParallax {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupMultiLayerParallax();
    this.setupScrollReveal();
    this.setup3DDepth();
    this.setupImageParallax();
  }
  
  setupMultiLayerParallax() {
    // Multi-layer parallax for hero section
    const layers = document.querySelectorAll('[data-parallax-layer]');
    
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.parallaxSpeed) || 0.5;
      
      gsap.to(layer, {
        yPercent: 50 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.closest('section'),
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    });
  }
  
  setupScrollReveal() {
    // Reveal elements as they enter viewport
    const revealElements = document.querySelectorAll('[data-scroll-reveal]');
    
    revealElements.forEach(element => {
      const direction = element.dataset.scrollReveal || 'bottom';
      const distance = 100;
      
      let fromVars = {
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      };
      
      switch(direction) {
        case 'left':
          fromVars.x = -distance;
          break;
        case 'right':
          fromVars.x = distance;
          break;
        case 'top':
          fromVars.y = -distance;
          break;
        default: // bottom
          fromVars.y = distance;
      }
      
      gsap.from(element, {
        ...fromVars,
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }
  
  setup3DDepth() {
    // 3D depth effect on scroll
    const depthElements = document.querySelectorAll('[data-depth-3d]');
    
    depthElements.forEach(element => {
      const depth = parseFloat(element.dataset.depth3d) || 1;
      
      gsap.to(element, {
        z: -500 * depth,
        rotationX: 15 * depth,
        transformPerspective: 1000,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });
  }
  
  setupImageParallax() {
    // Parallax effect for images
    const images = document.querySelectorAll('[data-parallax-image]');
    
    images.forEach(img => {
      const container = img.parentElement;
      const speed = parseFloat(img.dataset.parallaxImage) || 0.3;
      
      // Ensure container has overflow hidden
      container.style.overflow = 'hidden';
      
      gsap.to(img, {
        yPercent: 20 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });
  }
  
  // Horizontal scroll sections
  setupHorizontalScroll(container) {
    const sections = container.querySelectorAll('.horizontal-section');
    
    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => `+=${container.offsetWidth * sections.length}`
      }
    });
  }
  
  // Smooth scale on scroll
  setupScaleOnScroll(element) {
    gsap.from(element, {
      scale: 0.8,
      opacity: 0,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1
      }
    });
  }
  
  // Parallax mouse movement
  setupMouseParallax(element, strength = 20) {
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      
      gsap.to(element, {
        x: mouseX * strength,
        y: mouseY * strength,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  }
  
  // Stagger fade in
  setupStaggerFade(elements, delay = 0.1) {
    gsap.from(elements, {
      opacity: 0,
      y: 50,
      stagger: delay,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: elements[0],
        start: 'top 80%'
      }
    });
  }
  
  // Rotation on scroll
  setupRotateOnScroll(element, degrees = 360) {
    gsap.to(element, {
      rotation: degrees,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  }
  
  // Text reveal animation
  setupTextReveal(element) {
    const text = element.textContent;
    element.innerHTML = text.split('').map(char => 
      `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');
    
    const chars = element.querySelectorAll('span');
    
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      stagger: 0.03,
      duration: 0.5,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      }
    });
  }
  
  // Clip path reveal
  setupClipReveal(element) {
    gsap.from(element, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 1.5,
      ease: 'power4.inOut',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      }
    });
  }
  
  // Counter animation
  setupCounter(element) {
    const target = parseFloat(element.dataset.counterTarget) || 100;
    const duration = parseFloat(element.dataset.counterDuration) || 2;
    
    ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(element, {
          textContent: target,
          duration: duration,
          ease: 'power2.out',
          snap: { textContent: 1 },
          onUpdate: function() {
            element.textContent = Math.floor(this.targets()[0].textContent).toLocaleString();
          }
        });
      }
    });
  }
}

// Export singleton
export const advancedParallax = new AdvancedParallax();
