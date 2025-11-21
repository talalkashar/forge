// Stripe Checkout Handler for FORGE
// This file handles the checkout process using Stripe
// Note: We redirect directly to Stripe Checkout, so we don't need the Stripe.js library

// Create checkout session and redirect
async function createCheckoutSession(quantity = 1) {
  try {
    // Show loading state
    const button = document.getElementById('buy-now-btn') || event?.target;
    const originalText = button ? button.textContent : 'Buy Now';
    if (button) {
      button.disabled = true;
      button.textContent = 'Processing...';
      button.classList.add('opacity-75', 'cursor-not-allowed');
    }

    // Call backend to create checkout session
    // Using Render server for production
    const API_URL = 'https://forge-stripe-server.onrender.com/api';
    
    const response = await fetch(`${API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const data = await response.json();

    // Redirect to Stripe Checkout
    if (data.url) {
      // Direct redirect to Stripe Checkout URL
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showError(error.message || 'An error occurred during checkout. Please try again.');
    
    // Reset button state
    const button = document.getElementById('buy-now-btn') || event?.target;
    if (button) {
      button.disabled = false;
      button.textContent = 'Buy Now';
      button.classList.remove('opacity-75', 'cursor-not-allowed');
    }
  }
}

// Show error message
function showError(message) {
  // Create or update error notification
  let errorDiv = document.getElementById('checkout-error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'checkout-error';
    errorDiv.className = 'fixed top-24 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300';
    document.body.appendChild(errorDiv);
  }
  
  errorDiv.textContent = message;
  errorDiv.classList.remove('translate-x-full', 'opacity-0');
  errorDiv.classList.add('translate-x-0', 'opacity-100');

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorDiv.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);
}

// Export for use in other scripts
window.createCheckoutSession = createCheckoutSession;

