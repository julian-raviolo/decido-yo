import {
  WEEKLY_ACTION,
  WEEKLY_DEFENSE,
  actionCardsFor,
  defenseCardsFor,
  isDefenseCard,
  getCard,
} from '@/data/cards-catalog';
import type { CardDef, GameMode, HandCard, WeeklyDeck } from '@/types/game';
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

/** Sorteo sin repetición, ponderado por rareza (`copies`). */
const sampleDistinct = (pool: CardDef[], n: number): string[] => {
  const left = [...pool];
  const out: string[] = [];
  while (out.length < n && left.length) {
    const total = left.reduce((s, c) => s + c.copies, 0);
    let roll = Math.random() * total;
    const i = left.findIndex((c) => (roll -= c.copies) < 0);
    out.push(left.splice(i === -1 ? left.length - 1 : i, 1)[0].id);
  }
  return out;
};

/** 10 cartas variadas por semana (7 Acción + 3 Defensa) del catálogo completo. */
export const createWeeklyDeck = (mode: GameMode, date = new Date()): WeeklyDeck => {
  const ids = [
    ...sampleDistinct(actionCardsFor(mode), WEEKLY_ACTION),
    ...sampleDistinct(defenseCardsFor(mode), WEEKLY_DEFENSE),
  ];
  return {
    mode,
    weekKey: weekKeyFor(date),
    stock: Object.fromEntries(ids.map((id) => [id, 1])),
    burned: [],
  };
};

/** Nuevo sorteo si cambió la semana (lunes 00:00) o el formato guardado es viejo. */
export const ensureCurrentWeek = (deck: WeeklyDeck | null | undefined, mode: GameMode, date = new Date()) => {
  const valid =
    deck &&
    deck.mode === mode &&
    deck.weekKey === weekKeyFor(date) &&
    Object.keys(deck.stock).every((id) => {
      try {
        return getCard(id).mode === mode;
      } catch {
        return false;
      }
    });
  return valid ? deck : createWeeklyDeck(mode, date);
};

export const deckCards = (deck: WeeklyDeck) => Object.keys(deck.stock).map(getCard);

const count = (deck: WeeklyDeck, defense: boolean) =>
  deckCards(deck)
    .filter((c) => isDefenseCard(c) === defense)
    .reduce((n, c) => n + Math.max(0, deck.stock[c.id] ?? 0), 0);

export const remainingAction = (deck: WeeklyDeck) => count(deck, false);
export const remainingDefense = (deck: WeeklyDeck) => count(deck, true);
export const remainingTotal = (deck: WeeklyDeck) => remainingAction(deck) + remainingDefense(deck);

/**
 * Saca una carta al azar del mazo semanal. No descuenta stock (sólo se quema lo que se usa),
 * pero respeta las cartas que ya están reservadas en la mano.
 */
export const drawCard = (deck: WeeklyDeck, defense: boolean, reserved: string[] = []): string | null => {
  const avail: string[] = [];
  for (const c of deckCards(deck)) {
    if (isDefenseCard(c) !== defense) continue;
    const n = (deck.stock[c.id] ?? 0) - reserved.filter((r) => r === c.id).length;
    for (let i = 0; i < n; i++) avail.push(c.id);
  }
  return avail.length ? avail[Math.floor(Math.random() * avail.length)] : null;
};

/** Quema permanente de una unidad hasta el próximo lunes. */
export const burnCard = (deck: WeeklyDeck, cardId: string): WeeklyDeck => ({
  ...deck,
  stock: { ...deck.stock, [cardId]: Math.max(0, (deck.stock[cardId] ?? 0) - 1) },
  burned: [...deck.burned, { cardId, at: Date.now() }],
});

export const handCard = (cardId: string): HandCard => ({ uid: uid('h_'), cardId, state: 'ready' });

/** Mano infinita para bots del modo prueba. */
const weighted = (pool: CardDef[]) => {
  const all = pool.flatMap((c) => Array<string>(c.copies).fill(c.id));
  return all[Math.floor(Math.random() * all.length)];
};
export const randomActionCard = (mode: GameMode) => weighted(actionCardsFor(mode));
export const randomDefenseCard = (mode: GameMode) => weighted(defenseCardsFor(mode));

/** Cuántos slots de cada tipo corresponden según el tamaño de la mesa. */
export const slotsFor = (players: number) => (players >= 11 ? 2 : 1);
