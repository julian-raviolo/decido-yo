'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { Check, ChevronRight, Copy, MapPin, Swords, Trophy } from 'lucide-react';
import { BrutalButton, Sheet } from '@/components/ui';
import {
  VENUE_CATEGORIES,
  businessWhatsappUrl,
  getVenue,
  venuesByCategory,
  type Venue,
  type VenueCategory,
} from '@/data/venues-catalog';
import type { DuelSide, Room, Saliduelo } from '@/types/game';

const POP = { type: 'spring', damping: 15, stiffness: 300 } as const;
const SPRING = { type: 'spring', damping: 20, stiffness: 260 } as const;

const membersOf = (sd: Saliduelo, side: DuelSide) => Object.keys(sd.picks).filter((id) => sd.picks[id] === side);

/* ---------- Logo del lugar: emoji sobre badge de color plano ---------- */

export function VenueLogo({ venue, size = 40 }: { venue: Venue; size?: number }) {
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-2xl border-[3px] border-black leading-none shadow-brutal-sm"
      style={{ width: size, height: size, backgroundColor: venue.logoColor, fontSize: size * 0.5 }}
    >
      {venue.logoEmoji}
    </span>
  );
}


/* ---------- Tablero del duelo (arriba de la mesa) ---------- */

export function DuelBoard({
  room,
  meId,
  onPick,
  onStart,
  onOpenVictory,
}: {
  room: Room;
  meId: string;
  onPick: () => void;
  onStart: () => void;
  onOpenVictory: () => void;
}) {
  const sd = room.saliduelo;
  if (!sd) return null;
  const mySide = sd.picks[meId];
  const isHost = room.hostId === meId;
  const ready = !!sd.sides.A && !!sd.sides.B;
  const won = sd.phase === 'won';

  const action = won ? (
    <button
      onClick={onOpenVictory}
      className="flex h-11 items-center gap-1 rounded-2xl border-[3px] border-black bg-lime px-3 text-[11px] font-black uppercase text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      🎟️ Ver cupón
    </button>
  ) : !mySide ? (
    <button
      onClick={onPick}
      className="flex h-11 items-center gap-1 rounded-2xl border-[3px] border-black bg-lime px-3 text-[11px] font-black uppercase text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <MapPin size={14} strokeWidth={3} /> {ready ? 'Elegí bando' : 'Elegí lugar'}
    </button>
  ) : sd.phase === 'pick' && ready && isHost ? (
    <button
      onClick={onStart}
      className="flex h-11 items-center gap-1 rounded-2xl border-[3px] border-black bg-special px-3 text-[11px] font-black uppercase text-white shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <Swords size={14} strokeWidth={3} /> ¡A la batalla!
    </button>
  ) : sd.phase === 'pick' ? (
    <button
      onClick={onPick}
      aria-label="Cambiar lugar"
      className="flex h-11 items-center rounded-2xl px-2 text-[10px] font-black uppercase tracking-widest text-white/70 underline decoration-2 underline-offset-2"
    >
      Cambiar
    </button>
  ) : null;

  return (
    <section
      className="shrink-0 rounded-3xl border-4 border-black bg-panel p-2 shadow-brutal-sm"
      aria-label="SALIDUELO"
      onClick={won ? onOpenVictory : undefined}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
        <SideCard sd={sd} side="A" mine={mySide === 'A'} />
        <span className="font-display text-xs font-black uppercase text-lime">⚔️</span>
        <SideCard sd={sd} side="B" mine={mySide === 'B'} />
      </div>
      {action && (
        <div className="mt-2 flex justify-center" onClick={(e) => e.stopPropagation()}>
          {action}
        </div>
      )}
    </section>
  );
}

function SideCard({ sd, side, mine }: { sd: Saliduelo; side: DuelSide; mine: boolean }) {
  const reduce = !!useReducedMotion();
  const d = sd.sides[side];
  const controls = useAnimationControls();
  const wins = sd.wins?.[side] ?? 0;
  // Mano ganada: rebote del lugar (no al montar).
  const seen = useRef(wins);
  useEffect(() => {
    if (wins === seen.current) return;
    seen.current = wins;
    if (!reduce) void controls.start({ scale: [1, 1.08, 1], transition: { duration: 0.4 } });
  }, [wins, controls, reduce]);

  if (!d) {
    return (
      <div className="flex h-14 items-center justify-center rounded-2xl border-[3px] border-dashed border-black bg-black/30 px-2 text-center text-[10px] font-black uppercase tracking-widest text-white/60">
        Lugar {side}…
      </div>
    );
  }
  const venue = getVenue(d.venueId);
  const winner = sd.phase === 'won' && sd.winner === side;
  const loser = sd.phase === 'won' && sd.winner !== side;

  return (
    <motion.div
      animate={controls}
      title={`${venue.name} · ${venue.promoText}`}
      className={`relative flex h-14 min-w-0 items-center gap-1.5 rounded-2xl border-[3px] border-black px-1.5 text-black ${
        winner ? 'bg-lime' : 'bg-cream'
      } ${loser ? 'opacity-50' : ''} ${mine ? 'shadow-brutal-accent' : 'shadow-brutal-sm'}`}
    >
      <VenueLogo venue={venue} size={30} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[11px] font-black uppercase leading-tight">{venue.name}</span>
        {winner ? (
          <span className="flex items-center gap-0.5 text-[10px] font-black uppercase">
            <Trophy size={12} strokeWidth={3} /> Gana
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase">🏅 {sd.wins?.[side] ?? 0} de 2 manos</span>
        )}
      </div>
      {mine && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-black bg-lime px-1.5 text-[9px] font-black uppercase leading-[14px]">
          Tu bando
        </span>
      )}
    </motion.div>
  );
}

/* ---------- Card comercial B2B (al final de cada categoría) ---------- */

export function VenueB2BCard() {
  return (
    <div className="flex flex-col gap-2 rounded-3xl border-4 border-dashed border-black bg-destiny p-4 text-white">
      <span className="font-display text-lg font-black uppercase leading-none">✨ Tu local puede estar aquí</span>
      <p className="text-sm font-semibold text-white/90">
        Promocioná tu bar, restaurante o evento en SALIDUELO.
      </p>
      <a
        href={businessWhatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 flex min-h-[44px] items-center justify-center rounded-2xl border-[3px] border-black bg-cream px-3 py-2 text-center font-display text-xs font-black uppercase text-black shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        📲 Contactar por WhatsApp
      </a>
    </div>
  );
}

/* ---------- Selector de lugar (Sheet) ---------- */

export function VenuePicker({
  open,
  room,
  meId,
  onPick,
  onClose,
}: {
  open: boolean;
  room: Room;
  meId: string;
  onPick: (venueId: string) => void;
  onClose: () => void;
}) {
  const sd = room.saliduelo;
  const [cat, setCat] = useState<VenueCategory>('GASTRONOMIA');
  const hot = room.mode === 'hot';
  if (!sd) return null;
  const mySide = sd.picks[meId];
  const both = !!sd.sides.A && !!sd.sides.B;
  const duo = room.players.length <= 2;
  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? '¿?';
  /** De a dos cada uno defiende su lugar: el bando del otro no se puede tomar. */
  const takenBy = (side: DuelSide) => {
    if (!duo) return null;
    const other = membersOf(sd, side).find((id) => id !== meId);
    return other ? nameOf(other) : null;
  };
  const sideOfVenue = (id: string): DuelSide | null =>
    sd.sides.A?.venueId === id ? 'A' : sd.sides.B?.venueId === id ? 'B' : null;
  // Con los dos lugares armados (o ya en batalla) sólo queda elegir bando.
  const sidesOnly = both || sd.phase !== 'pick';

  const pick = (venueId: string) => {
    onPick(venueId);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={sidesOnly ? '⚔️ Elegí tu bando' : '📍 ¿A dónde vamos?'} tone={hot ? '#FFF1C9' : '#FFFDF7'}>
      {sidesOnly ? (
        <div className="flex flex-col gap-3">
          <p className="-mt-2 text-sm font-semibold text-black/70">
            Defendé tu lugar: se juega al mejor de 3 manos con minijuegos al azar.
          </p>
          {(['A', 'B'] as const).map((side) => {
            const d = sd.sides[side];
            if (!d) return null;
            const venue = getVenue(d.venueId);
            const taken = takenBy(side);
            return (
              <button
                key={side}
                disabled={!!taken || mySide === side}
                onClick={() => pick(venue.id)}
                className="flex items-center gap-3 rounded-3xl border-4 border-black bg-white p-3 text-left shadow-brutal transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
              >
                <VenueLogo venue={venue} size={52} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-black/60">Lugar {side}</span>
                  <span className="block truncate font-display text-base font-black uppercase leading-tight">{venue.name}</span>
                  <span className="block truncate text-[12px] font-bold text-black/70">🎁 {venue.promoText}</span>
                </span>
                <span className="flex flex-col items-end gap-1 text-[10px] font-black uppercase">

                  {mySide === side ? 'Tu bando' : taken ? `De ${taken}` : `👥 ${membersOf(sd, side).length}`}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="-mt-2 text-sm font-semibold text-black/70">
            {sd.sides.A
              ? 'Sumate al Lugar A o proponé otro: el primero distinto es el rival.'
              : 'Elegí el lugar que vas a defender. El cupón se revela sólo si gana.'}
          </p>
          {/* Categorías */}
          <div className="grid grid-cols-4 gap-1.5" role="tablist" aria-label="Categorías">
            {VENUE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={cat === c.id}
                title={c.label}
                onClick={() => setCat(c.id)}
                className={`flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl border-[3px] border-black text-[10px] font-black uppercase transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  cat === c.id ? 'bg-black text-cream' : 'bg-white text-black shadow-brutal-sm'
                }`}
              >
                <span className="text-base leading-none">{c.emoji}</span>
                {c.short}
              </button>
            ))}
          </div>
          <div className="text-[11px] font-black uppercase tracking-widest text-black/60">
            {VENUE_CATEGORIES.find((c) => c.id === cat)?.label}
          </div>
          <ul className="flex flex-col gap-2">
            {venuesByCategory(cat).map((venue) => {
              const side = sideOfVenue(venue.id);
              const taken = side ? takenBy(side) : null;
              const isMine = !!side && side === mySide;
              return (
                <li key={venue.id}>
                  <button
                    disabled={!!taken || isMine}
                    onClick={() => pick(venue.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-[3px] border-black p-2.5 text-left shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 ${
                      side ? 'bg-social' : 'bg-white'
                    }`}
                  >
                    <VenueLogo venue={venue} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm font-black uppercase leading-tight">{venue.name}</span>
                      <span className="block truncate text-[11px] font-bold text-black/60">📍 {venue.zone}</span>
                      <span className="block truncate text-[12px] font-bold">🎁 {venue.promoText}</span>
                    </span>
                    {side ? (
                      <span className="shrink-0 rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase">
                        {isMine ? 'Tuyo' : taken ? `De ${taken}` : `Lugar ${side}`}
                      </span>
                    ) : (
                      <ChevronRight size={18} strokeWidth={3} className="shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <VenueB2BCard />
        </div>
      )}
    </Sheet>
  );
}

/* ---------- Modal de victoria (celebración + cupón) ---------- */

export function SaliduelVictory({
  open,
  room,
  meId,
  onClose,
}: {
  open: boolean;
  room: Room;
  meId: string;
  onClose: () => void;
}) {
  const reduce = !!useReducedMotion();
  const sd = room.saliduelo;
  const side = sd?.winner;
  const d = side ? sd?.sides[side] : undefined;
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  const hot = room.mode === 'hot';

  // El cupón se "desbloquea" un instante después de abrir: el reveal es parte del premio.
  useEffect(() => {
    if (!open) {
      setUnlocked(false);
      setCopied(null);
      return;
    }
    const t = setTimeout(() => setUnlocked(true), reduce ? 0 : 1100);
    return () => clearTimeout(t);
  }, [open, reduce]);

  if (!sd || !side || !d) return null;
  const venue = getVenue(d.venueId);
  const iWon = sd.picks[meId] === side;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(venue.secretCouponCode);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal
          aria-label="Ganador de la salida"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={reduce ? false : { scale: 0.7, rotate: -6, y: 30 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={SPRING}
            className="flex max-h-[96dvh] w-full max-w-[400px] flex-col gap-3 overflow-y-auto rounded-3xl border-4 border-black p-4 shadow-brutal-cream"
            style={{ backgroundColor: hot ? '#FF4D6D' : '#AA00FF' }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border-2 border-black bg-cream px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black">
                ⚔️ Saliduelo
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-white">
                {iWon ? '¡Ganó tu bando!' : 'Se va a donde dijo el otro bando'}
              </span>
            </div>

            <motion.h2
              initial={reduce ? false : { scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...POP, delay: 0.1 }}
              className="-rotate-2 font-display text-[40px] font-black uppercase leading-[0.9] text-white"
            >
              🏆 Ganador
              <br />
              <span className="inline-block rounded-2xl border-4 border-black bg-social px-2 text-black shadow-brutal">
                de la salida
              </span>
            </motion.h2>

            <motion.div
              initial={reduce ? false : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...SPRING, delay: 0.25 }}
              className="flex items-center gap-3 rounded-3xl border-4 border-black bg-cream p-3 text-black shadow-brutal"
            >
              <motion.span
                initial={reduce ? false : { rotate: -30, scale: 0.4 }}
                animate={{ rotate: -4, scale: 1 }}
                transition={{ ...POP, delay: 0.35 }}
              >
                <VenueLogo venue={venue} size={68} />
              </motion.span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-black uppercase leading-tight">{venue.name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[12px] font-bold text-black/70">
                  <MapPin size={12} strokeWidth={3} /> {venue.zone}
                </span>
                <span className="mt-1 inline-block rounded-full border-2 border-black bg-social px-2 py-0.5 text-[11px] font-black">
                  🎁 {venue.promoText}
                </span>
              </span>
            </motion.div>

            {/* Cupón: recién acá se revela el código */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-dashed border-black bg-lime p-4 text-center text-black">
              <div className="text-[11px] font-black uppercase tracking-widest">Tu cupón</div>
              <div className="relative mt-1 grid h-14 place-items-center">
                <AnimatePresence mode="wait" initial={false}>
                  {unlocked ? (
                    <motion.span
                      key="code"
                      initial={reduce ? false : { scale: 0.3, opacity: 0, rotate: -8 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={POP}
                      className="select-all font-mono text-3xl font-black tracking-[0.12em]"
                    >
                      {venue.secretCouponCode}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="lock"
                      className="text-4xl leading-none"
                      animate={reduce ? undefined : { rotate: [0, -14, 14, -10, 10, 0] }}
                      exit={{ scale: 1.8, opacity: 0, y: -20 }}
                      transition={{ duration: 0.8 }}
                    >
                      🔒
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={copy}
                disabled={!unlocked}
                className="mx-auto mt-2 flex h-11 items-center justify-center gap-2 rounded-2xl border-[3px] border-black bg-cream px-4 font-display text-xs font-black uppercase shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40"
              >
                {copied === 'ok' ? <Check size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
                {copied === 'ok' ? '¡Copiado!' : copied === 'fail' ? 'Copialo a mano' : 'Copiar código'}
              </button>
              <p className="mt-2 text-[11px] font-bold text-black/70">Mostralo al llegar para usar la promo.</p>
            </div>

            <BrutalButton variant="cream" onClick={onClose} className="w-full">
              Seguir jugando en el lugar
            </BrutalButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
