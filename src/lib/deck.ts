import {
  WEEKLY_BURNS,
  WEEKLY_FREE_RESHUFFLES,
  PRO_WEEKLY_REFILLS,
  activeCardsFor,
  fitsScenario,
  catalogFor,
  getCard,
  hasCard,
  isDefenseCard,
  proCardsFor,
} from '@/data/cards-catalog';
import type { CardDef, Economy, GameMode, HandCard, Scenario, Unlocks, WeeklyDeck } from '@/types/game';
import { uid } from '@/lib/utils';

/** Lunes 00:00 (hora local) de la semana que contiene `date`. */
export const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const nextReset = (date = new Date()) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 7);
  return d;
};

export const weekKeyFor = (date = new Date()) => startOfWeek(date).toISOString();

/* ------------------------------------------------------------------ */
/* Presupuesto semanal: 10 quemas por modo                             */
/* ------------------------------------------------------------------ */

export const createWeeklyDeck = (mode: GameMode, date = new Date()): WeeklyDeck => ({
  mode,
  weekKey: weekKeyFor(date),
  weeklyBurnsRemaining: WEEKLY_BURNS,
  burnedIds: [],
  burned: [],
});

/** Reinicia a 10/10 el lunes 00:00 (o si el formato guardado es viejo). */
export const ensureCurrentWeek = (deck: WeeklyDeck | null | undefined, mode: GameMode, date = new Date()) => {
  const valid =
    deck &&
    deck.mode === mode &&
    deck.weekKey === weekKeyFor(date) &&
    typeof deck.weeklyBurnsRemaining === 'number' &&
    Array.isArray(deck.burnedIds);
  return valid ? deck : createWeeklyDeck(mode, date);
};

/**
 * Quema una carta: queda marcada `burnedThisWeek` hasta el lunes.
 * `consume` descuenta 1 del presupuesto (uso propio); un saqueo la quema sin gastar presupuesto.
 */
export const burnCard = (deck: WeeklyDeck, cardId: string, consume = true): WeeklyDeck => ({
  ...deck,
  weeklyBurnsRemaining: consume ? Math.max(0, deck.weeklyBurnsRemaining - 1) : deck.weeklyBurnsRemaining,
  burnedIds: deck.burnedIds.includes(cardId) ? deck.burnedIds : [...deck.burnedIds, cardId],
  burned: [...deck.burned, { cardId, at: Date.now(), consumed: consume }],
});

export const isBurnedThisWeek = (deck: WeeklyDeck, cardId: string) => deck.burnedIds.includes(cardId);

/* ------------------------------------------------------------------ */
/* Desbloqueos PRO                                                     */
/* ------------------------------------------------------------------ */

export const emptyUnlocks = (date = new Date()): Unlocks => ({ packs: [], weekKey: weekKeyFor(date), weekly: [] });

/** Los desbloqueos por reto duran hasta el lunes; los packs comprados son permanentes. */
export const ensureUnlocks = (u: Unlocks | null | undefined, date = new Date()): Unlocks => {
  if (!u || !Array.isArray(u.packs)) return emptyUnlocks(date);
  if (u.weekKey !== weekKeyFor(date)) return { packs: u.packs, weekKey: weekKeyFor(date), weekly: [] };
  return { ...u, weekly: u.weekly.filter(hasCard) };
};

/** `unlockedCardIds`: todas las PRO de packs comprados + las ganadas con retos esta semana. */
export const unlockedCardIds = (u: Unlocks): string[] => [
  ...u.packs.flatMap((m) => proCardsFor(m).map((c) => c.id)),
  ...u.weekly,
];

export const isPlayable = (card: CardDef, unlocked: string[]) => !card.isLocked || unlocked.includes(card.id);

/* ------------------------------------------------------------------ */
/* Reparto                                                             */
/* ------------------------------------------------------------------ */

/**
 * Saca una carta al azar para la mano: del modo, del escenario de la sala, desbloqueada,
 * no quemada esta semana y que no esté ya en la mano. No descuenta presupuesto.
 * `allowBurned`: para recargas pagas, si no queda nada sin quemar se permite repetir.
 */
export const drawCard = (
  deck: WeeklyDeck,
  defense: boolean,
  unlocked: string[],
  reserved: string[] = [],
  scenario?: Scenario,
  allowBurned = false,
): string | null => {
  const base = catalogFor(deck.mode).filter(
    (c) => isDefenseCard(c) === defense && isPlayable(c, unlocked) && (!scenario || fitsScenario(c, scenario)),
  );
  const pick = (pool: CardDef[]) => (pool.length ? pool[Math.floor(Math.random() * pool.length)].id : null);
  const fresh = base.filter((c) => !deck.burnedIds.includes(c.id) && !reserved.includes(c.id));
  if (fresh.length || !allowBurned) return pick(fresh);
  return pick(base.filter((c) => !reserved.includes(c.id))) ?? pick(base);
};

/** Suma usos al presupuesto semanal (recarga paga). */
export const addBurns = (deck: WeeklyDeck, n: number): WeeklyDeck => ({
  ...deck,
  weeklyBurnsRemaining: deck.weeklyBurnsRemaining + n,
});

/* ------------------------------------------------------------------ */
/* Economía: re-barajados gratis por semana                            */
/* ------------------------------------------------------------------ */

export const ensureEconomy = (e: Economy | null | undefined, date = new Date()): Economy => {
  const weekKey = weekKeyFor(date);
  if (!e || typeof e.weeklyReshufflesRemaining !== 'number') {
    return { weekKey, weeklyReshufflesRemaining: WEEKLY_FREE_RESHUFFLES, purchases: [] };
  }
  if (e.weekKey !== weekKey)
    return {
      ...e,
      weekKey,
      weeklyReshufflesRemaining: WEEKLY_FREE_RESHUFFLES,
      ...(e.pro ? { pro: { ...e.pro, refillsLeft: PRO_WEEKLY_REFILLS } } : {}),
    };
  return e;
};

export const handCard = (cardId: string): HandCard => ({ uid: uid('h_'), cardId, state: 'ready' });

/** Mano infinita para bots del modo prueba (sólo cartas activas del escenario). */
const randomOf = (mode: GameMode, defense: boolean, scenario?: Scenario) => {
  const all = activeCardsFor(mode).filter((c) => isDefenseCard(c) === defense);
  const fit = scenario ? all.filter((c) => fitsScenario(c, scenario)) : all;
  const pool = fit.length ? fit : all;
  return pool[Math.floor(Math.random() * pool.length)].id;
};
export const randomActionCard = (mode: GameMode, scenario?: Scenario) => randomOf(mode, false, scenario);
export const randomDefenseCard = (mode: GameMode, scenario?: Scenario) => randomOf(mode, true, scenario);

/** Para el modal de desbloqueo: un reto al azar entre las 30 activas del modo. */
export const randomChallenge = (mode: GameMode, exclude?: string) => {
  const pool = activeCardsFor(mode).filter((c) => !isDefenseCard(c) && c.id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
};

export { getCard };
