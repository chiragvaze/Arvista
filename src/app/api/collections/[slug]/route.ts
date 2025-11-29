import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/collections/[slug] - Get collection by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        artworks: {
          include: {
            category: true,
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
            tags: true,
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
        },
        _count: {
          select: {
            artworks: true,
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Add ratings to artworks
    const artworksWithRatings = await Promise.all(
      collection.artworks.map(async (artwork: any) => {
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
          favoriteCount: artwork._count.favorites,
        };
      })
    );

    const collectionWithStats = {
      ...collection,
      artworks: artworksWithRatings,
      artworkCount: collection._count.artworks,
    };

    return NextResponse.json(collectionWithStats);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// PATCH /api/collections/[slug] - Update collection (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const body = await request.json();

    const {
      name,
      description,
      imageUrl,
      featured,
      artworkIds,
    } = body;

    const updateData: any = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (featured !== undefined) updateData.featured = featured;

    if (artworkIds) {
      updateData.artworks = {
        set: artworkIds.map((id: string) => ({ id })),
      };
    }

    const collection = await prisma.collection.update({
      where: { slug },
      data: updateData,
      include: {
        artworks: true,
        _count: {
          select: {
            artworks: true,
          },
        },
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[slug] - Delete collection (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    await prisma.collection.delete({
      where: { slug },
    });

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
