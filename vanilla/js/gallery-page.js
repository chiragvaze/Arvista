// Gallery Page Enhanced Functionality
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let currentFilter = 'all';
let currentSort = 'featured';
let allArtworks = [];

// Initialize gallery page
export function initGalleryPage() {
  allArtworks = window.artworksData || [];
  
  renderGallery();
  initFilters();
  initSort();
  animateGalleryEntrance();
}

// Render gallery grid
function renderGallery() {
  const grid = document.querySelector('.gallery-grid-full');
  if (!grid) return;
  
  let filteredArtworks = filterArtworks(allArtworks);
  filteredArtworks = sortArtworks(filteredArtworks);
  
  grid.innerHTML = '';
  
  filteredArtworks.forEach((artwork, index) => {
    const card = createArtworkCard(artwork, index);
    grid.appendChild(card);
  });
  
  // Animate cards entrance
  gsap.from('.artwork-card', {
    opacity: 0,
    y: 60,
    scale: 0.9,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.gallery-grid-full',
      start: 'top 80%'
    }
  });
  
  attachCardListeners();
}

// Filter artworks
function filterArtworks(artworks) {
  if (currentFilter === 'all') return artworks;
  return artworks.filter(artwork => artwork.category === currentFilter);
}

// Sort artworks
function sortArtworks(artworks) {
  const sorted = [...artworks];
  
  switch(currentSort) {
    case 'newest':
      return sorted.sort((a, b) => b.year - a.year);
    case 'oldest':
      return sorted.sort((a, b) => a.year - b.year);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'name':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

// Create artwork card
function createArtworkCard(artwork, index) {
  const card = document.createElement('div');
  card.className = 'artwork-card';
  card.setAttribute('data-artwork-id', artwork.id);
  card.setAttribute('data-category', artwork.category);
  card.setAttribute('data-gradient-border', '');
  card.setAttribute('data-glow', '');
  
  card.innerHTML = `
    <div class="artwork-image-wrapper">
      <img src="${artwork.image}" alt="${artwork.title}" class="artwork-image" loading="lazy">
      <div class="artwork-overlay">
        <button class="quick-view-btn" data-magnetic>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="artwork-info">
      <h3 class="artwork-title">${artwork.title}</h3>
      <p class="artwork-artist">${artwork.artist}</p>
      <div class="artwork-meta">
        <span class="artwork-category">${formatCategory(artwork.category)}</span>
        <span class="artwork-year">${artwork.year}</span>
      </div>
      <p class="artwork-price">$${artwork.price.toLocaleString()}</p>
    </div>
  `;
  
  return card;
}

// Format category name
function formatCategory(category) {
  const categoryNames = {
    'oil': 'Oil Painting',
    'watercolor': 'Watercolor',
    'digital': 'Digital Art',
    'sculpture': 'Sculpture',
    'photography': 'Photography'
  };
  return categoryNames[category] || category;
}

// Initialize filters
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update filter and re-render
      currentFilter = filter;
      
      // Animate out current cards
      gsap.to('.artwork-card', {
        opacity: 0,
        y: -30,
        scale: 0.95,
        duration: 0.3,
        stagger: 0.03,
        onComplete: renderGallery
      });
    });
  });
}

// Initialize sorting
function initSort() {
  const sortSelect = document.getElementById('sortSelect');
  
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      
      // Animate and re-render
      gsap.to('.artwork-card', {
        opacity: 0,
        y: -20,
        duration: 0.3,
        stagger: 0.02,
        onComplete: renderGallery
      });
    });
  }
}

// Attach card event listeners
function attachCardListeners() {
  const cards = document.querySelectorAll('.artwork-card');
  
  cards.forEach(card => {
    // Premium hover effect
    card.addEventListener('mouseenter', (e) => {
      gsap.to(card, {
        y: -15,
        rotationY: 5,
        rotationX: -5,
        scale: 1.05,
        duration: 0.6,
        ease: 'power2.out'
      });
      
      gsap.to(card.querySelector('.artwork-image'), {
        scale: 1.15,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out'
      });
      
      gsap.to(card.querySelector('.artwork-image'), {
        scale: 1,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
    
    // Quick view
    const quickViewBtn = card.querySelector('.quick-view-btn');
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const artworkId = card.getAttribute('data-artwork-id');
        openLightbox(artworkId);
      });
    }
    
    // Card click
    card.addEventListener('click', () => {
      const artworkId = card.getAttribute('data-artwork-id');
      openLightbox(artworkId);
    });
  });
}

// Open lightbox
function openLightbox(artworkId) {
  const artwork = allArtworks.find(a => a.id == artworkId);
  if (!artwork) return;
  
  // Create lightbox
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox active';
  lightbox.innerHTML = `
    <div class="lightbox-overlay"></div>
    <div class="lightbox-content">
      <button class="lightbox-close" data-magnetic>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="lightbox-image-container">
        <img src="${artwork.image}" alt="${artwork.title}" class="lightbox-image">
      </div>
      <div class="lightbox-info">
        <h2 class="lightbox-title">${artwork.title}</h2>
        <p class="lightbox-artist">${artwork.artist}</p>
        <p class="lightbox-description">${artwork.description}</p>
        <div class="lightbox-meta">
          <span>${formatCategory(artwork.category)}</span>
          <span>${artwork.year}</span>
        </div>
        <p class="lightbox-price">$${artwork.price.toLocaleString()}</p>
        <button class="lightbox-cta" data-magnetic data-ripple>
          <span>Inquire About This Piece</span>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(lightbox);
  
  // Animate entrance
  gsap.from('.lightbox-content', {
    scale: 0.9,
    opacity: 0,
    duration: 0.5,
    ease: 'power3.out'
  });
  
  // Close handlers
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const overlay = lightbox.querySelector('.lightbox-overlay');
  
  [closeBtn, overlay].forEach(el => {
    el.addEventListener('click', () => closeLightbox(lightbox));
  });
  
  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeLightbox(lightbox);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

// Close lightbox
function closeLightbox(lightbox) {
  gsap.to(lightbox, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => lightbox.remove()
  });
}

// Animate gallery entrance
function animateGalleryEntrance() {
  // Animate title letters
  gsap.from('.title-line', {
    opacity: 0,
    y: 100,
    rotationX: -90,
    duration: 1,
    stagger: 0.1,
    ease: 'power4.out'
  });
  
  // Animate subtitle
  gsap.from('.page-subtitle', {
    opacity: 0,
    y: 30,
    duration: 1,
    delay: 0.5,
    ease: 'power3.out'
  });
  
  // Animate description
  gsap.from('.gallery-description p', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.2,
    delay: 0.8,
    ease: 'power2.out'
  });
  
  // Animate filters
  gsap.from('.filter-btn', {
    opacity: 0,
    scale: 0.8,
    y: 20,
    duration: 0.6,
    stagger: 0.1,
    delay: 1,
    ease: 'back.out(1.7)'
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGalleryPage);
} else {
  initGalleryPage();
}
