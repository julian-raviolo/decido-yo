import { NextResponse } from 'next/server';
import type { RoomAction } from '@/lib/realtime';
import { applyActions } from '@/server/rooms';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const { actions } = (await req.json()) as { actions: RoomAction[] };
  if (!Array.isArray(actions)) return NextResponse.json({ error: 'Acciones inválidas' }, { status: 400 });
  const snap = applyActions(params.code, actions.slice(0, 50));
  if (!snap) return NextResponse.json({ error: 'No existe esa sala' }, { status: 404 });
  return NextResponse.json(snap);
}
