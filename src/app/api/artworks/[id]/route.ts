import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/artworks/[id] - Get single artwork by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const artwork = await prisma.artwork.findUnique({
      where: { id },
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
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating = artwork.reviews.length > 0
      ? artwork.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / artwork.reviews.length
      : 0;

    const artworkWithStats = {
      ...artwork,
      averageRating: Math.round(avgRating * 10) / 10,
      favoriteCount: artwork._count.favorites,
    };

    return NextResponse.json(artworkWithStats);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artwork' },
      { status: 500 }
    );
  }
}

// PATCH /api/artworks/[id] - Update artwork (admin/artist only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      title,
      description,
      price,
      imageUrl,
      dimensions,
      medium,
      year,
      status,
      featured,
      categoryId,
      collectionIds,
      tagNames,
    } = body;

    // Build update data
    const updateData: any = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (dimensions) updateData.dimensions = dimensions;
    if (medium) updateData.medium = medium;
    if (year !== undefined) updateData.year = year;
    if (status) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;
    if (categoryId) updateData.categoryId = categoryId;

    // Handle collections
    if (collectionIds) {
      updateData.collections = {
        set: collectionIds.map((id: string) => ({ id })),
      };
    }

    // Handle tags
    if (tagNames) {
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
      updateData.tags = {
        set: tags,
      };
    }

    const artwork = await prisma.artwork.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(artwork);
  } catch (error) {
    console.error('Error updating artwork:', error);
    return NextResponse.json(
      { error: 'Failed to update artwork' },
      { status: 500 }
    );
  }
}

// DELETE /api/artworks/[id] - Delete artwork (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    await prisma.artwork.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return NextResponse.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    );
  }
}
