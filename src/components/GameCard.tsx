'use client';

import { motion } from 'framer-motion';
import { Crown, Flame, Lock, Shield, Zap } from 'lucide-react';
import { cardMeta, getCard, isDefenseCard } from '@/data/cards-catalog';

type Size = 'mini' | 'md' | 'hand' | 'sm' | 'lg';

const SIZES: Record<Size, { box: string; circle: string; icon: number; title: string; pad: string }> = {
  mini: { box: 'w-[78px] h-[110px] rounded-2xl border-[3px]', circle: 'w-11 h-11 border-[3px]', icon: 22, title: 'text-[8px]', pad: 'p-1.5' },
  md: { box: 'w-[88px] h-[126px] rounded-2xl border-[3px]', circle: 'w-12 h-12 border-[3px]', icon: 24, title: 'text-[9px]', pad: 'p-1.5' },
  hand: { box: 'w-[112px] h-[160px] rounded-[1.4rem] border-[3px]', circle: 'w-[58px] h-[58px] border-[3px]', icon: 30, title: 'text-[11px]', pad: 'p-2' },
  sm: { box: 'w-[150px] h-[212px] rounded-3xl border-4', circle: 'w-[74px] h-[74px] border-4', icon: 38, title: 'text-[13px]', pad: 'p-2.5' },
  lg: { box: 'w-[268px] h-[380px] rounded-3xl border-4', circle: 'w-[132px] h-[132px] border-4', icon: 68, title: 'text-2xl', pad: 'p-4' },
};

/** Tamaño base del título por tamaño de carta (el mismo que la clase `title`). */
const TITLE_BASE: Record<Size, string> = { mini: '8px', md: '9px', hand: '11px', sm: '13px', lg: '1.5rem' };

/**
 * El título nunca corta una palabra ni se sale de la carta: si la palabra más larga
 * no entra en el ancho (≈0.82em por letra en Arial Black mayúscula), se achica lo justo.
 */
function titleFontSize(name: string, size: Size) {
  const longest = Math.max(...name.split(/\s+/).map((w) => [...w].length));
  return `min(${TITLE_BASE[size]}, ${(100 / (longest * 0.82)).toFixed(2)}cqw)`;
}

/** Aureola sutil (ángel) o cuernitos (diablo) sobre el círculo central. */
function HotOrnament({ kind, size }: { kind: 'ANGEL' | 'DEVIL'; size: Size }) {
  const w = size === 'lg' ? 96 : size === 'sm' ? 56 : size === 'hand' ? 44 : 34;
  return kind === 'ANGEL' ? (
    <svg width={w} height={w * 0.28} viewBox="0 0 100 28" className="pointer-events-none -mb-1">
      <ellipse cx="50" cy="14" rx="44" ry="9" fill="none" stroke="#FFD166" strokeWidth="6" />
      <ellipse cx="50" cy="14" rx="44" ry="9" fill="none" stroke="#000" strokeWidth="2" />
    </svg>
  ) : (
    <svg width={w} height={w * 0.3} viewBox="0 0 100 30" className="pointer-events-none -mb-2">
      <path d="M22 30 C18 18 22 8 32 2 C30 12 32 20 40 26 Z" fill="#FF1744" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
      <path d="M78 30 C82 18 78 8 68 2 C70 12 68 20 60 26 Z" fill="#FF1744" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

interface Props {
  cardId: string;
  size?: Size;
  /** locked = amordazada / sin presupuesto · pro = carta PRO bloqueada. */
  state?: 'ready' | 'burned' | 'locked' | 'pro';
  /** Texto del candado (por defecto "Amordazada"). */
  lockLabel?: string;
  showDescription?: boolean;
  className?: string;
}

export function GameCard({ cardId, size = 'sm', state = 'ready', lockLabel, showDescription, className = '' }: Props) {
  const card = getCard(cardId);
  const meta = cardMeta(card);
  const s = SIZES[size];
  const Icon = card.icon;
  const isDefense = isDefenseCard(card);
  const describe = showDescription ?? size === 'lg';
  const small = size === 'mini' || size === 'md';
  const hot = card.mode === 'hot';
  const stripe = hot ? (isDefense ? '#FFD166' : '#FF1744') : '#000';

  return (
    <div
      className={`relative ${s.box} ${s.pad} border-black flex flex-col items-center justify-between overflow-hidden select-none ${
        small ? 'shadow-brutal-sm' : 'shadow-brutal'
      } ${className}`}
      style={{ backgroundColor: meta.color, color: meta.text }}
    >
      {/* textura de rayas */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: hot ? 0.22 : 0.12,
          backgroundImage: `repeating-linear-gradient(-45deg, ${stripe} 0 2px, transparent 2px 12px)`,
        }}
      />

      {card.isLocked && (
        <span
          className={`absolute z-30 flex items-center gap-0.5 rounded-full border-2 border-black bg-halo font-black uppercase text-black ${
            small ? 'right-1 top-1 px-1 text-[7px]' : '-right-0.5 bottom-2 rotate-[-8deg] px-1.5 text-[9px]'
          }`}
        >
          <Crown size={small ? 8 : 10} strokeWidth={3} /> PRO
        </span>
      )}

      {!small && (
        <div className="relative z-10 flex w-full items-center justify-between">
          <span
            className={`truncate rounded-full border-2 border-black bg-black font-black uppercase tracking-wider text-white ${
              size === 'hand' ? 'px-1.5 py-0.5 text-[7px]' : 'px-2 py-0.5 text-[9px]'
            }`}
          >
            {meta.label}
          </span>
          <span
            className={`grid shrink-0 place-items-center rounded-full border-2 border-black bg-cream text-black ${
              size === 'hand' ? 'h-5 w-5' : 'h-6 w-6'
            }`}
          >
            {isDefense ? <Shield size={13} strokeWidth={3} /> : <Zap size={13} strokeWidth={3} />}
          </span>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        {hot && <HotOrnament kind={isDefense ? 'ANGEL' : 'DEVIL'} size={size} />}
        <div className={`${s.circle} grid shrink-0 place-items-center rounded-full border-black bg-cream text-black`}>
          <Icon size={s.icon} strokeWidth={2.75} />
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-col items-center gap-1 text-center [container-type:inline-size]">
        <h3
          className={`${s.title} font-display font-black uppercase leading-[1.05] tracking-tight`}
          style={{ fontSize: titleFontSize(card.name, size) }}
        >
          {card.name}
        </h3>
        {describe && (
          <p
            className={`w-full rounded-2xl border-2 border-black bg-cream px-2 py-1.5 text-black ${
              size === 'lg' ? 'text-[13px] leading-snug' : 'text-[10px] leading-tight'
            } font-semibold`}
          >
            {card.description}
          </p>
        )}
        {card.durationMin && size === 'lg' && (
          <span className="rounded-full border-2 border-black bg-black px-2 py-0.5 text-[10px] font-black text-white">
            ⏱ {card.durationMin} MIN
          </span>
        )}
      </div>

      {state === 'burned' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 grid place-items-center bg-black/70"
        >
          <div className="flex flex-col items-center gap-1 text-food">
            <Flame size={small ? 22 : 40} strokeWidth={3} />
            {!small && <span className="text-xs font-black uppercase text-white">Quemada</span>}
          </div>
        </motion.div>
      )}
      {state === 'locked' && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/60">
          <div className="flex flex-col items-center gap-1 text-white">
            <Lock size={small ? 20 : 34} strokeWidth={3} />
            {!small && (
              <span className="px-2 text-center text-[11px] font-black uppercase leading-tight">{lockLabel ?? 'Amordazada'}</span>
            )}
          </div>
        </div>
      )}
      {state === 'pro' && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 backdrop-grayscale">
          <span className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-black bg-halo text-black shadow-brutal-sm">
            <Lock size={18} strokeWidth={3} />
          </span>
        </div>
      )}
    </div>
  );
}

export function CardBack({ size = 'sm', label }: { size?: Size; label?: string }) {
  const s = SIZES[size];
  return (
    <div
      className={`${s.box} ${s.pad} relative grid place-items-center border-black bg-panel text-cream ${
        size === 'mini' || size === 'md' || size === 'hand' ? 'shadow-brutal-sm' : 'shadow-brutal'
      }`}
      style={{
        backgroundImage: 'radial-gradient(#ffffff22 1.5px, transparent 1.5px)',
        backgroundSize: '12px 12px',
      }}
    >
      <div className="rounded-2xl border-[3px] border-black bg-lime px-2 py-1 text-center font-display text-[11px] font-black uppercase leading-none text-black shadow-brutal-sm">
        Decido
        <br />
        Yo
      </div>
      {label && (
        <span className="absolute bottom-2 px-1 text-center text-[10px] font-bold uppercase leading-tight text-white/70">
          {label}
        </span>
      )}
    </div>
  );
}
