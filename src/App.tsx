import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Participant } from './types';
import { AdminView } from './components/AdminView';
import type { ParticipanteDB } from './raffle';
import {
  MODO_PRUEBA,
  ROOT,
  inicializarSiHaceFalta,
  escucharRifa,
  asignarCupo,
  elegirOpcionFresco,
  reiniciarRifa,
  EstadoRifa
} from './firebase';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { WheelView } from './components/WheelView';
import { CongratsView } from './components/CongratsView';
import { FrescoChoiceView } from './components/FrescoChoiceView';
import { ResultView } from './components/ResultView';
import { ResultsTableView } from './components/ResultsTableView';

const ESTADO_VACIO: EstadoRifa = {
  articulos: {},
  participantes: {},
  cupos: {},
  frescoOpciones: { pepsi: null, coca: null, sabores: null }
};

const CLAVE_REINICIO = 'Vokarin2020';

type Paso = 'home' | 'wheel' | 'congrats' | 'fresco' | 'result' | 'table' | 'admin';

export default function App() {
  const [estado, setEstado] = useState<EstadoRifa>(ESTADO_VACIO);
  const [conectado, setConectado] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastWonItem, setLastWonItem] = useState<string>('Queso crema');
  const [paso, setPaso] = useState<Paso>(window.location.hash === '#admin' ? 'admin' : 'home');

  const [error, setError] = useState('');
  useEffect(() => {
    const cambiarRuta = () => setPaso(window.location.hash === '#admin' ? 'admin' : 'home');
    window.addEventListener('hashchange', cambiarRuta);
    return () => window.removeEventListener('hashchange', cambiarRuta);
  }, []);
  useEffect(() => {
    let baja: (() => void) | undefined;
    let cancelado = false;
    inicializarSiHaceFalta().then(() => {
      if (cancelado) return;
      baja = escucharRifa(nuevo => { setEstado(nuevo); setConectado(true); setError(''); }, e => { setConectado(false); setError(e.message); });
    }).catch(() => { if (!cancelado) setError('No se pudo conectar. Revisa tu conexión y recarga la página.'); });
    return () => { cancelado = true; baja?.(); };
  }, []);
  const items = useMemo(() => Object.values(estado.articulos), [estado.articulos]);
  const participants: Participant[] = useMemo(() => Object.entries<ParticipanteDB>(estado.participantes).map(([id, p]) => ({
    id, name: p.nombre, hasPlayed: !!p.yaJugo,
    assignedItem: p.articulo || undefined, assignedOption: p.opcionFresco || undefined,
    pendingDrink: p.articulo === 'Fresco' && !p.opcionFresco, photoIndex: p.photoIndex || 1
  })), [estado.participantes]);

  const activeParticipant = useMemo(
    () => participants.find(p => p.id === activeId) || null,
    [participants, activeId]
  );

  useEffect(() => {
    if (!activeId || ['home', 'admin', 'table'].includes(paso)) return;
    if (!activeParticipant || (paso !== 'wheel' && !activeParticipant.hasPlayed)) {
      setActiveId(null);
      setPaso('home');
    }
  }, [activeId, activeParticipant, paso]);

  /** Claves de bebida ya reservadas (pepsi / coca / sabores). */
  const getTakenFrescoOptions = useCallback(
    (): string[] =>
      Object.entries(estado.frescoOpciones)
        .filter(([, quien]) => !!quien)
        .map(([clave]) => clave),
    [estado.frescoOpciones]
  );

  // ---------- Acciones ----------

  const handleSelectParticipant = (participant: Participant) => {
    setActiveId(participant.id);
    // Si ya giró y solo le falta la bebida, va directo a elegirla (no vuelve a girar).
    if (participant.pendingDrink) {
      setLastWonItem('Fresco');
      setPaso('fresco');
    } else if (participant.hasPlayed) {
      setPaso('home');
    } else {
      setPaso('wheel');
    }
  };

  /** Pide un cupo a Firebase de forma atómica. Una sola vez por persona. */
  const pedirCupo = useCallback(async (): Promise<string | null> => {
    if (!activeParticipant) return null;
    try {
      const res = await asignarCupo(activeParticipant.id);
      return res.articulo || null;
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo guardar el giro. Inténtalo de nuevo.');
      setPaso('home');
      return null;
    }
  }, [activeParticipant]);

  const handleSpinComplete = (itemWon: string) => {
    setLastWonItem(itemWon);
    setPaso('congrats');
  };

  const handleCongratsComplete = () => {
    setPaso(activeParticipant?.pendingDrink ? 'fresco' : 'result');
  };

  const handleSelectFrescoOption = useCallback(
    async (optionId: string, optionName: string) => {
      if (!activeParticipant) return;
      try {
        await elegirOpcionFresco(activeParticipant.id, optionId, optionName);
        setLastWonItem('Fresco');
        setPaso('result');
      } catch (e) { alert(e instanceof Error ? e.message : 'No se pudo guardar la bebida. Inténtalo de nuevo.'); }
    },
    [activeParticipant]
  );

  const handleResetData = async () => {
    if (!window.confirm('¿Borrar todos los resultados? Se conservarán los artículos y participantes configurados.')) return;
    await reiniciarRifa();
    setActiveId(null);
  };

  const completedCount = participants.filter(p => p.hasPlayed && !p.pendingDrink).length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      <Navbar
        completedCount={completedCount}
        totalCount={participants.length}
        isFirebaseLive={conectado}
      />

      {MODO_PRUEBA && (
        <div className="w-full bg-amber-500 text-stone-950 text-xs font-bold text-center py-1.5">
          MODO PRUEBA — escribiendo en el nodo "{ROOT}", la rifa de verdad no se toca.
        </div>
      )}

      <main className="flex-1 w-full pb-16">
        {error && <p role="alert" className="max-w-4xl mx-auto p-4 text-red-800 bg-red-50">{error}</p>}
        {paso === 'admin' && <AdminView estado={estado} conectado={conectado} password={CLAVE_REINICIO} onReset={handleResetData} onExit={() => { window.location.hash = ''; setPaso('home'); }} />}
        {paso === 'home' && (
          <HomeView
            items={items}
            participants={participants}
            onSelectParticipant={handleSelectParticipant}
            onOpenResultsTable={() => setPaso('table')}
          />
        )}

        {paso === 'wheel' && activeParticipant && (
          <WheelView
            key={`${activeId}:${JSON.stringify(items)}`}
            items={items.filter(i => i.totalSlots > 0)}
            participant={activeParticipant}
            onSpin={pedirCupo}
            onSpinComplete={handleSpinComplete}
            onCancel={() => setPaso('home')}
          />
        )}

        {paso === 'congrats' && activeParticipant && (
          <CongratsView
            participantName={activeParticipant.name}
            onTimeoutComplete={handleCongratsComplete}
          />
        )}

        {paso === 'fresco' && activeParticipant && (
          <FrescoChoiceView
            participantName={activeParticipant.name}
            onSelectOption={handleSelectFrescoOption}
            takenOptions={getTakenFrescoOptions()}
          />
        )}

        {paso === 'result' && activeParticipant && (
          <ResultView
            items={items}
            participant={activeParticipant}
            itemWon={activeParticipant.assignedItem || lastWonItem}
            optionWon={activeParticipant.assignedOption}
            photoIndex={activeParticipant.photoIndex || 1}
            onGoHome={() => {
              setActiveId(null);
              setPaso('home');
            }}
            onViewResultsTable={() => setPaso('table')}
          />
        )}

        {paso === 'table' && (
          <ResultsTableView
            items={items}
            participants={participants}
            onBackToHome={() => setPaso('home')}
          />
        )}
      </main>

      <footer className="w-full bg-stone-900 border-t border-stone-800 text-stone-400 text-xs py-4 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🥩 Rifa Carne Asada de Despedida • {items.reduce((n, a) => n + a.totalSlots, 0)} cupos</span>
          <span className="text-stone-500">
            Nodo Firebase: <code className="text-amber-400 bg-stone-800 px-1.5 py-0.5 rounded">{ROOT}</code> en <code className="text-stone-300">invitaciones-24ace</code>
          </span>
        </div>
      </footer>
    </div>
  );
}
