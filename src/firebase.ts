import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, runTransaction } from 'firebase/database';
import { ItemDefinition } from './types';
import { EstadoRifa, normalizar, crearEstado, guardarParticipante, guardarArticulo, asignar, elegirBebida, reiniciarEstado } from './raffle';
export { slug } from './raffle';
export type { EstadoRifa } from './raffle';

const firebaseConfig = {
  apiKey: 'AIzaSyCeQnXQNuLdCO0mudgFKDBbFmq78F0ANaw',
  authDomain: 'invitaciones-24ace.firebaseapp.com',
  databaseURL: 'https://invitaciones-24ace-default-rtdb.firebaseio.com',
  projectId: 'invitaciones-24ace',
  storageBucket: 'invitaciones-24ace.firebasestorage.app',
  messagingSenderId: '33940052580',
  appId: '1:33940052580:web:f2e231d44b8d32f3e15d71'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


export const MODO_PRUEBA = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('test');
export const ROOT = MODO_PRUEBA ? 'carneAsadaPRUEBA' : 'carneAsada';

// Las operaciones completas comparten una transacción: edición y giros no se pisan.
async function cambiar(accion: (s: EstadoRifa) => void): Promise<EstadoRifa> {
  let error: Error | null = null;
  const res = await runTransaction(ref(db, ROOT), raw => {
    error = null;
    // Firebase puede comenzar con caché vacía; null permite consultar el estado del servidor.
    if (!raw) return raw;
    const s = normalizar(raw);
    try { accion(s); return s; }
    catch (e) { error = e as Error; return undefined; }
  }, { applyLocally: false });
  if (error) throw error;
  if (!res.committed || !res.snapshot.exists()) throw new Error('No se pudo guardar. Recarga la página e inténtalo de nuevo.');
  return normalizar(res.snapshot.val());
}
export async function inicializarSiHaceFalta() {
  await runTransaction(ref(db, ROOT), raw => raw?.inicializado ? undefined : crearEstado(), { applyLocally: false });
}
export function escucharRifa(cb: (s: EstadoRifa) => void, onError?: (e: Error) => void) {
  return onValue(ref(db, ROOT), snap => cb(normalizar(snap.val())), onError);
}
export async function asignarCupo(id: string) {
  const s = await cambiar(s => { asignar(s, id); });
  return { ok: true, articulo: s.participantes[id].articulo };
}
export async function elegirOpcionFresco(id: string, opcion: string, _etiqueta?: string) {
  await cambiar(s => elegirBebida(s, id, opcion));
  return { ok: true };
}
export async function guardarParticipanteAdmin(id: string, nombre: string, foto: number, esperado?: string) {
  await cambiar(s => guardarParticipante(s, id, nombre, foto, esperado));
}
export async function guardarArticuloAdmin(item: ItemDefinition, esperado?: ItemDefinition) {
  await cambiar(s => guardarArticulo(s, item, esperado));
}
export async function reiniciarRifa() { await cambiar(reiniciarEstado); }
