'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  DEFENSE_WINDOW_SECONDS,
  MAX_PLAYERS,
  handSizeFor,
  GAG_MINUTES,
  IMMUNITY_MINUTES,
  getCard,
  hasCard,
} from '@/data/cards-catalog';
import { BOT_RULES, HOT_BOT_RULES } from '@/data/punishments';
import {
  burnCard,
  drawCard,
  ensureCurrentWeek,
  ensureUnlocks,
  handCard,
  randomActionCard,
  randomDefenseCard,
  unlockedCardIds,
} from '@/lib/deck';
import {
  createLocalTransport,
  createServerTransport,
  roomReducer,
  type RoomAction,
  type RoomTransport,
  type Snapshot,
} from '@/lib/realtime';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import { AVATAR_COLORS, pickRandom, roomCode, uid } from '@/lib/utils';
import type {
  DefenseEffect,
  GameMode,
  HandCard,
  LogEntry,
  Player,
  Profile,
  Room,
  TablePlay,
  Unlocks,
  WeeklyDeck,
} from '@/types/game';

const BOT_NAMES = [
  'Lupe', 'Tincho', 'Romi', 'Fede', 'Caro', 'Nacho', 'Juli', 'Vicky',
  'Male', 'Santi', 'Flor', 'Bauti', 'Cami', 'Lucho', 'Agus', 'Pili',
];
const MIN = 60_000;

export const isGagged = (p?: Player | null, now = Date.now()) => !!p?.gaggedUntil && p.gaggedUntil > now;
export const isImmune = (p?: Player | null, now = Date.now()) => !!p?.immuneUntil && p.immuneUntil > now;
export const readyCards = (cards: HandCard[]) => cards.filter((c) => c.state === 'ready');

type Decks = Record<GameMode, WeeklyDeck>;

interface Settings {
  mode: GameMode;
  hotConfirmed: boolean;
}

interface GameContextValue {
  hydrated: boolean;
  profile: Profile;
  mode: GameMode;
  settings: Settings;
  /** Mazo semanal (presupuesto de 10 quemas) del modo activo. */
  deck: WeeklyDeck;
  decks: Decks;
  /** IDs de cartas PRO habilitadas (packs comprados + retos de esta semana). */
  unlockedIds: string[];
  unlocks: Unlocks;
  buyPack(mode: GameMode): void;
  unlockWithChallenge(cardId: string): void;
  room: Room | null;
  me: Player | null;
  online: boolean;
  notice: string | null;
  clearNotice(): void;
  setName(name: string): void;
  setMode(mode: GameMode): void;
  confirmHot(): void;
  createRoom(opts: { kind: 'friends' | 'bots'; bots?: number }): Promise<string>;
  joinRoom(code: string): Promise<void>;
  leaveRoom(): void;
  resetDeck(): void;
  /* Jugadas propias */
  throwAction(handUid: string, targetId: string | null, extra?: { ruleText?: string }): void;
  gagPlayer(handUid: string, targetId: string): void;
  respondIncoming(
    id: string,
    choice: 'defend' | 'comply' | 'refuse',
    opts?: { redirectTo?: string; defenseUid?: string },
  ): void;
  expireIncoming(id: string): void;
  resolveRps(defenderWins: boolean): void;
  finishRoulette(id: string, punishment: string): void;
  /* Modo prueba */
  simulateBotAttack(botId: string, cardId?: string): void;
  simulateBotGag(botId: string): void;
  setBotAuto(value: boolean): void;
}

const GameContext = createContext<GameContextValue | null>(null);

const defaultProfile = (): Profile => ({ id: uid('p_'), name: '', color: pickRandom(AVATAR_COLORS) });

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<Profile>({ id: 'me', name: '', color: AVATAR_COLORS[0] });
  const [settings, setSettings] = useState<Settings>({ mode: 'classic', hotConfirmed: false });
  const [decks, setDecksState] = useState<Decks>(() => ({
    classic: ensureCurrentWeek(null, 'classic'),
    hot: ensureCurrentWeek(null, 'hot'),
  }));
  const [room, setRoomState] = useState<Room | null>(null);
  const [unlocks, setUnlocksState] = useState<Unlocks>(() => ensureUnlocks(null));
  const [online, setOnline] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Refs síncronas: la lógica de juego lee siempre el estado más reciente.
  const roomRef = useRef<Room | null>(null);
  const decksRef = useRef<Decks>(decks);
  const unlocksRef = useRef<Unlocks>(unlocks);
  const profileRef = useRef<Profile>(profile);
  const transportRef = useRef<RoomTransport>(createLocalTransport());
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  /* ---------------- store ---------------- */

  const localize = (r: Room | null): Room | null =>
    r && { ...r, players: r.players.map((p) => ({ ...p, isMe: p.id === profileRef.current.id })) };

  const setRoom = useCallback((r: Room | null) => {
    roomRef.current = localize(r);
    setRoomState(roomRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback(
    (action: RoomAction) => {
      setRoom(roomReducer(roomRef.current, action));
      transportRef.current.publish(action);
    },
    [setRoom],
  );

  const setDecks = useCallback((next: Decks) => {
    decksRef.current = next;
    setDecksState(next);
  }, []);

  const setUnlocks = useCallback((next: Unlocks) => {
    unlocksRef.current = next;
    setUnlocksState(next);
  }, []);
  const unlockedNow = () => unlockedCardIds(ensureUnlocks(unlocksRef.current));

  const deckOf = (mode: GameMode) => ensureCurrentWeek(decksRef.current[mode], mode);
  /** Quema una carta (burnedThisWeek). `consume`: descuenta 1 del presupuesto de 10. */
  const burn = (cardId: string, consume = true) => {
    const mode = getCard(cardId).mode;
    setDecks({ ...decksRef.current, [mode]: burnCard(deckOf(mode), cardId, consume) });
  };
  const hasBudget = (mode: GameMode) => deckOf(mode).weeklyBurnsRemaining > 0;

  const later = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  const log = (text: string, tone: LogEntry['tone'] = 'info') =>
    send({ type: 'LOG', entry: { id: uid('l_'), at: Date.now(), text, tone } });

  const player = (id: string | null | undefined) => roomRef.current?.players.find((p) => p.id === id);
  /**
   * El registro se comparte entre celulares: en salas de amigos se escribe en
   * tercera persona; en el modo prueba (un solo celular) se habla de "vos".
   */
  const isVos = (id: string | null | undefined) => roomRef.current?.kind === 'bots' && !!player(id)?.isMe;
  const nameOf = (id: string | null | undefined) => {
    const p = player(id);
    return p ? (isVos(id) ? 'Vos' : p.name) : '¿?';
  };
  /** En posición de objeto: "a vos", "hacia Tincho". */
  const objOf = (id: string | null | undefined) => (isVos(id) ? 'vos' : nameOf(id));
  /** Conjugación rioplatense: "Tincho tira" / "Vos tirás". */
  const says = (id: string | null | undefined, third: string, vos: string) =>
    `${nameOf(id)} ${isVos(id) ? vos : third}`;
  const getPlay = (id: string) => roomRef.current?.table.find((p) => p.id === id);
  const meId = () => profileRef.current.id;

  /* ---------------- conexión ---------------- */

  const connect = useCallback(
    (r: Room) => {
      transportRef.current.disconnect();
      if (r.kind !== 'friends') {
        transportRef.current = createLocalTransport();
        return;
      }
      transportRef.current = createServerTransport(
        r.code,
        (s: Snapshot) => {
          const mine = s.room?.players.some((p) => p.id === profileRef.current.id);
          if (!s.room || !mine) {
            transportRef.current.disconnect();
            transportRef.current = createLocalTransport();
            if (roomRef.current) setNotice('La sala se cerró o ya no estás en ella.');
            setRoom(null);
            return;
          }
          setRoom(s.room);
        },
        setOnline,
      );
    },
    [setRoom],
  );

  /* ---------------- hidratación / persistencia ---------------- */

  useEffect(() => {
    const p = storage.get<Profile | null>(STORAGE_KEYS.profile, null) ?? defaultProfile();
    profileRef.current = p;
    setProfile(p);
    const st = storage.get<Settings>(STORAGE_KEYS.settings, { mode: 'classic', hotConfirmed: false });
    setSettings(st);
    const saved = storage.get<Partial<Decks>>(STORAGE_KEYS.decks, {});
    setDecks({ classic: ensureCurrentWeek(saved.classic, 'classic'), hot: ensureCurrentWeek(saved.hot, 'hot') });
    setUnlocks(ensureUnlocks(storage.get<Unlocks | null>(STORAGE_KEYS.unlocks, null)));
    const savedRoom = storage.get<Room | null>(STORAGE_KEYS.room, null);
    // Si el catálogo cambió y la sala guardada tiene cartas que ya no existen, se descarta.
    const validCards = savedRoom?.players?.every((x) => [...x.actions, ...x.defenses].every((c) => hasCard(c.cardId)));
    if (validCards && savedRoom?.players?.some((x) => x.id === p.id)) {
      setRoom(savedRoom);
      connect(savedRoom);
    }
    setHydrated(true);
  }, [connect, setDecks, setRoom, setUnlocks]);

  useEffect(() => {
    if (hydrated) storage.set(STORAGE_KEYS.profile, profile);
  }, [hydrated, profile]);
  useEffect(() => {
    if (hydrated) storage.set(STORAGE_KEYS.settings, settings);
  }, [hydrated, settings]);
  useEffect(() => {
    if (hydrated) storage.set(STORAGE_KEYS.decks, decks);
  }, [hydrated, decks]);
  useEffect(() => {
    if (hydrated) storage.set(STORAGE_KEYS.unlocks, unlocks);
  }, [hydrated, unlocks]);
  useEffect(() => {
    if (!hydrated) return;
    if (room) storage.set(STORAGE_KEYS.room, room);
    else storage.remove(STORAGE_KEYS.room);
  }, [hydrated, room]);

  // Reset semanal en vivo (si la app queda abierta al cruzar el lunes 00:00).
  useEffect(() => {
    const t = setInterval(() => {
      const next = { classic: deckOf('classic'), hot: deckOf('hot') };
      if (next.classic !== decksRef.current.classic || next.hot !== decksRef.current.hot) setDecks(next);
      const u = ensureUnlocks(unlocksRef.current);
      if (u.weekKey !== unlocksRef.current.weekKey) setUnlocks(u);
    }, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDecks, setUnlocks]);

  useEffect(
    () => () => {
      clearTimers();
      transportRef.current.disconnect();
    },
    [clearTimers],
  );

  // Tema: la sala manda; fuera de una sala, el modo elegido.
  const activeMode: GameMode = room?.mode ?? settings.mode;
  useEffect(() => {
    document.documentElement.dataset.mode = activeMode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', activeMode === 'hot' ? '#9E0014' : '#121212');
  }, [activeMode]);

  /* ---------------- reglas de mesa: tamaño de la mano ---------------- */

  // 2–6 jugadores: 2 Acción + 1 Defensa · 7–12 jugadores: 3 Acción + 2 Defensa.
  // Si la mesa crece durante la juntada, se reparten las cartas que falten.
  useEffect(() => {
    const r = roomRef.current;
    const me = r?.players.find((p) => p.isMe);
    if (!r || !me) return;
    const size = handSizeFor(r.players.length);
    const deck = deckOf(r.mode);
    const unlocked = unlockedNow();
    const reserved = [...me.actions, ...me.defenses].filter((c) => c.state === 'ready').map((c) => c.cardId);

    for (const [slot, isDef, want] of [
      ['actions', false, size.actions],
      ['defenses', true, size.defenses],
    ] as const) {
      for (let i = me[slot].length; i < want; i++) {
        const id = drawCard(deck, isDef, unlocked, reserved);
        if (!id) break;
        reserved.push(id);
        send({ type: 'ADD_CARD', playerId: me.id, slot, card: handCard(id) });
        log(
          `🃏 Mesa de ${r.players.length}: ${says(me.id, 'recibe', 'recibís')} otra carta de ${isDef ? 'Defensa' : 'Acción'}.`,
          'system',
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  /* ---------------- motor de resolución ---------------- */

  /** Bots del modo prueba: mazo infinito, reponen la carta usada. */
  const refillBot = (botId: string, cardUid: string, slot: 'action' | 'defense') => {
    later(2500, () => {
      const r = roomRef.current;
      if (!r || !player(botId)) return;
      const cardId = slot === 'action' ? randomActionCard(r.mode) : randomDefenseCard(r.mode);
      send({ type: 'REPLACE_CARD', playerId: botId, uid: cardUid, card: handCard(cardId) });
    });
  };

  const pushRoulette = (playerId: string, reason: string) =>
    send({ type: 'PUSH_ROULETTE', request: { id: uid('r_'), playerId, reason } });

  const newPlay = (cardId: string, fromId: string, toId: string | null, note?: string): TablePlay => ({
    id: uid('t_'),
    cardId,
    fromId,
    toId,
    status: 'pending',
    at: Date.now(),
    tilt: Math.round(Math.random() * 24 - 12),
    note,
  });

  /** Aplica el efecto de la carta sobre el objetivo (la víctima cumple). */
  const applyComply = (play: TablePlay, propagate: boolean, durationFactor = 1) => {
    const target = player(play.toId);
    if (!target) return;
    const card = getCard(play.cardId);
    send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'complied' });

    if (card.special === 'LOOTER') {
      const loot = readyCards(target.actions);
      const victim = loot[Math.floor(Math.random() * loot.length)];
      if (victim) {
        // Se quema (no vuelve hasta el lunes) pero no gasta el presupuesto de la víctima.
        if (target.isMe) burn(victim.cardId, false);
        send({ type: 'SET_CARD_STATE', playerId: target.id, uid: victim.uid, state: 'looted' });
        log(`🔥 ${says(play.fromId, 'saqueó', 'saqueaste')} la carta de Acción de ${objOf(target.id)}.`, 'attack');
        if (target.isBot) refillBot(target.id, victim.uid, 'action');
      } else {
        log(`${nameOf(target.id)} no tenía carta de Acción para saquear.`, 'info');
      }
      return;
    }

    if (card.special === 'BLOOD_PACT') {
      send({ type: 'PATCH_PLAYER', playerId: target.id, patch: { pactWith: play.fromId } });
      send({ type: 'PATCH_PLAYER', playerId: play.fromId, patch: { pactWith: target.id } });
      log(`🩸 Pacto de Sangre entre ${objOf(play.fromId)} y ${objOf(target.id)}.`, 'attack');
      return;
    }

    log(`✅ ${says(target.id, 'cumple', 'cumplís')} «${card.name}»${durationFactor > 1 ? ' (doble de tiempo)' : ''}.`, 'info');
    if (card.durationMin) {
      send({
        type: 'ADD_EFFECT',
        effect: {
          id: uid('e_'),
          cardId: card.id,
          targetId: target.id,
          fromId: play.fromId,
          startedAt: Date.now(),
          endsAt: Date.now() + card.durationMin * durationFactor * MIN,
        },
      });
    }

    // Pacto de Sangre: el vinculado también cumple (sin defensa, sin re-propagar).
    if (propagate && target.pactWith && target.pactWith !== play.fromId) {
      const partner = player(target.pactWith);
      if (partner) {
        const forced = newPlay(card.id, play.fromId, partner.id, `Pacto de Sangre con ${objOf(target.id)}`);
        send({ type: 'ADD_PLAY', play: forced });
        log(`🩸 Por el Pacto, ${says(partner.id, 'también cumple', 'también cumplís')} «${card.name}».`, 'attack');
        forceOn(forced, `Pacto de Sangre con ${target.name}`, false);
      }
    }
  };

  /** Ataque sin posibilidad de defensa: cumplir o castigo. */
  const forceOn = (play: TablePlay, reason: string, propagate: boolean, punishAfter = false, durationFactor = 1) => {
    const target = player(play.toId);
    if (!target) return;
    if (target.isBot) {
      later(1200 + Math.random() * 1200, () => botAccept(play.id, propagate, punishAfter, durationFactor));
      return;
    }
    send({
      type: 'PUSH_INCOMING',
      incoming: {
        id: uid('i_'),
        targetId: target.id,
        playId: play.id,
        cardId: play.cardId,
        fromId: play.fromId,
        startedAt: Date.now(),
        phase: 'comply',
        reason,
        punishAfter,
        noPropagate: !propagate,
        durationFactor,
      },
    });
  };

  const botAccept = (playId: string, propagate: boolean, punishAfter = false, durationFactor = 1) => {
    const play = getPlay(playId);
    const bot = player(play?.toId);
    if (!play || !bot) return;
    const card = getCard(play.cardId);
    if (!punishAfter && card.refusable !== false && Math.random() < 0.2) {
      send({ type: 'SET_PLAY_STATUS', playId, status: 'refused' });
      log(`🙅 ${bot.name} se niega a «${card.name}» → Ruleta.`, 'punish');
      pushRoulette(bot.id, `Se negó a «${card.name}»`);
      return;
    }
    applyComply(play, propagate, durationFactor);
    if (punishAfter) pushRoulette(bot.id, `Perdió el Doble o Nada contra «${card.name}»`);
  };

  /** Entrega un ataque defendible a su objetivo. */
  const deliverAttack = (play: TablePlay) => {
    const target = player(play.toId);
    if (!target) return;
    if (target.isBot) {
      later(1400 + Math.random() * 1600, () => botRespond(play.id));
      return;
    }
    const canDefend = readyCards(target.defenses).length > 0;
    send({
      type: 'PUSH_INCOMING',
      incoming: {
        id: uid('i_'),
        targetId: target.id,
        playId: play.id,
        cardId: play.cardId,
        fromId: play.fromId,
        startedAt: Date.now(),
        phase: canDefend ? 'defend' : 'comply',
        reason: canDefend ? undefined : 'No tenés defensa disponible',
      },
    });
  };

  const botRespond = (playId: string) => {
    const play = getPlay(playId);
    const bot = player(play?.toId);
    if (!play || !bot || play.status !== 'pending') return;
    const def = readyCards(bot.defenses)[0];
    if (def && Math.random() < 0.55) {
      const card = getCard(def.cardId);
      send({ type: 'SET_CARD_STATE', playerId: bot.id, uid: def.uid, state: 'used' });
      log(`🛡️ ${bot.name} responde con «${card.name}».`, 'defense');
      refillBot(bot.id, def.uid, 'defense');
      applyDefense(play, bot.id, card.defenseEffect!, card.id);
    } else {
      botAccept(playId, true);
    }
  };

  const eligibleTargets = (excludeIds: string[]) =>
    (roomRef.current?.players ?? []).filter((p) => !excludeIds.includes(p.id) && !isImmune(p));

  const applyDefense = (
    play: TablePlay,
    defenderId: string,
    effect: DefenseEffect,
    defenseCardId: string,
    redirectTo?: string,
  ) => {
    const card = getCard(play.cardId);
    const defender = player(defenderId)!;
    send({
      type: 'ADD_PLAY',
      play: { ...newPlay(defenseCardId, defenderId, play.fromId), status: 'defense', note: `vs «${card.name}»` },
    });

    switch (effect) {
      case 'NULLIFY': {
        send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'nullified' });
        const def = getCard(defenseCardId);
        // Los escudos HOT dejan una "deuda": se muestra el texto de la carta.
        log(
          `🚫 «${card.name}» anulada por ${objOf(defenderId)}${def.mode === 'hot' ? ` · ${def.description}` : '.'}`,
          'defense',
        );
        return;
      }
      case 'COUNTER': {
        send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'nullified' });
        log(`⚔️ Contraataque: «${card.name}» anulada y ${objOf(play.fromId)} va a la Ruleta.`, 'defense');
        pushRoulette(play.fromId, `Contraataque Letal de ${defender.name}`);
        return;
      }
      case 'IMMUNITY': {
        send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'nullified' });
        send({
          type: 'PATCH_PLAYER',
          playerId: defenderId,
          patch: { immuneUntil: Date.now() + IMMUNITY_MINUTES * MIN },
        });
        log(`🏛️ ${says(defenderId, 'es', 'sos')} intocable por ${IMMUNITY_MINUTES} min.`, 'defense');
        return;
      }
      case 'REFLECT': {
        send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'reflected' });
        const back = newPlay(card.id, defenderId, play.fromId, 'Rebotada');
        send({ type: 'ADD_PLAY', play: back });
        log(`🪞 «${card.name}» rebota hacia ${objOf(play.fromId)}.`, 'defense');
        forceOn(back, `${defender.name} te rebotó tu propia carta`, true);
        return;
      }
      case 'REDIRECT': {
        // En citas de a 2 no hay a quién desviar: funciona como escudo normal.
        const twoPlayers = (roomRef.current?.players.length ?? 0) <= 2;
        const target = twoPlayers
          ? null
          : (redirectTo && player(redirectTo)) || pickRandomOrNull(eligibleTargets([defenderId]));
        if (!target) {
          send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'nullified' });
          log(`🐐 «${card.name}» queda anulada (no había a quién desviarla).`, 'defense');
          return;
        }
        send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'redirected' });
        const moved = newPlay(card.id, play.fromId, target.id, `Desviada por ${defender.name}`);
        send({ type: 'ADD_PLAY', play: moved });
        log(`🐐 ${says(defenderId, 'desvía', 'desviás')} «${card.name}» hacia ${objOf(target.id)}.`, 'defense');
        deliverAttack(moved);
        return;
      }
      case 'DOUBLE_OR_NOTHING': {
        send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'rps' });
        const attacker = player(play.fromId);
        if (defender.isBot && attacker?.isBot) {
          const defenderWins = Math.random() < 0.5;
          log(
            `✂️ Doble o Nada entre bots: ${defenderWins ? `gana ${defender.name}, se anula` : `pierde ${defender.name}`}.`,
            'defense',
          );
          if (defenderWins) send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'nullified' });
          else loseRps(play, defenderId, defenseCardId);
          return;
        }
        send({
          type: 'SET_RPS',
          rps: { id: uid('rps_'), playId: play.id, cardId: play.cardId, attackerId: play.fromId, defenderId, defenseCardId },
        });
        log(
          `✂️ ${getCard(defenseCardId).name}: ${nameOf(play.fromId)} vs ${objOf(defenderId)} a Piedra, Papel o Tijera.`,
          'defense',
        );
        return;
      }
    }
  };

  /** Perder el PPT: carta + castigo (Doble o Nada) o carta por el doble de tiempo (Todo o Nada Sensual). */
  const loseRps = (play: TablePlay, defenderId: string, defenseCardId?: string) => {
    const doubled = defenseCardId ? getCard(defenseCardId).rpsLose === 'double' : false;
    const target = { ...play, toId: defenderId };
    if (doubled) forceOn(target, 'Perdiste el Todo o Nada: la cumplís por el doble de tiempo', true, false, 2);
    else forceOn(target, 'Perdió el Doble o Nada: cumple la carta y además va a la ruleta', true, true);
  };

  /** Lógica común de una carta de Acción jugada por cualquier jugador. */
  const performAttack = (fromId: string, cardId: string, targetId: string | null, ruleText?: string) => {
    const card = getCard(cardId);
    const r = roomRef.current!;
    if (card.special === 'ABSOLUTE') {
      const text = ruleText?.trim() || pickRandom(r.mode === 'hot' ? HOT_BOT_RULES : BOT_RULES);
      send({ type: 'ADD_PLAY', play: { ...newPlay(card.id, fromId, null, text), status: 'rule' } });
      send({ type: 'ADD_RULE', rule: { id: uid('rule_'), text, byId: fromId } });
      log(`⚖️ ${says(fromId, 'impone', 'imponés')} una regla: «${text}».`, 'attack');
      return;
    }
    if (card.special === 'RUSSIAN_ROULETTE') {
      const victim = pickRandom(r.players);
      send({ type: 'ADD_PLAY', play: { ...newPlay(card.id, fromId, victim.id), status: 'roulette' } });
      log(`🎲 «${card.name}» de ${objOf(fromId)}… ¡le tocó a ${objOf(victim.id)}!`, 'punish');
      pushRoulette(victim.id, card.name);
      return;
    }
    const target = player(targetId);
    if (!target) return;
    if (isImmune(target)) {
      log(`🏛️ ${nameOf(target.id)} es intocable: la carta no tiene efecto.`, 'defense');
      return;
    }
    const play = newPlay(card.id, fromId, target.id);
    send({ type: 'ADD_PLAY', play });
    log(`⚡ ${says(fromId, 'le tira', 'le tirás')} «${card.name}» a ${objOf(target.id)}.`, 'attack');
    deliverAttack(play);
  };

  /* ---------------- acciones públicas: perfil / salas ---------------- */

  const setName = useCallback((name: string) => {
    setProfile((p) => {
      const next = { ...p, name };
      profileRef.current = next;
      return next;
    });
  }, []);

  const setMode = (mode: GameMode) => setSettings((s) => ({ ...s, mode }));
  const confirmHot = () => setSettings((s) => ({ ...s, hotConfirmed: true, mode: 'hot' }));

  /** Arma un jugador humano con su mano repartida desde su mazo semanal. */
  const buildMe = (mode: GameMode, tableSize: number): Player => {
    const prof = profileRef.current;
    const deck = deckOf(mode);
    setDecks({ ...decksRef.current, [mode]: deck });
    const size = handSizeFor(tableSize);
    const unlocked = unlockedNow();
    const reserved: string[] = [];
    const deal = (def: boolean) =>
      Array.from({ length: def ? size.defenses : size.actions }, () => {
        const id = drawCard(deck, def, unlocked, reserved);
        if (id) reserved.push(id);
        return id;
      })
        .filter((x): x is string => !!x)
        .map(handCard);
    return {
      id: prof.id,
      name: prof.name.trim() || 'Yo',
      color: prof.color,
      isBot: false,
      isMe: true,
      actions: deal(false),
      defenses: deal(true),
    };
  };

  const baseRoom = (code: string, mode: GameMode, kind: Room['kind'], players: Player[]): Room => ({
    code,
    createdAt: Date.now(),
    mode,
    kind,
    hostId: profileRef.current.id,
    botAuto: false,
    players,
    table: [],
    incoming: [],
    rps: null,
    roulettes: [],
    effects: [],
    rules: [],
    log: [
      {
        id: uid('l_'),
        at: Date.now(),
        tone: 'system',
        text:
          kind === 'friends'
            ? mode === 'hot'
              ? `Sala HOT ${code} abierta. Pasale el código a tu pareja.`
              : `Sala ${code} abierta. Compartí el código para que se sumen tus amigos.`
            : `Modo prueba ${code}: ${players.length - 1} bots en la mesa.`,
      },
    ],
  });

  const createRoom: GameContextValue['createRoom'] = async ({ kind, bots = 3 }) => {
    clearTimers();
    transportRef.current.disconnect();
    transportRef.current = createLocalTransport();
    const mode = settings.mode;
    const botCount = Math.max(1, Math.min(bots, MAX_PLAYERS[mode] - 1));
    const total = kind === 'bots' ? botCount + 1 : 1;
    const me = buildMe(mode, total);

    if (kind === 'bots') {
      const size = handSizeFor(total);
      const names = BOT_NAMES.filter((n) => n.toLowerCase() !== me.name.toLowerCase())
        .sort(() => Math.random() - 0.5)
        .slice(0, botCount);
      const botPlayers: Player[] = names.map((name, i) => ({
        id: uid('bot_'),
        name,
        color: AVATAR_COLORS[(AVATAR_COLORS.indexOf(me.color) + i + 1) % AVATAR_COLORS.length],
        isBot: true,
        isMe: false,
        actions: Array.from({ length: size.actions }, () => handCard(randomActionCard(mode))),
        defenses: Array.from({ length: size.defenses }, () => handCard(randomDefenseCard(mode))),
      }));
      const r = baseRoom(roomCode(), mode, 'bots', [me, ...botPlayers]);
      send({ type: 'SET_ROOM', room: r });
      return r.code;
    }

    for (let attempt = 0; attempt < 4; attempt++) {
      const r = baseRoom(roomCode(), mode, 'friends', [me]);
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room: r }),
      });
      if (res.status === 409) continue;
      if (!res.ok) throw new Error('No se pudo crear la sala');
      const snap = (await res.json()) as Snapshot;
      setRoom(snap.room);
      connect(snap.room!);
      return r.code;
    }
    throw new Error('No se pudo crear la sala, probá de nuevo');
  };

  const joinRoom: GameContextValue['joinRoom'] = async (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    const res = await fetch(`/api/rooms/${code}`);
    if (res.status === 404) throw new Error('No existe una sala con ese código');
    if (!res.ok) throw new Error('No se pudo conectar con la sala');
    const snap = (await res.json()) as Snapshot;
    const r = snap.room!;
    const already = r.players.some((p) => p.id === profileRef.current.id);
    if (!already && r.players.length >= MAX_PLAYERS[r.mode]) {
      throw new Error(r.mode === 'hot' ? 'Esa sala HOT ya tiene a la pareja completa' : 'La sala está llena (12 jugadores)');
    }
    clearTimers();
    setSettings((s) => ({ ...s, mode: r.mode }));
    setRoom(r);
    connect(r);
    if (!r.players.some((p) => p.id === profileRef.current.id)) {
      const me = buildMe(r.mode, r.players.length + 1);
      send({ type: 'ADD_PLAYER', player: me });
      log(`👋 ${me.name} se sumó a la mesa.`, 'system');
    }
  };

  const leaveRoom = () => {
    const r = roomRef.current;
    clearTimers();
    if (r?.kind === 'friends') {
      const me = r.players.find((p) => p.isMe);
      const actions: RoomAction[] = [
        { type: 'REMOVE_PLAYER', playerId: meId() },
        { type: 'LOG', entry: { id: uid('l_'), at: Date.now(), tone: 'system', text: `🚪 ${me?.name ?? 'Alguien'} se fue de la mesa.` } },
      ];
      void fetch(`/api/rooms/${r.code}/actions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ actions }),
        keepalive: true,
      }).catch(() => {});
    }
    transportRef.current.disconnect();
    transportRef.current = createLocalTransport();
    // Las cartas no usadas no se queman: siguen en el mazo semanal.
    setRoom(null);
  };

  const resetDeck = () => {
    const mode = roomRef.current?.mode ?? settings.mode;
    setDecks({ ...decksRef.current, [mode]: ensureCurrentWeek(null, mode) });
  };

  /** Checkout simulado: destraba las 20 PRO del modo para siempre. */
  const buyPack = (mode: GameMode) => {
    const u = ensureUnlocks(unlocksRef.current);
    if (!u.packs.includes(mode)) setUnlocks({ ...u, packs: [...u.packs, mode] });
  };

  /** Reto cumplido: la carta PRO queda habilitada hasta el lunes. */
  const unlockWithChallenge = (cardId: string) => {
    const u = ensureUnlocks(unlocksRef.current);
    if (!u.weekly.includes(cardId)) setUnlocks({ ...u, weekly: [...u.weekly, cardId] });
  };

  /* ---------------- acciones públicas: jugadas ---------------- */

  const throwAction: GameContextValue['throwAction'] = (handUid, targetId, extra) => {
    const me = player(meId());
    const slot = me?.actions.find((c) => c.uid === handUid && c.state === 'ready');
    if (!me || !slot || isGagged(me) || !hasBudget(getCard(slot.cardId).mode)) return;
    burn(slot.cardId); // -1 del presupuesto semanal, no vuelve hasta el lunes
    send({ type: 'SET_CARD_STATE', playerId: me.id, uid: slot.uid, state: 'used' });
    performAttack(me.id, slot.cardId, targetId, extra?.ruleText);
  };

  const gagPlayer: GameContextValue['gagPlayer'] = (handUid, targetId) => {
    const me = player(meId());
    const target = player(targetId);
    const slot = me?.defenses.find((c) => c.uid === handUid && c.state === 'ready');
    if (!me || !target || !slot || isImmune(target) || !hasBudget(getCard(slot.cardId).mode)) return;
    burn(slot.cardId);
    send({ type: 'SET_CARD_STATE', playerId: me.id, uid: slot.uid, state: 'used' });
    send({ type: 'PATCH_PLAYER', playerId: target.id, patch: { gaggedUntil: Date.now() + GAG_MINUTES * MIN } });
    send({ type: 'ADD_PLAY', play: { ...newPlay(slot.cardId, me.id, target.id, 'Mordaza'), status: 'gag' } });
    log(`🤐 Mordaza: ${target.name} no puede usar su Acción por ${GAG_MINUTES} min.`, 'defense');
  };

  const respondIncoming: GameContextValue['respondIncoming'] = (id, choice, opts = {}) => {
    const inc = roomRef.current?.incoming.find((i) => i.id === id);
    const play = inc && getPlay(inc.playId);
    const me = player(meId());
    if (!inc || !play || !me || inc.targetId !== me.id) return;
    send({ type: 'REMOVE_INCOMING', id });

    if (choice === 'defend' && inc.phase === 'defend') {
      const slot =
        me.defenses.find((c) => c.uid === opts.defenseUid && c.state === 'ready') ?? readyCards(me.defenses)[0];
      if (slot && hasBudget(getCard(slot.cardId).mode)) {
        const def = getCard(slot.cardId);
        burn(def.id);
        send({ type: 'SET_CARD_STATE', playerId: me.id, uid: slot.uid, state: 'used' });
        log(`🛡️ ${says(me.id, 'juega', 'jugaste')} «${def.name}».`, 'defense');
        applyDefense(play, me.id, def.defenseEffect!, def.id, opts.redirectTo);
        return;
      }
    }
    if (choice === 'refuse') {
      const name = getCard(play.cardId).name;
      send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'refused' });
      log(`🙅 ${says(me.id, 'se niega', 'te negaste')} a «${name}» → Ruleta.`, 'punish');
      pushRoulette(me.id, `Se negó a «${name}»`);
      return;
    }
    applyComply(play, !inc.noPropagate, inc.durationFactor ?? 1);
    if (inc.punishAfter) pushRoulette(me.id, 'Perdió el Doble o Nada');
  };

  const expireIncoming = (id: string) => {
    const inc = roomRef.current?.incoming.find((i) => i.id === id);
    if (!inc || inc.phase !== 'defend') return;
    send({ type: 'PATCH_INCOMING', id, patch: { phase: 'comply', reason: `Pasaron los ${DEFENSE_WINDOW_SECONDS} segundos` } });
  };

  const resolveRps = (defenderWins: boolean) => {
    const rps = roomRef.current?.rps;
    const play = rps && getPlay(rps.playId);
    if (!rps || !play) return;
    send({ type: 'SET_RPS', rps: null });
    if (defenderWins) {
      send({ type: 'SET_PLAY_STATUS', playId: play.id, status: 'nullified' });
      log(`✂️ ${says(rps.defenderId, 'gana', 'ganás')} el Doble o Nada: carta anulada.`, 'defense');
    } else {
      const doubled = rps.defenseCardId && getCard(rps.defenseCardId).rpsLose === 'double';
      log(
        `✂️ ${says(rps.defenderId, 'pierde', 'perdés')} ${doubled ? 'el Todo o Nada: cumple por el doble de tiempo' : 'el Doble o Nada: carta + castigo'}.`,
        'punish',
      );
      loseRps(play, rps.defenderId, rps.defenseCardId);
    }
  };

  const finishRoulette = (id: string, punishment: string) => {
    const req = roomRef.current?.roulettes.find((r) => r.id === id);
    if (!req) return;
    send({ type: 'REMOVE_ROULETTE', id });
    log(`🎡 Castigo para ${objOf(req.playerId)}: «${punishment}».`, 'punish');
  };

  /* ---------------- modo prueba (bots) ---------------- */

  const simulateBotAttack = (botId: string, cardId?: string) => {
    const bot = player(botId);
    const me = player(meId());
    const r = roomRef.current;
    if (!bot || !me || !r) return;
    if (isGagged(bot)) return log(`🤐 ${bot.name} está amordazado y no puede atacar.`, 'system');
    const slot = readyCards(bot.actions)[0];
    const chosen = cardId ?? slot?.cardId ?? randomActionCard(r.mode);
    const card = getCard(chosen);
    if (!card.targetMode || card.targetMode === 'single') {
      if (isImmune(me)) return log(`🏛️ ${bot.name} intentó atacarte, pero sos intocable.`, 'defense');
    }
    if (slot) {
      send({ type: 'SET_CARD_STATE', playerId: bot.id, uid: slot.uid, state: 'used' });
      refillBot(bot.id, slot.uid, 'action');
    }
    performAttack(bot.id, chosen, me.id);
  };

  const simulateBotGag = (botId: string) => {
    const bot = player(botId);
    const me = player(meId());
    const r = roomRef.current;
    if (!bot || !me || !r) return;
    if (isImmune(me)) return log(`🏛️ ${bot.name} quiso amordazarte, pero sos intocable.`, 'defense');
    const slot = readyCards(bot.defenses)[0];
    const def = slot?.cardId ?? randomDefenseCard(r.mode);
    if (slot) {
      send({ type: 'SET_CARD_STATE', playerId: bot.id, uid: slot.uid, state: 'used' });
      refillBot(bot.id, slot.uid, 'defense');
    }
    send({ type: 'PATCH_PLAYER', playerId: me.id, patch: { gaggedUntil: Date.now() + GAG_MINUTES * MIN } });
    send({ type: 'ADD_PLAY', play: { ...newPlay(def, bot.id, me.id, 'Mordaza'), status: 'gag' } });
    log(`🤐 ${bot.name} te amordazó: tu Acción queda bloqueada ${GAG_MINUTES} min.`, 'attack');
  };

  const setBotAuto = (value: boolean) => send({ type: 'SET_BOT_AUTO', value });

  // Bots autónomos: cada ~12s un bot puede tirar una carta a alguien.
  const autoRef = useRef<() => void>(() => {});
  autoRef.current = () => {
    const r = roomRef.current;
    if (r?.kind !== 'bots' || !r.botAuto || r.incoming.length || r.rps || r.roulettes.length) return;
    if (Math.random() > 0.45) return;
    const bots = r.players.filter((p) => p.isBot && readyCards(p.actions).length && !isGagged(p));
    if (!bots.length) return;
    const bot = pickRandom(bots);
    const slot = readyCards(bot.actions)[0];
    const targets = r.players.filter((p) => p.id !== bot.id && !isImmune(p));
    if (!targets.length) return;
    send({ type: 'SET_CARD_STATE', playerId: bot.id, uid: slot.uid, state: 'used' });
    refillBot(bot.id, slot.uid, 'action');
    performAttack(bot.id, slot.cardId, pickRandom(targets).id);
  };
  useEffect(() => {
    const t = setInterval(() => autoRef.current(), 12_000);
    return () => clearInterval(t);
  }, []);

  // Tras recargar la página, retoma las respuestas pendientes de los bots.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || resumedRef.current) return;
    resumedRef.current = true;
    if (roomRef.current?.kind !== 'bots') return;
    roomRef.current.table
      .filter((p) => p.status === 'pending' && player(p.toId)?.isBot)
      .forEach((p) => later(1500, () => botRespond(p.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const me = room?.players.find((p) => p.isMe) ?? null;

  const value: GameContextValue = {
    hydrated,
    profile,
    mode: activeMode,
    settings,
    deck: decks[activeMode],
    decks,
    unlockedIds: unlockedCardIds(unlocks),
    unlocks,
    buyPack,
    unlockWithChallenge,
    room,
    me,
    online,
    notice,
    clearNotice: () => setNotice(null),
    setName,
    setMode,
    confirmHot,
    createRoom,
    joinRoom,
    leaveRoom,
    resetDeck,
    throwAction,
    gagPlayer,
    respondIncoming,
    expireIncoming,
    resolveRps,
    finishRoulette,
    simulateBotAttack,
    simulateBotGag,
    setBotAuto,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

function pickRandomOrNull<T>(items: T[]): T | null {
  return items.length ? pickRandom(items) : null;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>');
  return ctx;
}

/** Reloj compartido para countdowns. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
