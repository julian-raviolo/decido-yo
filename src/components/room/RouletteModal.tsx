'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Skull } from 'lucide-react';
import { BrutalButton } from '@/components/ui';
import { HOT_PUNISHMENTS, PUNISHMENTS } from '@/data/punishments';
import type { GameMode, Player, RouletteRequest } from '@/types/game';

const DARK = new Set(['#1A0006', '#AA00FF']);

export function RouletteModal({
  request,
  players,
  mode,
  onDone,
}: {
  request: RouletteRequest | null;
  players: Player[];
  mode: GameMode;
  onDone: (punishment: string) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    setResult(null);
    setSpinning(false);
  }, [request?.id]);

  const PUNISHMENTS_ = mode === 'hot' ? HOT_PUNISHMENTS : PUNISHMENTS;
  const SEG = 360 / PUNISHMENTS_.length;
  if (!request) return null;
  const target = players.find((p) => p.id === request.playerId);
  const isMe = !!target?.isMe;

  const spin = () => {
    if (spinning) return;
    const idx = Math.floor(Math.random() * PUNISHMENTS_.length);
    // El puntero está arriba (0°): llevar el centro del segmento idx a 0°.
    const base = rotation - (rotation % 360);
    const target = base + 360 * 6 + (360 - (idx * SEG + SEG / 2));
    setSpinning(true);
    setResult(null);
    setRotation(target);
    setTimeout(() => {
      setSpinning(false);
      setResult(idx);
    }, 4200);
  };

  const gradient = `conic-gradient(${PUNISHMENTS_.map(
    (p, i) => `${p.color} ${i * SEG}deg ${(i + 1) * SEG}deg`,
  ).join(', ')})`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex w-full max-w-[400px] flex-col items-center gap-4"
      >
        <div className="flex items-center gap-2 rounded-full border-4 border-black bg-special px-4 py-1.5 text-white shadow-brutal">
          <Skull size={18} strokeWidth={3} />
          <span className="font-display text-sm font-black uppercase">
            {mode === 'hot' ? 'Ruleta HOT' : 'Ruleta de Castigos'} · {isMe ? 'Vos' : target?.name}
          </span>
        </div>
        <p className="text-center text-xs font-bold uppercase text-white/70">{request.reason}</p>

        <div className="relative h-[300px] w-[300px]">
          {/* puntero */}
          <div className="absolute left-1/2 top-[-14px] z-20 -translate-x-1/2">
            <div className="h-0 w-0 border-x-[16px] border-t-[30px] border-x-transparent border-t-black" />
            <div className="absolute left-1/2 top-[-4px] h-0 w-0 -translate-x-1/2 border-x-[11px] border-t-[22px] border-x-transparent border-t-lime" />
          </div>
          <motion.div
            className="relative h-full w-full rounded-full border-[6px] border-black shadow-brutal-cream"
            style={{ background: gradient }}
            animate={{ rotate: rotation }}
            transition={{ duration: 4.1, ease: [0.12, 0.8, 0.18, 1] }}
          >
            {PUNISHMENTS_.map((p, i) => (
              <div
                key={p.id}
                className="absolute left-1/2 top-0 h-1/2 origin-bottom -translate-x-1/2 pt-3"
                style={{ transform: `translateX(-50%) rotate(${i * SEG + SEG / 2}deg)` }}
              >
                <span
                  className="block w-[64px] text-center text-[8.5px] font-black uppercase leading-[1.05]"
                  style={{ color: DARK.has(p.color) ? '#FFFDF7' : '#000' }}
                >
                  {p.text}
                </span>
              </div>
            ))}
            {Array.from({ length: PUNISHMENTS_.length }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-0 h-1/2 w-[3px] origin-bottom -translate-x-1/2 bg-black"
                style={{ transform: `translateX(-50%) rotate(${i * SEG}deg)` }}
              />
            ))}
          </motion.div>
          <div className="absolute left-1/2 top-1/2 z-10 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-black bg-cream text-black">
            <Skull size={28} strokeWidth={3} />
          </div>
        </div>

        {result === null ? (
          <BrutalButton variant="red" className="w-full" disabled={spinning} onClick={spin}>
            {spinning ? 'Girando…' : 'Girar la ruleta'}
          </BrutalButton>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full rounded-3xl border-4 border-black bg-cream p-4 text-center text-black shadow-brutal"
          >
            <div className="text-[11px] font-black uppercase text-black/60">{mode === 'hot' ? 'Reto (soft, con consentimiento)' : 'Castigo (se cumple sí o sí)'}</div>
            <div className="font-display text-xl font-black uppercase leading-tight">
              {PUNISHMENTS_[result].text}
            </div>
            <BrutalButton variant="lime" className="mt-3 w-full" onClick={() => onDone(PUNISHMENTS_[result].text)}>
              {isMe ? 'Cumplido' : `${target?.name} cumplió`}
            </BrutalButton>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
