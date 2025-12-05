import mongoose from 'mongoose';

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['abstract', 'landscape', 'portrait', 'contemporary', 'sculpture', 'digital', 'mixed-media']
  },
  medium: {
    type: String,
    required: true
  },
  dimensions: {
    width: Number,
    height: Number,
    depth: Number,
    unit: {
      type: String,
      default: 'cm'
    }
  },
  year: Number,
  imageUrl: {
    type: String,
    required: true
  },
  images: [String], // Additional images
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
artworkSchema.index({ title: 'text', artist: 'text', description: 'text', tags: 'text' });

export const Artwork = mongoose.model('Artwork', artworkSchema);
