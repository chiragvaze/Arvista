// Loading Screen with Progress
import { gsap } from 'gsap';

export class LoadingScreen {
  constructor() {
    this.progress = 0;
    this.totalItems = 0;
    this.loadedItems = 0;
    this.screen = null;
    this.init();
  }
  
  init() {
    this.createLoadingScreen();
    this.trackResources();
  }
  
  createLoadingScreen() {
    this.screen = document.createElement('div');
    this.screen.className = 'loading-screen active';
    this.screen.innerHTML = `
      <div class="loading-content">
        <div class="loading-logo">
          <svg width="120" height="120" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <!-- A for Arvista -->
            <text x="100" y="130" 
                  font-family="Cinzel, serif" 
                  font-size="100" 
                  font-weight="700"
                  fill="url(#logoGradient)"
                  filter="url(#glow)"
                  text-anchor="middle">A</text>
            
            <!-- Decorative circles -->
            <circle cx="100" cy="100" r="85" fill="none" 
                    stroke="url(#logoGradient)" 
                    stroke-width="2" 
                    opacity="0.4"
                    class="loading-circle-outer"/>
            <circle cx="100" cy="100" r="70" fill="none" 
                    stroke="url(#logoGradient)" 
                    stroke-width="1.5" 
                    opacity="0.3"
                    class="loading-circle-middle"/>
            <circle cx="100" cy="100" r="55" fill="none" 
                    stroke="url(#logoGradient)" 
                    stroke-width="1" 
                    opacity="0.2"
                    class="loading-circle-inner"/>
          </svg>
        </div>
        
        <h1 class="loading-title">Arvista</h1>
        <p class="loading-subtitle">Gallery of Fine Art</p>
        
        <div class="loading-progress-container">
          <div class="loading-progress-bar">
            <div class="loading-progress-fill"></div>
          </div>
          <div class="loading-percentage">0%</div>
        </div>
        
        <div class="loading-status">Initializing...</div>
      </div>
      
      <!-- Animated particles -->
      <div class="loading-particles"></div>
    `;
    
    document.body.appendChild(this.screen);
    
    // Animate logo entrance
    gsap.from('.loading-logo', {
      scale: 0,
      opacity: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.5)',
      delay: 0.2
    });
    
    gsap.from('.loading-title', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.5
    });
    
    gsap.from('.loading-subtitle', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.7
    });
    
    // Rotate circles
    gsap.to('.loading-circle-outer', {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: 'none',
      transformOrigin: 'center'
    });
    
    gsap.to('.loading-circle-middle', {
      rotation: -360,
      duration: 15,
      repeat: -1,
      ease: 'none',
      transformOrigin: 'center'
    });
    
    gsap.to('.loading-circle-inner', {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: 'none',
      transformOrigin: 'center'
    });
    
    this.createParticles();
  }
  
  createParticles() {
    const container = this.screen.querySelector('.loading-particles');
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'loading-particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.8), transparent);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        pointer-events: none;
      `;
      
      container.appendChild(particle);
      
      // Animate particle
      gsap.to(particle, {
        y: `-=${Math.random() * 200 + 100}`,
        x: `+=${Math.random() * 100 - 50}`,
        opacity: 0,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        delay: Math.random() * 2,
        ease: 'power1.out'
      });
    }
  }
  
  trackResources() {
    // Track images
    const images = document.querySelectorAll('img');
    this.totalItems += images.length;
    
    images.forEach(img => {
      if (img.complete) {
        this.onItemLoaded();
      } else {
        img.addEventListener('load', () => this.onItemLoaded());
        img.addEventListener('error', () => this.onItemLoaded());
      }
    });
    
    // Track scripts
    const scripts = document.querySelectorAll('script[src]');
    this.totalItems += scripts.length;
    
    // Track fonts
    if (document.fonts) {
      document.fonts.ready.then(() => {
        this.onItemLoaded();
      });
      this.totalItems++;
    }
    
    // Minimum loading time
    setTimeout(() => {
      if (this.progress < 100) {
        this.setProgress(100);
      }
    }, 2000);
  }
  
  onItemLoaded() {
    this.loadedItems++;
    const progress = (this.loadedItems / this.totalItems) * 100;
    this.setProgress(progress);
  }
  
  setProgress(value) {
    this.progress = Math.min(100, value);
    
    const progressFill = this.screen.querySelector('.loading-progress-fill');
    const percentage = this.screen.querySelector('.loading-percentage');
    const status = this.screen.querySelector('.loading-status');
    
    gsap.to(progressFill, {
      width: `${this.progress}%`,
      duration: 0.5,
      ease: 'power2.out'
    });
    
    gsap.to(percentage, {
      textContent: Math.floor(this.progress),
      duration: 0.5,
      snap: { textContent: 1 },
      onUpdate: function() {
        percentage.textContent = Math.floor(this.targets()[0].textContent) + '%';
      }
    });
    
    // Update status
    if (this.progress < 30) {
      status.textContent = 'Loading resources...';
    } else if (this.progress < 60) {
      status.textContent = 'Preparing gallery...';
    } else if (this.progress < 90) {
      status.textContent = 'Almost ready...';
    } else if (this.progress >= 100) {
      status.textContent = 'Complete!';
      setTimeout(() => this.hide(), 500);
    }
  }
  
  hide() {
    const tl = gsap.timeline({
      onComplete: () => {
        this.screen.remove();
      }
    });
    
    tl.to('.loading-percentage, .loading-status', {
      opacity: 0,
      duration: 0.3
    })
    .to('.loading-progress-container', {
      opacity: 0,
      duration: 0.3
    }, '-=0.1')
    .to('.loading-title, .loading-subtitle', {
      y: -30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5
    }, '-=0.2')
    .to('.loading-logo', {
      scale: 1.5,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in'
    }, '-=0.3')
    .to('.loading-screen', {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    }, '-=0.3');
  }
  
  show() {
    this.screen.classList.add('active');
  }
}

// Auto-initialize on page load
export const loadingScreen = new LoadingScreen();
