import React from 'react';
import { RefreshCw } from 'lucide-react';

interface NavbarProps {
  completedCount: number;
  totalCount: number;
  isFirebaseLive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  completedCount,
  totalCount,
  isFirebaseLive
}) => {
  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 text-stone-100 backdrop-blur-md border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-xl font-bold">
              🥩
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  Rifa Carne Asada <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">Despedida</span>
                </h1>
              </div>
              <p className="text-xs text-stone-400">
                {totalCount} Participantes • Sorteo aleatorio
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800/80 border border-stone-700 text-stone-300">
              <span
                className={`w-2 h-2 rounded-full ${isFirebaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`}
                title={isFirebaseLive ? 'Conectado a Firebase' : 'Conectando…'}
              ></span>
              <span className="font-semibold text-amber-400">{completedCount}</span> / {totalCount} listos
            </div>


          </div>
        </div>
      </div>
    </header>
  );
};
