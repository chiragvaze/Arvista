# Quick MongoDB Atlas Setup

## ⚡ 5-Minute Cloud Database Setup (FREE)

Since local MongoDB isn't installed, we'll use **MongoDB Atlas** (cloud database). It's free, fast, and production-ready!

### Step 1: Create Account (2 minutes)

1. Visit: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with Google/Email
3. Choose **FREE** tier when asked

### Step 2: Create Cluster (1 minute)

1. After login, click **"Build a Database"**
2. Choose **FREE (M0)** tier
3. Select **AWS** provider
4. Choose region closest to you
5. Cluster Name: `Arvista` (or keep default)
6. Click **"Create Deployment"**

### Step 3: Create Database User (30 seconds)

You'll see a security quickstart:

1. **Username**: `arvista_admin`
2. **Password**: Click "Autogenerate Secure Password" and **COPY IT**
3. Click **"Create Database User"**

### Step 4: Network Access (30 seconds)

1. IP Access List: Add `0.0.0.0/0` (allow from anywhere - development only)
2. Click **"Add Entry"**
3. Click **"Finish and Close"**

### Step 5: Get Connection String (1 minute)

1. Click **"Connect"** button on your cluster
2. Choose **"Drivers"**
3. **COPY** the connection string (looks like):
   ```
   mongodb+srv://arvista_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update `.env` File

Open `backend/.env` and update:

```env
# Replace with YOUR connection string
MONGODB_URI=mongodb+srv://arvista_admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/arvista?retryWrites=true&w=majority

JWT_SECRET=arvista-dev-secret-key-2024
PORT=3003
NODE_ENV=development
FRONTEND_URL=http://localhost:3002
```

**IMPORTANT**: 
- Replace `<password>` with the password you copied (remove the `<` `>` brackets!)
- Change `?retryWrites` to `arvista?retryWrites` (add database name)

### Step 7: Seed Database

Run in terminal:
```powershell
cd backend
node seed.js
```

**Success looks like:**
```
✅ Connected to MongoDB
🗑️  Cleared existing data
👤 Created admin user (admin@arvista.com / admin123)
👤 Created test user (user@test.com / user123)
🎨 Created 8 artworks
✨ Database seeded successfully!
```

### Step 8: Start Server

```powershell
npm run dev
```

## 🎯 Test Login Credentials

**Admin Account:**
- Email: `admin@arvista.com`
- Password: `admin123`

**Regular User:**
- Email: `user@test.com`
- Password: `user123`

## ✅ Verify Connection

Visit: http://localhost:3003/api/health

Should show:
```json
{
  "status": "ok",
  "mongodb": "connected"
}
```

## 🐛 Troubleshooting

**"Authentication failed"**
- Check password in connection string (no < > brackets)
- Verify database user exists in Atlas

**"IP not whitelisted"**
- In Atlas → Network Access → Add `0.0.0.0/0`

**"Cannot find module"**
```powershell
npm install
```

## 📊 View Your Data

In MongoDB Atlas:
1. Click **"Browse Collections"**
2. See your `arvista` database with:
   - users (2 documents)
   - artworks (8 documents)
   - carts, orders, favorites (empty initially)

---

**Next:** After database is seeded, test the frontend login!
