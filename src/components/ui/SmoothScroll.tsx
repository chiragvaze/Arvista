'use client';

import { useEffect } from 'react';

/**
 * Ultra-smooth scroll behavior using Lenis
 * Provides buttery smooth 60fps scrolling
 */
export default function SmoothScroll() {
  useEffect(() => {
    let rafId: number;
    
    // Lightweight smooth scroll implementation
    const smoothScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Update scroll position with easing
      document.documentElement.style.setProperty('--scroll-y', `${scrollTop}px`);
      
      rafId = requestAnimationFrame(smoothScroll);
    };
    
    rafId = requestAnimationFrame(smoothScroll);
    
    // Smooth scroll to anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(this: HTMLAnchorElement, e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = 1000; // 1 second
          let start: number | null = null;
          
          const easeInOutCubic = (t: number): number => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
          };
          
          const animation = (currentTime: number) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + distance * ease);
            
            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          };
          
          requestAnimationFrame(animation);
        }
      });
    });
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
  
  return null;
}
