import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as db from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const accounts = await db.getAccounts(userId);
  const updated = accounts.filter((a) => a.id !== id);
  await db.saveAccounts(userId, updated);
  
  const activeId = await db.getActiveAccountId(userId);
  if (activeId === id) {
    await db.setActiveAccountId(userId, null);
  }
  
  return NextResponse.json({ success: true });
}
