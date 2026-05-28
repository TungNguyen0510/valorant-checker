import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await db.getListingById(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    return NextResponse.json(listing);
  } catch (err: any) {
    console.error('API GET /api/shop/[id] error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'sold', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be active, sold, or cancelled' }, { status: 400 });
    }

    const listing = await db.getListingById(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.sellerId !== userId) {
      return NextResponse.json({ error: 'Forbidden. You do not own this listing' }, { status: 403 });
    }

    const success = await db.updateListingStatus(id, userId, status);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update listing status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    console.error('API PATCH /api/shop/[id] error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listing = await db.getListingById(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.sellerId !== userId) {
      return NextResponse.json({ error: 'Forbidden. You do not own this listing' }, { status: 403 });
    }

    const success = await db.deleteListing(id, userId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API DELETE /api/shop/[id] error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
