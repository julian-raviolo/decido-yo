'use client';

import { useEffect, useState } from 'react';
import { Avatar, BrutalButton, Sheet } from '@/components/ui';

/** Popup para poner (o cambiar) el nombre con el que te ven en la mesa. */
export function NameSheet({
  open,
  firstTime = false,
  initial,
  color,
  hot,
  onSave,
  onClose,
  onExited,
}: {
  open: boolean;
  /** Sin nombre guardado: popup limpio, sin cerrar, con "Continuar". */
  firstTime?: boolean;
  initial: string;
  color: string;
  hot: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
  /** Cuando el popup terminó de bajar: recién ahí puede entrar otro overlay. */
  onExited?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  // Se congela al abrir: así el botón no cambia de texto mientras el popup baja.
  const [first, setFirst] = useState(firstTime);
  const ok = draft.trim().length >= 2;

  // Al abrir, parte del nombre actual.
  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);
  useEffect(() => {
    if (open) setFirst(firstTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Sheet
      open={open}
      onClose={first ? undefined : onClose}
      onExitComplete={onExited}
      title="¿Cómo te llamás?"
      tone={hot ? '#9E0014' : undefined}
    >
      <form
        className={`flex flex-col gap-4 ${hot ? 'text-cream' : 'text-black'}`}
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onSave(draft.trim());
        }}
      >
        <p className={`-mt-2 text-sm font-semibold ${hot ? 'text-cream/80' : 'text-black/70'}`}>
          {first ? 'Poné tu nombre para entrar: así te van a ver en la mesa.' : 'Así te van a ver en la mesa.'}
        </p>
        <div className="flex items-center gap-3">
          <Avatar name={draft || '?'} color={color} size={52} />
          <input
            value={draft}
            autoFocus
            maxLength={16}
            autoComplete="nickname"
            enterKeyHint="done"
            aria-label="Tu nombre"
            onChange={(e) => setDraft(e.target.value.slice(0, 16))}
            placeholder="Ej: Juli"
            className="h-14 w-0 flex-1 rounded-2xl border-[3px] border-black bg-cream px-4 font-display font-black uppercase text-black shadow-brutal-sm outline-none placeholder:text-black/30"
          />
        </div>
        <BrutalButton type="submit" variant="lime" disabled={!ok} className="w-full">
          {first ? 'Continuar' : 'Guardar'}
        </BrutalButton>
      </form>
    </Sheet>
  );
}
