// ===================================
// Movie Gallery - Enhanced JavaScript
// ===================================

'use strict';

// DOM Elements
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('emptyState');
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
const lbCaption = document.getElementById('lbCaption');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

// State
let currentFilter = 'all';
let currentSearchTerm = '';
let allCards = [];
let currentLightboxIndex = -1;
let visibleImages = [];

// ===================================
// Initialization
// ===================================

function init() {
  allCards = Array.from(document.querySelectorAll('.card'));
  
  // Event Listeners
  filterButtons.forEach(btn => {
    btn.addEventListener('click', handleFilterClick);
  });
  
  searchInput.addEventListener('input', debounce(handleSearch, 300));
  
  // Lightbox events
  allCards.forEach((card, index) => {
    const img = card.querySelector('.thumb img');
    const playBtn = card.querySelector('.play-btn');
    
    if (img) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(index);
      });
      
      img.addEventListener('click', () => openLightbox(index));
    }
  });
  
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrevImage);
  lbNext.addEventListener('click', showNextImage);
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyPress);
  
  // Close lightbox on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Initial render
  updateDisplay();
}

// ===================================
// Filter Functionality
// ===================================

function handleFilterClick(e) {
  const btn = e.currentTarget;
  const filter = btn.dataset.filter;
  
  // Update active state
  filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Update filter
  currentFilter = filter;
  updateDisplay();
  
  // Announce change for screen readers
  announceChange(`Showing ${filter === 'all' ? 'all items' : filter + 's'}`);
}

// ===================================
// Search Functionality
// ===================================

function handleSearch(e) {
  currentSearchTerm = e.target.value.toLowerCase().trim();
  updateDisplay();
  
  // Announce results
  const visibleCount = allCards.filter(card => !card.classList.contains('hidden')).length;
  announceChange(`${visibleCount} result${visibleCount !== 1 ? 's' : ''} found`);
}

// ===================================
// Display Update
// ===================================

function updateDisplay() {
  let visibleCount = 0;
  
  allCards.forEach((card, index) => {
    const category = card.dataset.category;
    const keywords = card.dataset.keywords || '';
    const title = card.querySelector('.title').textContent.toLowerCase();
    
    // Check filter match
    const matchesFilter = currentFilter === 'all' || category === currentFilter;
    
    // Check search match
    const matchesSearch = !currentSearchTerm || 
                          keywords.includes(currentSearchTerm) ||
                          title.includes(currentSearchTerm);
    
    // Show or hide card
    if (matchesFilter && matchesSearch) {
      card.classList.remove('hidden');
      card.style.animationDelay = `${visibleCount * 0.1}s`;
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });
  
  // Show/hide empty state
  if (visibleCount === 0) {
    emptyState.style.display = 'block';
    emptyState.style.animation = 'fadeInUp 0.5s ease';
  } else {
    emptyState.style.display = 'none';
  }
  
  // Update visible images for lightbox
  updateVisibleImages();
}

// ===================================
// Lightbox Functionality
// ===================================

function updateVisibleImages() {
  visibleImages = allCards
    .filter(card => !card.classList.contains('hidden'))
    .map(card => {
      const img = card.querySelector('.thumb img');
      const title = card.querySelector('.title').textContent;
      const meta = card.querySelector('.meta')?.textContent || '';
      return {
        src: img.src,
        alt: img.alt,
        caption: `${title} • ${meta}`
      };
    });
}

function openLightbox(cardIndex) {
  // Find the index in visible images
  const visibleCardIndices = allCards
    .map((card, idx) => card.classList.contains('hidden') ? -1 : idx)
    .filter(idx => idx !== -1);
  
  currentLightboxIndex = visibleCardIndices.indexOf(cardIndex);
  
  if (currentLightboxIndex === -1) return;
  
  showLightboxImage();
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  
  // Focus close button for accessibility
  lbClose.focus();
}

function showLightboxImage() {
  if (currentLightboxIndex < 0 || currentLightboxIndex >= visibleImages.length) return;
  
  const imageData = visibleImages[currentLightboxIndex];
  lbImage.src = imageData.src;
  lbImage.alt = imageData.alt;
  lbCaption.textContent = imageData.caption;
  
  // Update navigation button states
  lbPrev.style.opacity = currentLightboxIndex === 0 ? '0.3' : '1';
  lbPrev.style.cursor = currentLightboxIndex === 0 ? 'not-allowed' : 'pointer';
  
  lbNext.style.opacity = currentLightboxIndex === visibleImages.length - 1 ? '0.3' : '1';
  lbNext.style.cursor = currentLightboxIndex === visibleImages.length - 1 ? 'not-allowed' : 'pointer';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  
  setTimeout(() => {
    lbImage.src = '';
    lbCaption.textContent = '';
  }, 300);
}

function showPrevImage() {
  if (currentLightboxIndex > 0) {
    currentLightboxIndex--;
    showLightboxImage();
  }
}

function showNextImage() {
  if (currentLightboxIndex < visibleImages.length - 1) {
    currentLightboxIndex++;
    showLightboxImage();
  }
}

function handleKeyPress(e) {
  if (!lightbox.classList.contains('active')) return;
  
  switch(e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      showPrevImage();
      break;
    case 'ArrowRight':
      showNextImage();
      break;
  }
}

// ===================================
// Utility Functions
// ===================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function announceChange(message) {
  // Create a live region announcement for screen readers
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// ===================================
// Lazy Loading Images
// ===================================

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  document.querySelectorAll('.thumb img').forEach(img => {
    imageObserver.observe(img);
  });
}

// ===================================
// Smooth Scroll Enhancement
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ===================================
// Performance: Request Animation Frame
// ===================================

let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      // Add scroll-based effects here if needed
      ticking = false;
    });
    ticking = true;
  }
});

// ===================================
// Initialize App
// ===================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ===================================
// Service Worker Registration (Optional)
// ===================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment to enable service worker
    // navigator.serviceWorker.register('/sw.js')
    //   .then(reg => console.log('Service Worker registered'))
    //   .catch(err => console.log('Service Worker registration failed'));
  });
}