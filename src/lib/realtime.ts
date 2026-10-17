import { SALIDUELO_HEARTS, hasVenue } from '@/data/venues-catalog';
import type {
  DuelRound,
  MiniGame,
  ActiveEffect,
  DuelSide,
  HandCard,
  Incoming,
  LogEntry,
  Player,
  PlayStatus,
  Room,
  RouletteRequest,
  RpsChoice,
  RpsMatch,
  Saliduelo,
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
  | { type: 'PATCH_PLAY'; playId: string; patch: Partial<Omit<TablePlay, 'id'>> }
  | { type: 'VOTE'; playId: string; playerId: string; vote: 'yes' | 'no' }
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
  | { type: 'SET_BOT_AUTO'; value: boolean }
  /* Piedra, Papel o Tijera sincronizado */
  | { type: 'RPS_CHOOSE'; rpsId: string; playerId: string; choice: RpsChoice; at: number }
  | { type: 'RPS_NEXT_ROUND'; rpsId: string; round: number; at: number }
  /* ⚔️ SALIDUELO */
  | { type: 'SALIDUELO_PICK'; playerId: string; venueId: string }
  | { type: 'SALIDUELO_START' }
  | { type: 'SALIDUELO_DAMAGE'; playId: string; playerId: string; at: number }
  | { type: 'SD_ROUND'; round: DuelRound }
  | { type: 'SD_RPS'; n: number; playerId: string; choice: RpsChoice }
  | { type: 'SD_REACT'; n: number; playerId: string; ms: number }
  | { type: 'SD_TAPS'; n: number; playerId: string; count: number; final: boolean };

const RPS_CHOICES: RpsChoice[] = ['ROCK', 'PAPER', 'SCISSORS'];
const other = (s: DuelSide): DuelSide => (s === 'A' ? 'B' : 'A');
const MINI_GAMES: MiniGame[] = ['RPS', 'REFLEX', 'TAP'];
const BEATS_RPS: Record<RpsChoice, RpsChoice> = { ROCK: 'SCISSORS', PAPER: 'ROCK', SCISSORS: 'PAPER' };
const repSide = (r: DuelRound, id: string): DuelSide | null => (r.reps.A === id ? 'A' : r.reps.B === id ? 'B' : null);
const withRound = (room: Room, sd: Saliduelo, round: DuelRound): Room => ({ ...room, saliduelo: { ...sd, round } });
/** Cierra la mano: suma la victoria y, con 2 manos ganadas, termina el duelo. */
function finishRound(room: Room, sd: Saliduelo, round: DuelRound, winner: DuelSide): Room {
  const wins = { ...(sd.wins ?? { A: 0, B: 0 }) };
  wins[winner] += 1;
  const won = wins[winner] >= 2;
  return {
    ...room,
    saliduelo: {
      ...sd,
      wins,
      round: { ...round, winner },
      history: [...(sd.history ?? []), { n: round.n, game: round.game, winner }],
      ...(won ? { phase: 'won' as const, winner } : {}),
    },
  };
}

/**
 * Elección de lugar. Reglas de bandos:
 * - el primer local elegido es el Lugar A; el primer local distinto, el Lugar B;
 * - elegir un local que ya es A o B te suma a ese bando;
 * - en salas de 2 (incluida HOT) cada uno defiende su propio lugar;
 * - durante la batalla sólo se puede sumar a A o B (para quien llega tarde).
 */
function pickVenue(room: Room, s: Saliduelo, playerId: string, venueId: string): Saliduelo | null {
  if (s.phase === 'won' || !hasVenue(venueId) || !room.players.some((p) => p.id === playerId)) return null;
  const sides = { ...s.sides };
  const picks = { ...s.picks };
  const members = (side: DuelSide) => Object.keys(picks).filter((id) => picks[id] === side);
  const cur = picks[playerId];
  const duo = room.players.length <= 2;

  // Re-elección en la fase de elección: si estás solo en tu bando, cambiás el local de tu bando.
  if (s.phase === 'pick' && cur && sides[cur] && sides[cur]!.venueId !== venueId) {
    const alone = members(cur).every((id) => id === playerId);
    if (alone && sides[other(cur)]?.venueId !== venueId) {
      sides[cur] = { venueId, hearts: SALIDUELO_HEARTS };
      return { ...s, sides };
    }
  }

  let side: DuelSide | null = null;
  if (sides.A?.venueId === venueId) side = 'A';
  else if (sides.B?.venueId === venueId) side = 'B';
  else if (s.phase === 'pick' && !sides.A) side = 'A';
  else if (s.phase === 'pick' && !sides.B) side = 'B';
  if (!side) return null;
  if (side === cur) return null;
  // De a dos, cada uno defiende su lugar: no te podés sumar al bando del otro.
  if (duo && members(side).some((id) => id !== playerId)) return null;
  if (!sides[side]) sides[side] = { venueId, hearts: SALIDUELO_HEARTS };
  picks[playerId] = side;

  // Un bando que quedó vacío durante la elección se libera.
  if (s.phase === 'pick') {
    for (const x of ['A', 'B'] as const) {
      if (sides[x] && !Object.values(picks).includes(x)) delete sides[x];
    }
    // Si sólo quedó B, pasa a ser A.
    if (!sides.A && sides.B) {
      sides.A = sides.B;
      delete sides.B;
      for (const id of Object.keys(picks)) picks[id] = 'A';
    }
  }

  const next: Saliduelo = { ...s, sides, picks };
  // Todos eligieron y hay dos lugares: arranca la batalla sola.
  if (next.phase === 'pick' && sides.A && sides.B && room.players.every((p) => picks[p.id])) next.phase = 'battle';
  return next;
}

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
    case 'REMOVE_PLAYER': {
      const sd = room.saliduelo;
      let saliduelo = sd;
      if (sd && sd.picks[action.playerId]) {
        const picks = { ...sd.picks };
        delete picks[action.playerId];
        saliduelo = { ...sd, picks };
      }
      return {
        ...room,
        ...(saliduelo ? { saliduelo } : {}),
        players: room.players.filter((p) => p.id !== action.playerId),
        incoming: room.incoming.filter((i) => i.targetId !== action.playerId),
        roulettes: room.roulettes.filter((r) => r.playerId !== action.playerId),
        rps:
          room.rps && (room.rps.attackerId === action.playerId || room.rps.defenderId === action.playerId)
            ? null
            : room.rps,
      };
    }
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
    case 'PATCH_PLAY':
      return {
        ...room,
        table: room.table.map((p) => (p.id === action.playId ? { ...p, ...action.patch } : p)),
      };
    case 'VOTE':
      return {
        ...room,
        table: room.table.map((p) =>
          p.id === action.playId && p.status === 'evidence'
            ? { ...p, votes: { ...(p.votes ?? {}), [action.playerId]: action.vote } }
            : p,
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

    case 'RPS_CHOOSE': {
      const rps = room.rps;
      if (!rps || rps.id !== action.rpsId || !RPS_CHOICES.includes(action.choice)) return room;
      if (action.playerId !== rps.attackerId && action.playerId !== rps.defenderId) return room;
      // Idempotente: la primera jugada de la ronda es la que vale.
      if (rps.choices?.[action.playerId]) return room;
      const choices = { ...(rps.choices ?? {}), [action.playerId]: action.choice };
      const both = !!choices[rps.attackerId] && !!choices[rps.defenderId];
      return { ...room, rps: { ...rps, choices, ...(both ? { revealAt: action.at } : {}) } };
    }
    case 'RPS_NEXT_ROUND': {
      const rps = room.rps;
      if (!rps || rps.id !== action.rpsId || (rps.round ?? 0) !== action.round) return room;
      return { ...room, rps: { ...rps, choices: {}, round: action.round + 1, roundAt: action.at, revealAt: undefined } };
    }

    case 'SALIDUELO_PICK': {
      if (!room.saliduelo) return room;
      const next = pickVenue(room, room.saliduelo, action.playerId, action.venueId);
      return next ? { ...room, saliduelo: next } : room;
    }
    case 'SALIDUELO_START': {
      const sd = room.saliduelo;
      if (!sd || sd.phase !== 'pick' || !sd.sides.A || !sd.sides.B) return room;
      return { ...room, saliduelo: { ...sd, phase: 'battle' } };
    }
    case 'SD_ROUND': {
      const sd = room.saliduelo;
      const r = action.round;
      if (!sd || sd.phase !== 'battle' || r.n !== (sd.round?.n ?? 0) + 1 || (sd.round && !sd.round.winner)) return room;
      if (!MINI_GAMES.includes(r.game) || !r.reps?.A || !r.reps?.B) return room;
      return { ...room, saliduelo: { ...sd, wins: sd.wins ?? { A: 0, B: 0 }, round: { ...r, ties: 0 } } };
    }
    case 'SD_RPS': {
      const sd = room.saliduelo;
      const r = sd?.round;
      const side = r && repSide(r, action.playerId);
      if (!sd || !r || r.n !== action.n || r.game !== 'RPS' || r.winner || !side || !RPS_CHOICES.includes(action.choice))
        return room;
      if (r.choices?.[action.playerId]) return room;
      const choices = { ...(r.choices ?? {}), [action.playerId]: action.choice };
      const a = choices[r.reps.A];
      const b = choices[r.reps.B];
      if (!a || !b) return withRound(room, sd, { ...r, choices });
      if (a === b) return withRound(room, sd, { ...r, choices: {}, ties: r.ties + 1, last: choices });
      return finishRound(room, sd, { ...r, choices, last: choices }, BEATS_RPS[a] === b ? 'A' : 'B');
    }
    case 'SD_REACT': {
      const sd = room.saliduelo;
      const r = sd?.round;
      const side = r && repSide(r, action.playerId);
      if (!sd || !r || r.n !== action.n || r.game !== 'REFLEX' || r.winner || !side) return room;
      if (r.reactions?.[action.playerId] !== undefined) return room;
      const reactions = { ...(r.reactions ?? {}), [action.playerId]: action.ms };
      const next = { ...r, reactions };
      if (action.ms < 0) return finishRound(room, sd, next, other(side));
      const a = reactions[r.reps.A];
      const b = reactions[r.reps.B];
      if (a === undefined || b === undefined) return withRound(room, sd, next);
      return finishRound(room, sd, next, a <= b ? 'A' : 'B');
    }
    case 'SD_TAPS': {
      const sd = room.saliduelo;
      const r = sd?.round;
      const side = r && repSide(r, action.playerId);
      if (!sd || !r || r.n !== action.n || r.game !== 'TAP' || r.winner || !side || r.done?.[action.playerId]) return room;
      const taps = { ...(r.taps ?? {}), [action.playerId]: Math.max(r.taps?.[action.playerId] ?? 0, Math.min(200, action.count)) };
      const done = action.final ? { ...(r.done ?? {}), [action.playerId]: true } : r.done;
      const next = { ...r, taps, done };
      if (!done?.[r.reps.A] || !done?.[r.reps.B]) return withRound(room, sd, next);
      const a = taps[r.reps.A] ?? 0;
      const b = taps[r.reps.B] ?? 0;
      if (a === b) return withRound(room, sd, { ...next, taps: {}, done: {}, ties: r.ties + 1 });
      return finishRound(room, sd, next, a > b ? 'A' : 'B');
    }
    case 'SALIDUELO_DAMAGE': {
      const sd = room.saliduelo;
      const side = sd?.picks[action.playerId];
      if (!sd || sd.phase !== 'battle' || !side || sd.hits.includes(action.playId)) return room;
      const hit = sd.sides[side];
      if (!hit) return room;
      const hearts = Math.max(0, hit.hearts - 1);
      const won = hearts === 0;
      return {
        ...room,
        saliduelo: {
          ...sd,
          sides: { ...sd.sides, [side]: { ...hit, hearts } },
          hits: [...sd.hits, action.playId].slice(-60),
          lastHit: { id: action.playId, side, at: action.at },
          ...(won ? { phase: 'won' as const, winner: other(side) } : {}),
        },
      };
    }
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
