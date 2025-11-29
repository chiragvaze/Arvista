export interface Collection {
  id: string
  slug: string
  title: string
  description: string
  coverImage: string
  artworkIds: string[]
  year: number
  featured: boolean
}

export const collections: Collection[] = [
  {
    id: 'col-1',
    slug: 'coastal-visions',
    title: 'Coastal Visions',
    description: 'A series exploring the ever-changing moods of the Pacific coastline through various mediums and times of day.',
    coverImage: '/images/artwork-1-large.jpg',
    artworkIds: ['1', '4', '10'],
    year: 2024,
    featured: true,
  },
  {
    id: 'col-2',
    slug: 'urban-narratives',
    title: 'Urban Narratives',
    description: 'Stories of city life captured through portraiture, architecture, and everyday moments in metropolitan spaces.',
    coverImage: '/images/artwork-2-large.jpg',
    artworkIds: ['2', '9', '12', '18'],
    year: 2024,
    featured: true,
  },
  {
    id: 'col-3',
    slug: 'abstract-explorations',
    title: 'Abstract Explorations',
    description: 'A journey into color, form, and emotion through non-representational works that challenge perception.',
    coverImage: '/images/artwork-3-large.jpg',
    artworkIds: ['3', '16'],
    year: 2023,
    featured: true,
  },
  {
    id: 'col-4',
    slug: 'digital-dreamscapes',
    title: 'Digital Dreamscapes',
    description: 'Surreal digital compositions that blend reality with imagination, exploring themes of transformation and wonder.',
    coverImage: '/images/artwork-5-large.jpg',
    artworkIds: ['5', '13', '19'],
    year: 2024,
    featured: false,
  },
  {
    id: 'col-5',
    slug: 'natural-studies',
    title: 'Natural Studies',
    description: 'Intimate observations of botanical subjects and natural forms, celebrating the beauty of the organic world.',
    coverImage: '/images/artwork-11-large.jpg',
    artworkIds: ['11', '14'],
    year: 2024,
    featured: false,
  },
]
