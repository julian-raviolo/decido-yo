'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Gavel, Lock, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { getCard } from '@/data/cards-catalog';
import { formatCountdown } from '@/lib/utils';
import type { Room } from '@/types/game';

interface Item {
  key: string;
  icon: LucideIcon;
  label: string;
  endsAt: number;
  tone: 'effect' | 'gag' | 'immune';
}

/**
 * Restricciones visibles arriba de la mesa, agrupadas por persona:
 * efectos con tiempo, mordazas e inmunidades. Las reglas de mesa van en su propia ficha.
 */
export function RestrictionsBar({ room, now }: { room: Room; now: number }) {
  const groups = room.players
    .map((p) => {
      const items: Item[] = room.effects
        .filter((e) => e.targetId === p.id && e.endsAt > now)
        .map((e) => {
          const card = getCard(e.cardId);
          return { key: e.id, icon: card.icon, label: card.name, endsAt: e.endsAt, tone: 'effect' as const };
        });
      if (p.gaggedUntil && p.gaggedUntil > now)
        items.push({ key: `gag-${p.id}`, icon: Lock, label: 'Amordazado', endsAt: p.gaggedUntil, tone: 'gag' });
      if (p.immuneUntil && p.immuneUntil > now)
        items.push({ key: `imm-${p.id}`, icon: ShieldCheck, label: 'Intocable', endsAt: p.immuneUntil, tone: 'immune' });
      items.sort((a, b) => a.endsAt - b.endsAt);
      return { player: p, items };
    })
    .filter((g) => g.items.length > 0)
    // Primero vos, después el resto por lo que vence antes.
    .sort((a, b) => Number(b.player.isMe) - Number(a.player.isMe) || a.items[0].endsAt - b.items[0].endsAt);

  if (!groups.length && !room.rules.length) return null;

  return (
    <section
      aria-label="Restricciones activas"
      className="-mx-4 flex shrink-0 items-stretch gap-2 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <AnimatePresence initial={false}>
        {groups.map(({ player, items }) => (
          <motion.div
            key={player.id}
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex shrink-0 items-center gap-2 rounded-2xl border-[3px] border-black py-1 pl-1 pr-1.5 shadow-brutal-sm ${
              player.isMe ? 'bg-cream text-black' : 'bg-panel text-white'
            }`}
          >
            <Avatar name={player.name} color={player.color} size={30} />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase leading-none opacity-70">
                {player.isMe ? 'Vos' : player.name}
              </span>
              <div className="mt-0.5 flex gap-1">
                {items.map((it) => {
                  const Icon = it.icon;
                  const left = it.endsAt - now;
                  return (
                    <span
                      key={it.key}
                      title={it.label}
                      aria-label={`${it.label}: ${formatCountdown(left)}`}
                      className={`flex items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        left < 60_000
                          ? 'animate-pulse bg-special text-white'
                          : it.tone === 'gag'
                            ? 'bg-special/90 text-white'
                            : it.tone === 'immune'
                              ? 'bg-defense text-black'
                              : player.isMe
                                ? 'bg-black text-lime'
                                : 'bg-black/50 text-white'
                      }`}
                    >
                      <Icon size={11} strokeWidth={2.5} /> {formatCountdown(left)}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
        {room.rules.map((r) => (
          <motion.div
            key={r.id}
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex max-w-[230px] shrink-0 items-center gap-1.5 rounded-2xl border-[3px] border-black bg-special py-1 pl-1 pr-2 text-white shadow-brutal-sm"
          >
            <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border-2 border-black bg-cream text-black">
              <Gavel size={14} strokeWidth={2.75} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[9px] font-black uppercase leading-none opacity-80">Regla · toda la mesa</span>
              <span className="mt-0.5 line-clamp-2 text-[10px] font-bold leading-tight">{r.text}</span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}
