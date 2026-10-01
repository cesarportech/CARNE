import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearEstado, normalizar, guardarArticulo, guardarParticipante, asignar, elegirBebida, reiniciarEstado } from './raffle';

test('los datos anteriores conservan resultados y recuperan el catálogo', () => {
  const s = crearEstado();
  asignar(s, 'cesar', 0);
  const legacy: any = structuredClone(s);
  delete legacy.articulos;
  const migrated = normalizar(legacy);
  assert.equal(migrated.participantes.cesar.articulo, s.participantes.cesar.articulo);
  assert.equal(Object.keys(migrated.articulos).length, 7);
  assert.equal(Object.values(migrated.cupos).filter(c => !c.disponible).length, 1);
});
test('se agregan participantes y artículos que pueden salir en el sorteo', () => {
  const s = crearEstado();
  guardarParticipante(s, 'nuevo', 'Nueva persona', 4);
  guardarArticulo(s, { ...s.articulos.chimol, id: 'hielo', name: 'Hielo', totalSlots: 1 });
  assert.equal(asignar(s, 'nuevo', 0.999), 'Hielo');
  assert.throws(() => asignar(s, 'nuevo'), /ya giró/);
});
test('editar nombres y cantidades conserva asignaciones y rechaza cantidades insuficientes', () => {
  const s = crearEstado();
  asignar(s, 'cesar', 0);
  guardarParticipante(s, 'cesar', 'César actualizado', 7, 'Cesar');
  assert.equal(Object.values(s.cupos).find(c => !c.disponible)?.asignadoA, 'César actualizado');
  guardarArticulo(s, { ...s.articulos.chimol, name: 'Ensalada', totalSlots: 3 });
  assert.equal(s.participantes.cesar.articulo, 'Ensalada');
  assert.equal(Object.values(s.cupos).filter(c => c.tipo === 'Ensalada').length, 3);
  assert.throws(() => guardarArticulo(s, { ...s.articulos.chimol, totalSlots: 0 }), /asignados/);
});
test('se rechazan duplicados, cantidades inválidas y ediciones desactualizadas', () => {
  const s = crearEstado();
  assert.throws(() => guardarParticipante(s, 'nuevo', ' CÉSAR ', 1), /Ya existe/);
  assert.throws(() => guardarParticipante(s, 'cesar', 'Otro', 1, 'Nombre antiguo'), /cambió/);
  assert.throws(() => guardarArticulo(s, { ...s.articulos.chimol, totalSlots: -1 }), /entero/);
  assert.throws(() => guardarArticulo(s, { ...s.articulos.chimol, totalSlots: 1.5 }), /entero/);
  assert.throws(() => guardarArticulo(s, { ...s.articulos.chimol, name: 'Tortillas' }), /Ya existe/);
  assert.throws(() => guardarArticulo(s, { ...s.articulos.fresco, totalSlots: 4 }), /máximo 3/);
  const original = structuredClone(s.articulos.chimol);
  guardarArticulo(s, { ...original, totalSlots: 3 });
  assert.throws(() => guardarArticulo(s, original, original), /cambió/);
});
test('las bebidas son únicas y el cambio de nombre actualiza su reserva', () => {
  const s = crearEstado();
  s.participantes.cesar.articulo = 'Fresco';
  s.participantes.fernando.articulo = 'Fresco';
  elegirBebida(s, 'cesar', 'coca');
  assert.throws(() => elegirBebida(s, 'fernando', 'coca'), /ya fue elegida/);
  assert.throws(() => elegirBebida(s, 'cesar', 'pepsi'), /ya eligió/);
  guardarParticipante(s, 'cesar', 'César nuevo', 1);
  assert.equal(s.frescoOpciones.coca, 'César nuevo');
});
test('reiniciar conserva el catálogo y los participantes personalizados', () => {
  const s = crearEstado();
  guardarParticipante(s, 'nuevo', 'Invitado', 1);
  guardarArticulo(s, { ...s.articulos.chimol, name: 'Ensalada', totalSlots: 4 });
  asignar(s, 'nuevo', 0);
  reiniciarEstado(s);
  assert.equal(s.participantes.nuevo.nombre, 'Invitado');
  assert.equal(s.participantes.nuevo.yaJugo, false);
  assert.equal(s.articulos.chimol.name, 'Ensalada');
  assert.equal(s.articulos.chimol.totalSlots, 4);
  assert.ok(Object.values(s.cupos).every(c => c.disponible));
});
test('todos los giros respetan las cantidades y no reutilizan cupos', () => {
  const s = crearEstado();
  Object.keys(s.participantes).forEach(id => asignar(s, id));
  assert.equal(Object.values(s.cupos).filter(c => !c.disponible).length, 13);
  Object.values(s.articulos).forEach(a => assert.equal(Object.values(s.participantes).filter(p => p.articulo === a.name).length, a.totalSlots));
  guardarParticipante(s, 'extra', 'Extra', 1);
  assert.throws(() => asignar(s, 'extra'), /No quedan cupos/);
  assert.equal(s.participantes.extra.yaJugo, false);
});
