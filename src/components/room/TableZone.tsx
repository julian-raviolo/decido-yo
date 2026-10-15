'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { GameCard } from '@/components/GameCard';
import { cardMeta, getCard, hasCard } from '@/data/cards-catalog';
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
  evidence: { text: 'Votando', bg: '#FFD600' },
};

export function TableZone({ room }: { room: Room }) {
  const name = (id: string | null) => {
    const p = room.players.find((x) => x.id === id);
    return p ? (p.isMe ? 'Vos' : p.name) : 'Mesa';
  };
  const recent = room.table.slice(-6);

  return (
    <section className="flex min-h-[160px] flex-1 flex-col">
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
      <AnimatePresence initial={false}>
        {room.log.slice(0, 30).map((l) => {
          const card = l.cardId && hasCard(l.cardId) ? getCard(l.cardId) : null;
          const meta = card ? cardMeta(card) : null;
          const Icon = card?.icon;
          return (
            <motion.li
              key={l.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-lg border-l-4 bg-white/5 px-2.5 py-1.5 text-[12px] font-semibold leading-snug text-white/90 ${TONE[l.tone]}`}
            >
              {l.text}
              {card && meta && Icon && (
                /* Efecto de la carta, para entender qué pasó sin tener que conocerla */
                <div className="mt-1.5 flex items-start gap-2 rounded-xl border-2 border-black bg-cream p-1.5 text-black">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-black"
                    style={{ backgroundColor: meta.color, color: meta.text }}
                  >
                    <Icon size={15} strokeWidth={2.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-black uppercase leading-tight">
                      {card.name}
                      {card.durationMin ? <span className="ml-1 font-mono text-black/60">· {card.durationMin} min</span> : null}
                    </span>
                    <span className="block text-[11.5px] font-semibold leading-snug text-black/80">{card.description}</span>
                  </span>
                </div>
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
