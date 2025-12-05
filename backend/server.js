import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { Artwork } from './models/Artwork.js';
import { Cart } from './models/Cart.js';
import { Order } from './models/Order.js';
import { Favorite } from './models/Favorite.js';
import { Review } from './models/Review.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arvista')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      email,
      name,
      password: hashedPassword
    });
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      id: user._id, 
      email: user.email, 
      name: user.name,
      role: user.role,
      avatar: user.avatar
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ARTWORK ROUTES
app.get('/api/artworks', async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Build query
    let artworkQuery = Artwork.find(query);
    
    // Sorting
    if (sort === 'price-low') {
      artworkQuery = artworkQuery.sort({ price: 1 });
    } else if (sort === 'price-high') {
      artworkQuery = artworkQuery.sort({ price: -1 });
    } else if (sort === 'newest') {
      artworkQuery = artworkQuery.sort({ createdAt: -1 });
    } else if (sort === 'popular') {
      artworkQuery = artworkQuery.sort({ reviewCount: -1, averageRating: -1 });
    }
    
    const artworks = await artworkQuery;
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/artworks/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/artworks', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const artwork = await Artwork.create(req.body);
    res.status(201).json(artwork);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// CART ROUTES
app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate('items.artwork');
    
    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/cart/add', authMiddleware, async (req, res) => {
  try {
    const { artworkId, quantity = 1 } = req.body;
    
    // Verify artwork exists
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    let cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.userId,
        items: [{ artwork: artworkId, quantity }]
      });
    } else {
      // Check if item already in cart
      const existingItem = cart.items.find(
        item => item.artwork.toString() === artworkId
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ artwork: artworkId, quantity });
      }
      
      await cart.save();
    }
    
    cart = await cart.populate('items.artwork');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/cart/remove/:artworkId', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => item.artwork.toString() !== req.params.artworkId
    );
    
    await cart.save();
    await cart.populate('items.artwork');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/cart/clear', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      return res.json({ items: [] });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ORDER ROUTES
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const order = await Order.create({
      user: req.userId,
      items: items.map(item => ({
        artwork: item.artworkId,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount,
      shippingAddress,
      paymentMethod
    });
    
    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.userId },
      { items: [] }
    );
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.artwork')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// FAVORITES ROUTES
app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.userId })
      .populate('artwork')
      .sort({ addedAt: -1 });
    
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/favorites/add', authMiddleware, async (req, res) => {
  try {
    const { artworkId } = req.body;
    
    // Check if already favorited
    const existing = await Favorite.findOne({
      user: req.userId,
      artwork: artworkId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Already in favorites' });
    }
    
    const favorite = await Favorite.create({
      user: req.userId,
      artwork: artworkId
    });
    
    await favorite.populate('artwork');
    res.json(favorite);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/favorites/remove/:artworkId', authMiddleware, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      user: req.userId,
      artwork: req.params.artworkId
    });
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// SEARCH ROUTE
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }
    
    const artworks = await Artwork.find({
      $text: { $search: q }
    }).limit(20);
    
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
