// Page Transitions Manager
import { gsap } from 'gsap';

export class PageTransitions {
  constructor() {
    this.isTransitioning = false;
    this.init();
  }
  
  init() {
    // Intercept all internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && this.isInternalLink(link)) {
        e.preventDefault();
        this.navigateTo(link.href);
      }
    });
    
    // Page load animation
    this.animatePageIn();
  }
  
  isInternalLink(link) {
    return link.href.startsWith(window.location.origin) && 
           !link.target && 
           !link.download &&
           !link.href.includes('#');
  }
  
  async navigateTo(url) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    await this.animatePageOut();
    window.location.href = url;
  }
  
  async animatePageOut() {
    return new Promise((resolve) => {
      // Create transition overlay
      const overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
      
      // Create split panels
      const panels = [
        this.createPanel('left'),
        this.createPanel('right')
      ];
      
      panels.forEach(panel => overlay.appendChild(panel));
      
      // Animate panels
      const tl = gsap.timeline({
        onComplete: resolve
      });
      
      tl.to('.page-transition-panel.left', {
        x: '0%',
        duration: 0.8,
        ease: 'power4.inOut'
      }, 0)
      .to('.page-transition-panel.right', {
        x: '0%',
        duration: 0.8,
        ease: 'power4.inOut'
      }, 0)
      .to('main, header, footer', {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'power2.in'
      }, 0);
    });
  }
  
  animatePageIn() {
    // Find existing overlay
    const overlay = document.querySelector('.page-transition-overlay');
    
    if (!overlay) {
      // No overlay, just fade in content
      gsap.from('main, header, footer', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      });
      return;
    }
    
    // Animate panels out
    const tl = gsap.timeline({
      onComplete: () => overlay.remove()
    });
    
    tl.set('main, header, footer', {
      opacity: 0,
      scale: 0.95
    })
    .to('main, header, footer', {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    }, 0.2)
    .to('.page-transition-panel', {
      x: (index) => index === 0 ? '-100%' : '100%',
      duration: 0.8,
      ease: 'power4.inOut'
    }, 0.4);
  }
  
  createPanel(side) {
    const panel = document.createElement('div');
    panel.className = `page-transition-panel ${side}`;
    panel.style.cssText = `
      position: fixed;
      top: 0;
      ${side}: 0;
      width: 50%;
      height: 100%;
      background: linear-gradient(135deg, 
        rgba(10, 10, 15, 0.98), 
        rgba(20, 15, 30, 0.98)
      );
      z-index: 10000;
      transform: translateX(${side === 'left' ? '-100%' : '100%'});
    `;
    
    // Add decorative elements
    const deco = document.createElement('div');
    deco.className = 'transition-decoration';
    deco.innerHTML = `
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFD700;stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:#FFA500;stop-opacity:0.3" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="none" stroke="url(#goldGradient)" 
                stroke-width="2" opacity="0.5"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="url(#goldGradient)" 
                stroke-width="1.5" opacity="0.4"/>
        <circle cx="100" cy="100" r="40" fill="none" stroke="url(#goldGradient)" 
                stroke-width="1" opacity="0.3"/>
      </svg>
    `;
    deco.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.3;
    `;
    
    panel.appendChild(deco);
    
    // Animate decoration
    gsap.to(deco, {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: 'none'
    });
    
    return panel;
  }
}

// Morph Transition (alternative style)
export class MorphTransition {
  static async transition(fromElement, toURL) {
    const clone = fromElement.cloneNode(true);
    const rect = fromElement.getBoundingClientRect();
    
    clone.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      z-index: 10001;
    `;
    
    document.body.appendChild(clone);
    
    await gsap.to(clone, {
      scale: 100,
      opacity: 0,
      duration: 1,
      ease: 'power4.in',
      onComplete: () => {
        clone.remove();
        window.location.href = toURL;
      }
    });
  }
}

// Fade Transition (simple)
export class FadeTransition {
  static async out() {
    return gsap.to('body', {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut'
    });
  }
  
  static in() {
    return gsap.from('body', {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut'
    });
  }
}

// Slide Transition
export class SlideTransition {
  static async slideOut(direction = 'left') {
    const distance = direction === 'left' || direction === 'right' ? 
      window.innerWidth : window.innerHeight;
    
    const translateProp = direction === 'left' || direction === 'right' ? 'x' : 'y';
    const translateValue = direction === 'left' || direction === 'up' ? -distance : distance;
    
    return gsap.to('main', {
      [translateProp]: translateValue,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in'
    });
  }
  
  static slideIn(direction = 'left') {
    const distance = direction === 'left' || direction === 'right' ? 
      window.innerWidth : window.innerHeight;
    
    const translateProp = direction === 'left' || direction === 'right' ? 'x' : 'y';
    const startValue = direction === 'left' || direction === 'up' ? distance : -distance;
    
    return gsap.from('main', {
      [translateProp]: startValue,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });
  }
}

// Export default instance
export const pageTransitions = new PageTransitions();
