// Authentication Manager
import { api } from './api/client.js';
import { gsap } from 'gsap';

export class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }
  
  init() {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      this.currentUser = JSON.parse(userData);
      this.updateUI();
    }
  }
  
  async showLoginModal() {
    const modal = this.createAuthModal('login');
    document.body.appendChild(modal);
    
    // Animate in
    gsap.from(modal.querySelector('.auth-modal-content'), {
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      ease: 'back.out(1.7)'
    });
  }
  
  async showRegisterModal() {
    const modal = this.createAuthModal('register');
    document.body.appendChild(modal);
    
    // Animate in
    gsap.from(modal.querySelector('.auth-modal-content'), {
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      ease: 'back.out(1.7)'
    });
  }
  
  createAuthModal(type) {
    const modal = document.createElement('div');
    modal.className = 'auth-modal active';
    
    const isLogin = type === 'login';
    
    modal.innerHTML = `
      <div class="auth-modal-overlay"></div>
      <div class="auth-modal-content">
        <button class="auth-modal-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <h2 class="auth-modal-title">${isLogin ? 'Welcome Back' : 'Join Arvista'}</h2>
        <p class="auth-modal-subtitle">
          ${isLogin ? 'Sign in to your account' : 'Create your account'}
        </p>
        
        <form class="auth-form" id="authForm">
          ${!isLogin ? `
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" name="name" class="form-input" required>
            </div>
          ` : ''}
          
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" name="email" class="form-input" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" name="password" class="form-input" required>
          </div>
          
          <button type="submit" class="auth-submit-btn">
            <span>${isLogin ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>
        
        <p class="auth-switch">
          ${isLogin ? "Don't have an account?" : 'Already have an account?'}
          <a href="#" class="auth-switch-link">
            ${isLogin ? 'Sign Up' : 'Sign In'}
          </a>
        </p>
      </div>
    `;
    
    // Event listeners
    const closeBtn = modal.querySelector('.auth-modal-close');
    const overlay = modal.querySelector('.auth-modal-overlay');
    const form = modal.querySelector('#authForm');
    const switchLink = modal.querySelector('.auth-switch-link');
    
    const closeModal = () => {
      gsap.to(modal.querySelector('.auth-modal-content'), {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        onComplete: () => modal.remove()
      });
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    switchLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
      setTimeout(() => {
        if (isLogin) {
          this.showRegisterModal();
        } else {
          this.showLoginModal();
        }
      }, 300);
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(form, type, modal);
    });
    
    return modal;
  }
  
  async handleSubmit(form, type, modal) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const submitBtn = form.querySelector('.auth-submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Processing...</span>';
    
    try {
      let response;
      
      if (type === 'login') {
        response = await api.login(data);
      } else {
        response = await api.register(data);
      }
      
      this.currentUser = response.user;
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      this.updateUI();
      
      // Show success message
      this.showSuccessMessage(
        type === 'login' ? 'Welcome back!' : 'Account created successfully!'
      );
      
      // Close modal
      setTimeout(() => {
        modal.remove();
      }, 500);
      
    } catch (error) {
      this.showErrorMessage(error.message || 'An error occurred');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>${type === 'login' ? 'Sign In' : 'Create Account'}</span>`;
    }
  }
  
  logout() {
    api.logout();
    this.currentUser = null;
    this.updateUI();
    this.showSuccessMessage('Logged out successfully');
  }
  
  updateUI() {
    // Update navigation
    const navItems = document.querySelectorAll('.auth-nav-item');
    
    navItems.forEach(item => {
      if (this.currentUser) {
        if (item.classList.contains('login-btn')) {
          item.style.display = 'none';
        } else if (item.classList.contains('user-menu')) {
          item.style.display = 'block';
          item.querySelector('.user-name').textContent = this.currentUser.name;
        }
      } else {
        if (item.classList.contains('login-btn')) {
          item.style.display = 'block';
        } else if (item.classList.contains('user-menu')) {
          item.style.display = 'none';
        }
      }
    });
  }
  
  showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'auth-notification success';
    notification.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    gsap.from(notification, {
      y: -20,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out'
    });
    
    setTimeout(() => {
      gsap.to(notification, {
        y: -20,
        opacity: 0,
        duration: 0.3,
        onComplete: () => notification.remove()
      });
    }, 3000);
  }
  
  showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'auth-notification error';
    notification.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    gsap.from(notification, {
      y: -20,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out'
    });
    
    setTimeout(() => {
      gsap.to(notification, {
        y: -20,
        opacity: 0,
        duration: 0.3,
        onComplete: () => notification.remove()
      });
    }, 3000);
  }
  
  isAuthenticated() {
    return this.currentUser !== null;
  }
  
  getUser() {
    return this.currentUser;
  }
}

// Export singleton
export const auth = new AuthManager();
