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
  noBudget,
  onFocus,
}: {
  me: Player;
  gagged: boolean;
  /** Presupuesto semanal agotado: no se puede quemar nada. */
  noBudget: boolean;
  onFocus: (f: Focus) => void;
}) {
  const groups: { slot: Slot; title: string; cards: HandCard[]; tint: string }[] = [
    { slot: 'action', title: 'Acción', cards: me.actions, tint: '#FFD600' },
    { slot: 'defense', title: 'Escudos', cards: me.defenses, tint: '#00E5FF' },
  ];
  const total = me.actions.length + me.defenses.length;

  return (
    <div
      className={`-mx-4 flex snap-x snap-mandatory items-end gap-3 overflow-x-auto px-4 pb-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        total <= 3 ? 'justify-center' : ''
      }`}
    >
      {groups.map(({ slot, title, cards, tint }, g) => (
        <div key={slot} className="flex shrink-0 items-end gap-3">
          {g > 0 && <div className="h-[150px] w-[3px] shrink-0 self-center rounded-full bg-white/15" aria-hidden />}
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 pl-1 text-[10px] font-black uppercase tracking-widest text-white/70">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-black" style={{ background: tint }} />
              {title} · {readyCount(cards)}/{cards.length}
            </span>
            <div className="flex gap-2.5">
              {cards.length === 0 && <CardBack size="hand" label="Sin cartas disponibles" />}
              {cards.map((card, i) => {
                const usable = card.state === 'ready';
                const gag = slot === 'action' && gagged;
                const locked = usable && (gag || noBudget);
                return (
                  <motion.button
                    key={card.uid}
                    onClick={() => usable && onFocus({ uid: card.uid, cardId: card.cardId, slot })}
                    whileTap={usable ? { scale: 0.94, rotate: -2 } : undefined}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 220, delay: (g * 3 + i) * 0.05 }}
                    className="shrink-0 snap-start rounded-[1.4rem]"
                    aria-label={`${title} ${i + 1}`}
                  >
                    <GameCard
                      cardId={card.cardId}
                      size="hand"
                      state={usable ? (locked ? 'locked' : 'ready') : 'burned'}
                      lockLabel={gag ? 'Amordazada' : 'Sin usos esta semana'}
                    />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const readyCount = (cards: HandCard[]) => cards.filter((c) => c.state === 'ready').length;

export function CardFocus({
  focus,
  locked,
  lockReason,
  onClose,
  onThrow,
}: {
  focus: Focus | null;
  locked: boolean;
  lockReason?: string;
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
            <GameCard cardId={cardId} size="lg" state={locked ? 'locked' : 'ready'} lockLabel={lockReason} />
          </motion.div>

          <div className="mt-6 w-full max-w-[300px] text-center text-[12px] font-semibold text-white/80" onClick={(e) => e.stopPropagation()}>
            {locked ? (
              <p className="flex items-center justify-center gap-1 font-bold text-social">
                <Lock size={14} strokeWidth={3} /> {lockReason}
              </p>
            ) : slot === 'defense' ? (
              <p>
                <b className="text-defense">Uso reactivo:</b> se activa cuando te atacan (60 s para responder).
                <br />
                <b className="text-defense">Uso activo (Mordaza):</b> bloqueá la Acción de alguien por {GAG_MINUTES} min.
              </p>
            ) : (
              <p>Al usarla gastás 1 de tus 10 usos semanales y no vuelve a salir hasta el lunes.</p>
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
