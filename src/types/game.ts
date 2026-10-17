import type { LucideIcon } from 'lucide-react';

/** Modo de juego: Clásico o HOT (picante soft). */
export type GameMode = 'classic' | 'hot';

/** Modalidad: en persona o cada uno en su casa. */
export type Environment = 'PRESENCIAL' | 'ONLINE';

/** Escenario contextual de la sala (ONLINE siempre es REMOTE). */
export type Scenario = 'OUTING' | 'HOME' | 'PARTY' | 'CASUAL' | 'REMOTE';

/** Escenarios donde aplica una carta; ALL_PRESENCIAL = cualquiera de los 4 presenciales. */
export type CardScenario = Scenario | 'ALL_PRESENCIAL';

/** En HOT las mismas categorías se muestran como Cita Picante / Seducción / En Casa / etc. */
export type Category = 'FOOD' | 'SOCIAL' | 'DESTINY' | 'SPECIAL' | 'DEFENSE';

/** Cómo se apunta una carta de acción. */
export type TargetMode = 'single' | 'table' | 'random';

/** Qué hace una carta de defensa en modo reactivo. */
export type DefenseEffect =
  | 'NULLIFY'
  | 'REFLECT'
  | 'REDIRECT'
  | 'DOUBLE_OR_NOTHING'
  | 'IMMUNITY'
  /** Anula y manda al atacante a la Ruleta. */
  | 'COUNTER';

/** Comportamientos digitales de las cartas legendarias. */
export type SpecialEffect = 'ABSOLUTE' | 'BLOOD_PACT' | 'RUSSIAN_ROULETTE' | 'LOOTER';

export interface CardDef {
  id: string;
  name: string;
  description: string;
  category: Category;
  mode: GameMode;
  icon: LucideIcon;
  /** Escenarios donde puede salir en el reparto. */
  scenarios: CardScenario[];
  /** Carta PRO: sólo sale en el reparto si está desbloqueada. */
  isLocked: boolean;
  packName?: string;
  /** Si el efecto dura un tiempo, se muestra como efecto activo en la mesa. */
  durationMin?: number;
  targetMode?: TargetMode;
  defenseEffect?: DefenseEffect;
  special?: SpecialEffect;
  /** false = efecto digital: la víctima no puede "negarse" (no hay castigo). */
  refusable?: boolean;
  /** Piedra, Papel o Tijera perdido: castigo extra (default) o cumplir por el doble de tiempo. */
  rpsLose?: 'punish' | 'double';
}

/* ---------- Mazo semanal ---------- */

export interface WeeklyDeck {
  mode: GameMode;
  /** ISO del lunes 00:00 (hora local) de la semana actual. */
  weekKey: string;
  /** Presupuesto semanal: 10 cartas quemables por modo. */
  weeklyBurnsRemaining: number;
  /** Cartas quemadas esta semana (burnedThisWeek): no vuelven a salir hasta el lunes. */
  burnedIds: string[];
  burned: { cardId: string; at: number; consumed: boolean }[];
}

/** Desbloqueos PRO: packs comprados (permanentes) + retos cumplidos (hasta el lunes). */
export interface Unlocks {
  packs: GameMode[];
  weekKey: string;
  weekly: string[];
}

/** Economía semanal compartida entre modos: re-barajados gratis. */
export interface Economy {
  weekKey: string;
  weeklyReshufflesRemaining: number;
  /** Pagos simulados (para métricas / historial de compras). */
  purchases: { kind: 'reshuffle' | 'recharge' | 'pack' | 'refill' | 'pro'; usd: number; at: number; mode: GameMode }[];
  /** Plan PRO (simulado): 2 refills de energía gratis por semana + 1 pack de expansión a elección. */
  pro?: { since: number; refillsLeft: number; pack: GameMode };
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
  | 'roulette'
  /** Modo Online: esperando la prueba de la víctima y el voto de la sala. */
  | 'evidence';

export interface Evidence {
  text?: string;
  /** Foto comprimida (data URL). Se borra al resolverse la votación. */
  image?: string;
  at: number;
}

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
  /** Modo Online: plazo para subir la prueba. */
  evidenceUntil?: number;
  evidence?: Evidence;
  votes?: Record<string, 'yes' | 'no'>;
  /** Cómo aplicar el efecto si la sala aprueba la prueba. */
  pending?: { propagate: boolean; durationFactor: number };
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
  /** Todo o Nada Sensual perdido: el efecto dura el doble. */
  durationFactor?: number;
}

export type RpsChoice = 'ROCK' | 'PAPER' | 'SCISSORS';

export interface RpsMatch {
  id: string;
  playId: string;
  cardId: string;
  attackerId: string;
  defenderId: string;
  /** Carta de defensa usada (define la penalidad si pierde quien se defiende). */
  defenseCardId?: string;
  /** Jugadas elegidas en la ronda actual (la UI no revela la del rival hasta que estén las dos). */
  choices?: Record<string, RpsChoice>;
  /** Ronda actual (sube con cada empate). */
  round?: number;
  /** Inicio de la ronda: a los 60 s se elige al azar por el ausente. */
  roundAt?: number;
  /** Momento en que se completaron las dos jugadas. */
  revealAt?: number;
}

/* ---------- SALIDUELO: batalla de lugares ---------- */

export type DuelSide = 'A' | 'B';

export interface DuelVenue {
  venueId: string;
  hearts: number;
}

/** Variante de sala (Clásico o HOT): dos lugares con 3 ❤️; el que queda en pie gana y revela su cupón. */
export interface Saliduelo {
  phase: 'pick' | 'battle' | 'won';
  sides: { A?: DuelVenue; B?: DuelVenue };
  /** Bando de cada jugador. */
  picks: Record<string, DuelSide>;
  winner?: DuelSide;
  /** Jugadas que ya restaron un corazón (evita el doble descuento). */
  hits: string[];
  /** Último corazón perdido: dispara la animación en todos los celulares. */
  lastHit?: { id: string; side: DuelSide; at: number };
  /** Batalla al mejor de 3 manos con minijuegos. */
  wins?: { A: number; B: number };
  round?: DuelRound;
  history?: { n: number; game: MiniGame; winner: DuelSide }[];
}

export type MiniGame = 'RPS' | 'REFLEX' | 'TAP';

/** Una mano de la batalla: minijuego sorteado entre 2 representantes. */
export interface DuelRound {
  n: number;
  game: MiniGame;
  reps: { A: string; B: string };
  /** Duelo de reflejos: ms de espera antes de la señal. */
  delay: number;
  /** Empates (PPT / tap) que reiniciaron la mano. */
  ties: number;
  choices?: Record<string, RpsChoice>;
  /** Reflejos: ms de reacción (negativo = se adelantó). */
  reactions?: Record<string, number>;
  taps?: Record<string, number>;
  done?: Record<string, boolean>;
  winner?: DuelSide;
  /** Para el revelado de PPT. */
  last?: Record<string, RpsChoice>;
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
  /** Inicio del efecto (para la barra de progreso). */
  startedAt?: number;
  endsAt: number;
}

export interface LogEntry {
  id: string;
  at: number;
  text: string;
  tone: 'info' | 'attack' | 'defense' | 'punish' | 'system';
  /** Carta involucrada: el historial muestra su efecto. */
  cardId?: string;
}

export interface Room {
  code: string;
  createdAt: number;
  mode: GameMode;
  environment: Environment;
  scenario: Scenario;
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
  /** Variante ⚔️ SALIDUELO (opcional: salas sin duelo no la tienen). */
  saliduelo?: Saliduelo;
}

export interface Profile {
  id: string;
  name: string;
  color: string;
}
