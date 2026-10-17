'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarClock, CheckCircle2, ChevronUp, Flame, Shield, Zap } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { Avatar, BrutalButton, Pill } from '@/components/ui';
import { WEEKLY_BURNS, actionCardsFor, defenseCardsFor } from '@/data/cards-catalog';
import type { GameMode } from '@/types/game';

/* ---------- Flag "ya vio el tutorial" (localStorage, tolerante a errores) ---------- */

const TUTORIAL_KEY = 'decido-yo:tutorial-seen';

/** Sólo llamar después de `hydrated` (lee localStorage). Si no hay storage, no molesta. */
export function tutorialSeen() {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  } catch {
    return true;
  }
}

function markTutorialSeen() {
  try {
    localStorage.setItem(TUTORIAL_KEY, '1');
  } catch {
    /* sin storage: no pasa nada */
  }
}

/* ---------- Tutorial tipo stories ---------- */

const SPRING = { type: 'spring', damping: 18, stiffness: 260 } as const;
const POP = { type: 'spring', damping: 15, stiffness: 300 } as const;
// Salida corta: cerrar tiene que sentirse inmediato (un spring acá tarda ~850 ms en asentarse).
const EXIT = { duration: 0.2, ease: [0.4, 0, 1, 1] } as const;

interface SlideProps {
  hot: boolean;
  reduce: boolean;
  actions: string[];
  defense: string;
  me: { name: string; color: string };
}

interface Slide {
  title: string;
  line: (hot: boolean) => string;
  ms: number;
  Art: (p: SlideProps) => JSX.Element;
}

const SLIDES: Slide[] = [
  {
    title: 'Armá la sala',
    line: (hot) =>
      hot ? 'Pasale el código a tu pareja: cada uno juega desde su celu.' : 'Compartí el código: cada uno juega desde su celu.',
    ms: 4500,
    Art: RoomArt,
  },
  {
    title: 'Tu mano',
    line: (hot) =>
      hot
        ? 'Te tocan al azar: diablitos para tentar y un ángel para zafar.'
        : 'Te toca al azar: cartas de Acción para tirar y un Escudo para cubrirte.',
    ms: 4500,
    Art: HandArt,
  },
  {
    title: 'Tirá una carta',
    line: (hot) =>
      hot
        ? 'Elegí la tentación y deslizala hacia tu pareja: esa carta se quema.'
        : 'Elegí carta y víctima. Deslizá para arriba y ¡zas! Esa carta se quema.',
    ms: 4500,
    Art: ThrowArt,
  },
  {
    title: 'Defendete o cumplí',
    line: () => 'Tenés 60 s: escudo o lo hacés. ¿Te negás? Ruleta de castigo.',
    ms: 5500,
    Art: DefendArt,
  },
  {
    title: '⚔️ Saliduelo',
    line: (hot) =>
      hot
        ? 'Cada uno defiende su lugar con 2 ❤️. El que no cumple pierde uno: el que queda en pie elige la salida.'
        : 'Cada bando defiende un lugar con 2 ❤️. El que no cumple pierde uno: el que queda en pie elige la salida.',
    ms: 6000,
    Art: DuelArt,
  },
  {
    title: `${WEEKLY_BURNS} energías por semana`,
    line: () => 'Cada carta que quemás vuelve el lunes, con las energías renovadas.',
    ms: 4500,
    Art: BurnsArt,
  },
];

export function HowToPlay({
  open,
  onClose,
  mode,
  me,
}: {
  open: boolean;
  onClose: () => void;
  mode: GameMode;
  me: { name: string; color: string };
}) {
  const reduce = !!useReducedMotion();
  const [idx, setIdx] = useState(0);
  const hot = mode === 'hot';
  const last = SLIDES.length - 1;
  const slide = SLIDES[idx];

  // Cartas de ejemplo del modo actual, siempre ids válidos del catálogo (sólo activas, no PRO).
  const { actions, defense } = useMemo(() => {
    // Se prefieren nombres con palabras cortas: en las cartas chicas se leen sin achicar el título.
    const longest = (n: string) => Math.max(...n.split(' ').map((w) => w.length));
    const byShort = <T extends { name: string }>(xs: T[]) => [...xs].sort((x, y) => longest(x.name) - longest(y.name));
    const a = byShort(actionCardsFor(mode).filter((c) => !c.isLocked));
    const d = byShort(defenseCardsFor(mode).filter((c) => !c.isLocked));
    return { actions: a.slice(0, 2).map((c) => c.id), defense: d[0].id };
  }, [mode]);

  // Ref al onClose del padre: así el timer no se reinicia cada vez que el inicio re-renderiza.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const close = useCallback(() => {
    markTutorialSeen();
    onCloseRef.current();
  }, []);

  const next = useCallback(() => (idx >= last ? close() : setIdx(idx + 1)), [idx, last, close]);
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  // Cada vez que se abre, arranca de la primera.
  useEffect(() => {
    if (open) setIdx(0);
  }, [open]);

  // Avance automático; en la última, se cierra solo.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(next, slide.ms);
    return () => clearTimeout(t);
  }, [open, next, slide.ms]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, next]);

  // Tap estilo stories: tercio izquierdo vuelve, el resto avanza.
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.3) prev();
    else next();
  };

  const Art = slide.Art;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal
          aria-label="Cómo se juega"
          className="fixed inset-0 z-[60] flex touch-none justify-center overscroll-none bg-night"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: EXIT }}
        >
          <motion.div
            className="flex h-dvh w-full max-w-[430px] flex-col gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]"
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0, transition: EXIT }}
            transition={SPRING}
          >
            {/* Barras de progreso */}
            <div className="flex gap-1.5" aria-hidden>
              {SLIDES.map((s, i) => (
                <div key={s.title} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
                  {i < idx && <div className="h-full w-full bg-lime" />}
                  {i === idx && (
                    <motion.div
                      key={`bar-${idx}`}
                      className="h-full w-full origin-left bg-lime"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: s.ms / 1000, ease: 'linear' }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/80">
                Cómo se juega · {idx + 1}/{SLIDES.length}
              </span>
              <button
                onClick={close}
                className="h-[44px] rounded-2xl border-[3px] border-black bg-cream px-4 font-display text-xs font-black uppercase text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Omitir
              </button>
            </div>

            {/* Zona tocable: ilustración + texto */}
            <div className="flex min-h-0 flex-1 cursor-pointer flex-col justify-center gap-4" onClick={onTap}>
              <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border-4 border-black bg-panel shadow-brutal">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${idx}-${mode}`}
                    className="absolute inset-0 grid place-items-center"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: -32 }}
                    transition={SPRING}
                  >
                    {/* En pantallas altas el marco crece: la ilustración acompaña para no quedar perdida */}
                    <div className="[@media(min-height:760px)]:scale-110">
                      <Art hot={hot} reduce={reduce} actions={actions} defense={defense} me={me} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="min-h-[5.5rem]">
                <h2 className="font-display text-3xl font-black uppercase leading-none text-cream">{slide.title}</h2>
                <p className="mt-2 text-sm font-semibold text-white/80">{slide.line(hot)}</p>
              </div>
            </div>

            <BrutalButton variant="lime" onClick={next} className="w-full">
              {idx === last ? '¡A jugar!' : 'Siguiente'}
            </BrutalButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Ilustraciones (una idea por slide) ---------- */

/** Posiciona sin pelearse con el transform de Framer: el wrapper ubica, el hijo anima. */
function At({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}>
      {children}
    </div>
  );
}

function PhoneAvatar({ name, color, size = 52 }: { name: string; color: string; size?: number }) {
  return (
    <div className="relative">
      <Avatar name={name} color={color} size={size} />
      <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-black bg-cream text-[11px] leading-none">
        📱
      </span>
    </div>
  );
}

function RoomArt({ hot, reduce, me }: SlideProps) {
  const people = hot
    ? [
        { name: me.name || 'Vos', color: me.color, x: -104, y: 0 },
        { name: 'Pareja', color: '#FF80AB', x: 104, y: 0 },
      ]
    : [
        { name: me.name || 'Vos', color: me.color, x: 0, y: -96 },
        { name: 'Ana', color: '#FF5722', x: 108, y: -34 },
        { name: 'Beto', color: '#00E5FF', x: 82, y: 76 },
        { name: 'Caro', color: '#AA00FF', x: -82, y: 76 },
        { name: 'Dani', color: '#C6FF00', x: -108, y: -34 },
      ];
  return (
    <div className="relative h-[260px] w-[300px]">
      <At x={0} y={0}>
        <motion.div
          initial={reduce ? false : { scale: 0.5, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: -2, opacity: 1 }}
          transition={POP}
          className="flex flex-col items-center gap-1 rounded-2xl border-4 border-black bg-social px-3 py-2 text-black shadow-brutal"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Código</span>
          <span className="font-mono text-2xl font-black tracking-[0.2em]">K7Q2P</span>
        </motion.div>
      </At>
      {people.map((p, i) => (
        <At key={p.name + i} x={p.x} y={p.y}>
          <motion.div
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...POP, delay: 0.5 + i * 0.3 }}
          >
            <PhoneAvatar name={p.name} color={p.color} />
          </motion.div>
        </At>
      ))}
    </div>
  );
}

function HandArt({ hot, reduce, actions, defense }: SlideProps) {
  const cards = [
    { id: actions[0], x: -72, y: 10, r: -14 },
    { id: actions[1], x: 0, y: -6, r: 0 },
    { id: defense, x: 72, y: 10, r: 14 },
  ];
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-[150px] w-[260px]">
        {cards.map((c, i) => (
          <At key={c.id} x={0} y={0}>
            <motion.div
              initial={reduce ? false : { x: 0, y: 30, rotate: 0 }}
              animate={{ x: c.x, y: c.y, rotate: c.r }}
              transition={{ ...SPRING, delay: 0.35 + i * 0.12 }}
              className="origin-bottom"
            >
              <GameCard cardId={c.id} size="md" />
            </motion.div>
          </At>
        ))}
      </div>
      <motion.div
        className="flex gap-2"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 1.1 }}
      >
        <Pill className="bg-cream px-3 py-1 text-[11px] text-black">
          <Zap size={12} strokeWidth={3} /> 2 {hot ? 'Diablitos' : 'Acción'}
        </Pill>
        <Pill className={`px-3 py-1 text-[11px] text-black ${hot ? 'bg-angel' : 'bg-defense'}`}>
          <Shield size={12} strokeWidth={3} /> 1 {hot ? 'Ángel' : 'Escudo'}
        </Pill>
      </motion.div>
    </div>
  );
}

function ThrowArt({ hot, reduce, actions, defense, me }: SlideProps) {
  const target = hot ? { name: 'Pareja', color: '#FF80AB' } : { name: 'Ana', color: '#FF5722' };
  return (
    <div className="relative h-[320px] w-[300px]">
      {/* Mesa: la víctima arriba (y otros jugadores atenuados en Clásico) */}
      {!hot && (
        <>
          <At x={-100} y={-96}>
            <div className="opacity-40">
              <Avatar name="Beto" color="#00E5FF" size={44} />
            </div>
          </At>
          <At x={100} y={-96}>
            <div className="opacity-40">
              <Avatar name="Caro" color="#AA00FF" size={44} />
            </div>
          </At>
        </>
      )}
      <At x={0} y={-100}>
        <motion.div
          initial={reduce ? false : { scale: 1 }}
          animate={reduce ? { scale: 1 } : { scale: [1, 1, 1.25, 1] }}
          transition={{ duration: 1.9, times: [0, 0.68, 0.8, 1] }}
        >
          <Avatar name={target.name} color={target.color} size={56} ring="rgb(var(--c-accent))" />
        </motion.div>
      </At>
      <At x={0} y={-46}>
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...POP, delay: reduce ? 0 : 1.6 }}
        >
          <Pill className="bg-lime text-black">¡Le toca!</Pill>
        </motion.div>
      </At>

      {/* El resto de tu mano queda abajo; la carta elegida vuela y aterriza al lado de la víctima */}
      <At x={-58} y={66}>
        <div className="-rotate-12 opacity-60">
          <GameCard cardId={actions[1]} size="mini" />
        </div>
      </At>
      <At x={58} y={66}>
        <div className="rotate-12 opacity-60">
          <GameCard cardId={defense} size="mini" />
        </div>
      </At>
      <At x={0} y={58}>
        <motion.div
          initial={reduce ? false : { x: 0, y: 0, rotate: -6, scale: 1 }}
          animate={{ x: 52, y: -168, rotate: 14, scale: 0.5 }}
          transition={{ ...SPRING, delay: 0.7 }}
        >
          <GameCard cardId={actions[0]} size="mini" />
        </motion.div>
      </At>
      {!reduce && (
        <At x={0} y={-12}>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0, 1, 0], y: [6, -6, -10] }}
            transition={{ duration: 0.9, times: [0, 0.4, 1] }}
            className="text-lime"
          >
            <ChevronUp size={28} strokeWidth={3} />
          </motion.div>
        </At>
      )}
      <At x={0} y={140}>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
          {me.name ? `Mano de ${me.name}` : 'Tu mano'}
        </span>
      </At>
    </div>
  );
}

/** Ruleta de 6 gajos con los colores del sistema (cambian solos en HOT). */
function Wheel({ reduce }: { reduce: boolean }) {
  const fills = ['fill-food', 'fill-social', 'fill-destiny', 'fill-special', 'fill-defense', 'fill-lime'];
  const R = 56;
  const pt = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(60 + R * Math.cos(a)).toFixed(2)} ${(60 + R * Math.sin(a)).toFixed(2)}`;
  };
  return (
    <div className="relative">
      <svg width="20" height="16" viewBox="0 0 20 16" className="absolute -top-2 left-1/2 z-10 -translate-x-1/2" aria-hidden>
        <path d="M2 2 H18 L10 14 Z" className="fill-cream" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <motion.svg
        width="112"
        height="112"
        viewBox="0 0 120 120"
        initial={reduce ? false : { rotate: 0 }}
        animate={{ rotate: reduce ? 0 : 1080 + 25 }}
        // Desaceleración de ruleta real: un spring acá rebotaría hacia atrás.
        transition={{ delay: 1.8, duration: 2.4, ease: [0.15, 0.85, 0.25, 1] }}
        aria-hidden
      >
        {fills.map((f, i) => (
          <path
            key={f}
            d={`M60 60 L${pt(i * 60 - 90)} A${R} ${R} 0 0 1 ${pt(i * 60 - 30)} Z`}
            className={f}
            stroke="#000"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        ))}
        <circle cx="60" cy="60" r={R} fill="none" stroke="#000" strokeWidth="4" />
        <circle cx="60" cy="60" r="10" className="fill-cream" stroke="#000" strokeWidth="3" />
      </motion.svg>
    </div>
  );
}

function DefendArt({ hot, reduce, actions, defense }: SlideProps) {
  return (
    <div className="flex w-[320px] max-w-full flex-col items-center gap-5 px-3">
      <div className="flex w-full items-end justify-around">
        {/* Escudo que rebota la carta */}
        <div className="relative h-[190px] w-[120px]">
          <At x={0} y={-30}>
            <motion.div
              initial={reduce ? false : { y: -80, rotate: -10, opacity: 0 }}
              animate={
                reduce
                  ? { y: -40, rotate: 18, opacity: 0.35 }
                  : { y: [-80, -10, -56], rotate: [-10, 0, 24], opacity: [0, 1, 0.35] }
              }
              transition={reduce ? undefined : { duration: 1.5, times: [0, 0.45, 1], ease: 'easeOut' }}
            >
              <GameCard cardId={actions[0]} size="mini" />
            </motion.div>
          </At>
          <At x={0} y={48}>
            <motion.div
              initial={reduce ? false : { y: 40, scale: 0.6, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ ...POP, delay: reduce ? 0 : 0.45 }}
            >
              <GameCard cardId={defense} size="mini" />
            </motion.div>
          </At>
        </div>
        <span className="mb-16 font-display text-lg font-black uppercase text-white/60">o</span>
        {/* Ruleta para el que se niega */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <motion.div
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...POP, delay: reduce ? 0 : 1.4 }}
          >
            <Wheel reduce={reduce} />
          </motion.div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { icon: <Shield size={12} strokeWidth={3} />, label: hot ? 'Ángel' : 'Escudo', cls: hot ? 'bg-angel text-black' : 'bg-defense text-black' },
          { icon: <CheckCircle2 size={12} strokeWidth={3} />, label: 'Cumplir', cls: 'bg-cream text-black' },
          { icon: <span className="text-[11px] leading-none">🎡</span>, label: 'Ruleta', cls: 'bg-special text-white' },
        ].map((o, i) => (
          <motion.div
            key={o.label}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: reduce ? 0 : 0.4 + i * 0.5 }}
          >
            <Pill className={`px-3 py-1 text-[11px] ${o.cls}`}>
              {o.icon} {o.label}
            </Pill>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BurnsArt({ reduce }: SlideProps) {
  const BURN = 3;
  const [used, setUsed] = useState(reduce ? BURN : 0);
  const [renewed, setRenewed] = useState(false);

  useEffect(() => {
    if (reduce) {
      setUsed(BURN);
      return;
    }
    const ts = [700, 1250, 1800].map((ms, i) => setTimeout(() => setUsed(i + 1), ms));
    ts.push(setTimeout(() => setRenewed(true), 3000));
    return () => ts.forEach(clearTimeout);
  }, [reduce]);

  const left = renewed ? WEEKLY_BURNS : WEEKLY_BURNS - used;

  return (
    <div className="flex w-[280px] flex-col items-center gap-5">
      <motion.span
        key={left}
        initial={reduce ? false : { scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={POP}
        className="font-display text-6xl font-black leading-none text-lime"
      >
        {left}/{WEEKLY_BURNS}
      </motion.span>
      <div className="grid w-full grid-cols-10 gap-1.5">
        {Array.from({ length: WEEKLY_BURNS }, (_, i) => {
          const on = i < left;
          return (
            <div key={i} className="relative">
              <span
                className={`block h-4 rounded-full border-[3px] border-black transition-colors duration-200 ${on ? 'bg-lime' : 'bg-black/60'}`}
              />
              <AnimatePresence>
                {!on && !renewed && (
                  <motion.span
                    className="absolute -top-6 left-1/2 -ml-[7px] text-food"
                    initial={reduce ? false : { opacity: 0, y: 6, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={POP}
                  >
                    <Flame size={14} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.7, rotate: -6 }}
        animate={renewed || reduce ? { opacity: 1, scale: 1, rotate: -2 } : { opacity: 0, scale: 0.7, rotate: -6 }}
        transition={POP}
      >
        <Pill className="bg-cream px-3 py-1 text-[11px] text-black">
          <CalendarClock size={12} strokeWidth={3} /> Lunes 00:00 · se renueva
        </Pill>
      </motion.div>
    </div>
  );
}

/** Dos lugares con 2 ❤️: A pierde de a uno (shake + corazón roto) y gana B. */
function DuelArt({ reduce }: SlideProps) {
  const [lost, setLost] = useState(reduce ? 2 : 0);
  useEffect(() => {
    if (reduce) {
      setLost(2);
      return;
    }
    const ts = [1100, 2400].map((ms, i) => setTimeout(() => setLost(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, [reduce]);
  const done = lost >= 2;

  return (
    <div className="relative flex w-[300px] flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <DuelPlace emoji="🍕" color="#FFD600" name="Lugar A" hearts={2 - lost} shake={done ? undefined : lost} dim={done} reduce={reduce} />
          <AnimatePresence>
            {!reduce && lost > 0 && (
              <motion.span
                key={lost}
                className="pointer-events-none absolute -top-4 left-1/2 -ml-4 text-3xl leading-none"
                initial={{ scale: 0.4, y: 0, opacity: 1 }}
                animate={{ scale: [0.4, 1.5, 1.1], y: [0, -12, 24], opacity: [1, 1, 0] }}
                transition={{ duration: 0.9, times: [0, 0.35, 1] }}
              >
                💔
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className="font-display text-xl font-black uppercase text-lime">vs</span>
        <DuelPlace emoji="🎳" color="#00E5FF" name="Lugar B" hearts={2} win={done} reduce={reduce} />
      </div>
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.7, rotate: -6 }}
        animate={done ? { opacity: 1, scale: 1, rotate: -2 } : { opacity: 0, scale: 0.7, rotate: -6 }}
        transition={POP}
      >
        <Pill className="bg-social px-3 py-1 text-[11px] text-black">🏆 Gana B · se revela el cupón</Pill>
      </motion.div>
    </div>
  );
}

function DuelPlace({
  emoji,
  color,
  name,
  hearts,
  shake,
  win,
  dim,
  reduce,
}: {
  emoji: string;
  color: string;
  name: string;
  hearts: number;
  /** Cambia con cada corazón perdido: dispara el sacudón. */
  shake?: number;
  win?: boolean;
  dim?: boolean;
  reduce: boolean;
}) {
  return (
    <motion.div
      key={shake}
      animate={
        reduce
          ? { scale: win ? 1.08 : 1 }
          : shake
            ? { x: [0, -8, 8, -6, 6, 0], scale: 1 }
            : { scale: win ? 1.08 : 1, rotate: win ? -3 : 0 }
      }
      transition={shake ? { duration: 0.45 } : POP}
      className={`flex w-[118px] flex-col items-center gap-2 rounded-3xl border-4 border-black p-3 text-black shadow-brutal ${
        win ? 'bg-lime' : 'bg-cream'
      } ${dim ? 'opacity-50' : ''}`}
    >
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-black text-3xl leading-none"
        style={{ backgroundColor: color }}
      >
        {emoji}
      </span>
      <span className="text-center text-[11px] font-black uppercase leading-tight">{name}</span>
      <span className="flex gap-0.5 text-base leading-none">
        {[0, 1, 2].map((i) => (
          <span key={i} className={i < hearts ? '' : 'opacity-30 grayscale'}>
            {i < hearts ? '❤️' : '🖤'}
          </span>
        ))}
      </span>
    </motion.div>
  );
}
