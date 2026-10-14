import { NextResponse } from 'next/server';
import { createRoom } from '@/server/rooms';
import type { Room } from '@/types/game';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { room } = (await req.json()) as { room: Room };
  if (!room?.code || !Array.isArray(room.players)) {
    return NextResponse.json({ error: 'Sala inválida' }, { status: 400 });
  }
  const snap = createRoom(room);
  if (!snap) return NextResponse.json({ error: 'Ese código ya existe' }, { status: 409 });
  return NextResponse.json(snap);
}
