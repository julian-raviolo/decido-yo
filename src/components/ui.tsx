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

/** Luminancia relativa (WCAG) de un color #RRGGBB; null si no es hex. */
function luminance(hex: string) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Tinta del título según el fondo: negro salvo que el negro no llegue a 4.5:1 (bordó HOT, paneles oscuros). */
function inkFor(tone: string) {
  const l = luminance(tone);
  return l !== null && (l + 0.05) / 0.05 < 4.5 ? 'text-cream' : 'text-black';
}

/** Modal a pantalla completa centrado dentro del contenedor mobile. */
export function Sheet({
  open,
  onClose,
  onExitComplete,
  title,
  children,
  tone = '#FFFDF7',
}: {
  open: boolean;
  onClose?: () => void;
  /** Se llama cuando terminó de bajar (para encadenar otro overlay sin superponerse). */
  onExitComplete?: () => void;
  title?: ReactNode;
  children: ReactNode;
  tone?: string;
}) {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
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
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className={`min-w-0 font-display text-xl font-black uppercase leading-tight ${inkFor(tone)}`}>{title}</h2>
                {onClose && (
                  <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full border-[3px] border-black bg-cream text-black shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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

export function Pill({ children, className = '', title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase ${className}`}
    >
      {children}
    </span>
  );
}
