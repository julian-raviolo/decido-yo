'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarClock, Flame, RotateCcw } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { BrutalButton } from '@/components/ui';
import { CATEGORY_META, WEEKLY_TOTAL, catalogFor, isDefenseCard } from '@/data/cards-catalog';
import { useGame, useNow } from '@/context/GameContext';
import { deckCards, nextReset, remainingTotal } from '@/lib/deck';
import { formatDuration } from '@/lib/utils';
import type { Category } from '@/types/game';

const ORDER: Category[] = ['FOOD', 'SOCIAL', 'DESTINY', 'SPECIAL', 'DEFENSE', 'DEVIL', 'ANGEL'];

export default function MazoPage() {
  const { deck, hydrated, resetDeck, mode } = useGame();
  const now = useNow(30_000);
  const hot = mode === 'hot';
  const week = deckCards(deck).sort((a, b) => Number(isDefenseCard(a)) - Number(isDefenseCard(b)));
  const catalog = catalogFor(mode);
  const categories = ORDER.filter((cat) => catalog.some((c) => c.category === cat));

  return (
    <div className="flex flex-1 flex-col gap-5 pb-8">
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
          {hydrated ? remainingTotal(deck) : '–'}/{WEEKLY_TOTAL}
        </span>
      </header>

      <div className="flex items-center gap-2 rounded-2xl border-[3px] border-black bg-panel px-3 py-2 text-[12px] font-bold text-white/85">
        <CalendarClock size={16} className="shrink-0" />
        Nuevo sorteo de 10 cartas el lunes 00:00 · faltan {hydrated ? formatDuration(nextReset(new Date(now)).getTime() - now) : '…'}
        <span className="ml-auto flex items-center gap-1 text-social">
          <Flame size={14} strokeWidth={3} /> {hydrated ? deck.burned.length : 0}
        </span>
      </div>

      {/* Esta semana */}
      <section>
        <h2 className="mb-3 font-display text-lg font-black uppercase">Tus 10 de esta semana</h2>
        <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-3">
          {hydrated && week.map((c) => (
            <GameCard key={c.id} cardId={c.id} size="mini" state={(deck.stock[c.id] ?? 0) > 0 ? 'ready' : 'burned'} />
          ))}
        </div>
      </section>

      {/* Catálogo completo */}
      <section className="flex flex-col gap-5">
        <div>
          <h2 className="font-display text-lg font-black uppercase">Todas las cartas posibles</h2>
          <p className="text-xs font-semibold text-white/70">
            {catalog.length} cartas en el catálogo {hot ? 'HOT' : 'clásico'}. Las más comunes salen más seguido.
          </p>
        </div>
        {categories.map((cat) => {
          const cards = catalog.filter((c) => c.category === cat);
          return (
            <div key={cat}>
              <h3 className="mb-3 flex items-center gap-2 font-display font-black uppercase">
                <span
                  className="h-4 w-4 rounded-full border-[3px] border-black"
                  style={{ background: CATEGORY_META[cat].color }}
                />
                {CATEGORY_META[cat].label}
              </h3>
              <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                {cards.map((c) => {
                  const inWeek = hydrated && c.id in deck.stock;
                  return (
                    <div key={c.id} className="flex flex-col items-center gap-1.5">
                      <div className={`relative ${inWeek ? '' : 'opacity-45 grayscale-[0.4]'}`}>
                        <GameCard cardId={c.id} size="mini" />
                        {inWeek && (
                          <span className="absolute -right-2 -top-2 rounded-full border-[3px] border-black bg-lime px-1.5 text-[9px] font-black uppercase text-black">
                            Tuya
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-3 px-1 text-center text-[10px] font-semibold leading-tight text-white/70">
                        {c.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <BrutalButton
        variant="dark"
        className="mt-2 flex items-center justify-center gap-2 text-sm"
        onClick={() => confirm('Modo dev: ¿sortear 10 cartas nuevas ahora?') && resetDeck()}
      >
        <RotateCcw size={16} strokeWidth={3} /> Nuevo sorteo (dev)
      </BrutalButton>
    </div>
  );
}
