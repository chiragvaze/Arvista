import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, artworkId, rating, comment } = body;

    if (!userId || !artworkId || !rating) {
      return NextResponse.json(
        { error: 'userId, artworkId, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this artwork
    const existing = await prisma.review.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this artwork' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId,
        artworkId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        artwork: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// GET /api/reviews - Get reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artworkId = searchParams.get('artworkId');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (artworkId) where.artworkId = artworkId;
    if (userId) where.userId = userId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        artwork: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
