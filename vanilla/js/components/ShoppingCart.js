// Shopping Cart Manager
import { api } from '../api/client.js';
import { auth } from '../auth/AuthManager.js';
import { gsap } from 'gsap';

export class ShoppingCart {
  constructor() {
    this.cart = null;
    this.cartPanel = null;
    this.cartBadge = null;
    this.init();
  }
  
  async init() {
    this.createCartUI();
    await this.loadCart();
  }
  
  createCartUI() {
    // Create cart panel
    this.cartPanel = document.createElement('div');
    this.cartPanel.className = 'cart-panel';
    this.cartPanel.innerHTML = `
      <div class="cart-panel-header">
        <h3 class="cart-panel-title">Shopping Cart</h3>
        <button class="cart-panel-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      
      <div class="cart-items-container">
        <!-- Cart items will be rendered here -->
      </div>
      
      <div class="cart-panel-footer">
        <div class="cart-total">
          <span class="cart-total-label">Total:</span>
          <span class="cart-total-amount">$0.00</span>
        </div>
        <button class="cart-checkout-btn">
          <span>Proceed to Checkout</span>
        </button>
        <button class="cart-clear-btn">Clear Cart</button>
      </div>
    `;
    
    document.body.appendChild(this.cartPanel);
    
    // Event listeners
    this.cartPanel.querySelector('.cart-panel-close').addEventListener('click', () => {
      this.closeCart();
    });
    
    this.cartPanel.querySelector('.cart-checkout-btn').addEventListener('click', () => {
      this.handleCheckout();
    });
    
    this.cartPanel.querySelector('.cart-clear-btn').addEventListener('click', () => {
      this.handleClearCart();
    });
  }
  
  async loadCart() {
    if (!auth.isAuthenticated()) {
      this.cart = { items: [], total: 0 };
      this.renderCart();
      return;
    }
    
    try {
      this.cart = await api.getCart();
      this.renderCart();
    } catch (error) {
      console.error('Failed to load cart:', error);
      this.cart = { items: [], total: 0 };
      this.renderCart();
    }
  }
  
  renderCart() {
    const container = this.cartPanel.querySelector('.cart-items-container');
    
    if (!this.cart || this.cart.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="21" r="1" stroke="currentColor" stroke-width="2"/>
            <circle cx="20" cy="21" r="1" stroke="currentColor" stroke-width="2"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" 
                  stroke="currentColor" stroke-width="2"/>
          </svg>
          <p>Your cart is empty</p>
        </div>
      `;
      this.updateTotal(0);
      this.updateBadge(0);
      return;
    }
    
    container.innerHTML = this.cart.items.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.artwork.image}" alt="${item.artwork.title}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.artwork.title}</h4>
          <p class="cart-item-artist">${item.artwork.artist}</p>
          <p class="cart-item-price">$${item.artwork.price.toLocaleString()}</p>
        </div>
        <div class="cart-item-controls">
          <div class="cart-item-quantity">
            <button class="quantity-btn decrease" data-item-id="${item.id}">-</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn increase" data-item-id="${item.id}">+</button>
          </div>
          <button class="cart-item-remove" data-item-id="${item.id}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners to controls
    container.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
      btn.addEventListener('click', () => {
        this.updateQuantity(btn.dataset.itemId, -1);
      });
    });
    
    container.querySelectorAll('.quantity-btn.increase').forEach(btn => {
      btn.addEventListener('click', () => {
        this.updateQuantity(btn.dataset.itemId, 1);
      });
    });
    
    container.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this.removeItem(btn.dataset.itemId);
      });
    });
    
    this.updateTotal(this.cart.total);
    this.updateBadge(this.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  }
  
  async addToCart(artworkId, quantity = 1) {
    if (!auth.isAuthenticated()) {
      auth.showLoginModal();
      return;
    }
    
    try {
      this.cart = await api.addToCart(artworkId, quantity);
      this.renderCart();
      this.showNotification('Added to cart!', 'success');
    } catch (error) {
      this.showNotification(error.message || 'Failed to add to cart', 'error');
    }
  }
  
  async updateQuantity(itemId, delta) {
    if (!auth.isAuthenticated()) return;
    
    const item = this.cart.items.find(i => i.id === itemId);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) {
      this.removeItem(itemId);
      return;
    }
    
    try {
      this.cart = await api.updateCartItem(itemId, newQuantity);
      this.renderCart();
    } catch (error) {
      this.showNotification('Failed to update quantity', 'error');
    }
  }
  
  async removeItem(itemId) {
    if (!auth.isAuthenticated()) return;
    
    try {
      this.cart = await api.removeFromCart(itemId);
      this.renderCart();
      this.showNotification('Item removed', 'success');
    } catch (error) {
      this.showNotification('Failed to remove item', 'error');
    }
  }
  
  async handleClearCart() {
    if (!auth.isAuthenticated()) return;
    if (!confirm('Clear all items from cart?')) return;
    
    try {
      await api.clearCart();
      this.cart = { items: [], total: 0 };
      this.renderCart();
      this.showNotification('Cart cleared', 'success');
    } catch (error) {
      this.showNotification('Failed to clear cart', 'error');
    }
  }
  
  async handleCheckout() {
    if (!auth.isAuthenticated()) {
      auth.showLoginModal();
      return;
    }
    
    if (!this.cart || this.cart.items.length === 0) {
      this.showNotification('Your cart is empty', 'error');
      return;
    }
    
    // Create order
    try {
      const orderData = {
        items: this.cart.items.map(item => ({
          artworkId: item.artwork.id,
          quantity: item.quantity,
          price: item.artwork.price
        })),
        total: this.cart.total,
        shippingAddress: 'Default Address', // Should be from user profile
        paymentMethod: 'card' // Should be selected by user
      };
      
      const order = await api.createOrder(orderData);
      
      this.showNotification('Order placed successfully!', 'success');
      this.cart = { items: [], total: 0 };
      this.renderCart();
      this.closeCart();
      
      // Redirect to orders page or show order confirmation
      setTimeout(() => {
        window.location.href = '/orders.html';
      }, 1500);
      
    } catch (error) {
      this.showNotification(error.message || 'Failed to create order', 'error');
    }
  }
  
  openCart() {
    this.cartPanel.classList.add('active');
    gsap.from(this.cartPanel, {
      x: '100%',
      duration: 0.4,
      ease: 'power3.out'
    });
  }
  
  closeCart() {
    gsap.to(this.cartPanel, {
      x: '100%',
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.cartPanel.classList.remove('active');
      }
    });
  }
  
  toggleCart() {
    if (this.cartPanel.classList.contains('active')) {
      this.closeCart();
    } else {
      this.openCart();
    }
  }
  
  updateTotal(total) {
    const totalElement = this.cartPanel.querySelector('.cart-total-amount');
    totalElement.textContent = `$${total.toLocaleString()}`;
  }
  
  updateBadge(count) {
    if (!this.cartBadge) {
      // Create badge element
      const cartIcon = document.querySelector('.cart-icon');
      if (cartIcon) {
        this.cartBadge = document.createElement('span');
        this.cartBadge.className = 'cart-badge';
        cartIcon.appendChild(this.cartBadge);
      }
    }
    
    if (this.cartBadge) {
      this.cartBadge.textContent = count;
      this.cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  }
  
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        ${type === 'success' 
          ? '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>'
          : '<path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2"/>'}
      </svg>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    gsap.from(notification, {
      x: 100,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    setTimeout(() => {
      gsap.to(notification, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        onComplete: () => notification.remove()
      });
    }, 3000);
  }
}

// Export singleton
export const cart = new ShoppingCart();
