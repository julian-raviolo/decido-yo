'use client';

import { useState } from 'react';
import { Bot, Dices, Lock, ShieldCheck, Swords, VolumeX } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { Avatar, BrutalButton, Sheet } from '@/components/ui';
import { actionCardsFor, fitsScenario } from '@/data/cards-catalog';
import { isGagged, isImmune } from '@/context/GameContext';
import type { GameMode, Player, Scenario } from '@/types/game';

export function VictimPicker({
  open,
  title,
  subtitle,
  players,
  now,
  tone,
  onPick,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  players: Player[];
  now: number;
  tone?: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title} tone={tone}>
      {subtitle && <p className="-mt-2 mb-4 text-sm font-semibold">{subtitle}</p>}
      <div className="grid grid-cols-2 gap-3">
        {players.map((p) => {
          const immune = isImmune(p, now);
          return (
            <button
              key={p.id}
              disabled={immune}
              onClick={() => onPick(p.id)}
              className="flex items-center gap-3 rounded-3xl border-4 border-black bg-white p-3 text-left shadow-brutal transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-40"
            >
              <Avatar name={p.name} color={p.color} size={40} />
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-black uppercase">{p.name}</div>
                <div className="text-[10px] font-bold uppercase text-black/60">
                  {immune ? (
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck size={11} /> Inmune
                    </span>
                  ) : isGagged(p, now) ? (
                    <span className="inline-flex items-center gap-1">
                      <Lock size={11} /> Amordazado
                    </span>
                  ) : p.isBot ? (
                    'Bot'
                  ) : (
                    'Jugador'
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {players.length === 0 && <p className="text-center font-bold">No hay nadie disponible.</p>}
    </Sheet>
  );
}

export function RuleSheet({
  open,
  title = 'Decido Yo Absoluto',
  onSubmit,
  onClose,
}: {
  open: boolean;
  title?: string;
  onSubmit: (rule: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  return (
    <Sheet open={open} onClose={onClose} title={title} tone="#FF1744">
      <p className="-mt-2 mb-3 text-sm font-semibold text-white">
        Escribí una regla menor para el resto de la noche. Se aprueba sin votación.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={120}
        rows={3}
        placeholder="Ej: El que dice 'literal' toma un trago de agua"
        className="w-full resize-none rounded-3xl border-4 border-black bg-cream p-3 text-base font-semibold shadow-brutal outline-none"
      />
      <BrutalButton
        variant="lime"
        className="mt-4 w-full"
        disabled={text.trim().length < 4}
        onClick={() => {
          onSubmit(text.trim());
          setText('');
        }}
      >
        Imponer regla
      </BrutalButton>
    </Sheet>
  );
}

export function BotSheet({
  bot,
  mode,
  scenario,
  now,
  meImmune,
  onAttack,
  onGag,
  onClose,
}: {
  bot: Player | null;
  mode: GameMode;
  scenario: Scenario;
  now: number;
  meImmune: boolean;
  onAttack: (cardId?: string) => void;
  onGag: () => void;
  onClose: () => void;
}) {
  const [picking, setPicking] = useState(false);
  const gagged = isGagged(bot, now);
  const close = () => {
    setPicking(false);
    onClose();
  };
  return (
    <Sheet
      open={!!bot}
      onClose={close}
      title={
        <span className="flex items-center gap-2">
          <Bot size={22} strokeWidth={3} /> {bot?.name} (prueba)
        </span>
      }
    >
      {bot && (
        <div className="flex flex-col gap-3">
          <p className="-mt-2 text-sm font-semibold text-black/70">
            Controlá a este bot para probar defensas, mordazas y castigos desde un solo celular.
          </p>
          {meImmune && (
            <p className="rounded-2xl border-[3px] border-black bg-defense px-3 py-2 text-sm font-bold">
              Tenés Inmunidad Diplomática: los ataques hacia vos se bloquean.
            </p>
          )}
          {gagged && (
            <p className="rounded-2xl border-[3px] border-black bg-special px-3 py-2 text-sm font-bold text-white">
              Está amordazado: no puede usar su Acción.
            </p>
          )}

          {!picking ? (
            <>
              <BrutalButton
                variant="yellow"
                disabled={gagged}
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  onAttack();
                  close();
                }}
              >
                <Dices size={20} strokeWidth={3} /> Atacarme (su carta)
              </BrutalButton>
              <BrutalButton
                variant="cream"
                disabled={gagged}
                className="flex items-center justify-center gap-2"
                onClick={() => setPicking(true)}
              >
                <Swords size={20} strokeWidth={3} /> Elegir carta de ataque
              </BrutalButton>
              <BrutalButton
                variant="cyan"
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  onGag();
                  close();
                }}
              >
                <VolumeX size={20} strokeWidth={3} /> Amordazarme
              </BrutalButton>
            </>
          ) : (
            <div className="grid grid-cols-3 justify-items-center gap-3">
              {actionCardsFor(mode).filter((c) => fitsScenario(c, scenario)).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onAttack(c.id);
                    close();
                  }}
                  className="active:scale-95"
                >
                  <GameCard cardId={c.id} size="mini" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
