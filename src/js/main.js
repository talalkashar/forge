// Main JavaScript for FORGE Website

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const lines = ['line1', 'line2', 'line3'];

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('-translate-y-full');
      mobileMenuBtn.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
        mobileMenu.classList.add('-translate-y-full');
        mobileMenuBtn.classList.remove('active');
      }
    });
  }

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
  const cartBtns = document.querySelectorAll('.cart-btn');
  cartBtns.forEach(btn => {
    const currentCount = parseInt(btn.textContent.match(/\d+/)?.[0] || '0');
    btn.textContent = `Cart (${currentCount + 1})`;
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
});

