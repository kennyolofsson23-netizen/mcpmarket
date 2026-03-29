import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsageSummary } from '@/lib/metering';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const serverId = url.searchParams.get('serverId');
    if (!serverId) {
      return NextResponse.json({ error: 'serverId is required' }, { status: 400 });
    }

    const summary = await getUsageSummary(session.user.id, serverId);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
