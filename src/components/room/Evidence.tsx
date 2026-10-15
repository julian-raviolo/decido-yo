'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Send, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { GameCard } from '@/components/GameCard';
import { BrutalButton } from '@/components/ui';
import { getCard } from '@/data/cards-catalog';
import { formatCountdown } from '@/lib/utils';
import type { Evidence, Room, TablePlay } from '@/types/game';

/** Comprime una foto a ~480px JPEG para que viaje liviana por la sala. */
async function compressImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const max = 480;
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * k);
    canvas.height = Math.round(img.height * k);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.6);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Modal de la víctima: subir foto (Clásico) o escribir la respuesta (Clásico y HOT). */
export function EvidenceModal({
  play,
  room,
  now,
  onSubmit,
}: {
  play: TablePlay;
  room: Room;
  now: number;
  onSubmit: (ev: Omit<Evidence, 'at'>) => void;
}) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const hot = room.mode === 'hot';
  const left = (play.evidenceUntil ?? now) - now;
  const card = getCard(play.cardId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex max-h-[96dvh] w-full max-w-[400px] flex-col gap-3 overflow-y-auto rounded-[2rem] border-4 border-black bg-cream p-4 text-black shadow-brutal-cream"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-black uppercase leading-tight">📸 Mostrá la prueba</span>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-sm font-black ${
              left < 30_000 ? 'animate-pulse bg-special text-white' : 'bg-black text-lime'
            }`}
          >
            {formatCountdown(left)}
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-[3px] border-black bg-white p-2">
          <GameCard cardId={card.id} size="mini" />
          <p className="text-[12px] font-semibold leading-snug">{card.description}</p>
        </div>

        {!hot && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setBusy(true);
                try {
                  setImage(await compressImage(f));
                } finally {
                  setBusy(false);
                }
              }}
            />
            {image ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Tu prueba" className="max-h-56 w-full rounded-2xl border-[3px] border-black object-cover" />
                <button
                  onClick={() => setImage(null)}
                  aria-label="Quitar foto"
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border-2 border-black bg-white"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <BrutalButton
                variant="yellow"
                className="flex items-center justify-center gap-2 text-sm"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
              >
                <Camera size={18} strokeWidth={3} /> {busy ? 'Procesando…' : 'Sacar / subir foto'}
              </BrutalButton>
            )}
          </>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 280))}
          rows={3}
          placeholder={hot ? 'Contale a tu pareja cómo lo cumpliste…' : 'O escribí tu respuesta / cómo lo cumpliste…'}
          className="w-full resize-none rounded-2xl border-[3px] border-black bg-white p-3 font-semibold outline-none"
        />
        {hot && (
          <p className="text-[11px] font-bold text-black/60">
            Por privacidad, en HOT las fotos no pasan por la app: si querés mandá una por WhatsApp (ver una vez).
          </p>
        )}
        <BrutalButton
          variant="lime"
          className="flex items-center justify-center gap-2"
          disabled={!image && text.trim().length < 2}
          onClick={() => onSubmit({ text: text.trim() || undefined, image: image ?? undefined })}
        >
          <Send size={18} strokeWidth={3} /> Enviar prueba
        </BrutalButton>
      </motion.div>
    </div>
  );
}

/** En la mesa: la prueba de la víctima y la votación de los demás. */
export function EvidencePanel({
  room,
  meId,
  now,
  onVote,
}: {
  room: Room;
  meId: string;
  now: number;
  onVote: (playId: string, vote: 'yes' | 'no') => void;
}) {
  const plays = room.table.filter((p) => p.status === 'evidence');
  if (!plays.length) return null;
  const name = (id: string | null) => room.players.find((p) => p.id === id)?.name ?? '¿?';

  return (
    <div className="flex shrink-0 flex-col gap-2">
      {plays.map((play) => {
        const card = getCard(play.cardId);
        const mine = play.toId === meId;
        const votes = Object.values(play.votes ?? {});
        const yes = votes.filter((v) => v === 'yes').length;
        const no = votes.length - yes;
        const myVote = play.votes?.[meId];
        return (
          <motion.div
            key={play.id}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-3xl border-4 border-black bg-social p-3 text-black shadow-brutal"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase leading-tight">
                {mine ? 'Tu prueba' : `Prueba de ${name(play.toId)}`} · {card.name}
              </span>
              {!play.evidence && (
                <span className="rounded-full bg-black px-2 py-0.5 font-mono text-[11px] font-black text-lime">
                  {formatCountdown((play.evidenceUntil ?? now) - now)}
                </span>
              )}
            </div>

            {!play.evidence ? (
              <p className="mt-1 text-sm font-semibold">
                {mine ? 'Subí tu prueba para que la sala vote.' : `Esperando que ${name(play.toId)} muestre la prueba…`}
              </p>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                {play.evidence.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={play.evidence.image}
                    alt={`Prueba de ${name(play.toId)}`}
                    className="max-h-48 w-full rounded-2xl border-[3px] border-black object-cover"
                  />
                )}
                {play.evidence.text && (
                  <p className="rounded-2xl border-[3px] border-black bg-cream px-3 py-2 text-sm font-semibold">
                    “{play.evidence.text}”
                  </p>
                )}
                {mine ? (
                  <p className="text-[12px] font-bold">
                    La sala está votando… 👍 {yes} · 👎 {no}
                  </p>
                ) : myVote ? (
                  <p className="text-[12px] font-bold">
                    Votaste {myVote === 'yes' ? '👍 ¡Cumplió!' : '👎 Mentira'} · 👍 {yes} · 👎 {no}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <BrutalButton
                      variant="lime"
                      className="flex items-center justify-center gap-1 px-2 py-2 text-xs"
                      onClick={() => onVote(play.id, 'yes')}
                    >
                      <ThumbsUp size={16} strokeWidth={3} /> ¡Cumplió!
                    </BrutalButton>
                    <BrutalButton
                      variant="red"
                      className="flex items-center justify-center gap-1 px-2 py-2 text-xs"
                      onClick={() => onVote(play.id, 'no')}
                    >
                      <ThumbsDown size={16} strokeWidth={3} /> Mentira / Flojo
                    </BrutalButton>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
