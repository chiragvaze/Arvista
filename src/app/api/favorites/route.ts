import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/favorites - Add artwork to favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, artworkId } = body;

    if (!userId || !artworkId) {
      return NextResponse.json(
        { error: 'userId and artworkId are required' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Artwork already in favorites' },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        artworkId,
      },
      include: {
        artwork: {
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
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove artwork from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const artworkId = searchParams.get('artworkId');

    if (!userId || !artworkId) {
      return NextResponse.json(
        { error: 'userId and artworkId are required' },
        { status: 400 }
      );
    }

    await prisma.favorite.delete({
      where: {
        userId_artworkId: {
          userId,
          artworkId,
        },
      },
    });

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        artwork: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}
