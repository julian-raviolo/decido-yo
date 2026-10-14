import type {
  ActiveEffect,
  HandCard,
  Incoming,
  LogEntry,
  Player,
  PlayStatus,
  Room,
  RouletteRequest,
  RpsMatch,
  TablePlay,
} from '@/types/game';

/**
 * Todas las mutaciones de una sala son acciones serializables. Cada dispositivo
 * las aplica con el mismo reducer; en salas de amigos el servidor las ordena y
 * reparte el estado resultante a todos los teléfonos.
 */
export type RoomAction =
  | { type: 'SET_ROOM'; room: Room | null }
  | { type: 'ADD_PLAYER'; player: Player }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'LOG'; entry: LogEntry }
  | { type: 'ADD_PLAY'; play: TablePlay }
  | { type: 'SET_PLAY_STATUS'; playId: string; status: PlayStatus; note?: string }
  | { type: 'PATCH_PLAYER'; playerId: string; patch: Partial<Omit<Player, 'actions' | 'defenses'>> }
  | { type: 'SET_CARD_STATE'; playerId: string; uid: string; state: HandCard['state'] }
  | { type: 'ADD_CARD'; playerId: string; slot: 'actions' | 'defenses'; card: HandCard }
  | { type: 'REPLACE_CARD'; playerId: string; uid: string; card: HandCard }
  | { type: 'PUSH_INCOMING'; incoming: Incoming }
  | { type: 'PATCH_INCOMING'; id: string; patch: Partial<Incoming> }
  | { type: 'REMOVE_INCOMING'; id: string }
  | { type: 'SET_RPS'; rps: RpsMatch | null }
  | { type: 'PUSH_ROULETTE'; request: RouletteRequest }
  | { type: 'REMOVE_ROULETTE'; id: string }
  | { type: 'ADD_EFFECT'; effect: ActiveEffect }
  | { type: 'ADD_RULE'; rule: Room['rules'][number] }
  | { type: 'SET_BOT_AUTO'; value: boolean };

const mapPlayer = (room: Room, id: string, fn: (p: Player) => Player): Room => ({
  ...room,
  players: room.players.map((p) => (p.id === id ? fn(p) : p)),
});

const mapCards = (p: Player, fn: (c: HandCard) => HandCard): Player => ({
  ...p,
  actions: p.actions.map(fn),
  defenses: p.defenses.map(fn),
});

export function roomReducer(room: Room | null, action: RoomAction): Room | null {
  if (action.type === 'SET_ROOM') return action.room;
  if (!room) return room;

  switch (action.type) {
    case 'ADD_PLAYER':
      if (room.players.some((p) => p.id === action.player.id)) return room;
      return { ...room, players: [...room.players, { ...action.player, isMe: false }] };
    case 'REMOVE_PLAYER':
      return {
        ...room,
        players: room.players.filter((p) => p.id !== action.playerId),
        incoming: room.incoming.filter((i) => i.targetId !== action.playerId),
        roulettes: room.roulettes.filter((r) => r.playerId !== action.playerId),
        rps:
          room.rps && (room.rps.attackerId === action.playerId || room.rps.defenderId === action.playerId)
            ? null
            : room.rps,
      };
    case 'LOG':
      return { ...room, log: [action.entry, ...room.log].slice(0, 80) };
    case 'ADD_PLAY':
      return { ...room, table: [...room.table, action.play].slice(-40) };
    case 'SET_PLAY_STATUS':
      return {
        ...room,
        table: room.table.map((p) =>
          p.id === action.playId ? { ...p, status: action.status, note: action.note ?? p.note } : p,
        ),
      };
    case 'PATCH_PLAYER':
      return mapPlayer(room, action.playerId, (p) => ({ ...p, ...action.patch }));
    case 'SET_CARD_STATE':
      return mapPlayer(room, action.playerId, (p) =>
        mapCards(p, (c) => (c.uid === action.uid ? { ...c, state: action.state } : c)),
      );
    case 'ADD_CARD':
      return mapPlayer(room, action.playerId, (p) => ({ ...p, [action.slot]: [...p[action.slot], action.card] }));
    case 'REPLACE_CARD':
      return mapPlayer(room, action.playerId, (p) => mapCards(p, (c) => (c.uid === action.uid ? action.card : c)));
    case 'PUSH_INCOMING':
      return { ...room, incoming: [...room.incoming, action.incoming] };
    case 'PATCH_INCOMING':
      return {
        ...room,
        incoming: room.incoming.map((i) => (i.id === action.id ? { ...i, ...action.patch } : i)),
      };
    case 'REMOVE_INCOMING':
      return { ...room, incoming: room.incoming.filter((i) => i.id !== action.id) };
    case 'SET_RPS':
      return { ...room, rps: action.rps };
    case 'PUSH_ROULETTE':
      return { ...room, roulettes: [...room.roulettes, action.request] };
    case 'REMOVE_ROULETTE':
      return { ...room, roulettes: room.roulettes.filter((r) => r.id !== action.id) };
    case 'ADD_EFFECT':
      return { ...room, effects: [...room.effects, action.effect] };
    case 'ADD_RULE':
      return { ...room, rules: [...room.rules, action.rule] };
    case 'SET_BOT_AUTO':
      return { ...room, botAuto: action.value };
    default:
      return room;
  }
}

/* ------------------------------------------------------------------ */
/* Transporte                                                          */
/* ------------------------------------------------------------------ */

/**
 * El store aplica cada acción localmente (optimista, síncrono) y luego la
 * publica. El estado oficial que llega del servidor reemplaza al local.
 */
export interface RoomTransport {
  readonly kind: 'local' | 'server';
  publish(action: RoomAction): void;
  disconnect(): void;
}

/** Modo prueba con bots: un solo dispositivo, nada que difundir. */
export const createLocalTransport = (): RoomTransport => ({
  kind: 'local',
  publish: () => {},
  disconnect: () => {},
});

export interface Snapshot {
  room: Room | null;
  version: number;
}

/**
 * Salas de amigos: el servidor de la app (Next.js) guarda la sala en memoria,
 * aplica las acciones en orden y empuja el estado por Server-Sent Events.
 */
export const createServerTransport = (
  code: string,
  onSnapshot: (s: Snapshot) => void,
  onStatus?: (online: boolean) => void,
): RoomTransport => {
  let queue: RoomAction[] = [];
  let inflight = false;
  let closed = false;
  let latest: Snapshot | null = null;
  let applied = -1;

  // Sólo entregamos un snapshot cuando no hay acciones propias en vuelo,
  // así el estado optimista no "parpadea" hacia atrás.
  const deliver = () => {
    if (closed || inflight || queue.length || !latest || latest.version <= applied) return;
    applied = latest.version;
    onSnapshot(latest);
  };
  const consider = (s: Snapshot) => {
    if (!latest || s.version >= latest.version) latest = s;
    deliver();
  };

  const flush = async () => {
    if (inflight || !queue.length || closed) return;
    inflight = true;
    const batch = queue;
    queue = [];
    try {
      const res = await fetch(`/api/rooms/${code}/actions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ actions: batch }),
      });
      if (res.ok) consider((await res.json()) as Snapshot);
      else if (res.status === 404) consider({ room: null, version: Number.MAX_SAFE_INTEGER });
    } catch {
      onStatus?.(false);
      queue = [...batch, ...queue]; // reintentar
      await new Promise((r) => setTimeout(r, 1500));
    } finally {
      inflight = false;
      if (queue.length) void flush();
      else deliver();
    }
  };

  const es = new EventSource(`/api/rooms/${code}/stream`);
  es.onmessage = (e) => {
    onStatus?.(true);
    try {
      consider(JSON.parse(e.data) as Snapshot);
    } catch {
      /* ignore */
    }
  };
  es.onerror = () => onStatus?.(false);

  return {
    kind: 'server',
    publish(action) {
      if (action.type === 'SET_ROOM') return;
      queue.push(action);
      queueMicrotask(() => void flush());
    },
    disconnect() {
      closed = true;
      es.close();
    },
  };
};
