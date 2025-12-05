import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data stores (replace with database later)
const users = [];
const artworks = [];
const carts = new Map();
const orders = [];
const favorites = new Map();
const reviews = [];

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    // Simple token validation (use JWT in production)
    const userId = token.split('-')[0];
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// AUTH ROUTES
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const user = {
    id: Date.now().toString(),
    email,
    name,
    password, // Hash in production!
    createdAt: new Date()
  };
  
  users.push(user);
  
  const token = `${user.id}-${Date.now()}`;
  
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = `${user.id}-${Date.now()}`;
  
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

app.get('/api/auth/profile', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({ id: user.id, email: user.email, name: user.name });
});

// ARTWORK ROUTES
app.get('/api/artworks', (req, res) => {
  const { category, sort, search } = req.query;
  let filtered = [...artworks];
  
  if (category && category !== 'all') {
    filtered = filtered.filter(a => a.category === category);
  }
  
  if (search) {
    filtered = filtered.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.artist.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (sort) {
    switch(sort) {
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.year - b.year);
        break;
    }
  }
  
  res.json({ artworks: filtered, total: filtered.length });
});

app.get('/api/artworks/:id', (req, res) => {
  const artwork = artworks.find(a => a.id === req.params.id);
  
  if (!artwork) {
    return res.status(404).json({ message: 'Artwork not found' });
  }
  
  res.json(artwork);
});

app.post('/api/artworks', authMiddleware, (req, res) => {
  const artwork = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date()
  };
  
  artworks.push(artwork);
  res.status(201).json(artwork);
});

// CART ROUTES
app.get('/api/cart', authMiddleware, (req, res) => {
  const userCart = carts.get(req.userId) || [];
  res.json({ items: userCart, total: userCart.reduce((sum, item) => sum + item.price * item.quantity, 0) });
});

app.post('/api/cart/add', authMiddleware, (req, res) => {
  const { artworkId, quantity } = req.body;
  const artwork = artworks.find(a => a.id === artworkId);
  
  if (!artwork) {
    return res.status(404).json({ message: 'Artwork not found' });
  }
  
  const userCart = carts.get(req.userId) || [];
  const existingItem = userCart.find(item => item.artworkId === artworkId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    userCart.push({
      id: Date.now().toString(),
      artworkId,
      title: artwork.title,
      price: artwork.price,
      image: artwork.image,
      quantity
    });
  }
  
  carts.set(req.userId, userCart);
  res.json({ items: userCart });
});

app.delete('/api/cart/remove/:itemId', authMiddleware, (req, res) => {
  const userCart = carts.get(req.userId) || [];
  const filtered = userCart.filter(item => item.id !== req.params.itemId);
  carts.set(req.userId, filtered);
  res.json({ items: filtered });
});

app.delete('/api/cart/clear', authMiddleware, (req, res) => {
  carts.set(req.userId, []);
  res.json({ message: 'Cart cleared' });
});

// ORDER ROUTES
app.post('/api/orders', authMiddleware, (req, res) => {
  const userCart = carts.get(req.userId) || [];
  
  if (userCart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }
  
  const order = {
    id: Date.now().toString(),
    userId: req.userId,
    items: userCart,
    total: userCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    status: 'pending',
    createdAt: new Date(),
    ...req.body
  };
  
  orders.push(order);
  carts.set(req.userId, []); // Clear cart
  
  res.status(201).json(order);
});

app.get('/api/orders', authMiddleware, (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.userId);
  res.json({ orders: userOrders });
});

// FAVORITES ROUTES
app.get('/api/favorites', authMiddleware, (req, res) => {
  const userFavorites = favorites.get(req.userId) || [];
  const favoriteArtworks = artworks.filter(a => userFavorites.includes(a.id));
  res.json({ favorites: favoriteArtworks });
});

app.post('/api/favorites/add', authMiddleware, (req, res) => {
  const { artworkId } = req.body;
  const userFavorites = favorites.get(req.userId) || [];
  
  if (!userFavorites.includes(artworkId)) {
    userFavorites.push(artworkId);
    favorites.set(req.userId, userFavorites);
  }
  
  res.json({ message: 'Added to favorites' });
});

app.delete('/api/favorites/remove/:artworkId', authMiddleware, (req, res) => {
  const userFavorites = favorites.get(req.userId) || [];
  const filtered = userFavorites.filter(id => id !== req.params.artworkId);
  favorites.set(req.userId, filtered);
  res.json({ message: 'Removed from favorites' });
});

// SEARCH ROUTE
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  const results = artworks.filter(a =>
    a.title.toLowerCase().includes(q.toLowerCase()) ||
    a.artist.toLowerCase().includes(q.toLowerCase()) ||
    a.category.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({ results, total: results.length });
});

// Seed some initial data
const seedData = () => {
  if (artworks.length === 0) {
    const sampleArtworks = [
      {
        id: '1',
        title: 'Ethereal Dreams',
        category: 'oil',
        artist: 'Elena Moretti',
        price: 12500,
        year: 2024,
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        description: 'A mesmerizing oil painting capturing the essence of dreams',
        inStock: true
      },
      {
        id: '2',
        title: 'Urban Symphony',
        category: 'digital',
        artist: 'Marcus Chen',
        price: 8900,
        year: 2024,
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
        description: 'Digital art exploring modern city landscapes',
        inStock: true
      },
      {
        id: '3',
        title: 'Ocean Whispers',
        category: 'watercolor',
        artist: 'Sofia Rodriguez',
        price: 6500,
        year: 2023,
        image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
        description: 'Delicate watercolor portraying ocean serenity',
        inStock: true
      }
    ];
    
    artworks.push(...sampleArtworks);
    console.log('✅ Seeded sample artworks');
  }
};

seedData();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
