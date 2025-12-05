import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Artwork } from './models/Artwork.js';

dotenv.config();

const sampleArtworks = [
  {
    title: 'Ethereal Dreams',
    artist: 'Marina Volkov',
    description: 'A mesmerizing abstract piece that captures the essence of dreams through flowing colors and dynamic brushwork. This contemporary masterpiece combines traditional techniques with modern vision.',
    price: 12500,
    category: 'abstract',
    medium: 'Acrylic on Canvas',
    dimensions: { width: 120, height: 90, unit: 'cm' },
    year: 2023,
    imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
    images: [
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
      'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800'
    ],
    inStock: true,
    featured: true,
    tags: ['abstract', 'colorful', 'contemporary', 'large'],
    averageRating: 4.8,
    reviewCount: 12
  },
  {
    title: 'Urban Symphony',
    artist: 'David Chen',
    description: 'A powerful urban landscape that captures the rhythm and energy of city life. Mixed media techniques create depth and texture, reflecting the complexity of modern existence.',
    price: 8900,
    category: 'contemporary',
    medium: 'Mixed Media',
    dimensions: { width: 100, height: 80, unit: 'cm' },
    year: 2024,
    imageUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800',
    images: [
      'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800'
    ],
    inStock: true,
    featured: true,
    tags: ['contemporary', 'urban', 'mixed-media'],
    averageRating: 4.6,
    reviewCount: 8
  },
  {
    title: 'Ocean Whispers',
    artist: 'Sofia Martinez',
    description: 'An evocative seascape that brings the tranquility of the ocean into your space. Delicate brushwork and a soothing color palette create a sense of peace and contemplation.',
    price: 6500,
    category: 'landscape',
    medium: 'Oil on Canvas',
    dimensions: { width: 90, height: 60, unit: 'cm' },
    year: 2023,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'
    ],
    inStock: true,
    featured: false,
    tags: ['landscape', 'ocean', 'serene', 'blue'],
    averageRating: 4.9,
    reviewCount: 15
  },
  {
    title: 'Silent Contemplation',
    artist: 'Anna Kowalski',
    description: 'A striking portrait that captures a moment of quiet introspection. The subject\'s gaze invites viewers into a world of deep thought and emotion.',
    price: 9200,
    category: 'portrait',
    medium: 'Oil on Canvas',
    dimensions: { width: 70, height: 90, unit: 'cm' },
    year: 2024,
    imageUrl: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=800',
    images: [
      'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=800'
    ],
    inStock: true,
    featured: true,
    tags: ['portrait', 'realistic', 'emotional'],
    averageRating: 4.7,
    reviewCount: 10
  },
  {
    title: 'Digital Horizon',
    artist: 'Alex Kim',
    description: 'A groundbreaking digital artwork that explores the intersection of technology and nature. Vibrant colors and geometric patterns create a futuristic vision.',
    price: 4800,
    category: 'digital',
    medium: 'Digital Print on Archival Paper',
    dimensions: { width: 80, height: 60, unit: 'cm' },
    year: 2024,
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'
    ],
    inStock: true,
    featured: false,
    tags: ['digital', 'futuristic', 'colorful', 'geometric'],
    averageRating: 4.5,
    reviewCount: 6
  },
  {
    title: 'Sculptural Essence',
    artist: 'Marcus Stone',
    description: 'A contemporary bronze sculpture that challenges perceptions of form and space. The interplay of light and shadow creates an ever-changing visual experience.',
    price: 15000,
    category: 'sculpture',
    medium: 'Bronze',
    dimensions: { width: 40, height: 120, depth: 40, unit: 'cm' },
    year: 2023,
    imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
    images: [
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800'
    ],
    inStock: true,
    featured: true,
    tags: ['sculpture', 'bronze', 'contemporary', 'abstract'],
    averageRating: 5.0,
    reviewCount: 4
  },
  {
    title: 'Autumn Reverie',
    artist: 'Emma Wilson',
    description: 'A stunning landscape capturing the golden hues of autumn. Rich textures and warm colors evoke the beauty of changing seasons.',
    price: 7200,
    category: 'landscape',
    medium: 'Acrylic on Canvas',
    dimensions: { width: 100, height: 70, unit: 'cm' },
    year: 2023,
    imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800',
    images: [
      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800'
    ],
    inStock: true,
    featured: false,
    tags: ['landscape', 'autumn', 'warm', 'nature'],
    averageRating: 4.6,
    reviewCount: 9
  },
  {
    title: 'Velocity',
    artist: 'James Rodriguez',
    description: 'An explosive abstract composition that captures movement and energy. Bold strokes and contrasting colors create a sense of unstoppable momentum.',
    price: 10500,
    category: 'abstract',
    medium: 'Acrylic and Oil on Canvas',
    dimensions: { width: 150, height: 100, unit: 'cm' },
    year: 2024,
    imageUrl: 'https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=800',
    images: [
      'https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=800'
    ],
    inStock: true,
    featured: true,
    tags: ['abstract', 'dynamic', 'bold', 'large'],
    averageRating: 4.8,
    reviewCount: 11
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arvista');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Artwork.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@arvista.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log('👤 Created admin user (admin@arvista.com / admin123)');

    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      name: 'Test User',
      email: 'user@test.com',
      password: userPassword,
      role: 'user'
    });
    console.log('👤 Created test user (user@test.com / user123)');

    // Create artworks
    const artworks = await Artwork.insertMany(sampleArtworks);
    console.log(`🎨 Created ${artworks.length} artworks`);

    console.log('\n✨ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@arvista.com / admin123');
    console.log('User: user@test.com / user123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
