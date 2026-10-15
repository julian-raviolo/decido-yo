'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Crown, Dices, Eye, Flame, PartyPopper, Unlock } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { BrutalButton, Sheet } from '@/components/ui';
import {
  PACK_NAMES,
  PRICES,
  SCENARIO_META,
  activeCardsFor,
  cardMeta,
  cardScenarios,
  formatUSD,
  isDefenseCard,
} from '@/data/cards-catalog';
import { randomChallenge } from '@/lib/deck';
import type { CardDef } from '@/types/game';

type Step = 'choose' | 'checkout' | 'bought' | 'spinning' | 'challenge';

/**
 * Vista previa de cualquier carta del mazo (zoom-in, tamaño grande, escenarios).
 * Si es PRO bloqueada: comprar la expansión ($2.00, checkout simulado) o probarla
 * gratis hasta el lunes cumpliendo un reto sorteado de las activas.
 */
export function CardPreviewModal({
  card,
  playable,
  burned,
  onClose,
  onBuyPack,
  onUnlock,
}: {
  card: CardDef | null;
  /** Activa o ya desbloqueada. */
  playable: boolean;
  /** Quemada esta semana. */
  burned: boolean;
  onClose: () => void;
  onBuyPack: () => void;
  onUnlock: () => void;
}) {
  const [step, setStep] = useState<Step>('choose');
  const [slotName, setSlotName] = useState('');
  const [challenge, setChallenge] = useState<CardDef | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const actionsRef = useRef<HTMLDivElement>(null);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    if (card) {
      clear();
      setStep('choose');
      setChallenge(null);
    }
    return clear;
  }, [card]);

  useEffect(() => {
    if (step === 'challenge') setTimeout(() => actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 250);
  }, [step]);

  if (!card) return null;
  const mode = card.mode;
  const pack = PACK_NAMES[mode];

  /** Tragamonedas: los nombres pasan rápido y frenan hasta caer en el reto. */
  const spin = () => {
    clear();
    const names = activeCardsFor(mode).filter((c) => !isDefenseCard(c)).map((c) => c.name);
    const final = randomChallenge(mode);
    setChallenge(null);
    setStep('spinning');
    let t = 0;
    for (let i = 0; i < 22; i++) {
      t += 40 + i * i * 0.4;
      timers.current.push(setTimeout(() => setSlotName(names[(i * 7 + Math.floor(Math.random() * names.length)) % names.length]), t));
    }
    timers.current.push(
      setTimeout(() => {
        setSlotName(final.name);
        setChallenge(final);
        setStep('challenge');
      }, t + 220),
    );
  };

  const close = () => {
    clear();
    onClose();
  };

  return (
    <Sheet
      open
      onClose={step === 'spinning' ? undefined : close}
      title={
        <span className="flex items-center gap-2">
          {card.isLocked ? <Crown size={22} strokeWidth={3} /> : <Eye size={22} strokeWidth={3} />}
          {card.isLocked ? 'Carta PRO' : 'Vista previa'}
        </span>
      }
      tone={mode === 'hot' ? '#FFF1C9' : '#FFFDF7'}
    >
      <AnimatePresence mode="wait">
        {step === 'choose' && (
          <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0.55, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 220 }}
            >
              <GameCard cardId={card.id} size="lg" />
            </motion.div>

            {/* Categoría + escenarios donde aplica */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              <span
                className="rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase"
                style={{ backgroundColor: cardMeta(card).color, color: cardMeta(card).text }}
              >
                {cardMeta(card).label}
              </span>
              {cardScenarios(card).map((sc) => (
                <span key={sc} className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase">
                  {SCENARIO_META[sc].emoji} {SCENARIO_META[sc].short}
                </span>
              ))}
            </div>

            {playable ? (
              <div className="mt-4 flex flex-col items-center gap-2 text-center">
                <span className="flex items-center gap-1.5 rounded-full border-[3px] border-black bg-lime px-3 py-1 text-sm font-black uppercase text-black">
                  <CheckCircle2 size={16} strokeWidth={3} /> Carta activa en tu mazo
                </span>
                <span
                  className={`flex items-center gap-1 text-xs font-bold uppercase ${burned ? 'text-special' : 'text-black/60'}`}
                >
                  {burned ? (
                    <>
                      <Flame size={14} strokeWidth={3} /> Quemada esta semana · vuelve el lunes
                    </>
                  ) : (
                    'Disponible: te puede tocar en la próxima sala'
                  )}
                </span>
              </div>
            ) : (
              <>
                <p className="mt-4 text-center text-sm font-semibold">
                  Es parte del <b>{pack}</b> (20 cartas). Elegí cómo destrabarla:
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <BrutalButton
                    variant="yellow"
                    className="flex items-center justify-center gap-2 text-sm"
                    onClick={() => setStep('checkout')}
                  >
                    <Unlock size={18} strokeWidth={3} /> Comprar expansión completa (20 PRO) · {formatUSD(PRICES.pack)}
                  </BrutalButton>
                  <BrutalButton variant="lime" className="flex items-center justify-center gap-2 text-sm" onClick={spin}>
                    <Dices size={18} strokeWidth={3} /> Probar esta carta GRATIS con un reto ahora
                  </BrutalButton>
                </div>
              </>
            )}
          </motion.div>
        )}

        {step === 'checkout' && (
          <motion.div key="checkout" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-3xl border-4 border-black bg-white p-4 shadow-brutal">
              <div className="text-[11px] font-black uppercase text-black/60">Resumen</div>
              <div className="mt-1 flex items-center justify-between gap-3 font-display text-lg font-black uppercase">
                <span className="leading-tight">{pack}</span>
                <span className="shrink-0">{formatUSD(PRICES.pack)}</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-black/70">
                20 cartas · desbloqueo permanente de todas las PRO del modo {mode === 'hot' ? 'HOT' : 'Clásico'}.
              </p>
              <p className="mt-3 rounded-2xl border-2 border-dashed border-black/40 px-3 py-2 text-center text-[11px] font-bold uppercase text-black/60">
                Checkout simulado · no se cobra nada
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <BrutalButton variant="cream" className="flex-1 text-sm" onClick={() => setStep('choose')}>
                Volver
              </BrutalButton>
              <BrutalButton
                variant="yellow"
                className="flex-1 text-sm"
                onClick={() => {
                  onBuyPack();
                  setStep('bought');
                }}
              >
                Pagar
              </BrutalButton>
            </div>
          </motion.div>
        )}

        {step === 'bought' && (
          <motion.div key="bought" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <PartyPopper size={48} strokeWidth={2.5} className="mx-auto" />
            <h3 className="mt-2 font-display text-2xl font-black uppercase">¡{pack} activo!</h3>
            <p className="mt-1 text-sm font-semibold">Las 20 cartas PRO ya pueden salirte en las próximas salas.</p>
            <BrutalButton variant="lime" className="mt-4 w-full" onClick={close}>
              Genial
            </BrutalButton>
          </motion.div>
        )}

        {(step === 'spinning' || step === 'challenge') && (
          <motion.div key="slot" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-center text-sm font-bold">
              Para desbloquear <b>«{card.name}»</b> gratis por el resto de la semana, cumplí este reto ahora mismo con tu
              {mode === 'hot' ? ' pareja' : ' grupo o pareja'}:
            </p>

            {/* Tragamonedas */}
            <div className="mt-4 overflow-hidden rounded-3xl border-4 border-black bg-black p-1 shadow-brutal">
              <div className="flex h-16 items-center justify-center rounded-[1.2rem] bg-cream px-3">
                <motion.span
                  key={slotName}
                  initial={{ y: -24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.08 }}
                  className="text-center font-display text-xl font-black uppercase leading-tight text-black"
                >
                  {slotName || '…'}
                </motion.span>
              </div>
            </div>

            {step === 'challenge' && challenge && (
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4">
                <div className="flex items-center gap-3 rounded-3xl border-4 border-black bg-white p-3 shadow-brutal">
                  <GameCard cardId={challenge.id} size="md" />
                  <div className="min-w-0">
                    <div className="font-display text-base font-black uppercase leading-tight">{challenge.name}</div>
                    <p className="mt-1 text-[13px] font-semibold leading-snug">{challenge.description}</p>
                  </div>
                </div>
                <div ref={actionsRef} className="mt-4 flex flex-col gap-3">
                  <BrutalButton
                    variant="lime"
                    onClick={() => {
                      onUnlock();
                      close();
                    }}
                  >
                    ¡Reto cumplido! Desbloquear carta
                  </BrutalButton>
                  <BrutalButton variant="cream" className="text-sm" onClick={close}>
                    Arrugué (cancelar)
                  </BrutalButton>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}

/** Compatibilidad con el nombre anterior. */
export const UnlockCardModal = CardPreviewModal;
