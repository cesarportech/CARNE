import React from 'react';
import { Participant, ItemDefinition } from '../types';
import { Trophy, Users, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface HomeViewProps {
  items: ItemDefinition[];
  participants: Participant[];
  onSelectParticipant: (participant: Participant) => void;
  onOpenResultsTable: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  items,
  participants,
  onSelectParticipant,
  onOpenResultsTable
}) => {
  // Quien giró pero le falta escoger bebida todavía no cuenta como listo.
  const completedCount = participants.filter(p => p.hasPlayed && !p.pendingDrink).length;
  const pendingCount = participants.length - completedCount;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-20 text-6xl select-none">
          🥩🔥
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Sorteo 100% Aleatorio & Transparente
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight leading-tight">
              Gran Carne Asada de Despedida 🍖
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Selecciona tu nombre abajo para girar la ruleta y descubrir qué artículo te corresponde traer. Cada cupo está asegurado para que no se repitan excedentes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3">
            <button
              id="btn-ver-resultados-top"
              onClick={onOpenResultsTable}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-500/25 transition-all hover:scale-103 active:scale-98 text-sm"
            >
              <Trophy className="w-4 h-4 text-stone-950" />
              <span>Ver Resultados ({completedCount}/{participants.length})</span>
            </button>
            <div className="text-center text-xs text-stone-400">
              {pendingCount === 0 ? '🎉 ¡Todos ya participaron!' : `Faltan ${pendingCount} personas por girar`}
            </div>
          </div>
        </div>
      </div>

      {/* Participantes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Toca tu nombre para participar:
            </h3>
            <p className="text-xs text-stone-500">
              Los nombres desactivados ya giraron la ruleta y tienen su artículo guardado.
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
            {completedCount} de {participants.length} listos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {participants.map((person, index) => {
            // Si le tocó Fresco y aún no elige bebida, su nombre sigue activo
            // para que pueda volver a entrar y terminar.
            const pendingDrink = !!person.pendingDrink;
            const isPlayed = person.hasPlayed && !pendingDrink;

            return (
              <button
                key={person.id}
                id={`btn-participant-${person.name.toLowerCase()}`}
                disabled={isPlayed}
                onClick={() => onSelectParticipant(person)}
                className={`relative group p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[100px] ${
                  isPlayed
                    ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed text-stone-400'
                    : 'bg-white hover:bg-amber-50/50 border-stone-200 hover:border-amber-400 text-stone-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-stone-600 group-hover:text-amber-700">
                    #{index + 1}
                  </span>
                  {isPlayed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Listo
                    </span>
                  ) : pendingDrink ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-200">
                      🥤 Falta bebida
                    </span>
                  ) : (
                    <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition text-xs font-bold flex items-center">
                      Girar <ArrowRight className="w-3 h-3 ml-0.5" />
                    </span>
                  )}
                </div>

                <div>
                  <div className={`text-base font-bold tracking-tight ${isPlayed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                    {person.name}
                  </div>
                  {isPlayed && person.assignedItem && (
                    <p className="text-xs font-medium text-emerald-700 mt-1 truncate">
                      ✅ {person.assignedItem} {person.assignedOption ? `(${person.assignedOption})` : ''}
                    </p>
                  )}
                  {!isPlayed && (
                    <p className={`text-xs mt-0.5 ${pendingDrink ? 'font-semibold text-sky-700' : 'text-stone-600'}`}>
                      {pendingDrink ? 'Toca para escoger tu bebida' : 'Toca para jugar'}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Artículos Repartidos Reference Bar */}
      <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 space-y-3">
        <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Distribución de los {items.reduce((n, a) => n + a.totalSlots, 0)} cupos de la Carne Asada:
        </h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${item.badgeColor}`}
            >
              <span>{item.emoji}</span>
              <span>{item.name}</span>
              <span className="bg-white/80 px-1.5 py-0.5 rounded-md text-[11px] shadow-2xs font-bold">
                x{item.totalSlots}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
