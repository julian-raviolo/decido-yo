import { roomReducer, type RoomAction, type Snapshot } from '@/lib/realtime';
import { MAX_PLAYERS } from '@/data/cards-catalog';
import type { Room } from '@/types/game';

/**
 * Almacén en memoria de las salas de amigos. Vive en el proceso de Node que
 * corre la app (tu Mac con `npm run dev -- -H 0.0.0.0`, o `npm start`).
 * Para producción serverless, reemplazar por Supabase / Redis.
 */
interface Entry {
  room: Room;
  version: number;
  touchedAt: number;
  subs: Set<(s: Snapshot) => void>;
}

const g = globalThis as unknown as { __decidoYoRooms?: Map<string, Entry> };
const rooms = (g.__decidoYoRooms ??= new Map<string, Entry>());

const TTL = 12 * 60 * 60 * 1000;

const sweep = () => {
  const now = Date.now();
  rooms.forEach((e, code) => {
    if (now - e.touchedAt > TTL) rooms.delete(code);
  });
};

const snapshot = (e: Entry | undefined): Snapshot => ({ room: e?.room ?? null, version: e?.version ?? 0 });

export function createRoom(room: Room): Snapshot | null {
  sweep();
  const code = room.code.toUpperCase();
  if (rooms.has(code)) return null;
  const entry: Entry = { room: { ...room, code }, version: 1, touchedAt: Date.now(), subs: new Set() };
  rooms.set(code, entry);
  return snapshot(entry);
}

export function getRoom(code: string): Snapshot {
  return snapshot(rooms.get(code.toUpperCase()));
}

const ALLOWED = new Set<RoomAction['type']>([
  'ADD_PLAYER',
  'REMOVE_PLAYER',
  'LOG',
  'ADD_PLAY',
  'SET_PLAY_STATUS',
  'PATCH_PLAY',
  'VOTE',
  'PATCH_PLAYER',
  'SET_CARD_STATE',
  'ADD_CARD',
  'REPLACE_CARD',
  'PUSH_INCOMING',
  'PATCH_INCOMING',
  'REMOVE_INCOMING',
  'SET_RPS',
  'PUSH_ROULETTE',
  'REMOVE_ROULETTE',
  'ADD_EFFECT',
  'ADD_RULE',
]);

export function applyActions(code: string, actions: RoomAction[]): Snapshot | null {
  const key = code.toUpperCase();
  const entry = rooms.get(key);
  if (!entry) return null;
  let room: Room | null = entry.room;
  for (const a of actions) {
    if (!a || !ALLOWED.has(a.type)) continue;
    // Clásico hasta 12 jugadores; HOT es exclusivo de parejas (2).
    if (a.type === 'ADD_PLAYER' && room && room.players.length >= MAX_PLAYERS[room.mode]) continue;
    // Fotos de prueba (Modo Online): tope de tamaño para no inflar la sala.
    if (a.type === 'PATCH_PLAY' && a.patch.evidence?.image && a.patch.evidence.image.length > 250_000) {
      a.patch.evidence = { ...a.patch.evidence, image: undefined };
    }
    room = roomReducer(room, a);
  }
  // Una vez votada, la foto se descarta: sólo queda el texto en la sala.
  if (room) {
    room = {
      ...room,
      table: room.table.map((p) =>
        p.status !== 'evidence' && p.evidence?.image ? { ...p, evidence: { ...p.evidence, image: undefined } } : p,
      ),
    };
  }
  entry.version += 1;
  entry.touchedAt = Date.now();
  if (!room || room.players.length === 0) {
    rooms.delete(key);
    const gone = { room: null, version: entry.version };
    entry.subs.forEach((fn) => fn(gone));
    return gone;
  }
  entry.room = room;
  const s = snapshot(entry);
  entry.subs.forEach((fn) => fn(s));
  return s;
}

export function subscribe(code: string, fn: (s: Snapshot) => void): () => void {
  const entry = rooms.get(code.toUpperCase());
  fn(snapshot(entry));
  if (!entry) return () => {};
  entry.subs.add(fn);
  return () => entry.subs.delete(fn);
}
