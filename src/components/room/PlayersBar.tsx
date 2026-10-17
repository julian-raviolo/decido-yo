'use client';

import { Bot, Droplets, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui';
import { isGagged, isImmune } from '@/context/GameContext';
import type { Player } from '@/types/game';

export function PlayersBar({
  players,
  now,
  acting,
  onSelect,
  sides,
}: {
  players: Player[];
  /** ⚔️ SALIDUELO: bando de cada jugador (A/B). */
  sides?: Record<string, 'A' | 'B'>;
  now: number;
  /** Jugadores que tienen que responder ahora (defenderse, cumplir, girar la ruleta…). */
  acting: Set<string>;
  onSelect: (p: Player) => void;
}) {
  return (
    <div className="-mx-4 flex shrink-0 gap-3 overflow-x-auto px-4 pb-2 pt-4 [scrollbar-width:none]">
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
              {acting.has(p.id) && (
                <>
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -inset-[7px] rounded-full border-[3px] border-social"
                    animate={{ scale: [1, 1.12, 1], opacity: [1, 0.55, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  />
                  <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-black bg-social px-1.5 text-[8px] font-black uppercase leading-[14px] text-black">
                    Le toca
                  </span>
                </>
              )}
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
            <span className="flex w-full items-center justify-center gap-1 text-[11px] font-black uppercase text-white">
              {sides?.[p.id] && (
                <span
                  className="shrink-0 rounded-full border-2 border-black bg-lime px-1 text-[9px] leading-[12px] text-black"
                  title={`Bando ${sides[p.id]}`}
                >
                  {sides[p.id]}
                </span>
              )}
              <span className="truncate">{p.isMe ? 'Vos' : p.name}</span>
            </span>
            <div className="flex flex-wrap justify-center gap-[3px]" aria-label="Cartas restantes">
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
      className="h-2 w-2 rounded-full ring-[1.5px] ring-black"
      style={{ backgroundColor: on ? color : 'rgba(255,255,255,0.15)' }}
    />
  );
}
