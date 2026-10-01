import { ITEMS_CATALOG, PARTICIPANTS_LIST, FRESCO_OPTIONS } from './data/constants';
import { ItemDefinition } from './types';

export interface ParticipanteDB {
  nombre: string;
  yaJugo: boolean;
  articulo: string | null;
  opcionFresco: string | null;
  photoIndex?: number;
}
export interface CupoDB { tipo: string; disponible: boolean; asignadoA: string | null }
export interface EstadoRifa {
  inicializado?: boolean;
  participantes: Record<string, ParticipanteDB>;
  cupos: Record<string, CupoDB>;
  frescoOpciones: Record<string, string | null>;
  articulos: Record<string, ItemDefinition>;
}
export function slug(nombre: string) {
  return nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
}
export function normalizar(raw: any): EstadoRifa {
  const s = structuredClone(raw || {});
  s.participantes ||= {};
  s.cupos = Object.fromEntries(Object.entries(s.cupos || {}).filter(([, v]) => v));
  s.frescoOpciones ||= {};
  s.articulos ||= Object.fromEntries(ITEMS_CATALOG.map(item => {
    const count = Object.values(s.cupos).filter((c: CupoDB) => c.tipo === item.name).length;
    return [item.id, { ...item, totalSlots: s.inicializado ? count : item.totalSlots }];
  }));
  for (const [id, p] of Object.entries(s.participantes) as [string, ParticipanteDB][]) {
    p.photoIndex ||= Math.max(1, PARTICIPANTS_LIST.findIndex(n => slug(n) === id) + 1);
  }
  return s;
}
export function crearEstado(): EstadoRifa {
  const s = normalizar(null);
  s.inicializado = true;
  PARTICIPANTS_LIST.forEach((nombre, i) => {
    s.participantes[slug(nombre)] = { nombre, yaJugo: false, articulo: null, opcionFresco: null, photoIndex: i + 1 };
  });
  Object.values(s.articulos).forEach(item => {
    for (let i = 0; i < item.totalSlots; i++) s.cupos[`${item.id}_${i}`] = { tipo: item.name, disponible: true, asignadoA: null };
  });
  return s;
}
function nombreValido(nombre: string) {
  const limpio = nombre.trim().replace(/\s+/g, ' ');
  if (!limpio || limpio.length > 60) throw new Error('El nombre debe tener entre 1 y 60 caracteres.');
  return limpio;
}
export function guardarParticipante(s: EstadoRifa, id: string, nombre: string, photoIndex: number, esperado?: string) {
  nombre = nombreValido(nombre);
  const anterior = s.participantes[id];
  if (esperado !== undefined && anterior?.nombre !== esperado) throw new Error('Este participante cambió. Cierra la edición y vuelve a intentarlo.');
  if (Object.entries(s.participantes).some(([key, p]) => key !== id && slug(p.nombre) === slug(nombre))) throw new Error('Ya existe un participante con ese nombre.');
  if (!Number.isInteger(photoIndex) || photoIndex < 1 || photoIndex > 13) throw new Error('Elige una de las 13 fotos disponibles.');
  if (anterior) {
    Object.values(s.cupos).forEach(c => { if (c.asignadoA === anterior.nombre) c.asignadoA = nombre; });
    Object.keys(s.frescoOpciones).forEach(k => { if (s.frescoOpciones[k] === anterior.nombre) s.frescoOpciones[k] = nombre; });
  }
  s.participantes[id] = { ...(anterior || { yaJugo: false, articulo: null, opcionFresco: null }), nombre, photoIndex };
}
export function guardarArticulo(s: EstadoRifa, item: ItemDefinition, esperado?: ItemDefinition) {
  item = { ...item, name: nombreValido(item.name), description: item.description.trim() };
  const anterior = s.articulos[item.id];
  if (esperado && JSON.stringify(anterior) !== JSON.stringify(esperado)) throw new Error('Este artículo cambió. Cierra la edición y vuelve a intentarlo.');
  if (Object.values(s.articulos).some(a => a.id !== item.id && slug(a.name) === slug(item.name))) throw new Error('Ya existe un artículo con ese nombre.');
  if (!Number.isInteger(item.totalSlots) || item.totalSlots < 0 || item.totalSlots > 500) throw new Error('La cantidad debe ser un número entero entre 0 y 500.');
  if (!/^#[\da-f]{6}$/i.test(item.color) || !item.emoji.trim() || item.description.length > 300) throw new Error('Revisa el color, el emoji y la descripción (máximo 300 caracteres).');
  if (item.id === 'fresco' && (item.name !== 'Fresco' || item.totalSlots > FRESCO_OPTIONS.length)) throw new Error('Fresco conserva su nombre y admite como máximo 3 cupos, uno por bebida.');
  const ocupados = Object.entries(s.cupos).filter(([, c]) => c.tipo === anterior?.name && !c.disponible);
  if (item.totalSlots < ocupados.length) throw new Error(`Ya hay ${ocupados.length} cupos asignados. No puedes reducir la cantidad por debajo de ese número.`);
  Object.entries(s.cupos).forEach(([key, c]) => { if (c.tipo === anterior?.name && c.disponible) delete s.cupos[key]; });
  ocupados.forEach(([, c]) => { c.tipo = item.name; });
  Object.values(s.participantes).forEach(p => { if (anterior && p.articulo === anterior.name) p.articulo = item.name; });
  for (let i = 0, creados = 0; creados < item.totalSlots - ocupados.length; i++) {
    const key = `${item.id}_${i}`;
    if (!s.cupos[key]) { s.cupos[key] = { tipo: item.name, disponible: true, asignadoA: null }; creados++; }
  }
  s.articulos[item.id] = item;
}
export function asignar(s: EstadoRifa, id: string, azar = Math.random()): string {
  const p = s.participantes[id];
  if (!p) throw new Error('El participante ya no existe.');
  if (p.yaJugo) throw new Error('Este participante ya giró la ruleta.');
  const libres = Object.values(s.cupos).filter(c => c.disponible);
  if (!libres.length) throw new Error('No quedan cupos disponibles. Pide al administrador que agregue más.');
  const c = libres[Math.floor(azar * libres.length)];
  c.disponible = false;
  c.asignadoA = p.nombre;
  p.yaJugo = true;
  p.articulo = c.tipo;
  return c.tipo;
}
export function elegirBebida(s: EstadoRifa, id: string, opcion: string) {
  const p = s.participantes[id];
  const bebida = FRESCO_OPTIONS.find(o => o.id === opcion);
  if (!p || p.articulo !== 'Fresco' || !bebida) throw new Error('Selección de bebida inválida.');
  if (p.opcionFresco) throw new Error('Este participante ya eligió su bebida.');
  if (s.frescoOpciones[opcion]) throw new Error('Esa bebida ya fue elegida. Selecciona otra.');
  s.frescoOpciones[opcion] = p.nombre;
  p.opcionFresco = bebida.name;
}
export function reiniciarEstado(s: EstadoRifa) {
  Object.values(s.participantes).forEach(p => { p.yaJugo = false; p.articulo = null; p.opcionFresco = null; });
  Object.values(s.cupos).forEach(c => { c.disponible = true; c.asignadoA = null; });
  s.frescoOpciones = {};
}
