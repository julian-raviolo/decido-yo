'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import {
  DUEL_INTRO_MS,
  MINI_GAME_META,
  REFLEX_WINDOW_MS,
  RPS_MS,
  TAP_MS,
  getVenue,
} from '@/data/venues-catalog';
import type { DuelRound, DuelSide, RpsChoice, Saliduelo } from '@/types/game';

const RPS: { id: RpsChoice; emoji: string; label: string }[] = [
  { id: 'ROCK', emoji: '🪨', label: 'Piedra' },
  { id: 'PAPER', emoji: '📄', label: 'Papel' },
  { id: 'SCISSORS', emoji: '✂️', label: 'Tijera' },
];
const rpsEmoji = (c?: RpsChoice) => RPS.find((r) => r.id === c)?.emoji ?? '❔';

/** Reloj local a 10 fps mientras hay una mano en juego. */
function useTicker(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

/** Primera vez que este celular vio una clave (cada uno mide con su propio reloj). */
function useSeen() {
  const seen = useRef<Record<string, number>>({});
  return (key: string) => (seen.current[key] ??= Date.now());
}

/** Batalla de SALIDUELO: 3 manos con minijuegos al azar entre 2 representantes. */
export function DuelMatch() {
  const game = useGame();
  const room = game.room;
  const sd = room?.saliduelo;
  const round = sd?.phase === 'battle' ? sd.round : undefined;
  const now = useTicker(!!round);
  const seen = useSeen();
  if (!room || !sd || !round) return null;

  const me = room.players.find((p) => p.isMe);
  const name = (id: string) => room.players.find((p) => p.id === id)?.name ?? '¿?';
  const mySide: DuelSide | null = me ? (round.reps.A === me.id ? 'A' : round.reps.B === me.id ? 'B' : null) : null;
  const key = `${room.code}:${round.n}:${round.ties}`;
  const el = now - seen(key) - DUEL_INTRO_MS;
  const meta = MINI_GAME_META[round.game];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-night/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-3">
        <Scoreboard sd={sd} round={round} />
        <div className="text-center">
          <div className="text-[11px] font-black uppercase tracking-widest text-white/70">Mano {round.n} de 3</div>
          <div className="font-display text-2xl font-black uppercase leading-tight text-cream">
            {meta.emoji} {meta.label}
          </div>
          <div className="mt-1 text-sm font-bold text-white/85">
            🎯 Representantes de esta mano: <b className="text-lime">{name(round.reps.A)}</b> vs{' '}
            <b className="text-lime">{name(round.reps.B)}</b>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {round.winner ? (
              <Result key={`res-${round.n}`} sd={sd} round={round} />
            ) : el < 0 ? (
              <motion.div
                key={`intro-${key}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 16, stiffness: 260 }}
                className="text-center"
              >
                {round.ties > 0 && (
                  <div className="mb-2 font-display text-xl font-black uppercase text-social">¡Empate! Va de nuevo</div>
                )}
                <div className="font-display text-7xl font-black text-cream">{Math.ceil(-el / 1000)}</div>
                <p className="mt-2 text-sm font-semibold text-white/75">{meta.hint}</p>
              </motion.div>
            ) : round.game === 'RPS' ? (
              <RpsGame key={key} round={round} el={el} mySide={mySide} name={name} />
            ) : round.game === 'REFLEX' ? (
              <ReflexGame key={key} round={round} el={el} mySide={mySide} />
            ) : (
              <TapGame key={key} sd={sd} round={round} el={el} mySide={mySide} />
            )}
          </AnimatePresence>
        </div>
        {!mySide && !round.winner && (
          <p className="text-center text-[11px] font-black uppercase tracking-widest text-white/60">
            Mirá y alentá a tu bando 📣
          </p>
        )}
      </div>
    </div>
  );
}

function Scoreboard({ sd, round }: { sd: Saliduelo; round: DuelRound }) {
  const side = (s: DuelSide) => {
    const v = sd.sides[s] && getVenue(sd.sides[s]!.venueId);
    const wins = sd.wins?.[s] ?? 0;
    return (
      <div className={`flex min-w-0 flex-1 items-center gap-2 ${s === 'B' ? 'flex-row-reverse text-right' : ''}`}>
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-[3px] border-black text-xl"
          style={{ backgroundColor: v?.logoColor ?? '#FFFDF7' }}
        >
          {v?.logoEmoji ?? s}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[11px] font-black uppercase leading-tight text-cream">{v?.name ?? `Lugar ${s}`}</div>
          <div className="font-display text-xl font-black leading-none text-lime">{wins}</div>
        </div>
      </div>
    );
  };
  const done = sd.history ?? [];
  return (
    <div className="rounded-3xl border-4 border-black bg-panel p-2.5 shadow-brutal-sm">
      <div className="flex items-center gap-2">
        {side('A')}
        <span className="font-display text-sm font-black text-white/70">VS</span>
        {side('B')}
      </div>
      <div className="mt-2 flex justify-center gap-2" aria-label="Manos">
        {[1, 2, 3].map((n) => {
          const h = done.find((d) => d.n === n);
          return (
            <span
              key={n}
              className={`grid h-6 min-w-12 place-items-center rounded-full border-2 border-black px-2 text-[10px] font-black uppercase ${
                h ? 'bg-lime text-black' : n === round.n ? 'bg-cream text-black' : 'bg-black/40 text-white/60'
              }`}
            >
              {h ? `Gana ${h.winner}` : `Mano ${n}`}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Result({ sd, round }: { sd: Saliduelo; round: DuelRound }) {
  const v = round.winner && sd.sides[round.winner] ? getVenue(sd.sides[round.winner]!.venueId) : null;
  return (
    <motion.div
      initial={{ scale: 0.5, rotate: -6, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', damping: 14, stiffness: 260 }}
      className="text-center"
    >
      {round.game === 'RPS' && round.choices && (
        <div className="mb-3 text-6xl">
          {rpsEmoji(round.choices[round.reps.A])} <span className="text-2xl text-white/60">vs</span>{' '}
          {rpsEmoji(round.choices[round.reps.B])}
        </div>
      )}
      <div className="font-display text-3xl font-black uppercase text-lime">🏅 Mano para</div>
      <div className="mt-1 font-display text-2xl font-black uppercase text-cream">
        {v ? `${v.logoEmoji} ${v.name}` : `Lugar ${round.winner}`}
      </div>
    </motion.div>
  );
}

/* ---------- 🪨📄✂️ Piedra, Papel o Tijera ---------- */

function RpsGame({
  round,
  el,
  mySide,
  name,
}: {
  round: DuelRound;
  el: number;
  mySide: DuelSide | null;
  name: (id: string) => string;
}) {
  const game = useGame();
  const myId = mySide ? round.reps[mySide] : null;
  const mine = myId ? round.choices?.[myId] : undefined;
  const left = Math.max(0, RPS_MS - el);

  // Se acabó el tiempo: se juega al azar.
  useEffect(() => {
    if (myId && !mine && left <= 0) game.duelRps(RPS[Math.floor(Math.random() * 3)].id);
  }, [myId, mine, left, game]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full">
      <Timer left={left} total={RPS_MS} />
      {myId && !mine ? (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {RPS.map((r) => (
            <button
              key={r.id}
              onClick={() => game.duelRps(r.id)}
              className="flex h-28 flex-col items-center justify-center gap-1 rounded-3xl border-4 border-black bg-cream text-black shadow-brutal transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <span className="text-5xl leading-none">{r.emoji}</span>
              <span className="text-xs font-black uppercase">{r.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-center">
          <div className="font-display text-xl font-black uppercase text-cream">
            {mine ? 'Jugada lista – Esperando al rival…' : 'Están eligiendo…'}
          </div>
          <div className="mt-3 flex justify-center gap-4 text-sm font-bold text-white/80">
            {(['A', 'B'] as const).map((s) => (
              <span key={s}>
                {round.choices?.[round.reps[s]] ? '✅' : '⏳'} {name(round.reps[s])}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ---------- ⚡ Duelo de Reflejos ---------- */

function ReflexGame({ round, el, mySide }: { round: DuelRound; el: number; mySide: DuelSide | null }) {
  const game = useGame();
  const myId = mySide ? round.reps[mySide] : null;
  const sent = myId ? round.reactions?.[myId] : undefined;
  const go = el >= round.delay;
  const signalAt = useRef<number | null>(null);
  if (go && signalAt.current === null) signalAt.current = Date.now();

  // No tocó a tiempo: reacción máxima.
  useEffect(() => {
    if (myId && sent === undefined && el > round.delay + REFLEX_WINDOW_MS) game.duelReact(REFLEX_WINDOW_MS);
  }, [myId, sent, el, round.delay, game]);

  const tap = () => {
    if (!myId || sent !== undefined) return;
    game.duelReact(signalAt.current === null ? -1 : Date.now() - signalAt.current);
  };

  const label =
    sent !== undefined
      ? sent < 0
        ? '¡Te adelantaste!'
        : `${sent} ms`
      : go
        ? '¡TOCÁ AHORA!'
        : 'Esperá la señal… ¡NO TOQUES!';

  return (
    <motion.button
      type="button"
      onPointerDown={tap}
      disabled={!myId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, scale: go && sent === undefined ? [1, 1.03, 1] : 1 }}
      exit={{ opacity: 0 }}
      className={`flex h-[52dvh] w-full select-none items-center justify-center rounded-3xl border-4 border-black p-6 text-center shadow-brutal transition-colors duration-75 ${
        go ? 'bg-[#00E676] text-black' : 'bg-special text-white'
      }`}
    >
      <span className="font-display text-3xl font-black uppercase leading-tight">
        {myId ? label : go ? '¡YA!' : 'Esperando la señal…'}
      </span>
    </motion.button>
  );
}

/* ---------- 🔥 Tap Frenético ---------- */

function TapGame({ sd, round, el, mySide }: { sd: Saliduelo; round: DuelRound; el: number; mySide: DuelSide | null }) {
  const game = useGame();
  const myId = mySide ? round.reps[mySide] : null;
  const count = useRef(0);
  const [local, setLocal] = useState(0);
  const lastSent = useRef(0);
  const finished = el >= TAP_MS;

  // Envío periódico del conteo y el final al terminar los 7 segundos.
  useEffect(() => {
    if (!myId || round.done?.[myId]) return;
    if (finished) game.duelTaps(count.current, true);
    else if (count.current !== lastSent.current) {
      lastSent.current = count.current;
      game.duelTaps(count.current, false);
    }
  }, [myId, finished, el, round.done, game]);

  const tA = myId === round.reps.A ? local : (round.taps?.[round.reps.A] ?? 0);
  const tB = myId === round.reps.B ? local : (round.taps?.[round.reps.B] ?? 0);
  const pct = tA + tB === 0 ? 50 : (tA / (tA + tB)) * 100;
  const colorA = sd.sides.A ? getVenue(sd.sides.A.venueId).logoColor : '#FFD600';
  const colorB = sd.sides.B ? getVenue(sd.sides.B.venueId).logoColor : '#00E5FF';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full">
      <Timer left={Math.max(0, TAP_MS - el)} total={TAP_MS} />
      <div className="mt-4 flex items-center justify-between text-sm font-black text-cream">
        <span>A · {tA}</span>
        <span>{tB} · B</span>
      </div>
      <div className="mt-1 h-8 overflow-hidden rounded-full border-4 border-black" style={{ backgroundColor: colorB }}>
        <motion.div
          className="h-full border-r-4 border-black"
          style={{ backgroundColor: colorA }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        />
      </div>
      {myId && !finished && (
        <button
          type="button"
          onPointerDown={() => {
            count.current += 1;
            setLocal(count.current);
          }}
          className="mt-5 h-[34dvh] w-full select-none rounded-3xl border-4 border-black bg-lime font-display text-4xl font-black uppercase text-black shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          ¡TOCÁ! 🔥
        </button>
      )}
      {(finished || !myId) && (
        <p className="mt-5 text-center font-display text-lg font-black uppercase text-cream">
          {finished ? 'Contando toques…' : '¡Pulso de fuerza!'}
        </p>
      )}
    </motion.div>
  );
}

function Timer({ left, total }: { left: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-black bg-black/50">
        <div className="h-full bg-social transition-[width] duration-100" style={{ width: `${(left / total) * 100}%` }} />
      </div>
      <span className="w-8 text-right font-display text-sm font-black text-cream">{Math.ceil(left / 1000)}s</span>
    </div>
  );
}
