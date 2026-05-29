import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const account = await db.getAccountById(userId, id);

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  // Return full data but strip tokens
  const { accessToken, idToken, ...safeAccount } = account;

  const listing = await db.getListingByAccountId(id);
  const responseData = {
    ...safeAccount,
    listing: listing ? {
      id: listing.id,
      price: listing.price,
      description: listing.description,
      status: listing.status,
      contactInfo: listing.contactInfo,
    } : null
  };
  return NextResponse.json(responseData);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await db.deleteAccount(userId, id);
  
  const activeId = await db.getActiveAccountId(userId);
  if (activeId === id) {
    await db.setActiveAccountId(userId, null);
  }
  
  return NextResponse.json({ success: true });
}
