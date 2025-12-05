# Database Setup Guide

## MongoDB Installation & Configuration

### Option 1: Local MongoDB (Development)

1. **Install MongoDB Community Server**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation wizard
   - MongoDB will run on `mongodb://localhost:27017` by default

2. **Verify Installation**
   ```powershell
   mongod --version
   ```

3. **Start MongoDB Service** (if not auto-started)
   ```powershell
   net start MongoDB
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free tier (512MB storage, perfect for testing)

2. **Create a Cluster**
   - Choose **FREE** shared cluster
   - Select cloud provider (AWS recommended)
   - Choose region closest to you
   - Cluster takes 3-5 minutes to deploy

3. **Configure Database Access**
   - Go to **Database Access** tab
   - Click **Add New Database User**
   - Choose **Password** authentication
   - Username: `arvista_admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: **Read and write to any database**

4. **Configure Network Access**
   - Go to **Network Access** tab
   - Click **Add IP Address**
   - For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
   - For production: Add your server's specific IP

5. **Get Connection String**
   - Go to **Database** tab
   - Click **Connect** on your cluster
   - Choose **Connect your application**
   - Copy the connection string:
   ```
   mongodb+srv://arvista_admin:<password>@cluster0.xxxxx.mongodb.net/arvista?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Replace `arvista` with your database name (or keep it)

## Environment Configuration

### Update `.env` file

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/arvista

# OR for MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://arvista_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/arvista?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3003
NODE_ENV=development
FRONTEND_URL=http://localhost:3002
```

## Seed Database with Sample Data

Run the seed script to populate your database with:
- 2 test users (admin and regular user)
- 8 sample artworks with real images

```powershell
cd backend
npm run seed
```

**Expected Output:**
```
✅ Connected to MongoDB
🗑️  Cleared existing data
👤 Created admin user (admin@arvista.com / admin123)
👤 Created test user (user@test.com / user123)
🎨 Created 8 artworks

✨ Database seeded successfully!

Login credentials:
Admin: admin@arvista.com / admin123
User: user@test.com / user123
```

## Start the Server

```powershell
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://localhost:3003
📊 Environment: development
✅ Connected to MongoDB
```

## Test Database Connection

Visit: http://localhost:3003/api/health

**Expected Response:**
```json
{
  "status": "ok",
  "mongodb": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Database Schema Overview

### Collections Created

1. **users** - User accounts and authentication
   - Fields: name, email, password (hashed), role, avatar
   - Indexes: email (unique)

2. **artworks** - Art pieces for sale
   - Fields: title, artist, description, price, category, medium, dimensions, images, tags, ratings
   - Indexes: text search on title/artist/description/tags

3. **carts** - Shopping cart items
   - Fields: user (ref), items array with artwork references
   - Indexes: user (unique - one cart per user)

4. **orders** - Purchase history
   - Fields: user, items, totalAmount, status, shippingAddress, payment info
   - Indexes: user, createdAt

5. **favorites** - Saved/wishlisted artworks
   - Fields: user (ref), artwork (ref)
   - Indexes: compound unique (user + artwork)

6. **reviews** - Artwork reviews and ratings
   - Fields: user, artwork, rating (1-5), comment
   - Indexes: compound unique (user + artwork)

## Troubleshooting

### "MongoNetworkError: failed to connect"
- **Local MongoDB**: Ensure MongoDB service is running (`net start MongoDB`)
- **Atlas**: Check network access whitelist includes your IP
- **Atlas**: Verify connection string password is correct (no < > brackets)

### "Authentication failed"
- Atlas: Verify database user credentials
- Atlas: Ensure user has correct permissions (readWrite)
- Check connection string format

### "Cannot find module 'mongoose'"
```powershell
npm install
```

### Seed script fails
- Ensure MongoDB is running and connected
- Check .env file has correct MONGODB_URI
- Verify no syntax errors in seed.js

## Next Steps

After database setup:
1. ✅ Database configured and seeded
2. 🔄 Test API endpoints with Postman or frontend
3. 🎨 Continue with production polish (admin panel, payments)
4. 🚀 Deploy backend to Railway/Render/Heroku
