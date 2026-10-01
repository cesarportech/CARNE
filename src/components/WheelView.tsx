import React, { useState, useRef, useEffect } from 'react';
import { Participant, ItemDefinition } from '../types';
import { ArrowLeft, Sparkles, Flame, RefreshCcw } from 'lucide-react';

interface WheelViewProps {
  items: ItemDefinition[];
  participant: Participant;
  /** Pide el cupo (transacción en Firebase). Devuelve el artículo ganador, o null si falló. */
  onSpin: () => Promise<string | null>;
  onSpinComplete: (itemWon: string) => void;
  onCancel: () => void;
}

export const WheelView: React.FC<WheelViewProps> = ({
  items,
  participant,
  onSpin,
  onSpinComplete,
  onCancel
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Define segments on the wheel (7 item categories)
  const [segments] = useState(items);
  const numSegments = segments.length;
  const segmentDegrees = 360 / (numSegments || 1);

  // Build conic-gradient for the wheel
  const conicGradient = segments
    .map((item, index) => {
      const start = (index * 360) / numSegments;
      const end = ((index + 1) * 360) / numSegments;
      return `${item.color} ${start}deg ${end}deg`;
    })
    .join(', ');

  const handleSpin = async () => {
    if (running.current || !numSegments) return;
    running.current = true;
    setIsSpinning(true);

    // El artículo lo decide Firebase con una transacción: el cupo queda tomado
    // antes de que empiece la animación, así nadie se pisa con nadie.
    let chosenItemName: string | null = null;
    try {
      chosenItemName = await onSpin();
    } catch (err) {
      console.error('Error asignando el cupo:', err);
    }

    if (!chosenItemName) {
      running.current = false;
      setIsSpinning(false);
      return;
    }

    const chosenIndex = segments.findIndex(s => s.name.toLowerCase() === chosenItemName!.toLowerCase());
    if (chosenIndex < 0) {
      onSpinComplete(chosenItemName);
      return;
    }
    const targetSegmentIndex = chosenIndex >= 0 ? chosenIndex : 0;

    // El puntero está arriba (0deg / 12 en punto). Partimos de una vuelta entera
    // para que el ángulo final siempre caiga en el centro del gajo ganador,
    // aunque la rueda ya venga girada de antes.
    const extraSpins = 360 * 6; // 6 vueltas completas
    const segmentOffset = (targetSegmentIndex * segmentDegrees) + (segmentDegrees / 2);
    const base = Math.ceil(currentAngle / 360) * 360;
    const targetAngle = base + extraSpins + (360 - segmentOffset);

    setCurrentAngle(targetAngle);

    const itemWon = chosenItemName;
    timer.current = setTimeout(() => {
      running.current = false;
      setIsSpinning(false);
      onSpinComplete(itemWon);
    }, 4000);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 flex flex-col items-center animate-fadeIn">
      {/* Header with back button */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={onCancel}
          disabled={isSpinning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a lista
        </button>

        <div className="text-right">
          <span className="text-xs text-stone-400 font-medium">Turno de:</span>
          <div className="text-base font-extrabold text-stone-900 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {participant.name}
          </div>
        </div>
      </div>

      {/* Hero Box */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center justify-center gap-2">
          🎡 ¡Gira la Ruleta, {participant.name}!
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Presiona el botón para sortear qué te toca llevar a la carne asada.
        </p>
      </div>

      {/* Wheel Stage */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Top Pointer (Arrow pointing down into wheel) */}
        <div className="absolute -top-4 z-30 flex flex-col items-center">
          <div className={`w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-stone-900 filter drop-shadow-md transition-transform ${isSpinning ? 'scale-110 animate-bounce' : ''}`} />
          <div className="w-3 h-3 rounded-full bg-amber-400 -mt-6.5 shadow-sm border border-stone-900 z-40" />
        </div>

        {/* Outer Golden/Charcoal Rim */}
        <div className="w-72 h-72 sm:w-84 sm:h-84 rounded-full p-2.5 bg-gradient-to-tr from-stone-850 via-amber-600 to-stone-900 shadow-2xl border-4 border-stone-800 relative flex items-center justify-center">
          
          {/* Rotating Conic Wheel */}
          <div
            id="ruleta-canvas"
            className="w-full h-full rounded-full relative overflow-hidden shadow-inner transition-all"
            style={{
              background: `conic-gradient(${conicGradient})`,
              transform: `rotate(${currentAngle}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
            }}
          >
            {/* Segment Labels Overlay */}
            {segments.map((seg, idx) => {
              const rotate = (idx * segmentDegrees) + (segmentDegrees / 2);
              return (
                <div
                  key={seg.id}
                  className="absolute w-full h-full top-0 left-0 flex items-start justify-center pt-3 text-white select-none pointer-events-none"
                  style={{
                    transform: `rotate(${rotate}deg)`,
                    transformOrigin: '50% 50%'
                  }}
                >
                  <div className="flex flex-col items-center text-center max-w-[65px] drop-shadow-md">
                    <span className="text-xl">{seg.emoji}</span>
                    <span className="text-[11px] font-black uppercase tracking-tight leading-none text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)]">
                      {seg.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Wheel Center Hub */}
          <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-stone-900 border-4 border-amber-400 shadow-xl flex items-center justify-center text-white z-20">
            <span className="text-2xl animate-pulse">🥩</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full max-w-sm flex flex-col items-center gap-3">
        <button
          id="btn-girar-ruleta"
          disabled={isSpinning || !numSegments}
          onClick={handleSpin}
          className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-xl transition-all duration-200 ${
            isSpinning
              ? 'bg-stone-300 text-stone-600 cursor-not-allowed scale-98'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-orange-500/30 hover:scale-103 active:scale-97 cursor-pointer'
          }`}
        >
          {isSpinning ? (
            <>
              <RefreshCcw className="w-5 h-5 animate-spin" />
              <span>GIRANDO RULETA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>¡GIRAR RULETA AHORA!</span>
            </>
          )}
        </button>

        <p className="text-xs text-stone-500 text-center">
          {!numSegments ? 'No hay artículos activos. Pide al administrador que agregue cupos.' : isSpinning ? '🍀 ¡Cruzando los dedos!' : 'El artículo asignado se guardará automáticamente en Firebase.'}
        </p>
      </div>
    </div>
  );
};
