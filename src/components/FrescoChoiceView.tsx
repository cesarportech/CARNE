import React, { useState } from 'react';
import { FRESCO_OPTIONS } from '../data/constants';
import { Sparkles, Check, Lock } from 'lucide-react';

interface FrescoChoiceViewProps {
  participantName: string;
  onSelectOption: (optionId: string, optionName: string) => void | Promise<void>;
  takenOptions?: string[]; // e.g. ['coca'] if already chosen by another person
}

export const FrescoChoiceView: React.FC<FrescoChoiceViewProps> = ({
  participantName,
  onSelectOption,
  takenOptions = []
}) => {
  // Mientras la reserva va en camino bloqueamos los tres botones: si no, un doble
  // toque en el celular manda dos peticiones y la segunda choca contra la primera.
  const [enviando, setEnviando] = useState(false);

  const elegir = async (optionId: string, optionName: string) => {
    if (enviando) return;
    setEnviando(true);
    try {
      await onSelectOption(optionId, optionName);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          🥤 ¡Te tocó Fresco!
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Elige qué tipo de refresco vas a traer
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm max-w-sm mx-auto">
          {participantName}, selecciona una de las opciones disponibles. No se pueden repetir con el otro compañero de refresco.
        </p>
      </div>

      {/* 3 Drink Options */}
      <div className="grid grid-cols-1 gap-3.5">
        {FRESCO_OPTIONS.map((opt) => {
          const isTaken = takenOptions.some(
            t => t.toLowerCase() === opt.name.toLowerCase() || t.toLowerCase() === opt.id.toLowerCase()
          );

          return (
            <button
              key={opt.id}
              id={`btn-fresco-${opt.id}`}
              disabled={isTaken || enviando}
              onClick={() => elegir(opt.id, opt.name)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                isTaken
                  ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed text-stone-400'
                  : 'bg-white hover:bg-emerald-50/60 border-stone-200 hover:border-emerald-500 shadow-sm hover:shadow-md hover:scale-101 active:scale-99 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl p-2 rounded-xl bg-stone-100 group-hover:bg-emerald-100/70 transition">
                  {opt.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-900">
                    {opt.name}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {opt.desc}
                  </p>
                </div>
              </div>

              <div>
                {isTaken ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 bg-stone-200/80 px-2.5 py-1 rounded-lg">
                    <Lock className="w-3 h-3" /> Tomado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                    Elegir <Sparkles className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-center text-xs text-stone-400 bg-stone-50 p-3 rounded-xl border border-stone-200">
        💡 Se requieren botellas grandes de 2L o 3L para asegurar que alcance para todos.
      </div>
    </div>
  );
};
