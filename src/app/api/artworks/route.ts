import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/artworks - Get all artworks with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const collection = searchParams.get('collection');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    const where: any = {};

    if (category) {
      where.categoryId = category;
    }

    if (collection) {
      where.collectionId = collection;
    }

    if (status) {
      where.status = status;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const artworks = await prisma.artwork.findMany({
      where,
      include: {
        category: true,
        collection: true,
        tags: true,
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    });

    // Calculate average rating for each artwork
    const artworksWithRating = await Promise.all(
      artworks.map(async (artwork: any) => {
        const reviews = await prisma.review.findMany({
          where: { artworkId: artwork.id },
          select: { rating: true },
        });

        const avgRating = reviews.length > 0
          ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
          : 0;

        return {
          ...artwork,
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          favoriteCount: artwork._count.favorites,
        };
      })
    );

    return NextResponse.json(artworksWithRating);
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    );
  }
}

// POST /api/artworks - Create new artwork (admin/artist only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      artistId,
      categoryId,
      price,
      imageUrl,
      dimensions,
      medium,
      year,
      status = 'AVAILABLE',
      featured = false,
      collectionIds = [],
      tagNames = [],
    } = body;

    // Validate required fields
    if (!title || !artistId || !categoryId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or connect tags
    const tags = await Promise.all(
      tagNames.map(async (name: string) => {
        const tag = await prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        return { id: tag.id };
      })
    );

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    // Create artwork
    const artwork = await prisma.artwork.create({
      data: {
        title,
        slug,
        description,
        price,
        imageUrl,
        images: [],
        dimensions,
        medium,
        year,
        isAvailable: status === 'AVAILABLE',
        isFeatured: featured,
        artist: {
          connect: { id: artistId },
        },
        category: {
          connect: { id: categoryId },
        },
        collection: collectionIds && collectionIds.length > 0 ? {
          connect: { id: collectionIds[0] },
        } : undefined,
        tags: {
          connect: tags,
        },
      },
      include: {
        category: true,
        collection: true,
        tags: true,
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(artwork, { status: 201 });
  } catch (error) {
    console.error('Error creating artwork:', error);
    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    );
  }
}
