import React, { useState } from 'react';
import { EstadoRifa, guardarArticuloAdmin, guardarParticipanteAdmin, eliminarParticipanteAdmin, eliminarArticuloAdmin } from '../firebase';
import { ItemDefinition } from '../types';

interface Props { estado: EstadoRifa; conectado: boolean; onExit: () => void; onReset: () => Promise<void>; password: string }
const input = 'w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900';
const button = 'rounded-xl bg-amber-500 px-4 py-2 font-bold text-stone-950 disabled:opacity-50';
const nuevoArticulo = (): ItemDefinition => ({ id: `a_${crypto.randomUUID()}`, name: '', totalSlots: 1, emoji: '📦', color: '#F59E0B', badgeColor: 'bg-amber-100 text-amber-900 border-amber-200', description: '' });

export function AdminView({ estado, conectado, onExit, onReset, password }: Props) {
  const [autorizado, setAutorizado] = useState(false);
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [busy, setBusy] = useState(false);
  const [persona, setPersona] = useState<{ id: string; nombre: string; foto: number; esperado?: string } | null>(null);
  const [articulo, setArticulo] = useState<ItemDefinition | null>(null);
  const [original, setOriginal] = useState<ItemDefinition | undefined>();
  const personas = Object.entries(estado.participantes);
  const articulos = Object.values(estado.articulos);
  const pendientes = personas.filter(([, p]) => !p.yaJugo).length;
  const disponibles = Object.values(estado.cupos).filter(c => c.disponible).length;
  const guardar = async (accion: () => Promise<void>, cerrar: () => void, mensajeExito = 'Cambios guardados.') => {
    if (busy) return;
    setBusy(true); setError(''); setMensaje('');
    try { await accion(); cerrar(); setMensaje(mensajeExito); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar. Inténtalo de nuevo.'); }
    finally { setBusy(false); }
  };
  return <section className="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-black">Administración</h2><button disabled={busy} className="underline" onClick={onExit}>Cerrar y volver</button></div>
    {!autorizado ? <form className="bg-white rounded-2xl border p-6 max-w-md mx-auto space-y-4" onSubmit={e => { e.preventDefault(); if (clave === password) { setAutorizado(true); setClave(''); setError(''); } else setError('Contraseña incorrecta.'); }}>
      <p>Introduce la contraseña de administración.</p>
      <label className="block">Contraseña<input className={input} type="password" autoComplete="current-password" value={clave} onChange={e => setClave(e.target.value)} required autoFocus /></label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <button className={button}>Entrar</button>
    </form> : <>
      <p className="text-stone-600">Los cambios se guardan para todos. Los resultados ya asignados se conservan al editar nombres y cantidades.</p>
      {!conectado && <p role="alert">Esperando conexión. Las ediciones están deshabilitadas.</p>}
      <div className="rounded-2xl bg-white border p-4">{personas.length} participantes · {articulos.reduce((n, a) => n + a.totalSlots, 0)} cupos · {disponibles} disponibles</div>
      {disponibles !== pendientes && <p className="rounded-xl bg-amber-100 text-amber-950 p-4" role="status">{disponibles < pendientes ? `Faltan ${pendientes - disponibles} cupos para las ${pendientes} personas que aún no giraron. Agrega artículos o aumenta sus cantidades.` : `Sobran ${disponibles - pendientes} cupos respecto a las personas pendientes. Algunos artículos podrían quedar sin asignar.`}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 text-red-800 p-4">{error}</p>}
      {mensaje && <p role="status" className="text-emerald-800">{mensaje}</p>}
      <fieldset disabled={busy || !conectado} className="space-y-6 disabled:opacity-60">
        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap justify-between gap-3"><h3 className="text-xl font-bold">Participantes</h3><button className={button} onClick={() => { setPersona({ id: `p_${crypto.randomUUID()}`, nombre: '', foto: 1 }); setError(''); }}>Agregar participante</button></div>
          {persona && <form className="bg-stone-50 rounded-xl p-4 space-y-3" onSubmit={e => { e.preventDefault(); void guardar(() => guardarParticipanteAdmin(persona.id, persona.nombre, persona.foto, persona.esperado), () => setPersona(null)); }}>
            <h4 className="font-bold">{persona.esperado ? 'Editar participante' : 'Nuevo participante'}</h4>
            <label className="block">Nombre<input className={input} maxLength={60} value={persona.nombre} onChange={e => setPersona({ ...persona, nombre: e.target.value })} required /></label>
            <label className="block">Foto de recuerdo<select className={input} value={persona.foto} onChange={e => setPersona({ ...persona, foto: Number(e.target.value) })}>{Array.from({ length: 13 }, (_, i) => <option key={i} value={i + 1}>Foto {i + 1}</option>)}</select></label>
            <img src={`/fotos/foto${persona.foto}.jpg`} alt="Vista previa de la foto elegida" className="h-24 rounded-lg object-contain" />
            <div className="flex gap-4"><button className={button}>Guardar participante</button><button type="button" onClick={() => setPersona(null)}>Cancelar</button></div>
          </form>}
          {!personas.length && <p className="text-stone-500">No hay participantes. Agrega uno para comenzar.</p>}
          <ul className="divide-y">{personas.map(([id, p]) => <li key={id} className="py-3 flex justify-between gap-3 items-center"><div><strong>{p.nombre}</strong><p className="text-sm text-stone-500">{p.yaJugo ? `${p.articulo || 'Asignación pendiente'}${p.opcionFresco ? ` · ${p.opcionFresco}` : ''}` : 'Pendiente de girar'}</p></div><div className="flex flex-wrap justify-end gap-3"><button className="underline" onClick={() => { setPersona({ id, nombre: p.nombre, foto: p.photoIndex || 1, esperado: p.nombre }); setError(''); }}>Editar<span className="sr-only"> {p.nombre}</span></button><button className="text-red-700 underline" onClick={() => {
 if (!window.confirm(`¿Eliminar permanentemente a ${p.nombre}? Se borrará de la base de datos y de todas las vistas. Su cupo y bebida quedarán disponibles. Esta acción no se puede deshacer.`)) return;
 void guardar(() => eliminarParticipanteAdmin(id, p), () => { if (persona?.id === id) setPersona(null); }, "Participante eliminado permanentemente.");
 }}>Eliminar<span className="sr-only"> {p.nombre}</span></button></div></li>)}</ul>
        </div>
        <div className="bg-white border rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap justify-between gap-3"><h3 className="text-xl font-bold">Artículos</h3><button className={button} onClick={() => { setArticulo(nuevoArticulo()); setOriginal(undefined); setError(''); }}>Agregar artículo</button></div>
          {articulo && <form className="bg-stone-50 rounded-xl p-4 space-y-3" onSubmit={e => { e.preventDefault(); void guardar(() => guardarArticuloAdmin(articulo, original), () => setArticulo(null)); }}>
            <h4 className="font-bold">{original ? 'Editar artículo' : 'Nuevo artículo'}</h4>
            <label className="block">Nombre<input className={input} value={articulo.name} maxLength={60} readOnly={articulo.id === 'fresco'} onChange={e => setArticulo({ ...articulo, name: e.target.value })} required /></label>
            <label className="block">Cantidad total de personas que deben llevarlo<input className={input} type="number" min={0} max={articulo.id === 'fresco' ? 3 : 500} step={1} value={articulo.totalSlots} onChange={e => setArticulo({ ...articulo, totalSlots: Number(e.target.value) })} required /></label>
            <p className="text-sm text-stone-500">Incluye los cupos ya asignados. Una cantidad de cero retira un artículo sin asignaciones de la ruleta.{articulo.id === 'fresco' && ' Fresco admite hasta 3 personas, una por bebida, y conserva su nombre.'}</p>
            <div className="grid grid-cols-2 gap-3"><label>Emoji<input className={input} value={articulo.emoji} maxLength={16} onChange={e => setArticulo({ ...articulo, emoji: e.target.value })} required /></label><label>Color<input className={`${input} h-11`} type="color" value={articulo.color} onChange={e => setArticulo({ ...articulo, color: e.target.value })} /></label></div>
            <label className="block">Descripción<textarea className={input} maxLength={300} value={articulo.description} onChange={e => setArticulo({ ...articulo, description: e.target.value })} /></label>
            <div className="flex gap-4"><button className={button}>Guardar artículo</button><button type="button" onClick={() => setArticulo(null)}>Cancelar</button></div>
          </form>}
          {!articulos.length && <p className="text-stone-500">No hay artículos. Agrega uno para habilitar la ruleta.</p>}
          <ul className="divide-y">{articulos.map(a => <li key={a.id} className="py-3 flex items-center justify-between gap-3"><div><strong>{a.emoji} {a.name}</strong><p className="text-sm text-stone-500">{a.totalSlots} cupos · {Object.values(estado.cupos).filter(c => c.tipo === a.name && !c.disponible).length} asignados</p></div><div className="flex flex-wrap justify-end gap-3"><button className="underline" onClick={() => { setArticulo({ ...a }); setOriginal({ ...a }); setError(''); }}>Editar<span className="sr-only"> {a.name}</span></button><button className="text-red-700 underline" onClick={() => {
 if (!window.confirm(`¿Eliminar permanentemente ${a.name}? Se borrará de la base de datos, la ruleta y todas las vistas, junto con sus cupos y asignaciones. Las personas que lo tenían podrán volver a girar. Esta acción no se puede deshacer.`)) return;
 void guardar(() => eliminarArticuloAdmin(a.id, a), () => { if (articulo?.id === a.id) { setArticulo(null); setOriginal(undefined); } }, "Artículo eliminado permanentemente.");
 }}>Eliminar<span className="sr-only"> {a.name}</span></button></div></li>)}</ul>
        </div>
        <div className="border border-red-200 rounded-2xl p-5 space-y-3"><h3 className="font-bold">Reiniciar resultados</h3><p>Libera los cupos y permite volver a girar. Conserva los participantes y artículos configurados.</p><button className="text-red-700 underline" onClick={() => void guardar(onReset, () => {})}>Reiniciar sorteo</button></div>
      </fieldset>
    </>}
  </section>;
}
