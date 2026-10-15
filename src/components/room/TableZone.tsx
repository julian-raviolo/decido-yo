'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { GameCard } from '@/components/GameCard';
import { getCard } from '@/data/cards-catalog';
import { Gavel } from 'lucide-react';
import { formatCountdown } from '@/lib/utils';
import type { PlayStatus, Room } from '@/types/game';

const STATUS_LABEL: Record<PlayStatus, { text: string; bg: string }> = {
  pending: { text: 'En juego', bg: '#FFFDF7' },
  complied: { text: 'Cumplida', bg: '#FFD166' },
  refused: { text: 'Castigo', bg: '#FF1744' },
  nullified: { text: 'Anulada', bg: '#00E5FF' },
  reflected: { text: 'Rebotada', bg: '#00E5FF' },
  redirected: { text: 'Desviada', bg: '#00E5FF' },
  rps: { text: 'PPT', bg: '#FFD600' },
  gag: { text: 'Mordaza', bg: '#FF1744' },
  rule: { text: 'Regla', bg: '#FF1744' },
  roulette: { text: 'Ruleta', bg: '#FF1744' },
  defense: { text: 'Defensa', bg: '#00E5FF' },
};

export function TableZone({ room, now }: { room: Room; now: number }) {
  const name = (id: string | null) => {
    const p = room.players.find((x) => x.id === id);
    return p ? (p.isMe ? 'Vos' : p.name) : 'Mesa';
  };
  const recent = room.table.slice(-6);
  const effects = room.effects.filter((e) => e.endsAt > now).sort((a, b) => a.endsAt - b.endsAt);

  return (
    <section className="flex min-h-[220px] flex-1 flex-col">
      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] border-4 border-black bg-felt shadow-brutal"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgb(var(--c-felt-hi)) 0%, rgb(var(--c-felt)) 65%), repeating-radial-gradient(circle at 50% 45%, transparent 0 22px, rgba(255,255,255,0.04) 22px 24px)',
        }}
      >
        <span className="absolute left-4 top-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
          La Mesa
        </span>

        {/* Temporizadores sutiles: pastillas translúcidas en la esquina */}
        {(effects.length > 0 || room.rules.length > 0) && (
          <div className="absolute right-3 top-2.5 z-30 flex max-w-[70%] flex-wrap justify-end gap-1">
            {effects.slice(0, 4).map((e) => {
              const card = getCard(e.cardId);
              const Icon = card.icon;
              const left = e.endsAt - now;
              return (
                <span
                  key={e.id}
                  title={`${card.name} → ${name(e.targetId)}`}
                  className={`flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 font-mono text-[10px] font-bold text-white/85 backdrop-blur-sm ${
                    left < 60_000 ? 'animate-pulse text-special' : ''
                  }`}
                >
                  <Icon size={11} strokeWidth={2.5} /> {formatCountdown(left)}
                </span>
              );
            })}
            {effects.length > 4 && (
              <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold text-white/70">
                +{effects.length - 4}
              </span>
            )}
            {room.rules.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold text-white/85 backdrop-blur-sm">
                <Gavel size={11} strokeWidth={2.5} /> {room.rules.length}
              </span>
            )}
          </div>
        )}

        {/* Halo detrás de la última carta */}
        {recent.length > 0 && (
          <motion.div
            key={recent[recent.length - 1].id}
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 0.35 }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime blur-3xl"
          />
        )}

        {recent.length === 0 && (
          <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm font-bold text-white/70">
            Tocá una carta y deslizala hacia arriba para tirarla a la mesa.
          </div>
        )}

        <div className="absolute inset-0 grid place-items-center">
          <AnimatePresence>
            {recent.map((play, i) => {
              const depth = recent.length - 1 - i;
              const st = STATUS_LABEL[play.status];
              return (
                <motion.div
                  key={play.id}
                  className="absolute"
                  initial={{ y: 320, scale: 1.4, rotate: play.tilt * 3, opacity: 0 }}
                  animate={{
                    y: depth === 0 ? -6 : depth * -4 - 10,
                    x: depth === 0 ? 0 : (i % 2 === 0 ? -1 : 1) * (30 + Math.min(depth, 4) * 14),
                    scale: depth === 0 ? 1 : 0.9 - depth * 0.03,
                    rotate: play.tilt,
                    opacity: depth > 3 ? 0.4 : 1,
                  }}
                  transition={{ type: 'spring', damping: 18, stiffness: 180 }}
                  style={{ zIndex: i }}
                >
                  <div className="relative">
                    <GameCard cardId={play.cardId} size={depth === 0 ? 'hand' : 'mini'} />
                    {depth === 0 && (
                      <span
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase text-black"
                        style={{ backgroundColor: st.bg }}
                      >
                        {st.text}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {recent.length > 0 && (
          <div className="absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full border-[3px] border-black bg-cream px-3 py-1 text-center text-[12px] font-black text-black shadow-brutal-sm">
            {name(recent[recent.length - 1].fromId)} → {name(recent[recent.length - 1].toId)} ·{' '}
            {getCard(recent[recent.length - 1].cardId).name}
          </div>
        )}
      </div>

    </section>
  );
}

export function LogFeed({ room }: { room: Room }) {
  const TONE: Record<string, string> = {
    attack: 'border-l-social',
    defense: 'border-l-defense',
    punish: 'border-l-special',
    system: 'border-l-lime',
    info: 'border-l-white/40',
  };
  return (
    <ul className="flex min-h-[72px] flex-[2] flex-col gap-1.5 overflow-y-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <li className="sticky top-0 z-10 bg-night/90 px-1 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 backdrop-blur-sm">
        Historial
      </li>
      <AnimatePresence initial={false}>
        {room.log.slice(0, 30).map((l) => (
          <motion.li
            key={l.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-lg border-l-4 bg-white/5 px-2.5 py-1.5 text-[12px] font-semibold leading-snug text-white/90 ${TONE[l.tone]}`}
          >
            {l.text}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
