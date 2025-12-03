import { gsap } from 'gsap';

/**
 * Gallery grid with advanced hover effects
 */
export class Gallery {
  constructor(container) {
    this.container = container;
    this.items = [];
    this.init();
  }

  init() {
    this.createGrid();
    this.setupHoverEffects();
    this.setupLightbox();
  }

  createGrid() {
    // Assuming artworks data is loaded
    const artworks = window.artworksData || [];
    
    artworks.forEach((artwork, index) => {
      const item = this.createGalleryItem(artwork, index);
      this.container.appendChild(item);
      this.items.push(item);
    });

    // Stagger entrance animation
    gsap.from(this.items, {
      opacity: 0,
      y: 50,
      scale: 0.9,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out',
    });
  }

  createGalleryItem(artwork, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.dataset.index = index;
    
    item.innerHTML = `
      <div class="gallery-item-inner" data-magnetic>
        <img src="${artwork.image}" alt="${artwork.title}" data-reveal />
        <div class="gallery-overlay">
          <h3 class="gallery-title" data-text-reveal>${artwork.title}</h3>
          <p class="gallery-category">${artwork.category}</p>
        </div>
      </div>
    `;

    return item;
  }

  setupHoverEffects() {
    this.items.forEach(item => {
      const inner = item.querySelector('.gallery-item-inner');
      const img = item.querySelector('img');
      const overlay = item.querySelector('.gallery-overlay');

      item.addEventListener('mouseenter', () => {
        gsap.to(img, {
          scale: 1.1,
          duration: 0.6,
          ease: 'power2.out',
        });

        gsap.to(overlay, {
          opacity: 1,
          duration: 0.3,
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(img, {
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
        });

        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3,
        });
      });

      // 3D tilt effect on mouse move
      item.addEventListener('mousemove', (e) => {
        const rect = inner.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        gsap.to(inner, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.5,
          ease: 'power2.out',
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(inner, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
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
    // Lightbox implementation
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-overlay"></div>
      <div class="lightbox-content">
        <button class="lightbox-close">×</button>
        <img src="${window.artworksData[index].image}" alt="${window.artworksData[index].title}" />
      </div>
    `;

    document.body.appendChild(lightbox);

    // Animate in
    gsap.from(lightbox.querySelector('.lightbox-overlay'), {
      opacity: 0,
      duration: 0.3,
    });

    gsap.from(lightbox.querySelector('.lightbox-content'), {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.7)',
    });

    // Close handler
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
      this.closeLightbox(lightbox);
    });

    lightbox.querySelector('.lightbox-overlay').addEventListener('click', () => {
      this.closeLightbox(lightbox);
    });
  }

  closeLightbox(lightbox) {
    gsap.to(lightbox, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => lightbox.remove(),
    });
  }
}
