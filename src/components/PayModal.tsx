'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import { BrutalButton, Sheet } from '@/components/ui';
import { formatUSD } from '@/data/cards-catalog';

/** Checkout simulado (no cobra nada): resumen + "Pagar" + confirmación. */
export function PayModal({
  open,
  title,
  description,
  item,
  usd,
  confirmLabel = 'Pagar',
  onPay,
  onClose,
}: {
  open: boolean;
  title: string;
  description: React.ReactNode;
  item: string;
  usd: number;
  confirmLabel?: string;
  onPay: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'summary' | 'paying' | 'done'>('summary');
  useEffect(() => {
    if (open) setStep('summary');
  }, [open]);

  const pay = () => {
    setStep('paying');
    setTimeout(() => {
      onPay();
      setStep('done');
      setTimeout(onClose, 900);
    }, 700);
  };

  return (
    <Sheet open={open} onClose={step === 'paying' ? undefined : onClose} title={title}>
      {step === 'done' ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-4 text-center">
          <CheckCircle2 size={48} strokeWidth={2.5} className="mx-auto" />
          <p className="mt-2 font-display text-xl font-black uppercase">¡Listo!</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">{description}</p>
          <div className="rounded-3xl border-4 border-black bg-white p-4 shadow-brutal">
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-base font-black uppercase leading-tight">{item}</span>
              <span className="shrink-0 font-display text-xl font-black">{formatUSD(usd)}</span>
            </div>
            <p className="mt-3 rounded-2xl border-2 border-dashed border-black/40 px-3 py-2 text-center text-[11px] font-bold uppercase text-black/60">
              Pago simulado · no se cobra nada
            </p>
          </div>
          <div className="flex gap-3">
            <BrutalButton variant="cream" className="flex-1 text-sm" onClick={onClose} disabled={step === 'paying'}>
              Ahora no
            </BrutalButton>
            <BrutalButton
              variant="yellow"
              className="flex flex-1 items-center justify-center gap-2 text-sm"
              onClick={pay}
              disabled={step === 'paying'}
            >
              {step === 'paying' ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} strokeWidth={3} />}
              {confirmLabel}
            </BrutalButton>
          </div>
        </div>
      )}
    </Sheet>
  );
}
