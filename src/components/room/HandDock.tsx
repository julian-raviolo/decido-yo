'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronsUp, Lock } from 'lucide-react';
import { CardBack, GameCard } from '@/components/GameCard';
import { BrutalButton } from '@/components/ui';
import { GAG_MINUTES } from '@/data/cards-catalog';
import type { HandCard, Player } from '@/types/game';

export type Slot = 'action' | 'defense';
export interface Focus {
  uid: string;
  cardId: string;
  slot: Slot;
}

export function HandDock({
  me,
  gagged,
  onFocus,
}: {
  me: Player;
  gagged: boolean;
  onFocus: (f: Focus) => void;
}) {
  type Entry = { slot: Slot; card: HandCard | null; label: string };
  const entries: Entry[] = [
    ...(me.actions.length ? me.actions : [null]).map((card, i, all) => ({
      slot: 'action' as const,
      card,
      label: all.length > 1 ? `Acción ${i + 1}` : 'Slot 1 · Acción',
    })),
    ...(me.defenses.length ? me.defenses : [null]).map((card, i, all) => ({
      slot: 'defense' as const,
      card,
      label: all.length > 1 ? `Defensa ${i + 1}` : 'Slot 2 · Defensa',
    })),
  ];
  const size = entries.length > 2 ? 'md' : 'sm';

  return (
    <div className={`flex items-end justify-center ${size === 'md' ? 'gap-2' : 'gap-4'}`}>
      {entries.map(({ slot, card, label }, i) => {
        const state = card?.state;
        const locked = slot === 'action' && gagged && state === 'ready';
        const usable = state === 'ready';
        return (
          <div key={card?.uid ?? `${slot}-${i}`} className="flex flex-col items-center gap-2">
            {card ? (
              <motion.button
                onClick={() => usable && onFocus({ uid: card.uid, cardId: card.cardId, slot })}
                whileTap={usable ? { scale: 0.95 } : undefined}
                animate={usable ? { y: [0, -4, 0] } : { y: 0 }}
                transition={usable ? { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: i * 0.6 } : undefined}
                className="rounded-3xl"
              >
                <GameCard cardId={card.cardId} size={size} state={usable ? (locked ? 'locked' : 'ready') : 'burned'} />
              </motion.button>
            ) : (
              <CardBack size={size} label="Sin cartas esta semana" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
              {state === 'looted' ? 'Saqueada' : label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function CardFocus({
  focus,
  locked,
  onClose,
  onThrow,
}: {
  focus: Focus | null;
  locked: boolean;
  onClose: () => void;
  onThrow: () => void;
}) {
  const y = useMotionValue(0);
  const glow = useTransform(y, [-160, 0], [1, 0]);
  const hintOpacity = useTransform(y, [-80, 0], [0, 1]);
  const [thrown, setThrown] = useState(false);
  const slot = focus?.slot ?? null;
  const cardId = focus?.cardId ?? null;

  useEffect(() => {
    if (focus) {
      setThrown(false);
      y.set(0);
    }
  }, [focus, y]);

  const fire = () => {
    if (locked) return;
    setThrown(true);
    onThrow();
  };

  return (
    <AnimatePresence custom={thrown}>
      {slot && cardId && (
        <motion.div
          key="focus"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, delay: thrown ? 0.15 : 0 } }}
          onClick={onClose}
        >
          <motion.div
            style={{ opacity: hintOpacity }}
            className="mb-5 flex flex-col items-center text-lime"
          >
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.1 }}>
              <ChevronsUp size={34} strokeWidth={3} />
            </motion.div>
            <span className="font-display text-sm font-black uppercase tracking-wider">
              {locked ? 'Carta bloqueada' : slot === 'action' ? 'Deslizá para tirar' : 'Deslizá para amordazar'}
            </span>
          </motion.div>

          <motion.div
            custom={thrown}
            variants={{
              hidden: { y: 260, scale: 0.6, rotate: -6, opacity: 0 },
              shown: { y: 0, scale: 1, rotate: 0, opacity: 1 },
              gone: (t: boolean) =>
                t
                  ? { y: -900, rotate: -18, scale: 0.7, transition: { duration: 0.35, ease: 'easeIn' } }
                  : { y: 300, scale: 0.6, opacity: 0, transition: { duration: 0.2 } },
            }}
            initial="hidden"
            animate="shown"
            exit="gone"
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            drag={locked ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.9, bottom: 0.15 }}
            style={{ y }}
            onClick={(e) => e.stopPropagation()}
            onDragEnd={(_, info) => {
              if (info.offset.y < -110 || info.velocity.y < -650) fire();
            }}
            className="relative touch-none rounded-3xl"
          >
            <motion.div
              className="pointer-events-none absolute -inset-3 rounded-[2.2rem] bg-lime blur-xl"
              style={{ opacity: glow }}
            />
            <GameCard cardId={cardId} size="lg" state={locked ? 'locked' : 'ready'} />
          </motion.div>

          <div className="mt-6 w-full max-w-[300px] text-center text-[12px] font-semibold text-white/80" onClick={(e) => e.stopPropagation()}>
            {slot === 'defense' ? (
              <p>
                <b className="text-defense">Uso reactivo:</b> se activa cuando te atacan (60 s para responder).
                <br />
                <b className="text-defense">Uso activo (Mordaza):</b> bloqueá la Acción de alguien por {GAG_MINUTES} min.
              </p>
            ) : locked ? (
              <p className="flex items-center justify-center gap-1 text-special">
                <Lock size={14} strokeWidth={3} /> Te amordazaron: no podés usar tu Acción todavía.
              </p>
            ) : (
              <p>Al usarla se quema de tu mazo semanal hasta el lunes.</p>
            )}
            <div className="mt-4 flex gap-3">
              <BrutalButton variant="cream" className="flex-1 py-2.5 text-sm" onClick={onClose}>
                Volver
              </BrutalButton>
              <BrutalButton
                variant={slot === 'defense' ? 'cyan' : 'lime'}
                className="flex-1 py-2.5 text-sm"
                disabled={locked}
                onClick={fire}
              >
                {slot === 'defense' ? 'Mordaza' : 'Tirar'}
              </BrutalButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
