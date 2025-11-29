import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === 'UNSUBSCRIBED') {
        // Resubscribe
        await prisma.newsletter.update({
          where: { email },
          data: { status: 'SUBSCRIBED' },
        });
        return NextResponse.json({
          message: 'Successfully resubscribed to newsletter!',
        });
      }
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      );
    }

    // Subscribe
    await prisma.newsletter.create({
      data: {
        email,
        status: 'SUBSCRIBED',
      },
    });

    // TODO: Send welcome email when Resend API is configured

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

// DELETE /api/newsletter - Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await prisma.newsletter.update({
      where: { email },
      data: { status: 'UNSUBSCRIBED' },
    });

    return NextResponse.json({
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    );
  }
}
