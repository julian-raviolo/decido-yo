'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Gavel, Timer } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { getCard } from '@/data/cards-catalog';
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
  const effects = room.effects.filter((e) => e.endsAt > now);

  return (
    <section className="flex min-h-[210px] flex-1 flex-col gap-3">
      <div
        className="relative min-h-[210px] flex-1 overflow-hidden rounded-[2rem] border-4 border-black bg-felt shadow-brutal"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 40%, rgb(var(--c-felt-hi)) 0%, rgb(var(--c-felt)) 70%)',
        }}
      >
        <span className="absolute left-4 top-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
          La Mesa
        </span>

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
                    y: depth * -6 + (i - recent.length / 2) * 4,
                    x: (i % 2 === 0 ? -1 : 1) * Math.min(depth, 4) * 14,
                    scale: depth === 0 ? 1 : 0.9 - depth * 0.03,
                    rotate: play.tilt,
                    opacity: depth > 3 ? 0.4 : 1,
                  }}
                  transition={{ type: 'spring', damping: 18, stiffness: 180 }}
                  style={{ zIndex: i }}
                >
                  <div className="relative">
                    <GameCard cardId={play.cardId} size="mini" />
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
          <div className="absolute bottom-3 left-3 right-3 truncate rounded-full border-2 border-black bg-cream px-3 py-1 text-center text-[11px] font-black text-black">
            {name(recent[recent.length - 1].fromId)} → {name(recent[recent.length - 1].toId)} ·{' '}
            {getCard(recent[recent.length - 1].cardId).name}
          </div>
        )}
      </div>

      {(room.rules.length > 0 || effects.length > 0) && (
        <div className="flex flex-col gap-2">
          {room.rules.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 rounded-2xl border-[3px] border-black bg-special px-3 py-2 text-[12px] font-bold text-white shadow-brutal-sm"
            >
              <Gavel size={16} strokeWidth={3} className="shrink-0" />
              <span className="leading-tight">
                <b className="uppercase">Regla de {name(r.byId)}:</b> {r.text}
              </span>
            </div>
          ))}
          {effects.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-2 rounded-2xl border-[3px] border-black bg-cream px-3 py-2 text-[12px] font-bold text-black shadow-brutal-sm"
            >
              <Timer size={16} strokeWidth={3} className="shrink-0" />
              <span className="flex-1 truncate">
                {getCard(e.cardId).name} → <b>{name(e.targetId)}</b>
              </span>
              <span className="rounded-full bg-black px-2 py-0.5 font-mono text-[11px] text-lime">
                {formatCountdown(e.endsAt - now)}
              </span>
            </div>
          ))}
        </div>
      )}
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
    <ul className="flex flex-col gap-1.5">
      <AnimatePresence initial={false}>
        {room.log.slice(0, 4).map((l) => (
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
