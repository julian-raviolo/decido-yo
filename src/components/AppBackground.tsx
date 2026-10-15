'use client';

import { useGame } from '@/context/GameContext';

/**
 * Fondo único a pantalla completa (fuera del contenedor de 430px): cubre el
 * 100vw × 100dvh real desde el borde superior, sin cortes al scrollear.
 */
export function AppBackground() {
  const { mode } = useGame();
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 transition-colors duration-300 ${mode === 'hot' ? 'bg-dots-hot' : 'bg-dots'}`}
    />
  );
}
