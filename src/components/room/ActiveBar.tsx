'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Gavel, Timer } from 'lucide-react';
import { getCard } from '@/data/cards-catalog';
import { formatCountdown } from '@/lib/utils';
import type { Room } from '@/types/game';

/**
 * Franja fija arriba de la mesa con todo lo que está "en curso":
 * efectos con cuenta regresiva y reglas impuestas. Independiente del historial.
 */
export function ActiveBar({ room, now }: { room: Room; now: number }) {
  const effects = room.effects.filter((e) => e.endsAt > now).sort((a, b) => a.endsAt - b.endsAt);
  const total = effects.length + room.rules.length;
  if (!total) return null;

  const name = (id: string) => {
    const p = room.players.find((x) => x.id === id);
    return p ? (p.isMe ? 'Vos' : p.name) : '¿?';
  };

  return (
    <section
      aria-label="En curso"
      className="-mx-4 flex shrink-0 items-center gap-2 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <span className="flex shrink-0 flex-col items-center text-[9px] font-black uppercase leading-none tracking-wider text-white/60">
        <Timer size={14} strokeWidth={3} />
        <span className="mt-0.5">{total}</span>
      </span>
      <AnimatePresence initial={false}>
        {effects.map((e) => {
          const card = getCard(e.cardId);
          const Icon = card.icon;
          const left = e.endsAt - now;
          const pct = e.startedAt ? Math.max(0, Math.min(1, left / (e.endsAt - e.startedAt))) : null;
          const urgent = left < 60_000;
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative flex h-11 shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-2xl border-[3px] border-black bg-cream pl-1 pr-1.5 text-black shadow-brutal-sm"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-black bg-white">
                <Icon size={14} strokeWidth={2.75} />
              </span>
              <span className="flex flex-col leading-[1.05]">
                <span className="text-[11px] font-black uppercase">{card.name}</span>
                <span className="text-[10px] font-bold text-black/65">→ {name(e.targetId)}</span>
              </span>
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 font-mono text-[12px] font-black ${
                  urgent ? 'animate-pulse bg-special text-white' : 'bg-black text-lime'
                }`}
              >
                {formatCountdown(left)}
              </span>
              {pct !== null && (
                <span className="absolute bottom-0 left-0 h-[3px] bg-black/80" style={{ width: `${pct * 100}%` }} />
              )}
            </motion.div>
          );
        })}
        {room.rules.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-11 max-w-[260px] shrink-0 items-center gap-1.5 rounded-2xl border-[3px] border-black bg-special pl-1 pr-2 text-white shadow-brutal-sm"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-black bg-cream text-black">
              <Gavel size={14} strokeWidth={2.75} />
            </span>
            <span className="flex min-w-0 flex-col leading-[1.05]">
              <span className="text-[9px] font-black uppercase opacity-85">Regla de {name(r.byId)}</span>
              <span className="line-clamp-2 text-[11px] font-bold">{r.text}</span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}
