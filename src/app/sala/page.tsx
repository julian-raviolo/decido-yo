'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Copy, Flame, Home, Hourglass, ScrollText, LogOut, Share2, Users, WifiOff } from 'lucide-react';
import { PRICES, SCENARIO_META, WEEKLY_BURNS, formatUSD, getCard, handSizeFor, rechargePrice } from '@/data/cards-catalog';
import { PayModal } from '@/components/PayModal';
import { EvidenceModal, EvidencePanel } from '@/components/room/Evidence';
import { isGagged, isImmune, useGame, useNow } from '@/context/GameContext';
import { CardFocus, HandDock, type Focus } from '@/components/room/HandDock';
import { IncomingModal } from '@/components/room/IncomingModal';
import { PlayersBar } from '@/components/room/PlayersBar';
import { RouletteModal } from '@/components/room/RouletteModal';
import { RpsModal } from '@/components/room/RpsModal';
import { BotSheet, RuleSheet, VictimPicker } from '@/components/room/Sheets';
import { ActiveBar } from '@/components/room/ActiveBar';
import { RestrictionsBar } from '@/components/room/RestrictionsBar';
import { LogFeed, TableZone } from '@/components/room/TableZone';
import { Pill, Sheet } from '@/components/ui';
import type { Player } from '@/types/game';

export default function SalaPage() {
  const game = useGame();
  const { hydrated, room, me, online } = game;
  const router = useRouter();
  const now = useNow(1000);

  const [focus, setFocus] = useState<Focus | null>(null);
  // Carta elegida para tirar (se conserva mientras se elige víctima / regla).
  const [armed, setArmed] = useState<Focus | null>(null);
  const [picker, setPicker] = useState<'action' | 'gag' | null>(null);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [botSheet, setBotSheet] = useState<Player | null>(null);
  const [copied, setCopied] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [pay, setPay] = useState<'reshuffle' | 'recharge' | null>(null);
  const [seenLog, setSeenLog] = useState(0);
  useEffect(() => {
    if (logOpen && room) setSeenLog(room.log.length);
  }, [logOpen, room]);

  useEffect(() => {
    if (hydrated && !room) router.replace('/');
  }, [hydrated, room, router]);

  const incoming = room?.incoming.find((i) => i.targetId === me?.id) ?? null;
  const incomingId = incoming?.id;
  const onExpire = useCallback(() => {
    if (incomingId) game.expireIncoming(incomingId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingId]);

  if (!hydrated || !room || !me) {
    return <div className="grid flex-1 place-items-center font-display font-black uppercase text-white/50">Cargando mesa…</div>;
  }

  const gagged = isGagged(me, now);
  const immune = isImmune(me, now);
  const others = room.players.filter((p) => !p.isMe);
  const isFriends = room.kind === 'friends';
  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? '¿?';
  const rps = room.rps && (room.rps.attackerId === me.id || room.rps.defenderId === me.id) ? room.rps : null;
  const roulette =
    room.roulettes.find((r) => r.playerId === me.id) ??
    room.roulettes.find((r) => room.players.find((p) => p.id === r.playerId)?.isBot) ??
    null;
  const waitingOn = [
    ...room.incoming.filter((i) => i.targetId !== me.id).map((i) => nameOf(i.targetId)),
    ...room.roulettes.filter((r) => r.playerId !== me.id && r !== roulette).map((r) => nameOf(r.playerId)),
  ];
  // A quién "le toca": quien tiene que defenderse/cumplir, jugar PPT o girar la ruleta.
  const acting = new Set<string>([
    ...room.incoming.map((i) => i.targetId),
    ...room.roulettes.map((r) => r.playerId),
    ...(room.rps ? [room.rps.attackerId, room.rps.defenderId] : []),
    ...room.table.filter((t) => t.status === 'pending' && t.toId).map((t) => t.toId!),
    ...room.table.filter((t) => t.status === 'evidence' && t.toId).map((t) => t.toId!),
  ]);
  const blockingOverlay = !!(rps || incoming || roulette);
  const n = room.players.length;
  const hand = handSizeFor(n);
  const budget = game.deck.weeklyBurnsRemaining;
  const noBudget = budget <= 0;
  const handCards = hand.actions + hand.defenses;
  const rechargeCost = rechargePrice(handCards);
  const myEvidence = room.table.find((t) => t.status === 'evidence' && t.toId === me.id && !t.evidence) ?? null;
  const armedCard = armed ? getCard(armed.cardId) : null;

  const handleThrow = () => {
    if (!focus) return;
    const f = focus;
    setFocus(null);
    setArmed(f);
    if (f.slot === 'action') {
      if (gagged) return;
      const card = getCard(f.cardId);
      if (card.targetMode === 'table') setRuleOpen(true);
      else if (card.targetMode === 'random') game.throwAction(f.uid, null);
      else setPicker('action');
    } else {
      setPicker('gag');
    }
  };

  const leave = () => {
    const msg = isFriends
      ? '¿Salir de la sala? Las cartas que no usaste vuelven a tu mazo semanal.'
      : '¿Terminar la prueba? Las cartas que no usaste vuelven a tu mazo semanal.';
    if (!confirm(msg)) return;
    game.leaveRoom();
    router.replace('/');
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?sala=${room.code}` : '';
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(isFriends ? shareUrl : room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  const share = async () => {
    const text = `¡Sumate a mi juntada de Decido Yo! Código ${room.code}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Decido Yo', text, url: shareUrl });
      else await copyCode();
    } catch {
      /* cancelado */
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 mx-auto flex h-dvh w-full max-w-[430px] flex-col gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => router.push('/')}
          aria-label="Inicio"
          className="grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-black bg-cream text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Home size={20} strokeWidth={3} />
        </button>
        <button
          onClick={copyCode}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] border-black bg-social px-3 py-2 text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <span className="text-[10px] font-black uppercase">Sala</span>
          <span className="font-mono text-xl font-black tracking-[0.25em]">{room.code}</span>
          <Copy size={16} strokeWidth={3} />
          {copied && <span className="text-[10px] font-black uppercase">¡Copiado!</span>}
        </button>
        <button
          onClick={() => setLogOpen(true)}
          aria-label="Historial"
          className="relative grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-black bg-cream text-black shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <ScrollText size={20} strokeWidth={3} />
          {room.log.length > seenLog && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-black bg-special px-1 text-[10px] font-black text-white">
              {Math.min(room.log.length - seenLog, 9)}
            </span>
          )}
        </button>
        <button
          onClick={leave}
          aria-label="Salir de la sala"
          className="grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-black bg-special text-white shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <LogOut size={20} strokeWidth={3} />
        </button>
      </header>

      {/* Jugadores */}
      <PlayersBar
        players={room.players}
        now={now}
        acting={acting}
        onSelect={(p) => {
          if (p.isBot && room.kind === 'bots' && !blockingOverlay) setBotSheet(p);
        }}
      />

      {room.kind === 'bots' && (
        <div className="flex shrink-0 items-center justify-between gap-2 rounded-2xl border-[3px] border-black bg-panel px-3 py-2">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-white/70">
            <Bot size={14} strokeWidth={3} /> Tocá un bot para que te ataque
          </span>
          <label className="flex items-center gap-2 text-[11px] font-black uppercase text-white">
            Autónomos
            <button
              role="switch"
              aria-checked={room.botAuto}
              onClick={() => game.setBotAuto(!room.botAuto)}
              className={`relative h-6 w-11 rounded-full border-[3px] border-black transition-colors ${
                room.botAuto ? 'bg-lime' : 'bg-[#444]'
              }`}
            >
              <span
                className={`absolute top-[1px] h-[16px] w-[16px] rounded-full border-2 border-black bg-white transition-all ${
                  room.botAuto ? 'left-[21px]' : 'left-[1px]'
                }`}
              />
            </button>
          </label>
        </div>
      )}

      <div className="flex shrink-0 flex-wrap gap-2">
          {isFriends && !online && (
            <Pill className="bg-black text-white">
              <WifiOff size={11} strokeWidth={3} /> Reconectando…
            </Pill>
          )}
          <Pill className="bg-lime text-black">
            <Users size={11} strokeWidth={3} /> Mesa de {n}: {hand.actions} Acción + {hand.defenses} Escudo
            {hand.defenses > 1 ? 's' : ''}
          </Pill>
          <Pill className="bg-panel text-white">
            {SCENARIO_META[room.scenario].emoji} {SCENARIO_META[room.scenario].label}
          </Pill>
          <Pill className={noBudget ? 'bg-special text-white' : 'bg-cream text-black'}>
            <Flame size={11} strokeWidth={3} /> Usos {budget}/{WEEKLY_BURNS}
          </Pill>
      </div>


      {/* Restricciones de cada persona, siempre visibles arriba de la mesa */}
      <RestrictionsBar room={room} now={now} />

      {/* Mesa (zona scrolleable) */}
      <div className="-mx-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 [scrollbar-width:none]">
        {isFriends && n === 1 && (
          <div className="shrink-0 rounded-3xl border-4 border-black bg-lime p-4 text-black shadow-brutal">
            <div className="flex items-center gap-2 font-display text-lg font-black uppercase">
              <Users size={20} strokeWidth={3} /> {room.mode === 'hot' ? 'Invitá a tu pareja' : 'Invitá a tus amigos'}
            </div>
            <p className="mt-1 text-sm font-semibold">
              Que abran la app (misma dirección que vos) y entren con el código:
            </p>
            <div className="my-3 text-center font-mono text-4xl font-black tracking-[0.3em]">{room.code}</div>
            {/^(localhost|127\.)/.test(typeof window !== 'undefined' ? window.location.hostname : '') && (
              <p className="mb-3 rounded-2xl border-[3px] border-black bg-cream px-3 py-2 text-[11px] font-bold">
                Estás en “localhost”: tus amigos no pueden entrar a esa dirección. Abrí la app con la IP de tu Mac
                (ej. http://192.168.0.23:3000) y compartí desde ahí.
              </p>
            )}
            <button
              onClick={share}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-black bg-cream py-2.5 font-display font-black uppercase shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Share2 size={18} strokeWidth={3} /> Compartir link
            </button>
          </div>
        )}
        {waitingOn.length > 0 && (
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border-[3px] border-black bg-panel px-3 py-2 text-[12px] font-bold text-white">
            <Hourglass size={14} strokeWidth={3} className="shrink-0 animate-pulse" />
            Esperando a {Array.from(new Set(waitingOn)).join(', ')}…
          </div>
        )}
        <EvidencePanel room={room} meId={me.id} now={now} onVote={game.voteEvidence} />
        <TableZone room={room} />
      </div>

      {/* Mano */}
      <div className="shrink-0">
        <HandDock
          me={me}
          gagged={gagged}
          noBudget={noBudget}
          onFocus={setFocus}
          reshufflesLeft={game.economy.weeklyReshufflesRemaining}
          onReshuffle={() => {
            if (!game.reshuffleHand()) setPay('reshuffle');
          }}
          rechargeLabel={formatUSD(rechargeCost)}
          onRecharge={() => setPay('recharge')}
        />
      </div>

      {/* Capas */}
      <CardFocus
        focus={focus}
        locked={(focus?.slot === 'action' && gagged) || noBudget}
        lockReason={
          noBudget
            ? `Gastaste tus ${WEEKLY_BURNS} usos de la semana. Vuelven el lunes.`
            : 'Te amordazaron: no podés usar tu Acción todavía.'
        }
        onClose={() => setFocus(null)}
        onThrow={handleThrow}
      />

      <VictimPicker
        open={picker !== null}
        title={picker === 'gag' ? '¿A quién amordazás?' : '¿A quién se la tirás?'}
        subtitle={
          picker === 'gag'
            ? 'Su carta de Acción queda inhabilitada 20 minutos.'
            : armedCard
              ? `«${armedCard.name}»: ${armedCard.description}`
              : undefined
        }
        tone={picker === 'gag' ? '#00E5FF' : '#FFD600'}
        players={others}
        now={now}
        onClose={() => setPicker(null)}
        onPick={(id) => {
          if (armed) {
            if (picker === 'gag') game.gagPlayer(armed.uid, id);
            else game.throwAction(armed.uid, id);
          }
          setPicker(null);
          setArmed(null);
        }}
      />

      <Sheet open={logOpen} onClose={() => setLogOpen(false)} title={<span className="text-white">Historial</span>} tone="#1e1e1e">
        <div className="flex flex-col gap-4 text-white">
          <ActiveBar room={room} now={now} />
          <LogFeed room={room} />
        </div>
      </Sheet>

      <RuleSheet
        open={ruleOpen}
        title={armedCard?.name}
        onClose={() => setRuleOpen(false)}
        onSubmit={(text) => {
          if (armed) game.throwAction(armed.uid, null, { ruleText: text });
          setRuleOpen(false);
          setArmed(null);
        }}
      />

      <BotSheet
        bot={botSheet ? room.players.find((p) => p.id === botSheet.id) ?? null : null}
        mode={room.mode}
        scenario={room.scenario}
        now={now}
        meImmune={immune}
        onClose={() => setBotSheet(null)}
        onAttack={(cardId) => botSheet && game.simulateBotAttack(botSheet.id, cardId)}
        onGag={() => botSheet && game.simulateBotGag(botSheet.id)}
      />

      <PayModal
        open={pay === 'reshuffle'}
        title="🔄 Re-barajado extra"
        description="Ya usaste tus 2 cambios de mano gratis de esta semana. Esperá al lunes o desbloqueá un re-barajado extra ahora."
        item="Re-barajar mano"
        usd={PRICES.reshuffle}
        onPay={() => game.reshuffleHand(true)}
        onClose={() => setPay(null)}
      />
      <PayModal
        open={pay === 'recharge'}
        title="⚡ Recargar mano"
        description={`Te reparte una mano nueva completa (${hand.actions} Acción + ${hand.defenses} Escudo${hand.defenses > 1 ? 's' : ''}) y te suma ${handCards} usos esta semana.`}
        item={`Mano de ${handCards} cartas`}
        usd={rechargeCost}
        onPay={() => game.rechargeHand()}
        onClose={() => setPay(null)}
      />

      {rps ? (
        <RpsModal rps={rps} players={room.players} onResolve={game.resolveRps} />
      ) : incoming ? (
        <IncomingModal
          incoming={incoming}
          players={room.players}
          me={me}
          now={now}
          noBudget={noBudget}
          onRespond={(choice, opts) => game.respondIncoming(incoming.id, choice, opts)}
          onExpire={onExpire}
        />
      ) : myEvidence ? (
        <EvidenceModal
          key={myEvidence.id}
          play={myEvidence}
          room={room}
          now={now}
          onSubmit={(ev) => game.submitEvidence(myEvidence.id, ev)}
        />
      ) : roulette ? (
        <RouletteModal
          request={roulette}
          players={room.players}
          mode={room.mode}
          onDone={(p) => game.finishRoulette(roulette.id, p)}
        />
      ) : null}
    </div>
  );
}
