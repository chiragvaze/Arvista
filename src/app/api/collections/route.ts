import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/collections - Get all collections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');

    const where: any = {};

    if (featured === 'true') {
      where.featured = true;
    }

    const collections = await prisma.collection.findMany({
      where,
      include: {
        artworks: {
          take: 6,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            category: true,
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            artworks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const collectionsWithCount = collections.map((collection: any) => ({
      ...collection,
      artworkCount: collection._count.artworks,
    }));

    return NextResponse.json(collectionsWithCount);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/collections - Create new collection (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      slug,
      coverImage,
      year,
      isPublished = false,
      artworkIds = [],
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        title,
        description: description || '',
        slug,
        coverImage: coverImage || '',
        year: year || null,
        isPublished,
        artworks: artworkIds.length > 0 ? {
          connect: artworkIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        artworks: true,
        _count: {
          select: {
            artworks: true,
          },
        },
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
