import React from 'react';
import { Participant, ItemDefinition } from '../types';
import { Trophy, ArrowLeft, Users, CheckCircle2, Clock, Flame, Sparkles } from 'lucide-react';

interface ResultsTableViewProps {
  items: ItemDefinition[];
  participants: Participant[];
  onBackToHome: () => void;
}

export const ResultsTableView: React.FC<ResultsTableViewProps> = ({
  items,
  participants,
  onBackToHome
}) => {
  const completedList = participants.filter(p => p.hasPlayed);
  const pendingList = participants.filter(p => !p.hasPlayed);

  // Calculate allocated item counts
  const itemCounts: Record<string, number> = {};
  completedList.forEach(p => {
    if (p.assignedItem) {
      itemCounts[p.assignedItem] = (itemCounts[p.assignedItem] || 0) + 1;
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            Tabla de Resultados en Vivo
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Estado de asignaciones para la Carne Asada de Despedida.
          </p>
        </div>

        {/* Status Counter Badge */}
        <div className="flex items-center gap-3 bg-stone-900 text-white p-3 rounded-2xl border border-stone-800 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-xs text-stone-400">Progreso total:</span>
            <div className="text-lg font-black text-amber-400">
              {completedList.length} / {participants.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
            🥩
          </div>
        </div>
      </div>

      {/* Main Results Table (Only who played) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Participantes que ya jugaron ({completedList.length})
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            Actualización en tiempo real
          </span>
        </div>

        {completedList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center text-2xl">
              🎡
            </div>
            <h4 className="text-base font-bold text-stone-800">
              Aún nadie ha girado la ruleta
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Sé el primero en tocar tu nombre en la pantalla de inicio para inaugurar los resultados.
            </p>
            <button
              onClick={onBackToHome}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm transition"
            >
              Ir a la Pantalla de Inicio
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100/70 text-stone-600 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Participante</th>
                  <th className="py-3.5 px-4">Artículo Asignado</th>
                  <th className="py-3.5 px-4">Detalle / Opción</th>
                  <th className="py-3.5 px-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {completedList.map((person, idx) => {
                  const itemDef = items.find(
                    i => i.name.toLowerCase() === (person.assignedItem || '').toLowerCase()
                  );

                  return (
                    <tr key={person.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3.5 px-4 font-bold text-stone-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-stone-900">
                        {person.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${itemDef?.badgeColor || 'bg-stone-100 text-stone-800'}`}>
                          <span>{itemDef?.emoji || '📦'}</span>
                          <span>{person.assignedItem}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-stone-600">
                        {person.assignedOption ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-xs">
                            {person.assignedOption}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {person.pendingDrink ? 'Falta bebida' : 'Confirmado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Breakdown: Asignados vs Disponibles */}
      <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Balance de Cupos Asignados vs Faltantes
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map(item => {
            const taken = itemCounts[item.name] || 0;
            const remaining = item.totalSlots - taken;
            const isFull = remaining <= 0;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isFull
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-white border-stone-200 text-stone-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{item.emoji}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${isFull ? 'bg-emerald-200 text-emerald-900' : 'bg-stone-100 text-stone-600'}`}>
                    {taken}/{item.totalSlots}
                  </span>
                </div>
                <div className="text-xs font-extrabold truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {isFull ? '✅ Cupos completos' : `Quedan ${remaining} libre${remaining > 1 ? 's' : ''}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Participants Pending */}
      {pendingList.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase">
                Pendientes por girar ({pendingList.length}):
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                {pendingList.map(p => p.name).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm transition whitespace-nowrap self-start sm:self-auto"
          >
            Continuar Sorteo
          </button>
        </div>
      )}
    </div>
  );
};
