# Arvista Gallery - Deployment Guide

## 🚀 Quick Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Your code pushed to GitHub

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Complete art gallery with admin dashboard"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository `Arvista`
4. Vercel will auto-detect Next.js

### Step 3: Environment Variables

In Vercel project settings, add these environment variables:

```env
# Database
DATABASE_URL=postgresql://postgres.warkhnmvptqwfidzrbli:Arvista%40%2312@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.warkhnmvptqwfidzrbli:Arvista%40%2312@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://warkhnmvptqwfidzrbli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhcmtobm12cHRxd2ZpZHpyYmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTI3NTAsImV4cCI6MjA3OTkyODc1MH0.p5qv2zo369gobegIMdl8ax_EV4uVjIDahiBk8l0rdJI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhcmtobm12cHRxd2ZpZHpyYmxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM1Mjc1MCwiZXhwIjoyMDc5OTI4NzUwfQ.T78C4JfdtKfel0-Yys3Oa-256_8Jcq52Oq63q7Gu2fw

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=0Ml0g7PzdaRMCQ4d2Vvao0FHTObJutn7pdlmAIpn9YE=

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Optional - for contact form emails)
RESEND_API_KEY=
EMAIL_FROM=noreply@arvista.com

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Step 4: Update NEXTAUTH_URL

After deployment, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your actual Vercel domain:
- Example: `https://arvista.vercel.app`

### Step 5: Deploy

Click **"Deploy"** and wait for the build to complete!

---

## 📊 Post-Deployment Setup

### 1. Create Admin User

You need to create an admin user manually in the database:

```sql
-- Go to Supabase SQL Editor and run:
INSERT INTO "User" (id, email, name, "hashedPassword", role, "emailVerified")
VALUES (
  gen_random_uuid(),
  'admin@arvista.com',
  'Admin User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5BMFV1XUzIOPm', -- password: admin123
  'ADMIN',
  NOW()
);
```

**Important:** Change the password after first login!

### 2. Add Sample Data

Create some categories, collections, and artworks through the admin dashboard:

1. Go to `https://your-domain.vercel.app/admin`
2. Sign in with admin credentials
3. Add categories (Paintings, Digital Art, Sculptures, etc.)
4. Create collections
5. Upload artworks

### 3. Test Features

- ✅ Gallery page loads
- ✅ Contact form submission works
- ✅ Newsletter subscription works
- ✅ Admin dashboard accessible
- ✅ Image upload works
- ✅ Artwork filtering works

---

## 🎨 Features Implemented

### Frontend
- ✅ Modern, animated gallery with Framer Motion + GSAP
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/light mode compatible
- ✅ Artwork filtering and search
- ✅ Collection browsing
- ✅ Contact form with validation
- ✅ Newsletter subscription

### Backend & Database
- ✅ PostgreSQL database on Supabase
- ✅ 11 database models (Users, Artworks, Collections, Orders, etc.)
- ✅ Complete REST API with Next.js Route Handlers
- ✅ Image upload to Supabase Storage
- ✅ Authentication with NextAuth.js
- ✅ Role-based access control (User, Artist, Admin)

### Admin Dashboard
- ✅ Artwork management (CRUD)
- ✅ Collection management
- ✅ Category management
- ✅ Order viewing
- ✅ Contact message inbox
- ✅ Newsletter subscriber management
- ✅ Featured artwork toggling

### APIs Created
- `/api/artworks` - Artwork CRUD
- `/api/collections` - Collection CRUD
- `/api/categories` - Category management
- `/api/contact` - Contact form submissions
- `/api/newsletter` - Newsletter subscriptions
- `/api/favorites` - User favorites
- `/api/reviews` - Artwork reviews
- `/api/upload` - Image uploads
- `/api/auth/*` - Authentication endpoints

---

## 🔒 Security Implemented

- ✅ Password hashing with bcrypt
- ✅ JWT session tokens
- ✅ API route protection
- ✅ Admin-only endpoints
- ✅ SQL injection prevention (Prisma)
- ✅ Environment variable protection
- ✅ CORS configuration

---

## 📈 Optional Enhancements

### Email Integration (Resend)
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to environment variables
4. Uncomment email code in `/api/contact/route.ts`

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect: `https://your-domain.vercel.app/api/auth/callback/google`
4. Add client ID and secret to environment variables

### Custom Domain
1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`

### Analytics
- Add Vercel Analytics (built-in)
- Add Google Analytics
- Add Plausible/Fathom for privacy-focused analytics

---

## 🐛 Troubleshooting

### Database Connection Issues
- Check Supabase project is not paused
- Verify DATABASE_URL is correct
- Check connection string encoding

### Build Failures
- Run `npm install` locally
- Check for TypeScript errors: `npm run build`
- Verify all environment variables are set

### Authentication Issues
- Ensure NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches deployment URL
- Check database User table exists

### Image Upload Issues
- Verify Supabase Storage bucket "artworks" exists
- Check bucket is set to PUBLIC
- Verify SUPABASE_SERVICE_ROLE_KEY is correct

---

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Design System](./docs/DESIGN_SYSTEM.md)
- [Animations Guide](./docs/ANIMATIONS.md)
- [Getting Started](./docs/GETTING_STARTED.md)

---

## 🎉 Your Gallery is Live!

Your complete art gallery platform is now deployed with:
- 🎨 Beautiful frontend with animations
- 💾 Full-featured backend API
- 🔐 Authentication & authorization
- 📊 Admin dashboard
- 📧 Contact & newsletter forms
- 🖼️ Image management
- 📱 Fully responsive design

**Next Steps:**
1. Add your artworks through admin dashboard
2. Customize branding and content
3. Set up custom domain
4. Configure email service
5. Add analytics
6. Share with the world! 🚀
