// API Client - Frontend Interface for Backend
class APIClient {
  constructor(baseURL = 'http://localhost:3003/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }
  
  // Helper method for API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  // Authentication methods
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }
  
  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }
  
  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
  
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }
  
  async getProfile() {
    return this.request('/auth/profile');
  }
  
  // Artwork methods
  async getArtworks(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/artworks?${params}`);
  }
  
  async getArtwork(id) {
    return this.request(`/artworks/${id}`);
  }
  
  async createArtwork(artworkData) {
    return this.request('/artworks', {
      method: 'POST',
      body: JSON.stringify(artworkData)
    });
  }
  
  async updateArtwork(id, artworkData) {
    return this.request(`/artworks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(artworkData)
    });
  }
  
  async deleteArtwork(id) {
    return this.request(`/artworks/${id}`, {
      method: 'DELETE'
    });
  }
  
  // Cart methods
  async getCart() {
    return this.request('/cart');
  }
  
  async addToCart(artworkId, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ artworkId, quantity })
    });
  }
  
  async removeFromCart(cartItemId) {
    return this.request(`/cart/remove/${cartItemId}`, {
      method: 'DELETE'
    });
  }
  
  async updateCartItem(cartItemId, quantity) {
    return this.request(`/cart/update/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }
  
  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE'
    });
  }
  
  // Order methods
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }
  
  async getOrders() {
    return this.request('/orders');
  }
  
  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }
  
  // Favorites/Wishlist methods
  async getFavorites() {
    return this.request('/favorites');
  }
  
  async addFavorite(artworkId) {
    return this.request('/favorites/add', {
      method: 'POST',
      body: JSON.stringify({ artworkId })
    });
  }
  
  async removeFavorite(artworkId) {
    return this.request(`/favorites/remove/${artworkId}`, {
      method: 'DELETE'
    });
  }
  
  // Reviews methods
  async getReviews(artworkId) {
    return this.request(`/reviews/artwork/${artworkId}`);
  }
  
  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }
  
  // Search
  async search(query, filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    return this.request(`/search?${params}`);
  }
}

// Export singleton instance
export const api = new APIClient();
