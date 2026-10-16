'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, CheckCircle2, Crown, Flame, RotateCcw } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { CardPreviewModal } from '@/components/UnlockCardModal';
import { BrutalButton } from '@/components/ui';
import {
  PACK_NAMES,
  PRICES,
  WEEKLY_BURNS,
  formatUSD,
  activeCardsFor,
  categoryMeta,
  proCardsFor,
} from '@/data/cards-catalog';
import { useGame, useNow } from '@/context/GameContext';
import { isBurnedThisWeek, nextReset } from '@/lib/deck';
import { formatDuration } from '@/lib/utils';
import type { CardDef, Category } from '@/types/game';

const ORDER: Category[] = ['FOOD', 'SOCIAL', 'DESTINY', 'SPECIAL', 'DEFENSE'];

export default function MazoPage() {
  const game = useGame();
  const { deck, hydrated, mode, unlockedIds, unlocks } = game;
  const now = useNow(30_000);
  const [preview, setPreview] = useState<CardDef | null>(null);

  const hot = mode === 'hot';
  const left = hydrated ? deck.weeklyBurnsRemaining : WEEKLY_BURNS;
  const active = activeCardsFor(mode);
  const pro = proCardsFor(mode);
  const packOwned = hydrated && unlocks.packs.includes(mode);
  const proUnlocked = hydrated ? pro.filter((c) => unlockedIds.includes(c.id)).length : 0;

  return (
    <div className="flex flex-1 flex-col gap-4 pb-8">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Volver"
          className="grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-black bg-cream text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <ArrowLeft size={20} strokeWidth={3} />
        </Link>
        <h1 className="font-display text-3xl font-black uppercase leading-none">{hot ? 'Mazo HOT' : 'Mi mazo'}</h1>
        <span className="ml-auto rounded-2xl border-[3px] border-black bg-lime px-3 py-1 font-display text-xl font-black text-black shadow-brutal-sm">
          {left}/{WEEKLY_BURNS}
        </span>
      </header>

      {/* Presupuesto semanal */}
      <section className="rounded-3xl border-4 border-black bg-panel p-4 shadow-brutal-cream">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display font-black uppercase">
            <Flame size={18} strokeWidth={3} /> Usos de esta semana
          </span>
          <span className="font-display text-xl font-black text-lime">
            {left}/{WEEKLY_BURNS}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-10 gap-1.5">
          {Array.from({ length: WEEKLY_BURNS }, (_, i) => (
            <span
              key={i}
              className={`h-4 rounded-full border-[3px] border-black ${i < left ? 'bg-lime' : 'bg-black/60'}`}
            />
          ))}
        </div>
        <p className="mt-3 text-[12px] font-semibold text-white/75">
          Cada carta que quemás gasta 1 uso y no vuelve a salir hasta el lunes. Las que no usás vuelven a tu mazo.
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase text-white/70">
          <CalendarClock size={13} /> Reinicio a {WEEKLY_BURNS}/{WEEKLY_BURNS} el lunes 00:00 · faltan{' '}
          {hydrated ? formatDuration(nextReset(new Date(now)).getTime() - now) : '…'}
        </div>
      </section>

      {/* Activas */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-lg font-black uppercase">Activas · {active.length}</h2>
          <p className="text-xs font-semibold text-white/70">Te salen al azar según el escenario de la sala. Tocá una para verla en grande.</p>
        </div>
        {ORDER.map((cat) => {
          const cards = active.filter((c) => c.category === cat);
          if (!cards.length) return null;
          return (
            <div key={cat}>
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-black uppercase">
                <CategoryDot mode={mode} cat={cat} />
                {categoryMeta(mode, cat).label} · {cards.length}
              </h3>
              <CardGrid
                cards={cards}
                stateOf={(c) => (hydrated && isBurnedThisWeek(deck, c.id) ? 'burned' : 'ready')}
                onTap={setPreview}
              />
            </div>
          );
        })}
      </section>

      {/* PRO */}
      <section className="flex flex-col gap-4 rounded-3xl border-4 border-black bg-halo/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase">
              <Crown size={20} strokeWidth={3} className="text-halo" /> {PACK_NAMES[mode]}
            </h2>
            <p className="text-xs font-semibold text-white/75">
              {packOwned
                ? 'Pack activo: las 20 cartas pueden salirte en cada sala.'
                : `Expansión de 20 cartas por ${formatUSD(PRICES.pack)}. Tocá una para verla y probarla gratis con un reto.`}
            </p>
          </div>
          <span className="shrink-0 rounded-full border-[3px] border-black bg-halo px-2 py-0.5 text-[11px] font-black text-black">
            {proUnlocked}/{pro.length}
          </span>
        </div>
        <CardGrid
          cards={pro}
          stateOf={(c) =>
            !hydrated || !unlockedIds.includes(c.id) ? 'pro' : isBurnedThisWeek(deck, c.id) ? 'burned' : 'ready'
          }
          badgeOf={(c) => (hydrated && unlockedIds.includes(c.id) && !packOwned ? 'Hasta el lunes' : undefined)}
          onTap={(c) => hydrated && setPreview(c)}
        />
      </section>

      <BrutalButton
        variant="dark"
        className="mt-2 flex items-center justify-center gap-2 text-sm"
        onClick={() => confirm('Modo dev: ¿reiniciar los 10 usos de esta semana?') && game.resetDeck()}
      >
        <RotateCcw size={16} strokeWidth={3} /> Reiniciar usos (dev)
      </BrutalButton>

      <CardPreviewModal
        card={preview}
        playable={!!preview && (!preview.isLocked || unlockedIds.includes(preview.id))}
        burned={!!preview && hydrated && isBurnedThisWeek(deck, preview.id)}
        onClose={() => setPreview(null)}
        onBuyPack={() => game.buyPack(mode)}
        onUnlock={() => preview && game.unlockWithChallenge(preview.id)}
      />
    </div>
  );
}

function CategoryDot({ mode, cat }: { mode: 'classic' | 'hot'; cat: Category }) {
  return (
    <span className="h-4 w-4 rounded-full border-[3px] border-black" style={{ background: categoryMeta(mode, cat).color }} />
  );
}

function CardGrid({
  cards,
  stateOf,
  badgeOf,
  onTap,
}: {
  cards: CardDef[];
  stateOf: (c: CardDef) => 'ready' | 'burned' | 'pro';
  badgeOf?: (c: CardDef) => string | undefined;
  onTap?: (c: CardDef) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-4">
      {cards.map((c) => {
        const badge = badgeOf?.(c);
        const state = stateOf(c);
        return (
          <button
            key={c.id}
            onClick={() => onTap?.(c)}
            className={`flex flex-col items-center gap-1.5 text-left transition-transform ${onTap ? 'active:scale-95' : 'cursor-default'}`}
          >
            <div className="relative">
              <GameCard cardId={c.id} size="mini" state={state} />
              {badge && (
                <span className="absolute -left-1 -top-2 flex items-center gap-0.5 rounded-full border-2 border-black bg-lime px-1 text-[8px] font-black uppercase text-black">
                  <CheckCircle2 size={9} strokeWidth={3} /> {badge}
                </span>
              )}
            </div>
            <p className="line-clamp-3 px-1 text-center text-[10px] font-semibold leading-tight text-white/70">
              {c.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
