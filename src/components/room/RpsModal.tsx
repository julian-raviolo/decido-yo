'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Hand, Scissors, Square } from 'lucide-react';
import { BrutalButton } from '@/components/ui';
import { getCard } from '@/data/cards-catalog';
import type { Player, RpsMatch } from '@/types/game';

type Move = 'piedra' | 'papel' | 'tijera';
const MOVES: { id: Move; label: string; icon: typeof Hand; color: string }[] = [
  { id: 'piedra', label: 'Piedra', icon: Square, color: '#FF5722' },
  { id: 'papel', label: 'Papel', icon: Hand, color: '#FFD600' },
  { id: 'tijera', label: 'Tijera', icon: Scissors, color: '#00E5FF' },
];
const BEATS: Record<Move, Move> = { piedra: 'tijera', papel: 'piedra', tijera: 'papel' };

export function RpsModal({
  rps,
  players,
  onResolve,
}: {
  rps: RpsMatch | null;
  players: Player[];
  /** true = ganó quien se defendía. */
  onResolve: (defenderWins: boolean) => void;
}) {
  const [mine, setMine] = useState<Move | null>(null);
  const [theirs, setTheirs] = useState<Move | null>(null);

  useEffect(() => {
    setMine(null);
    setTheirs(null);
  }, [rps?.id]);

  if (!rps) return null;
  const me = players.find((p) => p.isMe);
  const attacker = players.find((p) => p.id === rps.attackerId);
  const defender = players.find((p) => p.id === rps.defenderId);
  const myRole = me?.id === rps.defenderId ? 'defender' : 'attacker';
  const rival = myRole === 'defender' ? attacker : defender;
  const vsBot = !!rival?.isBot;
  const defenseCard = rps.defenseCardId ? getCard(rps.defenseCardId) : null;
  const penalty = defenseCard?.rpsLose === 'double' ? 'la carta por el doble de tiempo' : 'carta + castigo';
  const report = (r: 'win' | 'lose') => onResolve((myRole === 'defender') === (r === 'win'));
  const result: 'win' | 'lose' | 'tie' | null =
    mine && theirs ? (mine === theirs ? 'tie' : BEATS[mine] === theirs ? 'win' : 'lose') : null;

  const play = (m: Move) => {
    setMine(m);
    setTheirs(MOVES[Math.floor(Math.random() * 3)].id);
  };

  const stakes =
    myRole === 'defender'
      ? `Si ganás, se anula. Si perdés: ${penalty}.`
      : `Si ganás, ${rival?.name} cumple ${penalty}. Si perdés, se anula.`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 px-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-[400px] rounded-[2rem] border-4 border-black bg-social p-5 text-black shadow-brutal-cream"
      >
        <div className="text-center">
          <div className="text-[11px] font-black uppercase tracking-widest">{defenseCard?.name ?? 'Doble o Nada'}</div>
          <h2 className="font-display text-2xl font-black uppercase leading-tight">
            Piedra, Papel o Tijera
          </h2>
          <p className="mt-1 text-sm font-semibold">
            vs <b>{rival?.name}</b> por «{getCard(rps.cardId).name}». {stakes}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase text-black/60">
            {vsBot ? 'Elegí tu jugada: el bot juega al azar.' : 'Juéguenlo en vivo, en la mesa, y marquen quién ganó.'}
          </p>
        </div>

        {!vsBot && (
          <div className="mt-5 flex flex-col gap-3">
            <BrutalButton variant="cyan" onClick={() => onResolve(true)}>
              Ganó {defender?.isMe ? 'vos' : defender?.name} (se anula)
            </BrutalButton>
            <BrutalButton variant="red" onClick={() => onResolve(false)}>
              Ganó {attacker?.isMe ? 'vos' : attacker?.name} ({penalty})
            </BrutalButton>
          </div>
        )}

        <div className={`mt-5 grid-cols-3 gap-3 ${vsBot ? 'grid' : 'hidden'}`}>
          {MOVES.map((m) => {
            const Icon = m.icon;
            const selected = mine === m.id;
            return (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.9 }}
                disabled={!!result && result !== 'tie'}
                onClick={() => play(m.id)}
                className={`flex flex-col items-center gap-1 rounded-3xl border-4 border-black p-3 shadow-brutal ${
                  selected ? 'translate-x-1 translate-y-1 shadow-none' : ''
                }`}
                style={{ backgroundColor: m.color }}
              >
                <span className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-black bg-cream">
                  <Icon size={26} strokeWidth={3} />
                </span>
                <span className="text-xs font-black uppercase">{m.label}</span>
              </motion.button>
            );
          })}
        </div>

        {mine && theirs && (
          <motion.div
            key={`${mine}-${theirs}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-5 rounded-3xl border-4 border-black bg-cream p-4 text-center"
          >
            <div className="text-sm font-bold">
              Vos: <b className="uppercase">{mine}</b> · {rival?.name}: <b className="uppercase">{theirs}</b>
            </div>
            <div className="font-display text-3xl font-black uppercase">
              {result === 'tie' ? '¡Empate!' : result === 'win' ? '¡Ganaste!' : 'Perdiste'}
            </div>
            {result === 'tie' ? (
              <p className="text-sm font-semibold">Elegí de nuevo.</p>
            ) : (
              <BrutalButton variant="lime" className="mt-3 w-full" onClick={() => report(result as 'win' | 'lose')}>
                Continuar
              </BrutalButton>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
