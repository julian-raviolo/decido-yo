'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Skull } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { Avatar, BrutalButton } from '@/components/ui';
import { DEFENSE_WINDOW_SECONDS, getCard } from '@/data/cards-catalog';
import { isImmune, readyCards } from '@/context/GameContext';
import type { HandCard, Incoming, Player } from '@/types/game';

export function IncomingModal({
  incoming,
  players,
  me,
  now,
  noBudget = false,
  onRespond,
  onExpire,
}: {
  incoming: Incoming | null;
  players: Player[];
  me: Player;
  now: number;
  /** Sin usos semanales: los escudos no se pueden quemar. */
  noBudget?: boolean;
  onRespond: (choice: 'defend' | 'comply' | 'refuse', opts?: { redirectTo?: string; defenseUid?: string }) => void;
  onExpire: () => void;
}) {
  const [declined, setDeclined] = useState(false);
  const [redirectWith, setRedirectWith] = useState<HandCard | null>(null);

  useEffect(() => {
    setDeclined(false);
    setRedirectWith(null);
  }, [incoming?.id]);

  const remaining = incoming ? DEFENSE_WINDOW_SECONDS - (now - incoming.startedAt) / 1000 : 0;
  const expired = remaining <= 0;
  useEffect(() => {
    if (incoming?.phase === 'defend' && expired) onExpire();
  }, [incoming?.phase, expired, onExpire]);

  if (!incoming) return null;
  const card = getCard(incoming.cardId);
  const attacker = players.find((p) => p.id === incoming.fromId);
  const defenses = noBudget ? [] : readyCards(me.defenses);
  const canDefend = incoming.phase === 'defend' && defenses.length > 0 && !declined;
  const refusable = card.refusable !== false && !incoming.punishAfter;
  // En citas de a 2, Chivo Expiatorio funciona como escudo normal.
  const redirectTargets = players.length <= 2 ? [] : players.filter((p) => !p.isMe && !isImmune(p, now));
  const pct = Math.max(0, Math.min(1, remaining / DEFENSE_WINDOW_SECONDS));

  const useDefense = (slot: HandCard) => {
    const redirect = getCard(slot.cardId).defenseEffect === 'REDIRECT';
    // Un solo destino posible: se redirige directo, sin preguntar.
    if (redirect && redirectTargets.length === 1)
      onRespond('defend', { redirectTo: redirectTargets[0].id, defenseUid: slot.uid });
    else if (redirect && redirectTargets.length) setRedirectWith(slot);
    else onRespond('defend', { defenseUid: slot.uid });
  };

  return (
    <AnimatePresence>
      <motion.div
        key={incoming.id}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.6, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220 }}
          className="flex max-h-[96dvh] w-full max-w-[400px] flex-col items-center gap-3 overflow-y-auto py-3"
        >
          <div className="flex items-center gap-2 rounded-full border-4 border-black bg-special px-4 py-1.5 text-white shadow-brutal">
            <AlertTriangle size={18} strokeWidth={3} />
            <span className="font-display text-sm font-black uppercase">
              {attacker?.isMe ? 'Vuelve a vos' : `${attacker?.name ?? '¿?'} te tiró una carta`}
            </span>
          </div>
          {noBudget && incoming.phase === 'defend' && readyCards(me.defenses).length > 0 && (
            <p className="text-center text-xs font-bold uppercase text-social">
              Gastaste tus 10 usos de la semana: no podés quemar escudos
            </p>
          )}
          {incoming.reason && (
            <p className="text-center text-xs font-bold uppercase text-social">{incoming.reason}</p>
          )}

          <motion.div animate={{ rotate: [0, -2, 2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <GameCard cardId={card.id} size="lg" />
          </motion.div>

          {canDefend && !redirectWith && (
            <div className="flex w-full flex-col gap-2 rounded-3xl border-4 border-black bg-cream p-3 text-black shadow-brutal">
              <div className="flex items-center gap-3">
                <div className="relative grid h-12 w-12 shrink-0 place-items-center">
                  <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#000" strokeWidth="5" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke={pct < 0.25 ? '#FF1744' : '#00E5FF'}
                      strokeWidth="3"
                      strokeDasharray={`${pct * 97.4} 97.4`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-mono text-sm font-black">{Math.ceil(Math.max(0, remaining))}</span>
                </div>
                <div className="text-[11px] font-black uppercase leading-tight">
                  Tenés {DEFENSE_WINDOW_SECONDS} s para defenderte
                </div>
              </div>
              {defenses.map((slot) => {
                const def = getCard(slot.cardId);
                const Icon = def.icon;
                return (
                  <button
                    key={slot.uid}
                    onClick={() => useDefense(slot)}
                    className="flex items-center gap-3 rounded-2xl border-[3px] border-black bg-defense p-2 text-left shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[3px] border-black bg-cream">
                      <Icon size={22} strokeWidth={2.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-sm font-black uppercase leading-tight">
                        Usar {def.name}
                      </span>
                      <span className="block text-[11px] font-semibold leading-tight">{def.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {redirectWith ? (
            <div className="w-full rounded-3xl border-4 border-black bg-defense p-3 shadow-brutal">
              <p className="mb-2 text-center font-display text-sm font-black uppercase text-black">
                ¿A quién se la desviás?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {redirectTargets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onRespond('defend', { redirectTo: p.id, defenseUid: redirectWith.uid })}
                    className="flex items-center gap-2 rounded-2xl border-[3px] border-black bg-white p-2 font-black uppercase text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Avatar name={p.name} color={p.color} size={30} />
                    <span className="truncate text-xs">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : canDefend ? (
            <BrutalButton variant="cream" className="w-full text-sm" onClick={() => setDeclined(true)}>
              No me defiendo
            </BrutalButton>
          ) : (
            <div className="flex w-full flex-col gap-3">
              <BrutalButton
                variant="lime"
                className="flex items-center justify-center gap-2"
                onClick={() => onRespond('comply')}
              >
                <Check size={20} strokeWidth={3} />
                {card.refusable === false ? 'Aceptar' : 'Lo cumplo'}
              </BrutalButton>
              {refusable && (
                <BrutalButton
                  variant="red"
                  className="flex items-center justify-center gap-2"
                  onClick={() => onRespond('refuse')}
                >
                  <Skull size={20} strokeWidth={3} /> Me niego (Ir a Castigo)
                </BrutalButton>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
