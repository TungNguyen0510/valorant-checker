import { NextRequest, NextResponse } from 'next/server';
import { getValorantData } from '@/lib/valorant';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, idToken } = await req.json();

    if (!accessToken || !idToken) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const data = await getValorantData(accessToken, idToken);
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
