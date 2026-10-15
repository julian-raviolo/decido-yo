'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bot,
  CalendarClock,
  Crown,
  Flame,
  Layers,
  Loader2,
  LogIn,
  Minus,
  Plus,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { BrutalButton, Sheet } from '@/components/ui';
import { MAX_PLAYERS, WEEKLY_BURNS, activeCardsFor, proCardsFor } from '@/data/cards-catalog';
import { useGame, useNow } from '@/context/GameContext';
import { nextReset } from '@/lib/deck';
import { formatDuration } from '@/lib/utils';
import type { GameMode } from '@/types/game';

export default function HomePage() {
  const game = useGame();
  const { hydrated, profile, deck, room, mode, settings, notice } = game;
  const router = useRouter();
  const now = useNow(30_000);
  const [bots, setBots] = useState(3);
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | 'bots' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hotAsk, setHotAsk] = useState(false);

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

  const pickMode = (m: GameMode) => {
    if (room) return;
    if (m === 'hot' && !settings.hotConfirmed) return setHotAsk(true);
    game.setMode(m);
  };

  const run = async (kind: 'create' | 'join' | 'bots') => {
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

  return (
    <div className="flex flex-1 flex-col gap-5 pb-6">
      {/* Hero */}
      <header className="relative pt-9">
        <div className="pointer-events-none absolute -right-2 top-3 flex">
          <motion.div key={`a-${mode}`} initial={{ rotate: 0, y: 20 }} animate={{ rotate: 14, y: 0 }} className="origin-bottom">
            <GameCard cardId={hot ? 'hot-mirada-intimidante' : 'sommelier-del-caos'} size="md" />
          </motion.div>
          <motion.div
            key={`b-${mode}`}
            initial={{ rotate: 0, y: 20 }}
            animate={{ rotate: -10, y: 8 }}
            className="-ml-11 origin-bottom"
          >
            <GameCard cardId={hot ? 'hot-tension-acumulada' : 'decido-yo-que-no'} size="md" />
          </motion.div>
        </div>
        {!hot && (
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-lime">Party card game</p>
        )}
        <h1
          className={`relative font-display text-[61px] font-black uppercase leading-[0.85] tracking-tighter text-cream ${
            hot ? 'mt-4' : 'mt-1'
          }`}
        >
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
        <p className="mt-4 max-w-[300px] text-sm font-semibold text-white/80">
          {hot
            ? 'Tentaciones para jugar en pareja: el diablo propone, el ángel salva.'
            : 'Las cartas deciden la salida: qué se pide, a dónde van y quién paga el castigo.'}
        </p>
      </header>

      {notice && (
        <div className="flex items-center gap-2 rounded-2xl border-[3px] border-black bg-social px-3 py-2 text-sm font-bold text-black">
          <span className="flex-1">{notice}</span>
          <button onClick={game.clearNotice} aria-label="Cerrar aviso">
            <X size={18} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Nombre */}
      <label className="flex flex-col gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-white/70">Tu nombre en la mesa</span>
        <input
          value={profile.name}
          disabled={!hydrated}
          onChange={(e) => game.setName(e.target.value.slice(0, 16))}
          placeholder="Ej: Juli"
          className="rounded-3xl border-4 border-black bg-cream px-4 py-3 font-display font-black uppercase text-black shadow-brutal outline-none placeholder:text-black/30"
        />
      </label>

      {/* Modo */}
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Modo de juego">
        <ModeButton active={!hot} disabled={!!room} onClick={() => pickMode('classic')}>
          <Sparkles size={18} strokeWidth={3} /> Clásico
        </ModeButton>
        <ModeButton active={hot} disabled={!!room} onClick={() => pickMode('hot')} hot>
          <Flame size={18} strokeWidth={3} /> HOT
        </ModeButton>
      </div>

      {/* Mazo semanal */}
      <Link
        href="/mazo"
        className="block rounded-3xl border-4 border-black bg-panel p-4 shadow-brutal-cream transition-transform active:translate-x-1 active:translate-y-1"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-lg font-black uppercase">
            <Layers size={20} strokeWidth={3} /> Mazo {hot ? 'HOT' : 'semanal'}
          </span>
          <span className="font-display text-2xl font-black text-lime">
            {left}/{WEEKLY_BURNS}
          </span>
        </div>
        <div className="mt-3">
          <PoolBar
            icon={<Flame size={14} strokeWidth={3} />}
            label="Usos esta semana"
            value={left}
            max={WEEKLY_BURNS}
            color={hot ? '#FF4D6D' : '#FFD600'}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black uppercase">
          <span className="flex items-center gap-1 rounded-full border-2 border-black bg-cream px-2 py-0.5 text-black">
            <Zap size={11} strokeWidth={3} /> {activeCardsFor(mode).length} activas
          </span>
          <span className="flex items-center gap-1 rounded-full border-2 border-black bg-halo px-2 py-0.5 text-black">
            <Crown size={11} strokeWidth={3} /> PRO {proUnlocked}/{pro.length}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold uppercase text-white/70">
          <CalendarClock size={13} /> Vuelve a {WEEKLY_BURNS}/{WEEKLY_BURNS} el lunes · faltan{' '}
          {hydrated ? formatDuration(nextReset(new Date(now)).getTime() - now) : '…'}
        </div>
      </Link>

      {room && (
        <BrutalButton variant="yellow" onClick={() => router.push('/sala')}>
          Volver a la sala {room.code}
        </BrutalButton>
      )}

      {/* Jugar con amigos */}
      <section className="flex flex-col gap-3 rounded-3xl border-4 border-black bg-lime p-4 text-black shadow-brutal">
        <div className="flex items-center gap-2 font-display text-xl font-black uppercase">
          <Users size={22} strokeWidth={3} /> {hot ? 'Jugar en pareja' : 'Jugar con amigos'}
        </div>
        <p className="-mt-1 text-xs font-semibold">
          {hot
            ? 'Sala privada para 2: creala y pasale el código a tu pareja.'
            : 'Creá la sala (hasta 12) y compartí el código. Cada uno juega desde su celular con su propio mazo.'}
        </p>
        <BrutalButton
          variant="cream"
          disabled={!hydrated || !nameOk || !!busy}
          onClick={() => run('create')}
          className="flex items-center justify-center gap-2"
        >
          {busy === 'create' ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} strokeWidth={3} />}
          Crear sala {hot && 'HOT'}
        </BrutalButton>
        <div className="flex gap-3">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
            placeholder="CÓDIGO"
            className="w-0 flex-1 rounded-3xl border-4 border-black bg-cream px-3 py-3 text-center font-mono font-black tracking-[0.3em] text-black shadow-brutal outline-none placeholder:text-black/30"
          />
          <BrutalButton
            variant="dark"
            disabled={!hydrated || !nameOk || joinCode.length < 5 || !!busy}
            onClick={() => run('join')}
            className="flex items-center gap-2 px-4"
          >
            {busy === 'join' ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} strokeWidth={3} />}
            Unirme
          </BrutalButton>
        </div>
        {error && <p className="text-center text-xs font-black uppercase text-special">{error}</p>}
      </section>

      {!nameOk && hydrated && (
        <p className="-mt-2 text-center text-xs font-bold uppercase text-social">Poné tu nombre para jugar</p>
      )}

      {/* Probar con bots (más chico) */}
      <section className="flex items-center gap-3 rounded-3xl border-[3px] border-black bg-panel p-3">
        <Bot size={22} strokeWidth={3} className="shrink-0 text-white/80" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-sm font-black uppercase">Probar con bots</div>
          <div className="text-[11px] font-semibold text-white/60">Solo en este celular · para testear</div>
        </div>
        <div className="flex items-center gap-1.5">
          <StepButton onClick={() => setBots((b) => Math.max(1, b - 1))} aria-label="Menos bots">
            <Minus size={14} strokeWidth={3} />
          </StepButton>
          <span className="w-6 text-center font-display text-lg font-black">{botCount}</span>
          <StepButton onClick={() => setBots((b) => Math.min(maxBots, b + 1))} aria-label="Más bots">
            <Plus size={14} strokeWidth={3} />
          </StepButton>
        </div>
        <button
          disabled={!hydrated || !nameOk || !!busy}
          onClick={() => run('bots')}
          className="rounded-2xl border-[3px] border-black bg-cream px-3 py-2 font-display text-xs font-black uppercase text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40"
        >
          Probar
        </button>
      </section>

      <section className="rounded-3xl border-4 border-black bg-panel p-4 text-sm font-semibold text-white/85">
        <h2 className="mb-2 font-display font-black uppercase text-cream">Reglas rápidas</h2>
        <ul className="flex list-disc flex-col gap-1 pl-4">
          <li>
            Tenés <b>10 usos por semana</b> por modo. Cada carta quemada no vuelve hasta el lunes.
          </li>
          <li>
            Mesa de <b>2 a 6</b>: te tocan <b>2 Acción + 1 Escudo</b>.
          </li>
          {!hot && (
            <li>
              Mesa de <b>7 a 12</b>: <b>3 Acción + 2 Escudos</b>.
            </li>
          )}
          <li>
            {activeCardsFor(mode).length} cartas activas + {pro.length} <b>PRO</b>: destrabalas con el pack o cumpliendo un
            reto.
          </li>
          <li>
            Te atacan: <b>60 s</b> para defenderte. ¿No cumplís? <b>Ruleta</b>, sí o sí.
          </li>
          {hot && (
            <li>
              Modo HOT: todo es soft y <b>con consentimiento</b>. Un “no” siempre se respeta.
            </li>
          )}
        </ul>
      </section>

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

function ModeButton({
  active,
  hot,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean; hot?: boolean }) {
  return (
    <button
      role="radio"
      aria-checked={active}
      {...rest}
      className={`flex items-center justify-center gap-2 rounded-3xl border-4 border-black py-3 font-display font-black uppercase transition-[transform,box-shadow] disabled:opacity-60 ${
        active
          ? hot
            ? 'bg-devil text-halo shadow-brutal-accent'
            : 'bg-cream text-black shadow-brutal-accent'
          : 'bg-panel text-white/70 shadow-brutal'
      }`}
    >
      {children}
    </button>
  );
}

function PoolBar({
  icon,
  label,
  value,
  max,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] font-black uppercase">
        <span className="flex items-center gap-1">
          {icon} {label}
        </span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full border-[3px] border-black bg-black">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

function StepButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="grid h-8 w-8 place-items-center rounded-full border-[3px] border-black bg-cream text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    />
  );
}
