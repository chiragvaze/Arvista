import { gsap } from 'gsap';

/**
 * Animated navigation with scroll behavior
 */
export class Navigation {
  constructor() {
    this.nav = document.querySelector('.nav');
    this.lastScroll = 0;
    this.init();
  }

  init() {
    this.setupScrollBehavior();
    this.setupMobileMenu();
    this.animateOnLoad();
  }

  animateOnLoad() {
    const navItems = this.nav.querySelectorAll('.nav-item');
    const logo = this.nav.querySelector('.nav-logo');

    gsap.from(logo, {
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: 'power3.out',
    });

    gsap.from(navItems, {
      opacity: 0,
      y: -20,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.2,
    });
  }

  setupScrollBehavior() {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      // Hide/show navigation on scroll
      if (currentScroll > 100) {
        if (currentScroll > this.lastScroll) {
          // Scrolling down
          gsap.to(this.nav, {
            y: -100,
            duration: 0.3,
            ease: 'power2.inOut',
          });
        } else {
          // Scrolling up
          gsap.to(this.nav, {
            y: 0,
            duration: 0.3,
            ease: 'power2.inOut',
          });
        }
      }

      // Add backdrop blur on scroll
      if (currentScroll > 50) {
        this.nav.classList.add('scrolled');
      } else {
        this.nav.classList.remove('scrolled');
      }

      this.lastScroll = currentScroll;
    });
  }

  setupMobileMenu() {
    const menuBtn = this.nav.querySelector('.menu-btn');
    const mobileMenu = this.nav.querySelector('.mobile-menu');

    if (!menuBtn || !mobileMenu) return;

    let isOpen = false;

    menuBtn.addEventListener('click', () => {
      isOpen = !isOpen;

      if (isOpen) {
        gsap.to(mobileMenu, {
          x: 0,
          duration: 0.5,
          ease: 'power3.inOut',
        });

        const items = mobileMenu.querySelectorAll('.mobile-menu-item');
        gsap.from(items, {
          opacity: 0,
          x: -20,
          stagger: 0.05,
          duration: 0.4,
          delay: 0.2,
        });
      } else {
        gsap.to(mobileMenu, {
          x: '100%',
          duration: 0.5,
          ease: 'power3.inOut',
        });
      }
    });
  }
}
