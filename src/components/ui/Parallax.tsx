'use client';

import { useEffect, useRef } from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

/**
 * Optimized parallax component for smooth scrolling effects
 * Uses requestAnimationFrame for 60fps performance
 */
export default function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    let ticking = false;
    let translateY = 0;
    
    const updateParallax = () => {
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const movement = (scrollPercent - 0.5) * 100 * speed;
      
      translateY = movement;
      element.style.transform = `translate3d(0, ${translateY}px, 0)`;
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };
    
    const handleScroll = () => {
      requestTick();
    };
    
    // Passive event listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateParallax(); // Initial position
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);
  
  return (
    <div
      ref={elementRef}
      className={`will-change-transform ${className}`}
      style={{ backfaceVisibility: 'hidden' }}
    >
      {children}
    </div>
  );
}
