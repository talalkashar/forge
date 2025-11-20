// Main JavaScript for FORGE Website

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const lines = ['line1', 'line2', 'line3'];

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.contains('max-h-screen');
      
      if (isOpen) {
        // Close menu
        mobileMenu.classList.remove('max-h-screen');
        mobileMenu.classList.add('max-h-0');
        mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
      } else {
        // Open menu
        mobileMenu.classList.remove('max-h-0');
        mobileMenu.classList.add('max-h-screen');
        mobileMenuBtn.classList.add('active');
        document.body.classList.add('menu-open');
      }
    });

    // Close menu when clicking on a link
    mobileMenu.querySelectorAll('a, button').forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('max-h-screen');
        mobileMenu.classList.add('max-h-0');
        mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
        mobileMenu.classList.remove('max-h-screen');
        mobileMenu.classList.add('max-h-0');
        mobileMenuBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }
  
  // Initialize cart display - hide badge if count is 0
  const cartCounts = document.querySelectorAll('.cart-count');
  cartCounts.forEach(countEl => {
    const count = parseInt(countEl.textContent) || 0;
    if (count === 0) {
      countEl.classList.add('hidden');
    }
  });

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      navbar.classList.add('shadow-lg');
    } else {
      navbar.classList.remove('shadow-lg');
    }

    lastScroll = currentScroll;
  });

  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, observerOptions);

  // Observe all elements with animate-on-scroll class
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // Parallax effect for hero section
  const hero = document.querySelector('.hero-parallax');
  if (hero) {
    window.addEventListener('scroll', function() {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.5;
      hero.style.transform = `translateY(${rate}px)`;
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});

// Form Validation
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const inputs = form.querySelectorAll('input[required], textarea[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add('border-red-600');
    } else {
      input.classList.remove('border-red-600');
    }

    // Email validation
    if (input.type === 'email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        input.classList.add('border-red-600');
      }
    }
  });

  return isValid;
}

// Add to Cart (Stub)
function addToCart(productId, productName, price) {
  // This is a stub - implement actual cart logic
  console.log('Adding to cart:', productId, productName, price);
  
  // Update cart count
  const cartCounts = document.querySelectorAll('.cart-count');
  cartCounts.forEach(countEl => {
    const currentCount = parseInt(countEl.textContent) || 0;
    const newCount = currentCount + 1;
    countEl.textContent = newCount;
    if (newCount > 0) {
      countEl.classList.remove('hidden');
    }
  });

  // Show notification
  showNotification(`${productName} added to cart!`);
}

// Show Notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-24 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);

  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Product Image Gallery
function initProductGallery() {
  const mainImage = document.getElementById('main-product-image');
  const thumbnails = document.querySelectorAll('.product-thumbnail');

  if (mainImage && thumbnails.length > 0) {
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', function() {
        const newSrc = this.getAttribute('data-full-image') || this.src;
        mainImage.src = newSrc;
        
        // Update active thumbnail
        thumbnails.forEach(t => t.classList.remove('ring-2', 'ring-red-600'));
        this.classList.add('ring-2', 'ring-red-600');
      });
    });
  }
}

// Initialize product gallery on page load
document.addEventListener('DOMContentLoaded', function() {
  initProductGallery();
  initProductCarousel();
});

// Product Image Carousel
function initProductCarousel() {
  const carousel = document.querySelector('.product-carousel-container');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  
  let currentSlide = 0;
  let autoPlayInterval = null;
  const autoPlayDelay = 5000; // 5 seconds

  // Function to show a specific slide
  function showSlide(index) {
    // Remove active class from all slides and dots
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
        slide.style.opacity = '1';
      } else {
        slide.classList.remove('active');
        slide.style.opacity = '0';
      }
    });

    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
        dot.classList.remove('bg-white/50');
        dot.classList.add('bg-white');
      } else {
        dot.classList.remove('active');
        dot.classList.remove('bg-white');
        dot.classList.add('bg-white/50');
      }
    });

    currentSlide = index;
  }

  // Function to go to next slide
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  // Function to go to previous slide
  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  // Start auto-play
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
  }

  // Stop auto-play
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  // Event listeners for navigation buttons
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      stopAutoPlay();
      startAutoPlay(); // Restart auto-play after manual navigation
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      stopAutoPlay();
      startAutoPlay(); // Restart auto-play after manual navigation
    });
  }

  // Event listeners for dot indicators
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      stopAutoPlay();
      startAutoPlay(); // Restart auto-play after manual navigation
    });
  });

  // Pause auto-play on hover
  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);

  // Start auto-play on initialization
  startAutoPlay();

  // Pause auto-play when page is not visible (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });
}

