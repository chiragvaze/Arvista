import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Ultra Premium Gallery with advanced effects
 */
export class Gallery {
  constructor(container) {
    this.container = container;
    this.items = [];
    this.init();
  }

  init() {
    this.createGrid();
    this.setupAdvancedHover();
    this.setupLightbox();
    this.initScrollAnimations();
  }

  createGrid() {
    const artworks = window.artworksData || [];
    
    artworks.forEach((artwork, index) => {
      const item = this.createGalleryItem(artwork, index);
      this.container.appendChild(item);
      this.items.push(item);
    });

    // Advanced stagger entrance
    gsap.from(this.items, {
      scrollTrigger: {
        trigger: this.container,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 100,
      scale: 0.8,
      rotateX: -45,
      stagger: {
        amount: 0.8,
        from: 'random',
      },
      duration: 1.2,
      ease: 'power3.out',
    });
  }

  createGalleryItem(artwork, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = index;
    item.dataset.glow = '';
    
    item.innerHTML = `
      <div class="gallery-item-inner" data-magnetic>
        <img src="${artwork.image}" alt="${artwork.title}" data-reveal loading="lazy" />
        <div class="gallery-overlay">
          <h3 class="gallery-title">${artwork.title}</h3>
          <p class="gallery-category">${artwork.category}</p>
        </div>
      </div>
    `;

    return item;
  }

  setupAdvancedHover() {
    this.items.forEach(item => {
      const inner = item.querySelector('.gallery-item-inner');
      const img = item.querySelector('img');
      const overlay = item.querySelector('.gallery-overlay');
      const title = item.querySelector('.gallery-title');
      const category = item.querySelector('.gallery-category');

      // Enhanced hover enter
      item.addEventListener('mouseenter', () => {
        gsap.to(img, {
          scale: 1.2,
          rotation: 2,
          duration: 0.8,
          ease: 'power2.out',
        });

        gsap.to(overlay, {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        });

        // Animate text with stagger
        gsap.to([title, category], {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.6,
          ease: 'back.out(1.7)',
        });
      });

      // Enhanced hover leave
      item.addEventListener('mouseleave', () => {
        gsap.to(img, {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'power2.out',
        });

        gsap.to(overlay, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        });

        gsap.to([title, category], {
          y: 20,
          opacity: 0,
          duration: 0.3,
        });
      });

      // Advanced 3D tilt with depth
      item.addEventListener('mousemove', (e) => {
        const rect = inner.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -20;
        const rotateY = ((x - centerX) / centerX) * 20;

        gsap.to(inner, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1000,
          duration: 0.5,
          ease: 'power2.out',
        });

        // Parallax image movement
        const moveX = ((x - centerX) / centerX) * 15;
        const moveY = ((y - centerY) / centerY) * 15;

        gsap.to(img, {
          x: moveX,
          y: moveY,
          duration: 0.5,
          ease: 'power2.out',
        });
      });

      // Reset on mouse leave
      item.addEventListener('mouseleave', () => {
        gsap.to(inner, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.8,
          ease: 'power2.out',
        });

        gsap.to(img, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    });
  }

  setupLightbox() {
    this.items.forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.openLightbox(index);
      });
    });
  }

  openLightbox(index) {
    const artwork = window.artworksData[index];
    
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-overlay"></div>
      <div class="lightbox-content">
        <button class="lightbox-close">×</button>
        <img src="${artwork.image}" alt="${artwork.title}" />
        <div class="lightbox-info">
          <h3>${artwork.title}</h3>
          <p>${artwork.category}</p>
        </div>
      </div>
    `;

    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';

    // Enhanced entrance animation
    const tl = gsap.timeline();
    
    tl.from(lightbox.querySelector('.lightbox-overlay'), {
      opacity: 0,
      duration: 0.4,
    })
    .from(lightbox.querySelector('.lightbox-content'), {
      scale: 0.7,
      opacity: 0,
      rotateX: -45,
      duration: 0.8,
      ease: 'back.out(1.5)',
    }, '-=0.2')
    .from(lightbox.querySelector('.lightbox-close'), {
      scale: 0,
      rotation: -180,
      duration: 0.5,
      ease: 'back.out(2)',
    }, '-=0.4');

    // Close handlers
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
      this.closeLightbox(lightbox);
    });

    lightbox.querySelector('.lightbox-overlay').addEventListener('click', () => {
      this.closeLightbox(lightbox);
    });

    // Close on ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeLightbox(lightbox);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  closeLightbox(lightbox) {
    gsap.to(lightbox, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        lightbox.remove();
        document.body.style.overflow = '';
      },
    });
  }

  initScrollAnimations() {
    // Parallax scroll for gallery items
    this.items.forEach((item, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        y: direction * 50,
        ease: 'none',
      });
    });
  }
}
