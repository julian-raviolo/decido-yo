'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Hourglass } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { getCard } from '@/data/cards-catalog';
import { RPS_CHOOSE_SECONDS } from '@/context/GameContext';
import type { Player, RpsChoice, RpsMatch } from '@/types/game';

const MOVES: { id: RpsChoice; label: string; emoji: string; color: string }[] = [
  { id: 'ROCK', label: 'Piedra', emoji: '🪨', color: '#FF5722' },
  { id: 'PAPER', label: 'Papel', emoji: '📄', color: '#FFFDF7' },
  { id: 'SCISSORS', label: 'Tijera', emoji: '✂️', color: '#00E5FF' },
];
const EMOJI: Record<RpsChoice, string> = { ROCK: '🪨', PAPER: '📄', SCISSORS: '✂️' };
const LABEL: Record<RpsChoice, string> = { ROCK: 'Piedra', PAPER: 'Papel', SCISSORS: 'Tijera' };
const BEATS: Record<RpsChoice, RpsChoice> = { ROCK: 'SCISSORS', PAPER: 'ROCK', SCISSORS: 'PAPER' };
/** Duración del "¡Piedra, Papel o Tijera!" antes del revelado (el resultado lo aplica GameContext). */
const COUNT_MS = 1700;
const POP = { type: 'spring', damping: 15, stiffness: 300 } as const;

/**
 * Piedra, Papel o Tijera sincronizado: cada participante elige en su celu, la
 * jugada rival queda oculta hasta que están las dos, y recién ahí se cuenta y
 * se revela. Los terceros miran sin botones.
 */
export function RpsModal({
  rps,
  players,
  now,
  onChoose,
}: {
  rps: RpsMatch;
  players: Player[];
  now: number;
  onChoose: (choice: RpsChoice) => void;
}) {
  const reduce = !!useReducedMotion();
  const me = players.find((p) => p.isMe);
  const attacker = players.find((p) => p.id === rps.attackerId);
  const defender = players.find((p) => p.id === rps.defenderId);
  const round = rps.round ?? 0;
  const choices = rps.choices ?? {};
  const isAttacker = me?.id === rps.attackerId;
  const isDefender = me?.id === rps.defenderId;
  const playing = isAttacker || isDefender;
  // Frente a frente: yo a la izquierda si juego; si miro, el defensor a la izquierda.
  const left = isAttacker ? attacker : defender;
  const right = isAttacker ? defender : attacker;
  const mine = me ? choices[me.id] : undefined;
  const both = !!choices[rps.attackerId] && !!choices[rps.defenderId];

  // Etapas locales: elegir → conteo (manos que se sacuden) → revelado.
  const [stage, setStage] = useState<'choose' | 'count' | 'reveal'>('choose');
  useEffect(() => {
    if (!both) {
      setStage('choose');
      return;
    }
    if (reduce) {
      setStage('reveal');
      return;
    }
    setStage('count');
    const t = setTimeout(() => setStage('reveal'), COUNT_MS);
    return () => clearTimeout(t);
  }, [both, rps.id, round, reduce]);

  const defenseCard = rps.defenseCardId ? getCard(rps.defenseCardId) : null;
  const penalty = defenseCard?.rpsLose === 'double' ? 'la carta por el doble de tiempo' : 'carta + castigo';
  const stakes = isDefender
    ? `Si ganás, se anula. Si perdés: ${penalty}.`
    : isAttacker
      ? `Si ganás, ${defender?.name} cumple ${penalty}. Si perdés, se anula.`
      : `Si gana ${defender?.name}, se anula la carta.`;

  const leftChoice = left ? choices[left.id] : undefined;
  const rightChoice = right ? choices[right.id] : undefined;
  const defenderWins =
    both && choices[rps.defenderId] !== choices[rps.attackerId]
      ? BEATS[choices[rps.defenderId]!] === choices[rps.attackerId]
      : null;
  const tie = both && defenderWins === null;
  const winner = defenderWins === null ? null : defenderWins ? defender : attacker;
  const headline = tie
    ? '¡Empate!'
    : winner?.isMe
      ? '¡Ganaste!'
      : playing
        ? 'Perdiste'
        : `Gana ${winner?.name}`;
  const sub = tie
    ? 'Va de nuevo…'
    : defenderWins
      ? `«${getCard(rps.cardId).name}» queda anulada.`
      : `${defender?.isMe ? 'Te toca' : `A ${defender?.name} le toca`}: ${penalty}.`;

  const secsLeft = Math.max(0, Math.ceil(RPS_CHOOSE_SECONDS - (now - (rps.roundAt ?? now)) / 1000));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 px-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="w-full max-w-[400px] rounded-3xl border-4 border-black bg-social p-5 text-black shadow-brutal-cream"
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest">
            {defenseCard?.name ?? 'Doble o Nada'}
            {round > 0 && (
              <span className="rounded-full border-2 border-black bg-cream px-2 text-[10px]">Ronda {round + 1}</span>
            )}
          </div>
          <h2 className="font-display text-2xl font-black uppercase leading-tight">Piedra, Papel o Tijera</h2>
          <p className="mt-1 text-sm font-semibold">
            Por «{getCard(rps.cardId).name}». {stakes}
          </p>
        </div>

        {/* Frente a frente */}
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Fighter
            player={left}
            you={playing}
            choice={leftChoice}
            ready={!!leftChoice}
            stage={stage}
            showOwn={playing && !both}
            reduce={reduce}
          />
          <span className="font-display text-xl font-black uppercase">vs</span>
          <Fighter
            player={right}
            choice={rightChoice}
            ready={!!rightChoice}
            stage={stage}
            mirrored
            reduce={reduce}
          />
        </div>

        <div className="mt-4 min-h-[124px]">
          <AnimatePresence mode="wait" initial={false}>
            {stage === 'count' ? (
              <motion.p
                key="count"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={POP}
                className="pt-6 text-center font-display text-2xl font-black uppercase leading-none"
              >
                ¡Piedra, Papel o Tijera!
              </motion.p>
            ) : stage === 'reveal' ? (
              <motion.div
                key={`reveal-${round}`}
                initial={{ scale: 0.5, opacity: 0, rotate: -4 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={POP}
                className={`rounded-3xl border-4 border-black p-4 text-center shadow-brutal ${
                  tie ? 'bg-cream' : winner?.isMe ? 'bg-lime' : 'bg-cream'
                }`}
              >
                <div className="font-display text-3xl font-black uppercase leading-none">{headline}</div>
                <p className="mt-2 text-sm font-semibold">{sub}</p>
              </motion.div>
            ) : playing && !mine ? (
              <motion.div key="choose" exit={{ opacity: 0 }} className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-3">
                  {MOVES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onChoose(m.id)}
                      aria-label={m.label}
                      className="flex h-24 flex-col items-center justify-center gap-1 rounded-3xl border-4 border-black shadow-brutal transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
                      style={{ backgroundColor: m.color }}
                    >
                      <span className="text-4xl leading-none">{m.emoji}</span>
                      <span className="text-xs font-black uppercase">{m.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-center text-[11px] font-black uppercase tracking-widest text-black/70">
                  Elegí en {secsLeft} s · si no, va al azar
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="wait"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 rounded-3xl border-4 border-black bg-cream p-4 text-center"
              >
                {playing && mine && (
                  <span className="flex items-center gap-1.5 rounded-full border-2 border-black bg-lime px-3 py-0.5 text-[11px] font-black uppercase">
                    <Check size={12} strokeWidth={3} /> Jugada lista · {EMOJI[mine]} {LABEL[mine]}
                  </span>
                )}
                <span className="flex items-center gap-2 font-display text-base font-black uppercase">
                  <Hourglass size={16} strokeWidth={3} className={reduce ? '' : 'animate-pulse'} />
                  {playing ? 'Esperando al rival…' : `${defender?.name} vs ${attacker?.name} están jugando…`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/** Un jugador del duelo: avatar, estado (eligiendo / lista) y su mano en el conteo y el revelado. */
function Fighter({
  player,
  you,
  choice,
  ready,
  stage,
  showOwn,
  mirrored,
  reduce,
}: {
  player?: Player;
  you?: boolean;
  choice?: RpsChoice;
  ready: boolean;
  stage: 'choose' | 'count' | 'reveal';
  /** Mi propia jugada se ve mientras espero; la del rival, nunca antes del revelado. */
  showOwn?: boolean;
  mirrored?: boolean;
  reduce: boolean;
}) {
  const hand = stage === 'reveal' && choice ? EMOJI[choice] : stage === 'count' ? '✊' : showOwn && choice ? EMOJI[choice] : null;
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <div className="grid h-[72px] place-items-center">
        {hand ? (
          <motion.span
            key={`${stage}-${hand}`}
            className="block text-6xl leading-none"
            style={{ scaleX: mirrored ? -1 : 1 }}
            initial={stage === 'reveal' && !reduce ? { scale: 0.3, rotate: mirrored ? 20 : -20 } : false}
            animate={
              stage === 'count' && !reduce
                ? { y: [0, -18, 0, -18, 0, -18, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={stage === 'count' ? { duration: 1.5, ease: 'easeInOut' } : POP}
          >
            {hand}
          </motion.span>
        ) : player ? (
          <Avatar name={player.name} color={player.color} size={56} />
        ) : null}
      </div>
      <span className="max-w-full truncate font-display text-sm font-black uppercase">
        {you ? 'Vos' : player?.name ?? '¿?'}
      </span>
      {stage === 'choose' && (
        <span
          className={`rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase ${
            ready ? 'bg-lime' : 'bg-cream'
          }`}
        >
          {ready ? '¡Lista!' : 'Eligiendo…'}
        </span>
      )}
    </div>
  );
}
