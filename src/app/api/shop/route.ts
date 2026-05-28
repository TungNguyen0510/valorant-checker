import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const search = searchParams.get('search') || undefined;
    const region = searchParams.get('region') || undefined;
    const rankStr = searchParams.get('rank');
    const rank = rankStr ? parseInt(rankStr, 10) : undefined;
    const minPriceStr = searchParams.get('minPrice');
    const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
    const maxPriceStr = searchParams.get('maxPrice');
    const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'newest';
    const skinsStr = searchParams.get('skins');
    const skins = skinsStr ? skinsStr.split(',') : undefined;

    const result = await db.getListings({
      page,
      limit,
      search,
      region,
      rank,
      minPrice,
      maxPrice,
      sortBy,
      skins
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API GET /api/shop error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, price, description, contactInfo } = body;

    if (!accountId || !price || !contactInfo) {
      return NextResponse.json({ error: 'Missing required fields: accountId, price, contactInfo' }, { status: 400 });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    // 1. Verify user owns this Valorant account
    const accounts = await db.getAccounts(userId);
    const ownsAccount = accounts.some(acc => acc.id === accountId);
    if (!ownsAccount) {
      return NextResponse.json({ error: 'You do not own this account' }, { status: 403 });
    }

    // 2. Check if already listed
    const existingListing = await db.getListingByAccountId(accountId);
    if (existingListing && existingListing.status === 'active') {
      return NextResponse.json({ error: 'This account is already listed for sale' }, { status: 400 });
    }

    // If an inactive listing exists, delete it first to avoid duplicate DB constraints
    if (existingListing) {
      await db.deleteListing(existingListing.id, existingListing.sellerId);
    }

    const listingId = crypto.randomUUID();

    const success = await db.createListing({
      id: listingId,
      accountId,
      sellerId: userId,
      price: priceNum,
      description,
      contactInfo
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: listingId });
  } catch (err: any) {
    console.error('API POST /api/shop error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
