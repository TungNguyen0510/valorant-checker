import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
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

    // Fetch Clerk user details for sellerName
    let sellerName = listing.sellerId;
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(listing.sellerId);
      if (user) {
        if (user.username) {
          sellerName = user.username;
        } else if (user.firstName || user.lastName) {
          sellerName = [user.firstName, user.lastName].filter(Boolean).join(' ');
        } else if (user.emailAddresses?.[0]?.emailAddress) {
          sellerName = user.emailAddresses[0].emailAddress;
        }
      }
    } catch (clerkErr) {
      console.error('Failed to fetch clerk user details for seller:', clerkErr);
    }

    return NextResponse.json({
      ...listing,
      sellerName,
    });
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
