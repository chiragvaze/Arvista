import { gsap } from 'gsap';

/**
 * Custom magnetic cursor with smooth following
 * Creates a premium, interactive cursor effect
 */
export function initCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  cursor.appendChild(cursorDot);

  let mouseX = 0;
  let mouseY = 0;

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Smooth cursor follow
    gsap.to(cursor, {
      x: mouseX,
      y: mouseY,
      duration: 0.8,
      ease: 'power3.out',
    });
  });

  // Magnetic effect on hover
  const magneticElements = document.querySelectorAll('[data-magnetic]');
  
  magneticElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursor, { scale: 2, duration: 0.3 });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(cursor, { scale: 1, duration: 0.3 });
    });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.8,
        ease: 'power3.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });

  // Hide default cursor
  document.body.style.cursor = 'none';

  return cursor;
}
