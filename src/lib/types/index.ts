export interface Artwork {
  id: string
  slug: string
  title: string
  description: string
  medium: string
  category: string
  tags: string[]
  year: number
  dimensions?: {
    width: number
    height: number
    unit: string
  }
  price?: number
  currency?: string
  availability: 'available' | 'sold' | 'not-for-sale' | 'commission-only'
  images: {
    original: string
    large: string
    medium: string
    thumbnail: string
    placeholder?: string
  }
  featured: boolean
  status: 'published' | 'draft' | 'archived'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  views?: number
  favorites?: number
}

export interface Collection {
  id: string
  slug: string
  name: string
  description: string
  artworkIds: string[]
  thumbnail?: string
  createdAt: string
  updatedAt: string
}
