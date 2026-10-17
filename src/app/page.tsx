'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Crown,
  Flame,
  Layers,
  Loader2,
  LogIn,
  Minus,
  Pencil,
  Plus,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { HowToPlay, tutorialSeen } from '@/components/HowToPlay';
import { NameSheet } from '@/components/NameSheet';
import { Avatar, BrutalButton, Sheet } from '@/components/ui';
import {
  MAX_PLAYERS,
  PRESENCIAL_SCENARIOS,
  SCENARIO_META,
  WEEKLY_BURNS,
  activeCardsFor,
  proCardsFor,
} from '@/data/cards-catalog';
import { useGame, useNow } from '@/context/GameContext';
import { nextReset } from '@/lib/deck';
import { formatDuration } from '@/lib/utils';
import type { GameMode } from '@/types/game';

type Kind = 'create' | 'join' | 'bots';

export default function HomePage() {
  const game = useGame();
  const { hydrated, profile, deck, room, mode, settings, notice } = game;
  const router = useRouter();
  const now = useNow(30_000);
  const [bots, setBots] = useState(3);
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState<Kind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hotAsk, setHotAsk] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  // Acción que el usuario quiso hacer sin nombre: se retoma apenas lo pone.
  const [pending, setPending] = useState<Kind | null>(null);
  const booted = useRef(false);
  // Primera visita: el tutorial entra recién cuando el popup del nombre terminó de bajar.
  const tutorialNext = useRef(false);

  // Links compartidos: /?sala=ABCDE
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('sala');
    if (code) setJoinCode(code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5));
  }, []);

  const hot = mode === 'hot';
  const left = hydrated ? deck.weeklyBurnsRemaining : WEEKLY_BURNS;
  const pro = proCardsFor(mode);
  const proUnlocked = hydrated ? pro.filter((c) => game.unlockedIds.includes(c.id)).length : 0;
  const maxBots = MAX_PLAYERS[mode] - 1;
  const botCount = Math.min(bots, maxBots);
  const nameOk = profile.name.trim().length >= 2;
  const duel = settings.saliduelo;

  // Primera visita (recién después de hidratar): primero el nombre, después el tutorial.
  useEffect(() => {
    if (!hydrated || booted.current) return;
    booted.current = true;
    if (!nameOk) setNameOpen(true);
    else if (!tutorialSeen()) setHowOpen(true);
  }, [hydrated, nameOk]);

  const pickMode = (m: GameMode) => {
    if (room) return;
    if (m === 'hot' && !settings.hotConfirmed) return setHotAsk(true);
    game.setMode(m);
  };

  const run = async (kind: Kind) => {
    if (room && !confirm('Ya estás en una sala. ¿Salir de esa y seguir? (las cartas no usadas vuelven a tu mazo)'))
      return;
    if (room) game.leaveRoom();
    setError(null);
    setBusy(kind);
    try {
      if (kind === 'join') await game.joinRoom(joinCode);
      else await game.createRoom({ kind: kind === 'bots' ? 'bots' : 'friends', bots: botCount });
      router.push('/sala');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal');
    } finally {
      setBusy(null);
    }
  };

  // Sin nombre no se juega: abrimos el popup y guardamos qué quería hacer.
  const play = (kind: Kind) => {
    if (!nameOk) {
      setPending(kind);
      setNameOpen(true);
      return;
    }
    run(kind);
  };

  // Se retoma la acción pendiente cuando el nombre ya quedó guardado en el perfil.
  useEffect(() => {
    if (!pending || !nameOk || nameOpen) return;
    setPending(null);
    run(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, nameOk, nameOpen]);

  const saveName = (name: string) => {
    game.setName(name);
    setNameOpen(false);
    // Primera visita sin acción pendiente: el tutorial entra cuando el popup ya bajó (onExited).
    tutorialNext.current = !pending && !tutorialSeen();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pb-6">
      {/* Hero: las cartas quedan a la altura del bloque DECIDO YO */}
      <header>
        {/* Fila superior: etiqueta + perfil (una vez puesto el nombre, sólo queda este ícono discreto) */}
        <div className={`flex h-11 items-center justify-between ${hot ? 'mb-1' : ''}`}>
          {!hot ? (
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-lime">Party card game</p>
          ) : (
            <span />
          )}
          {hydrated && nameOk && (
            <button
              onClick={() => setNameOpen(true)}
              aria-label={`Tu nombre: ${profile.name.trim()}. Tocá para cambiarlo`}
              title={profile.name.trim()}
              className="-mr-2 grid h-11 w-11 place-items-center transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <span className="relative">
                <Avatar name={profile.name} color={profile.color} size={28} />
                <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border-2 border-black bg-cream text-black">
                  <Pencil size={8} strokeWidth={4} />
                </span>
              </span>
            </button>
          )}
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute -right-1 top-1/2 flex -translate-y-[60%]" aria-hidden>
            <motion.div key={`a-${mode}`} initial={{ rotate: 0, y: 16 }} animate={{ rotate: 12, y: 0 }} transition={SPRING} className="origin-bottom">
              <GameCard cardId={hot ? 'hot-mirada-intimidante' : 'sommelier-del-caos'} size="mini" />
            </motion.div>
            <motion.div
              key={`b-${mode}`}
              initial={{ rotate: 0, y: 16 }}
              animate={{ rotate: -10, y: 8 }}
              transition={{ ...SPRING, delay: 0.06 }}
              className="-ml-9 origin-bottom"
            >
              <GameCard cardId={hot ? 'hot-tension-acumulada' : 'decido-yo-que-no'} size="mini" />
            </motion.div>
          </div>
          <h1 className="relative font-display text-[56px] font-black uppercase leading-[0.85] tracking-tighter text-cream min-[380px]:text-[61px]">
            <span className="relative inline-block">
              {hot && (
                <>
                  {/* Aureola sobre la "D" y el lema a la derecha, para que respire */}
                  <svg width="70" height="18" viewBox="0 0 100 26" className="absolute -top-4 left-0" aria-hidden>
                    <ellipse cx="50" cy="13" rx="44" ry="8" fill="none" stroke="#FFD166" strokeWidth="6" />
                  </svg>
                  <span className="absolute -top-5 right-0 font-sans text-[11px] font-black tracking-[0.25em] text-lime">
                    Ángel o diablo
                  </span>
                </>
              )}
              Decido
            </span>
            <br />
            <span className="relative inline-block -rotate-2 rounded-2xl border-4 border-black bg-social px-3 text-black shadow-brutal-cream">
              {hot && (
                <svg width="96" height="26" viewBox="0 0 100 30" className="absolute -top-5 left-1/2 -translate-x-1/2" aria-hidden>
                  <path d="M18 30 C14 18 18 8 28 2 C26 12 28 20 36 26 Z" fill="#1A0006" stroke="#000" strokeWidth="3" />
                  <path d="M82 30 C86 18 82 8 72 2 C74 12 72 20 64 26 Z" fill="#1A0006" stroke="#000" strokeWidth="3" />
                </svg>
              )}
              Yo
            </span>
          </h1>
        </div>
        <p className={`mt-3 max-w-[310px] text-sm font-semibold ${hot ? 'text-white/90' : 'text-white/80'}`}>
          {hot
            ? 'Tentaciones para jugar en pareja: el diablo propone, el ángel salva.'
            : 'Las cartas deciden la salida: qué se pide, a dónde van y quién paga el castigo.'}
        </p>
      </header>

      {notice && (
        <div className="flex items-center gap-2 rounded-2xl border-[3px] border-black bg-social py-1 pl-3 pr-1 text-sm font-bold text-black">
          <span className="flex-1">{notice}</span>
          <button onClick={game.clearNotice} aria-label="Cerrar aviso" className="grid h-[44px] w-[44px] shrink-0 place-items-center">
            <X size={18} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Configuración de la sala: 4 filas segmentadas */}
      <section className="flex flex-col gap-2 rounded-3xl border-4 border-black bg-panel/90 p-3 shadow-brutal-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-white/70">Configurá la sala</h2>
          {room && <span className="text-[10px] font-black uppercase tracking-widest text-white/60">🔒 En juego</span>}
        </div>
        <ConfigRow label="Modo" aria="Modo de juego" cols="grid-cols-2">
          <SegButton active={!hot} disabled={!!room} onClick={() => pickMode('classic')}>
            <Sparkles size={15} strokeWidth={3} /> Clásico
          </SegButton>
          <SegButton active={hot} disabled={!!room} onClick={() => pickMode('hot')} activeClass="bg-halo text-black">
            <Flame size={15} strokeWidth={3} /> HOT
          </SegButton>
        </ConfigRow>
        <ConfigRow label="Modalidad" aria="Modalidad" cols="grid-cols-2">
          {(
            [
              ['PRESENCIAL', '👥', 'Presencial'],
              ['ONLINE', '📱', 'Online'],
            ] as const
          ).map(([env, emoji, label]) => (
            <SegButton
              key={env}
              active={settings.environment === env}
              disabled={!!room}
              onClick={() => game.setEnvironment(env)}
            >
              <span className="text-sm leading-none">{emoji}</span> {label}
            </SegButton>
          ))}
        </ConfigRow>
        {settings.environment === 'ONLINE' ? (
          <ConfigRow label="Escenario" cols="grid-cols-1">
            <div className="flex h-[44px] items-center justify-center gap-1.5 rounded-2xl border-[3px] border-black bg-cream text-[11px] min-[380px]:text-[12px] font-black uppercase text-black">
              <span className="text-sm leading-none">{SCENARIO_META.REMOTE.emoji}</span> A distancia
            </div>
          </ConfigRow>
        ) : (
          <ConfigRow label="Escenario" aria="Escenario" cols="grid-cols-4">
            {PRESENCIAL_SCENARIOS.map((sc) => (
              <SegButton
                key={sc}
                active={settings.scenario === sc}
                disabled={!!room}
                onClick={() => game.setScenario(sc)}
                title={SCENARIO_META[sc].label}
                aria-label={SCENARIO_META[sc].label}
                stacked
              >
                <span className="text-base leading-none">{SCENARIO_META[sc].emoji}</span>
                <span className="text-[10px] leading-none">{SCENARIO_META[sc].short}</span>
              </SegButton>
            ))}
          </ConfigRow>
        )}
        <ConfigRow label="Variante" aria="Variante de sala" cols="grid-cols-2">
          <SegButton active={!duel} disabled={!!room} onClick={() => game.setSaliduelo(false)}>
            <span className="text-sm leading-none">🃏</span> Normal
          </SegButton>
          <SegButton
            active={duel}
            disabled={!!room}
            onClick={() => game.setSaliduelo(true)}
            activeClass="bg-lime text-black"
            title="Batalla de lugares: 3 ❤️ por bando y cupón para el ganador"
          >
            <span className="text-sm leading-none">⚔️</span> Saliduelo
          </SegButton>
        </ConfigRow>
      </section>

      {room && (
        <BrutalButton variant="yellow" onClick={() => router.push('/sala')}>
          Volver a la sala {room.code}
        </BrutalButton>
      )}

      {/* Jugar con amigos: el protagonista */}
      <section className="flex flex-col gap-3 rounded-3xl border-4 border-black bg-lime p-4 text-black shadow-brutal">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-black uppercase leading-none">
            <Users size={22} strokeWidth={3} /> {hot ? 'Jugar en pareja' : 'Jugar con amigos'}
          </div>
          <p className="mt-1.5 text-xs font-semibold [text-wrap:pretty]">
            {duel
              ? hot
                ? 'Cada uno defiende su lugar con 3 ❤️: el que queda en pie elige la salida.'
                : 'Cada bando defiende un lugar con 3 ❤️: el que queda en pie elige la salida.'
              : hot
                ? 'Sala para 2: creala y pasale el código a tu pareja.'
                : 'Hasta 12, cada uno desde su celu y con su propio mazo.'}
          </p>
        </div>
        <BrutalButton
          variant="cream"
          disabled={!hydrated || !!busy}
          onClick={() => play('create')}
          className="flex items-center justify-center gap-2"
        >
          {busy === 'create' ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} strokeWidth={3} />}
          {duel ? '⚔️ Crear Saliduelo' : 'Crear sala'} {hot && 'HOT'}
        </BrutalButton>
        <div className="flex gap-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
            placeholder="CÓDIGO"
            aria-label="Código de sala"
            className="w-0 flex-1 rounded-3xl border-4 border-black bg-cream px-3 py-3 text-center font-mono font-black tracking-[0.3em] text-black shadow-brutal outline-none placeholder:text-black/30"
          />
          <BrutalButton
            variant="dark"
            disabled={!hydrated || joinCode.length < 5 || !!busy}
            onClick={() => play('join')}
            className="flex items-center gap-2 px-4"
          >
            {busy === 'join' ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} strokeWidth={3} />}
            Unirme
          </BrutalButton>
        </div>
        {error && <p className="text-center text-xs font-black uppercase text-special">{error}</p>}
      </section>

      {/* Mazo semanal: compacto, debajo del protagonista */}
      <Link
        href="/mazo"
        className="block rounded-3xl border-4 border-black bg-panel/90 p-3 shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <div className="flex items-center gap-2">
          <Layers size={18} strokeWidth={3} className="shrink-0" />
          <span className="font-display text-sm font-black uppercase">Mazo {hot ? 'HOT' : 'semanal'}</span>
          <span className="ml-auto flex items-center gap-1 rounded-full border-2 border-black bg-cream px-1.5 text-[10px] font-black text-black">
            <Zap size={10} strokeWidth={3} /> {activeCardsFor(mode).length}
          </span>
          <span className="flex items-center gap-1 rounded-full border-2 border-black bg-halo px-1.5 text-[10px] font-black text-black">
            <Crown size={10} strokeWidth={3} /> {proUnlocked}/{pro.length}
          </span>
          <ChevronRight size={16} strokeWidth={3} className="text-white/60" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Flame size={14} strokeWidth={3} className="shrink-0" style={{ color: hot ? '#FF4D6D' : '#FFD600' }} />
          <div className="grid flex-1 grid-cols-10 gap-1">
            {Array.from({ length: WEEKLY_BURNS }, (_, i) => (
              <span
                key={i}
                className="h-2.5 rounded-full border-2 border-black"
                style={{ backgroundColor: i < left ? (hot ? '#FF4D6D' : '#FFD600') : 'rgba(0,0,0,0.5)' }}
              />
            ))}
          </div>
          <span className="font-display text-base font-black text-lime">
            {left}/{WEEKLY_BURNS}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold uppercase text-white/60">
          <CalendarClock size={11} /> Se renueva en {hydrated ? formatDuration(nextReset(new Date(now)).getTime() - now) : '…'}
        </div>
      </Link>

      {/* Probar con bots (secundario) */}
      <section className="flex flex-col gap-3 rounded-3xl border-4 border-black bg-panel p-3 shadow-brutal-sm">
        <div className="flex items-center gap-2">
          <Bot size={18} strokeWidth={3} className="shrink-0 text-white/80" />
          <span className="font-display text-sm font-black uppercase">Probar con bots</span>
          <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-white/60">Solo en este celu</span>
        </div>
        <div className="flex items-center gap-2">
          <StepButton onClick={() => setBots((b) => Math.max(1, b - 1))} aria-label="Menos bots">
            <Minus size={16} strokeWidth={3} />
          </StepButton>
          <span className="w-8 text-center font-display text-xl font-black" aria-live="polite">
            {botCount}
          </span>
          <StepButton onClick={() => setBots((b) => Math.min(maxBots, b + 1))} aria-label="Más bots">
            <Plus size={16} strokeWidth={3} />
          </StepButton>
          <button
            disabled={!hydrated || !!busy}
            onClick={() => play('bots')}
            className="ml-1 flex h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] border-black bg-cream px-3 font-display text-xs font-black uppercase text-black shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40"
          >
            {busy === 'bots' && <Loader2 size={16} className="animate-spin" />}
            Probar
          </button>
        </div>
      </section>

      {/* Tutorial y reglas: abajo de todo, discretos */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setHowOpen(true)}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl border-[3px] border-black bg-panel px-3 text-[11px] font-black uppercase text-cream shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <span className="text-sm leading-none">📖</span> ¿Cómo se juega?
          </button>
          <button
            onClick={() => setRulesOpen((o) => !o)}
            aria-expanded={rulesOpen}
            aria-controls="reglas-rapidas"
            className="flex h-11 items-center gap-1 rounded-2xl border-[3px] border-black bg-panel px-3 text-[11px] font-black uppercase text-cream shadow-brutal-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Reglas rápidas
            <ChevronDown size={16} strokeWidth={3} className={`transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <AnimatePresence initial={false}>
          {rulesOpen && (
            <motion.ul
              id="reglas-rapidas"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={SPRING}
              className="flex list-disc flex-col gap-1 rounded-3xl border-4 border-black bg-panel p-3 pl-7 text-sm font-semibold text-white/85 shadow-brutal-sm"
            >
              <li>
                Te toca una mano al azar: <b>2 Acción + 1 Escudo</b>
                {hot ? '.' : <> (mesa de 7 a 12: <b>3 + 2</b>).</>}
              </li>
              <li>
                Deslizá una carta para arriba y tirala. Cada carta quemada gasta <b>1 de tus 10 usos</b> de la
                semana y vuelve el lunes.
              </li>
              <li>
                Te atacan: <b>60 s</b> para defenderte o cumplir. ¿No cumplís? <b>Ruleta</b> de castigo.
              </li>
              <li>
                <b>⚔️ Saliduelo</b>: cada bando defiende un lugar con <b>3 ❤️</b>. El que no cumple le saca un
                corazón a su lugar; el que queda en pie gana y revela su cupón.
              </li>
              {hot && (
                <li>
                  Modo HOT: todo es soft y <b>con consentimiento</b>. Un “no” siempre se respeta.
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <NameSheet
        open={nameOpen}
        firstTime={hydrated && !nameOk}
        initial={profile.name}
        color={profile.color}
        hot={hot}
        onSave={saveName}
        onClose={() => {
          setNameOpen(false);
          setPending(null);
        }}
        onExited={() => {
          if (!tutorialNext.current) return;
          tutorialNext.current = false;
          setHowOpen(true);
        }}
      />

      <HowToPlay
        open={howOpen}
        onClose={() => setHowOpen(false)}
        mode={mode}
        me={{ name: nameOk ? profile.name.trim() : '', color: profile.color }}
      />

      <Sheet open={hotAsk} onClose={() => setHotAsk(false)} title="Modo HOT 😇😈" tone="#9E0014">
        <div className="flex flex-col gap-3 text-sm font-semibold text-cream">
          <p>
            50 cartas picantes (30 activas + 20 PRO) <b>exclusivas para parejas</b>: todo pasa entre ustedes dos,
            sin exponer a nadie frente a terceros. Las salas HOT son de 2 jugadores.
          </p>
          <p>
            Regla de oro: <b>todo con consentimiento</b>. Un “no” siempre se respeta y los escudos están para usarlos.
          </p>
          <BrutalButton
            variant="lime"
            onClick={() => {
              game.confirmHot();
              setHotAsk(false);
            }}
          >
            Soy +18, activar HOT
          </BrutalButton>
        </div>
      </Sheet>
    </div>
  );
}

const SPRING = { type: 'spring', damping: 18, stiffness: 260 } as const;

function ConfigRow({
  label,
  aria,
  cols,
  children,
}: {
  label: string;
  aria?: string;
  cols: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[4.75rem] shrink-0 text-[10px] font-black uppercase tracking-widest text-white/60">{label}</span>
      <div className={`grid flex-1 gap-1.5 ${cols}`} role={aria ? 'radiogroup' : undefined} aria-label={aria}>
        {children}
      </div>
    </div>
  );
}

/** Opción de un control segmentado: 44px de alto, se hunde al tocarla. */
function SegButton({
  active,
  activeClass = 'bg-cream text-black',
  stacked,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean; activeClass?: string; stacked?: boolean }) {
  return (
    <button
      role="radio"
      aria-checked={active}
      {...rest}
      className={`flex h-[44px] items-center justify-center rounded-2xl border-[3px] border-black font-black uppercase transition-[transform,box-shadow,background-color] duration-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60 ${
        stacked ? 'flex-col gap-0.5' : 'gap-1.5 text-[11px] min-[380px]:text-[12px]'
      } ${active ? `${activeClass} shadow-brutal-sm` : 'bg-black/30 text-white/70'}`}
    >
      {children}
    </button>
  );
}

function StepButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full border-[3px] border-black bg-cream text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    />
  );
}
