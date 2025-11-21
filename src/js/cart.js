// FORGE Shopping Cart System using localStorage
// This file handles all cart operations

const CART_STORAGE_KEY = 'forge_cart';

// Cart structure:
// {
//   items: [
//     {
//       id: 1,
//       name: "FORGE Lifting Straps",
//       price: 9.99,
//       quantity: 2
//     }
//   ]
// }

// Get cart from localStorage
function getCart() {
  const cartJson = localStorage.getItem(CART_STORAGE_KEY);
  if (!cartJson) {
    return { items: [] };
  }
  try {
    return JSON.parse(cartJson);
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    return { items: [] };
  }
}

// Save cart to localStorage
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartIcon();
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

// Add item to cart
function addToCart(productId, productName, price, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.items.find(item => item.id === productId);

  if (existingItem) {
    // Update quantity if item already exists
    existingItem.quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      id: productId,
      name: productName,
      price: parseFloat(price),
      quantity: quantity
    });
  }

  saveCart(cart);
  return cart;
}

// Remove item from cart
function removeFromCart(productId) {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.id !== productId);
  saveCart(cart);
  return cart;
}

// Update item quantity in cart
function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.items.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return removeFromCart(productId);
    }
    item.quantity = quantity;
    saveCart(cart);
  }
  
  return cart;
}

// Get total number of items in cart
function getCartItemCount() {
  const cart = getCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

// Get cart total price
function getCartTotal() {
  const cart = getCart();
  return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Clear entire cart
function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartIcon();
}

// Update cart icon count on all pages
function updateCartIcon() {
  const count = getCartItemCount();
  const cartCountElements = document.querySelectorAll('.cart-count');
  
  cartCountElements.forEach(element => {
    if (count > 0) {
      element.textContent = count;
      element.classList.remove('hidden');
    } else {
      element.textContent = '0';
      element.classList.add('hidden');
    }
  });
}

// Initialize cart icon on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartIcon();
});

// Export functions for use in other scripts
window.cart = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCartItemCount,
  getCartTotal,
  clearCart,
  updateCartIcon
};

