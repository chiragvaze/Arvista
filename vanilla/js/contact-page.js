// Contact Page Functionality
import { gsap } from 'gsap';

// Initialize contact page
export function initContactPage() {
  initFormValidation();
  initFormSubmission();
  animateContactEntrance();
}

// Form validation
function initFormValidation() {
  const form = document.getElementById('contactForm');
  const inputs = form.querySelectorAll('.form-input, .form-textarea');
  
  inputs.forEach(input => {
    // Real-time validation
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        validateField(input);
      }
    });
    
    // Premium focus effect
    input.addEventListener('focus', function() {
      gsap.to(this, {
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    input.addEventListener('blur', function() {
      gsap.to(this, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
}

// Validate individual field
function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  // Remove previous error
  removeError(field);
  
  // Check if required
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }
  
  // Phone validation (optional)
  if (field.type === 'tel' && value) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number';
    }
  }
  
  if (!isValid) {
    showError(field, errorMessage);
  }
  
  return isValid;
}

// Show error message
function showError(field, message) {
  field.classList.add('error');
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  
  field.parentNode.appendChild(errorDiv);
  
  // Animate error
  gsap.from(errorDiv, {
    opacity: 0,
    y: -10,
    duration: 0.3,
    ease: 'power2.out'
  });
}

// Remove error message
function removeError(field) {
  field.classList.remove('error');
  const errorDiv = field.parentNode.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Form submission
function initFormSubmission() {
  const form = document.getElementById('contactForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!validateField(input)) {
        isFormValid = false;
      }
    });
    
    if (!isFormValid) {
      // Shake form
      gsap.to(form, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.4,
        ease: 'power2.out'
      });
      return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    showSuccessMessage(form);
    
    // Reset form
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  });
}

// Show success message
function showSuccessMessage(form) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <div class="success-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h3>Message Sent Successfully!</h3>
    <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
  `;
  
  form.parentNode.insertBefore(successDiv, form);
  
  // Animate success message
  gsap.from(successDiv, {
    opacity: 0,
    scale: 0.8,
    y: 20,
    duration: 0.5,
    ease: 'back.out(1.7)'
  });
  
  // Scroll to success message
  successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Remove after 5 seconds
  setTimeout(() => {
    gsap.to(successDiv, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      onComplete: () => successDiv.remove()
    });
  }, 5000);
}

// Animate contact entrance
function animateContactEntrance() {
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
  gsap.from('.contact-description p', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    stagger: 0.2,
    delay: 0.8,
    ease: 'power2.out'
  });
  
  // Animate form
  gsap.from('.contact-form-wrapper', {
    opacity: 0,
    x: -50,
    duration: 1,
    delay: 1,
    ease: 'power3.out'
  });
  
  // Animate info cards
  gsap.from('.info-card', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.15,
    delay: 1.2,
    ease: 'power2.out'
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactPage);
} else {
  initContactPage();
}
