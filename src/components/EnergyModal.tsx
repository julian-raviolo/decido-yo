'use client';

import { useState } from 'react';
import { Crown, Zap } from 'lucide-react';
import { PayModal } from '@/components/PayModal';
import { BrutalButton, Sheet } from '@/components/ui';
import { PACK_NAMES, PRICES, PRO_WEEKLY_REFILLS, WEEKLY_BURNS, formatUSD } from '@/data/cards-catalog';
import { useGame } from '@/context/GameContext';
import type { GameMode } from '@/types/game';

/** Sin energías: refill pago o Plan PRO (2 refills por semana + pack a elección). Pagos simulados. */
export function EnergyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const game = useGame();
  const pro = game.economy.pro;
  const [checkout, setCheckout] = useState<'refill' | 'pro' | null>(null);
  const [pack, setPack] = useState<GameMode>(game.mode);

  const closeAll = () => {
    setCheckout(null);
    onClose();
  };

  return (
    <>
      <Sheet open={open && !checkout} onClose={onClose} title="⚡ Sin energías">
        <p className="-mt-1 text-sm font-semibold">
          Gastaste tus {WEEKLY_BURNS} energías de la semana. Vuelven el lunes, o seguí jugando ahora:
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {pro && pro.refillsLeft > 0 && (
            <BrutalButton
              variant="lime"
              className="flex items-center justify-center gap-2"
              onClick={() => game.refillEnergy(false) && onClose()}
            >
              <Crown size={18} strokeWidth={3} /> Usar refill PRO · {pro.refillsLeft}/{PRO_WEEKLY_REFILLS}
            </BrutalButton>
          )}

          <button
            onClick={() => setCheckout('refill')}
            className="flex items-center gap-3 rounded-3xl border-4 border-black bg-social p-3 text-left text-black shadow-brutal transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-[3px] border-black bg-cream">
              <Zap size={22} strokeWidth={3} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-black uppercase leading-tight">Refill de energías</span>
              <span className="block text-xs font-semibold">{WEEKLY_BURNS} energías y mano nueva ya</span>
            </span>
            <span className="shrink-0 font-display text-lg font-black">{formatUSD(PRICES.refill).replace(' USD', '')}</span>
          </button>

          {!pro && (
            <div className="rounded-3xl border-4 border-black bg-halo p-3 text-black shadow-brutal">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-[3px] border-black bg-cream">
                  <Crown size={22} strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-black uppercase leading-tight">Plan PRO</span>
                  <span className="block text-xs font-semibold">
                    {PRO_WEEKLY_REFILLS} refills por semana + 1 pack de expansión
                  </span>
                </span>
                <span className="shrink-0 text-right font-display text-lg font-black leading-none">
                  {formatUSD(PRICES.pro).replace(' USD', '')}
                  <span className="block text-[10px] font-black uppercase">/mes</span>
                </span>
              </div>
              <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-black/70">Elegí tu pack</div>
              <div className="mt-1 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Pack de expansión">
                {(['classic', 'hot'] as const).map((m) => (
                  <button
                    key={m}
                    role="radio"
                    aria-checked={pack === m}
                    onClick={() => setPack(m)}
                    className={`h-11 rounded-2xl border-[3px] border-black px-2 text-[11px] font-black uppercase leading-tight ${
                      pack === m ? 'bg-cream shadow-brutal-sm' : 'bg-black/10 text-black/70'
                    }`}
                  >
                    {m === 'hot' ? '🔥 ' : '✨ '}
                    {PACK_NAMES[m].replace(' PRO', '')}
                  </button>
                ))}
              </div>
              <BrutalButton variant="dark" className="mt-3 w-full text-sm" onClick={() => setCheckout('pro')}>
                Quiero el Plan PRO
              </BrutalButton>
            </div>
          )}

          <button onClick={onClose} className="h-11 text-xs font-black uppercase tracking-widest text-black/60 underline">
            Espero al lunes
          </button>
        </div>
      </Sheet>

      <PayModal
        open={checkout === 'refill'}
        title="⚡ Refill de energías"
        description={`Vuelven tus ${WEEKLY_BURNS} energías de la semana y te reparte una mano nueva.`}
        item={`${WEEKLY_BURNS} energías`}
        usd={PRICES.refill}
        onPay={() => game.refillEnergy(true)}
        onClose={closeAll}
      />
      <PayModal
        open={checkout === 'pro'}
        title="👑 Plan PRO"
        description={`${PRO_WEEKLY_REFILLS} refills de energía gratis por semana y el ${PACK_NAMES[pack]} incluido. Se activa con un refill ahora.`}
        item="Plan PRO mensual"
        usd={PRICES.pro}
        onPay={() => {
          game.subscribePro(pack);
          setTimeout(() => game.refillEnergy(false), 0);
        }}
        onClose={closeAll}
      />
    </>
  );
}
