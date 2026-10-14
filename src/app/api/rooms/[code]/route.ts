import { NextResponse } from 'next/server';
import { getRoom } from '@/server/rooms';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const snap = getRoom(params.code);
  if (!snap.room) return NextResponse.json({ error: 'No existe esa sala' }, { status: 404 });
  return NextResponse.json(snap);
}
