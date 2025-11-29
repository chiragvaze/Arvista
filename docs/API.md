# API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### POST /api/auth/[...nextauth]
NextAuth endpoints for sign in/sign out.
- Credentials provider (email/password)
- Google OAuth provider

---

## Artworks Endpoints

### GET /api/artworks
Get all artworks with optional filters.

**Query Parameters:**
- `category` - Filter by category ID
- `collection` - Filter by collection ID
- `status` - Filter by status (AVAILABLE, SOLD, RESERVED)
- `featured` - Filter featured artworks (true/false)
- `limit` - Limit number of results

**Response:**
```json
[
  {
    "id": "...",
    "title": "Artwork Title",
    "description": "...",
    "price": 1000,
    "imageUrl": "...",
    "averageRating": 4.5,
    "favoriteCount": 10,
    "artist": { "id": "...", "name": "..." }
  }
]
```

### POST /api/artworks
Create new artwork (admin/artist only).

**Request Body:**
```json
{
  "title": "New Artwork",
  "description": "Description",
  "artistId": "user-id",
  "categoryId": "category-id",
  "price": 1000,
  "imageUrl": "https://...",
  "dimensions": "24x36 inches",
  "medium": "Oil on canvas",
  "year": 2024,
  "status": "AVAILABLE",
  "featured": false,
  "collectionIds": ["..."],
  "tagNames": ["abstract", "modern"]
}
```

### GET /api/artworks/[id]
Get single artwork by ID with reviews and ratings.

### PATCH /api/artworks/[id]
Update artwork (admin/artist only).

### DELETE /api/artworks/[id]
Delete artwork (admin only).

---

## Collections Endpoints

### GET /api/collections
Get all collections.

**Query Parameters:**
- `featured` - Filter featured collections (true/false)

### POST /api/collections
Create new collection (admin only).

**Request Body:**
```json
{
  "name": "Collection Name",
  "description": "...",
  "slug": "collection-slug",
  "imageUrl": "https://...",
  "featured": false,
  "artworkIds": ["..."]
}
```

### GET /api/collections/[slug]
Get collection by slug with all artworks.

### PATCH /api/collections/[slug]
Update collection (admin only).

### DELETE /api/collections/[slug]
Delete collection (admin only).

---

## Categories Endpoints

### GET /api/categories
Get all categories with artwork counts.

### POST /api/categories
Create new category (admin only).

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "...",
  "slug": "category-slug"
}
```

---

## Contact Endpoints

### POST /api/contact
Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Message content"
}
```

### GET /api/contact
Get all contact messages (admin only).

**Query Parameters:**
- `status` - Filter by status (PENDING, REPLIED, RESOLVED)

---

## Newsletter Endpoints

### POST /api/newsletter
Subscribe to newsletter.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### DELETE /api/newsletter
Unsubscribe from newsletter.

**Query Parameters:**
- `email` - Email to unsubscribe

---

## Favorites Endpoints

### POST /api/favorites
Add artwork to favorites.

**Request Body:**
```json
{
  "userId": "user-id",
  "artworkId": "artwork-id"
}
```

### GET /api/favorites
Get user's favorites.

**Query Parameters:**
- `userId` - User ID (required)

### DELETE /api/favorites
Remove artwork from favorites.

**Query Parameters:**
- `userId` - User ID
- `artworkId` - Artwork ID

---

## Reviews Endpoints

### POST /api/reviews
Create a review.

**Request Body:**
```json
{
  "userId": "user-id",
  "artworkId": "artwork-id",
  "rating": 5,
  "comment": "Great artwork!"
}
```

### GET /api/reviews
Get reviews.

**Query Parameters:**
- `artworkId` - Filter by artwork
- `userId` - Filter by user

---

## Upload Endpoints

### POST /api/upload
Upload image to Supabase Storage.

**Request Body (multipart/form-data):**
- `file` - Image file (JPEG, PNG, WebP)
- `folder` - Destination folder (default: "artworks")

**Response:**
```json
{
  "url": "https://...",
  "path": "artworks/...",
  "message": "File uploaded successfully"
}
```

### DELETE /api/upload
Delete image from Supabase Storage.

**Query Parameters:**
- `path` - File path to delete

---

## Authentication

Most endpoints require authentication. Include the session token from NextAuth in your requests.

For admin-only endpoints, the user must have role `ADMIN` in the database.
For artist endpoints, the user must have role `ARTIST` or `ADMIN`.

## Error Responses

All endpoints return errors in the format:
```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
