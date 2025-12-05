// Custom Cursor with Trails
import { gsap } from 'gsap';

export class CustomCursor {
  constructor() {
    this.cursor = null;
    this.follower = null;
    this.trail = [];
    this.trailLength = 8;
    this.mousePos = { x: 0, y: 0 };
    this.cursorPos = { x: 0, y: 0 };
    this.followerPos = { x: 0, y: 0 };
    this.init();
  }
  
  init() {
    this.createCursor();
    this.createFollower();
    this.createTrail();
    this.addEventListeners();
    this.animate();
  }
  
  createCursor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursor.innerHTML = `
      <div class="cursor-inner">
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="#FFD700" stroke-width="2"/>
          <circle cx="10" cy="10" r="3" fill="#FFD700"/>
        </svg>
      </div>
    `;
    document.body.appendChild(this.cursor);
  }
  
  createFollower() {
    this.follower = document.createElement('div');
    this.follower.className = 'cursor-follower';
    document.body.appendChild(this.follower);
  }
  
  createTrail() {
    for (let i = 0; i < this.trailLength; i++) {
      const trailDot = document.createElement('div');
      trailDot.className = 'cursor-trail';
      trailDot.style.cssText = `
        position: fixed;
        width: ${8 - i * 0.5}px;
        height: ${8 - i * 0.5}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 215, 0, ${0.8 - i * 0.1}), transparent);
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        opacity: ${1 - i * 0.12};
      `;
      document.body.appendChild(trailDot);
      this.trail.push({
        element: trailDot,
        x: 0,
        y: 0
      });
    }
  }
  
  addEventListeners() {
    // Mouse move
    document.addEventListener('mousemove', (e) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
    });
    
    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.cursor.classList.add('active');
        this.follower.classList.add('active');
        gsap.to(this.cursor, { scale: 1.5, duration: 0.3 });
        gsap.to(this.follower, { scale: 1.8, duration: 0.3 });
      });
      
      element.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('active');
        this.follower.classList.remove('active');
        gsap.to(this.cursor, { scale: 1, duration: 0.3 });
        gsap.to(this.follower, { scale: 1, duration: 0.3 });
      });
    });
    
    // Click effect
    document.addEventListener('mousedown', () => {
      gsap.to(this.cursor, { scale: 0.8, duration: 0.2 });
      gsap.to(this.follower, { scale: 0.6, duration: 0.2 });
    });
    
    document.addEventListener('mouseup', () => {
      gsap.to(this.cursor, { scale: 1, duration: 0.2 });
      gsap.to(this.follower, { scale: 1, duration: 0.2 });
    });
    
    // Hide on touch devices
    document.addEventListener('touchstart', () => {
      this.cursor.style.display = 'none';
      this.follower.style.display = 'none';
      this.trail.forEach(dot => dot.element.style.display = 'none');
    });
  }
  
  animate() {
    // Smooth cursor movement
    this.cursorPos.x += (this.mousePos.x - this.cursorPos.x) * 0.8;
    this.cursorPos.y += (this.mousePos.y - this.cursorPos.y) * 0.8;
    
    this.followerPos.x += (this.mousePos.x - this.followerPos.x) * 0.12;
    this.followerPos.y += (this.mousePos.y - this.followerPos.y) * 0.12;
    
    this.cursor.style.transform = `translate(${this.cursorPos.x}px, ${this.cursorPos.y}px)`;
    this.follower.style.transform = `translate(${this.followerPos.x}px, ${this.followerPos.y}px)`;
    
    // Update trail
    this.trail.forEach((dot, index) => {
      const targetX = index === 0 ? this.cursorPos.x : this.trail[index - 1].x;
      const targetY = index === 0 ? this.cursorPos.y : this.trail[index - 1].y;
      
      dot.x += (targetX - dot.x) * 0.5;
      dot.y += (targetY - dot.y) * 0.5;
      
      dot.element.style.left = `${dot.x}px`;
      dot.element.style.top = `${dot.y}px`;
    });
    
    requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.cursor.remove();
    this.follower.remove();
    this.trail.forEach(dot => dot.element.remove());
  }
}

// Magnetic Cursor Effect
export class MagneticCursor {
  static apply(element, strength = 0.3) {
    element.addEventListener('mouseenter', () => {
      element.style.transition = 'transform 0.3s ease';
    });
    
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  }
}

// Export singleton
export const customCursor = new CustomCursor();
