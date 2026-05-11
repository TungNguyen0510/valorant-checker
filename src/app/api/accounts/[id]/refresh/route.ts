import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as db from '@/lib/db';
import { getValorantData } from '@/lib/valorant';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const accounts = await db.getAccounts(userId);
  const account = accounts.find((a) => a.id === id);

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  try {
    const data = await getValorantData(account.accessToken, account.idToken);
    
    account.data = data;
    account.lastUpdated = Date.now();
    
    await db.saveAccounts(userId, accounts);
    
    const { accessToken, idToken, ...safeAccount } = account;
    return NextResponse.json(safeAccount);
  } catch (err: any) {
    console.error('Refresh account error:', err);
    if (err.message.includes('401')) {
      return NextResponse.json({ error: 'Riot tokens expired. Please re-add your account.' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
