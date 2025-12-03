import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Split text into individual characters for animation
 */
function splitText(element) {
  const text = element.textContent;
  element.innerHTML = '';
  
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    element.appendChild(span);
  });

  return Array.from(element.children);
}

/**
 * Animate text reveal with stagger effect
 */
export function initTextReveal() {
  const titles = document.querySelectorAll('[data-text-reveal]');

  titles.forEach(title => {
    const chars = splitText(title);

    gsap.set(chars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
    });

    ScrollTrigger.create({
      trigger: title,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.02,
          duration: 1,
          ease: 'back.out(1.7)',
        });
      },
    });
  });
}

/**
 * Scramble text animation effect
 */
export function scrambleText(element, finalText) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const duration = 1000;
  const steps = 20;
  let step = 0;

  const interval = setInterval(() => {
    let scrambled = '';
    for (let i = 0; i < finalText.length; i++) {
      if (i < (step / steps) * finalText.length) {
        scrambled += finalText[i];
      } else {
        scrambled += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    element.textContent = scrambled;
    step++;

    if (step > steps) {
      clearInterval(interval);
      element.textContent = finalText;
    }
  }, duration / steps);
}
