import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, PartyPopper } from 'lucide-react';

interface CongratsViewProps {
  participantName: string;
  onTimeoutComplete: () => void;
  durationMs?: number;
}

export const CongratsView: React.FC<CongratsViewProps> = ({
  participantName,
  onTimeoutComplete,
  durationMs = 1200
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Launch celebratory confetti bursts
    const count = 200;
    const defaults = {
      origin: { y: 0.6 }
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55
    });
    fire(0.2, {
      spread: 60
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45
    });

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onTimeoutComplete();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [durationMs, onTimeoutComplete]);

  return (
    <div className="w-full min-h-[420px] flex flex-col items-center justify-center text-center px-4 py-12 animate-fadeIn relative">
      {/* Background glow */}
      <div className="absolute w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 space-y-5 max-w-md">
        <div className="inline-flex p-5 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-2xl shadow-orange-500/40 animate-bounce">
          <PartyPopper className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-600 font-extrabold">
            ¡Sorteo Exitoso!
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            ¡Felicidades, {participantName}! 🎉
          </h2>
          <p className="text-stone-600 text-sm font-medium">
            Preparando tu tarjeta de resultado y recuerdo...
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-48 h-2 mx-auto bg-stone-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-75 ease-linear"
            style={{ width: `${100 - progress}%` }}
          />
        </div>

        <div>
          <button
            onClick={onTimeoutComplete}
            className="text-xs text-stone-600 hover:text-stone-800 underline font-medium cursor-pointer"
          >
            Continuar de inmediato &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
