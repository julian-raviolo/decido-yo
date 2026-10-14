'use client';

import { Bot, Droplets, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui';
import { isGagged, isImmune } from '@/context/GameContext';
import type { Player } from '@/types/game';

export function PlayersBar({
  players,
  now,
  onSelect,
}: {
  players: Player[];
  now: number;
  onSelect: (p: Player) => void;
}) {
  return (
    <div className="-mx-4 flex shrink-0 gap-3 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:none]">
      {players.map((p) => {
        const gag = isGagged(p, now);
        const imm = isImmune(p, now);
        return (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(p)}
            className="relative flex w-[64px] shrink-0 flex-col items-center gap-1"
          >
            <div className="relative">
              <Avatar name={p.name} color={p.color} size={52} ring={p.isMe ? 'rgb(var(--c-accent))' : undefined} />
              {p.isBot && (
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-black bg-white text-black">
                  <Bot size={13} strokeWidth={3} />
                </span>
              )}
              {gag && (
                <span className="absolute -left-1 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-black bg-special text-white">
                  <Lock size={12} strokeWidth={3} />
                </span>
              )}
              {imm && (
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-black bg-defense text-black">
                  <ShieldCheck size={13} strokeWidth={3} />
                </span>
              )}
              {p.pactWith && (
                <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full border-2 border-black bg-special text-white">
                  <Droplets size={12} strokeWidth={3} />
                </span>
              )}
            </div>
            <span className="w-full truncate text-center text-[11px] font-black uppercase text-white">
              {p.isMe ? 'Vos' : p.name}
            </span>
            <div className="flex gap-1">
              {p.actions.map((c) => (
                <SlotDot key={c.uid} on={c.state === 'ready' && !gag} color="#FFD600" />
              ))}
              {p.defenses.map((c) => (
                <SlotDot key={c.uid} on={c.state === 'ready'} color="#00E5FF" />
              ))}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function SlotDot({ on, color }: { on: boolean; color: string }) {
  return (
    <span
      className="h-2.5 w-3.5 rounded-full border-2 border-black"
      style={{ backgroundColor: on ? color : '#333' }}
    />
  );
}
