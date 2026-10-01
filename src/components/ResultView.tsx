import React, { useState } from 'react';
import { Participant, ItemDefinition } from '../types';
import { DEMO_PHOTOS } from '../data/constants';
import { Trophy, CheckCircle, Share2, Home, Sparkles, Image as ImageIcon, Flame } from 'lucide-react';

interface ResultViewProps {
  items: ItemDefinition[];
  participant: Participant;
  itemWon: string;
  optionWon?: string;
  photoIndex?: number;
  onGoHome: () => void;
  onViewResultsTable: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  items,
  participant,
  itemWon,
  optionWon,
  photoIndex = 1,
  onGoHome,
  onViewResultsTable
}) => {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find item details from catalog
  const itemInfo = items.find(
    i => i.name.toLowerCase() === itemWon.toLowerCase()
  ) || {
    name: itemWon,
    emoji: '🥩',
    color: '#F59E0B',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Artículo asignado para compartir en la carne asada.'
  };

  // Build photo url strategy:
  // First tries local `/fotos/foto${photoIndex}.jpg`, if missing falls back to demo celebratory photo
  const localPhotoUrl = `/fotos/foto${photoIndex}.jpg`;
  const fallbackPhotoUrl = DEMO_PHOTOS[(photoIndex - 1) % DEMO_PHOTOS.length];
  const photoSrc = imageError ? fallbackPhotoUrl : localPhotoUrl;

  const handleShare = () => {
    const text = `🎉 ¡Hola! En la rifa de la Carne Asada de Despedida a ${participant.name} le tocó llevar: ${itemWon}${optionWon ? ` (${optionWon})` : ''} 🥩🔥`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Celebration Result Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-5 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3 h-3" /> Asignación Confirmada
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {participant.name}, ¡tu misión está lista!
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Carne Asada de Despedida 🍖
          </p>
        </div>

        {/* Coworker / Memory Photo Section */}
        {/* El marco se adapta a cada foto: las hay casi cuadradas y muy verticales,
            y con un alto fijo salían con barrotes a los lados en el teléfono. */}
        <div className="relative bg-stone-950/5 w-full overflow-hidden border-b border-stone-100 flex items-center justify-center">
          <img
            src={photoSrc}
            alt={`Foto de recuerdo ${participant.name}`}
            className="w-full h-auto max-h-[60vh] object-contain"
            onError={() => {
              // If /fotos/fotoN.jpg does not exist in the file system yet, smoothly fallback to high-res celebration photo
              if (!imageError) {
                setImageError(true);
              }
            }}
          />

          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-sm flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-amber-400" /> Foto #{photoIndex}
            </span>
          </div>

          <div className="absolute bottom-3 right-3">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black shadow-lg">
              {participant.name}
            </span>
          </div>
        </div>

        {/* Assigned Item Details */}
        <div className="p-6 space-y-5 text-center">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold text-stone-400 tracking-wider">
              Te corresponde traer:
            </span>

            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 flex flex-col items-center gap-2 shadow-inner">
              <span className="text-4xl">{itemInfo.emoji}</span>
              <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                {itemWon}
              </h3>
              {optionWon && (
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm">
                  Variedad: {optionWon}
                </span>
              )}
              <p className="text-xs text-stone-600 max-w-xs">
                {itemInfo.description}
              </p>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 text-left flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Este resultado quedó guardado permanentemente para que nadie más tome tu cupo. ¡Nos vemos en la carne asada!
            </span>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onGoHome}
              className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Home className="w-4 h-4" /> Inicio
            </button>

            <button
              onClick={onViewResultsTable}
              className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-98"
            >
              <Trophy className="w-4 h-4" /> Ver Tabla
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full py-2 text-xs text-stone-500 hover:text-stone-800 font-medium flex items-center justify-center gap-1 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? '¡Copiado al portapapeles! 📋' : 'Copiar mi resultado para compartir'}
          </button>
        </div>
      </div>
    </div>
  );
};
