'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { initials } from '@/lib/utils';

type Variant = 'lime' | 'cream' | 'cyan' | 'red' | 'yellow' | 'dark';
const VARIANTS: Record<Variant, string> = {
  lime: 'bg-lime text-black',
  cream: 'bg-cream text-black',
  cyan: 'bg-defense text-black',
  red: 'bg-special text-white',
  yellow: 'bg-social text-black',
  dark: 'bg-[#222] text-white',
};

export function BrutalButton({
  variant = 'lime',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={`rounded-3xl border-4 border-black px-5 py-3 font-display font-black uppercase tracking-tight shadow-brutal transition-[transform,box-shadow] duration-100 active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0px_0px_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-brutal ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Avatar({
  name,
  color,
  size = 48,
  ring,
}: {
  name: string;
  color: string;
  size?: number;
  ring?: string;
}) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full border-[3px] border-black font-display font-black text-black shadow-brutal-sm"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.36,
        outline: ring ? `3px solid ${ring}` : undefined,
        outlineOffset: 2,
      }}
    >
      {initials(name)}
    </div>
  );
}

/** Modal a pantalla completa centrado dentro del contenedor mobile. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  tone = '#FFFDF7',
}: {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  tone?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative mb-0 max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[2rem] border-4 border-b-0 border-black p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-black"
            style={{ backgroundColor: tone }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || onClose) && (
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="font-display text-xl font-black uppercase leading-tight">{title}</h2>
                {onClose && (
                  <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[3px] border-black bg-white shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase ${className}`}
    >
      {children}
    </span>
  );
}
