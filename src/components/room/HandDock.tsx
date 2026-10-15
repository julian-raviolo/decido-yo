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
  reshufflesLeft,
  onReshuffle,
  rechargeLabel,
  onRecharge,
}: {
  me: Player;
  gagged: boolean;
  /** Presupuesto semanal agotado: no se puede quemar nada. */
  noBudget: boolean;
  onFocus: (f: Focus) => void;
  /** Re-barajados gratis que quedan esta semana. */
  reshufflesLeft: number;
  onReshuffle: () => void;
  /** Precio de recargar una mano entera (ej. "$0.50 USD"). */
  rechargeLabel: string;
  onRecharge: () => void;
}) {
  const groups: { slot: Slot; title: string; cards: HandCard[]; tint: string }[] = [
    { slot: 'action', title: 'Acción', cards: me.actions, tint: '#FFD600' },
    { slot: 'defense', title: 'Escudos', cards: me.defenses, tint: '#00E5FF' },
  ];
  const total = me.actions.length + me.defenses.length;
  const compact = useShortScreen();
  // Con más de 3 cartas: abanicos agrupados (cartas más chicas) y "vista previa" antes de elegir.
  const fan = total > 3;
  const size = fan || compact ? 'md' : 'hand';
  const [preview, setPreview] = useState<string | null>(null);
  const overlap = 42;

  const all = [...me.actions, ...me.defenses];
  const anyReady = all.some((c) => c.state === 'ready');
  const outOfCards = !anyReady || noBudget;
  useEffect(() => {
    if (preview && !all.some((c) => c.uid === preview && c.state === 'ready')) setPreview(null);
  }, [all, preview]);

  const pick = (card: HandCard, slot: Slot) => {
    if (card.state !== 'ready') return;
    if (fan && preview !== card.uid) return setPreview(card.uid); // 1er toque: se acerca y se agranda
    setPreview(null);
    onFocus({ uid: card.uid, cardId: card.cardId, slot }); // 2do toque: elegir
  };

  return (
    <div className="flex flex-col gap-1.5">
      {outOfCards ? (
        <div className="flex items-center gap-2 rounded-2xl border-[3px] border-black bg-special px-3 py-2 text-white shadow-brutal-sm">
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block font-display text-sm font-black uppercase">¡Te quedaste sin cartas!</span>
            <span className="block text-[10px] font-semibold opacity-85">
              {noBudget ? 'Gastaste tus 10 usos de la semana.' : 'Quemaste toda tu mano.'}
            </span>
          </span>
          <button
            onClick={onRecharge}
            className="shrink-0 rounded-2xl border-[3px] border-black bg-lime px-2.5 py-1.5 text-[11px] font-black uppercase text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            ⚡ Recargar · {rechargeLabel.replace(' USD', '')}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end">
          <button
            onClick={onReshuffle}
            className="flex items-center gap-1 rounded-full border-2 border-black bg-cream px-2.5 py-0.5 text-[10px] font-black uppercase text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            🔄 Re-barajar mano · {reshufflesLeft > 0 ? `quedan ${reshufflesLeft}/2 gratis` : '$0.50'}
          </button>
        </div>
      )}
    <div
      onClick={(e) => e.target === e.currentTarget && setPreview(null)}
      className={`-mx-4 flex items-end gap-3 px-4 pb-1 ${
        fan
          ? 'justify-center overflow-visible pt-12'
          : 'snap-x snap-mandatory overflow-x-auto pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
      } ${total <= 3 ? 'justify-center' : ''}`}
    >
      {groups.map(({ slot, title, cards, tint }, g) => (
        <div key={slot} className="flex shrink-0 items-end gap-3">
          {g > 0 && (
            <div
              className={`${size === 'md' ? 'h-[110px]' : 'h-[150px]'} w-[3px] shrink-0 self-center rounded-full bg-white/15`}
              aria-hidden
            />
          )}
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 pl-1 text-[10px] font-black uppercase tracking-widest text-white/70">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-black" style={{ background: tint }} />
              {title} · {readyCount(cards)}/{cards.length}
            </span>
            <div className={`relative flex ${fan ? '' : 'gap-2.5'}`}>
              {cards.length === 0 && <CardBack size={size} label="Sin cartas disponibles" />}
              {cards.map((card, i) => {
                const usable = card.state === 'ready';
                const gag = slot === 'action' && gagged;
                const locked = usable && (gag || noBudget);
                const mid = (cards.length - 1) / 2;
                const isPreview = preview === card.uid;
                const dimmed = fan && preview !== null && !isPreview;
                return (
                  <motion.button
                    key={card.uid}
                    onClick={() => pick(card, slot)}
                    whileTap={usable ? { scale: fan ? 1.08 : 0.94 } : undefined}
                    initial={{ y: 40, opacity: 0 }}
                    animate={
                      fan
                        ? {
                            opacity: dimmed ? 0.75 : 1,
                            y: isPreview ? -44 : Math.abs(i - mid) * 5 + (dimmed ? 6 : 0),
                            rotate: isPreview ? 0 : (i - mid) * 7,
                            scale: isPreview ? 1.45 : 1,
                          }
                        : { y: 0, opacity: 1 }
                    }
                    transition={{ type: 'spring', damping: 17, stiffness: 260, delay: preview ? 0 : (g * 3 + i) * 0.05 }}
                    style={{
                      marginLeft: fan && i > 0 ? -overlap : 0,
                      zIndex: isPreview ? 50 : i,
                      transformOrigin: '50% 100%',
                    }}
                    className={`relative shrink-0 rounded-[1.4rem] ${fan ? '' : 'snap-start'}`}
                    aria-label={`${title} ${i + 1}`}
                    aria-pressed={fan ? isPreview : undefined}
                  >
                    <GameCard
                      cardId={card.cardId}
                      size={size}
                      state={usable ? (locked ? 'locked' : 'ready') : 'burned'}
                      lockLabel={gag ? 'Amordazada' : 'Sin usos esta semana'}
                    />
                    {isPreview && (
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-black bg-lime px-1.5 py-0.5 text-[7px] font-black uppercase text-black shadow-brutal-sm"
                      >
                        Tocá de nuevo
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}

/** Pantallas bajas (ej. iPhone SE): la mano usa cartas más chicas. */
function useShortScreen() {
  const [short, setShort] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-height: 740px)');
    const update = () => setShort(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return short;
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
