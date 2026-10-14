import type { LucideIcon } from 'lucide-react';

/** Modo de juego: Clásico o HOT (picante soft). */
export type GameMode = 'classic' | 'hot';

export type Category =
  | 'FOOD'
  | 'SOCIAL'
  | 'DESTINY'
  | 'SPECIAL'
  | 'DEFENSE'
  /* HOT */
  | 'DEVIL'
  | 'ANGEL';

/** Cómo se apunta una carta de acción. */
export type TargetMode = 'single' | 'table' | 'random';

/** Qué hace una carta de defensa en modo reactivo. */
export type DefenseEffect = 'NULLIFY' | 'REFLECT' | 'REDIRECT' | 'DOUBLE_OR_NOTHING' | 'IMMUNITY';

/** Comportamientos digitales de las cartas legendarias. */
export type SpecialEffect = 'ABSOLUTE' | 'BLOOD_PACT' | 'RUSSIAN_ROULETTE' | 'LOOTER';

export interface CardDef {
  id: string;
  name: string;
  description: string;
  category: Category;
  mode: GameMode;
  /** Rareza: peso en el sorteo semanal (más copias = más chance de salir). */
  copies: number;
  icon: LucideIcon;
  /** Si el efecto dura un tiempo, se muestra como efecto activo en la mesa. */
  durationMin?: number;
  targetMode?: TargetMode;
  defenseEffect?: DefenseEffect;
  special?: SpecialEffect;
  /** false = efecto digital: la víctima no puede "negarse" (no hay castigo). */
  refusable?: boolean;
}

/* ---------- Mazo semanal ---------- */

export interface WeeklyDeck {
  mode: GameMode;
  /** ISO del lunes 00:00 (hora local) de la semana actual. */
  weekKey: string;
  /** Las 10 cartas sorteadas esta semana: unidades restantes por id. */
  stock: Record<string, number>;
  burned: { cardId: string; at: number }[];
}

/* ---------- Sala / Juntada ---------- */

export interface HandCard {
  /** id único del slot (una misma carta podría repetirse en bots). */
  uid: string;
  cardId: string;
  state: 'ready' | 'used' | 'looted';
}

export interface Player {
  id: string;
  name: string;
  color: string;
  isBot: boolean;
  /** Calculado en cada dispositivo (nunca viaja como verdad compartida). */
  isMe: boolean;
  actions: HandCard[];
  defenses: HandCard[];
  /** Cartas de Acción extra recibidas por mesa de +4 (máx. 1). */
  actionRefills: number;
  gaggedUntil?: number;
  immuneUntil?: number;
  pactWith?: string;
}

export type PlayStatus =
  | 'pending'
  | 'complied'
  | 'refused'
  | 'nullified'
  | 'reflected'
  | 'redirected'
  | 'rps'
  | 'gag'
  | 'defense'
  | 'rule'
  | 'roulette';

export interface TablePlay {
  id: string;
  cardId: string;
  fromId: string;
  toId: string | null;
  status: PlayStatus;
  at: number;
  /** Rotación aleatoria para la pila de cartas en la mesa. */
  tilt: number;
  note?: string;
}

/** Ataque entrante a un jugador humano, esperando su decisión. */
export interface Incoming {
  id: string;
  targetId: string;
  playId: string;
  cardId: string;
  fromId: string;
  startedAt: number;
  phase: 'defend' | 'comply';
  /** Mensaje de contexto (ej: "Rebotado por Espejito"). */
  reason?: string;
  /** Doble o Nada perdido: castigo además de cumplir. */
  punishAfter?: boolean;
  /** Ataques forzados (Pacto de Sangre) no vuelven a propagarse. */
  noPropagate?: boolean;
}

export interface RpsMatch {
  id: string;
  playId: string;
  cardId: string;
  attackerId: string;
  defenderId: string;
}

export interface RouletteRequest {
  id: string;
  playerId: string;
  reason: string;
}

export interface ActiveEffect {
  id: string;
  cardId: string;
  targetId: string;
  fromId: string;
  endsAt: number;
}

export interface LogEntry {
  id: string;
  at: number;
  text: string;
  tone: 'info' | 'attack' | 'defense' | 'punish' | 'system';
}

export interface Room {
  code: string;
  createdAt: number;
  mode: GameMode;
  /** friends = salas reales entre celulares · bots = modo prueba local. */
  kind: 'friends' | 'bots';
  hostId: string;
  botAuto: boolean;
  players: Player[];
  table: TablePlay[];
  incoming: Incoming[];
  rps: RpsMatch | null;
  roulettes: RouletteRequest[];
  effects: ActiveEffect[];
  rules: { id: string; text: string; byId: string }[];
  log: LogEntry[];
}

export interface Profile {
  id: string;
  name: string;
  color: string;
}
