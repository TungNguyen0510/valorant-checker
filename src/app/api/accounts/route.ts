import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as db from '@/lib/db';
import { getValorantData } from '@/lib/valorant';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accounts = await db.getAccounts(userId);
  const safeAccounts = accounts.map(({ accessToken, idToken, ...rest }) => rest);
  return NextResponse.json(safeAccounts);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { accessToken, idToken } = body;

  if (!accessToken || !idToken) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
  }

  try {
    const data = await getValorantData(accessToken, idToken);
    
    const newAccount = {
      id: data.puuid,
      name: data.user.acct.game_name,
      tag: data.user.acct.tag_line,
      accessToken,
      idToken,
      lastUpdated: Date.now(),
      data: data
    };

    const accounts = await db.getAccounts(userId);
    const index = accounts.findIndex((a) => a.id === newAccount.id);
    
    if (index >= 0) {
      accounts[index] = newAccount;
    } else {
      accounts.push(newAccount);
    }
    
    await db.saveAccounts(userId, accounts);
    
    // Return safe version
    const { accessToken: _, idToken: __, ...safeAccount } = newAccount;
    return NextResponse.json(safeAccount);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
