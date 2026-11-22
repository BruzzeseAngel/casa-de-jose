import test from 'node:test';
import assert from 'node:assert/strict';
import { HABITACION_VACIA, habitacionAFormulario, normalizarListaAdmin, textoALista, validarHabitacion } from '../src/lib/adminRoomsModel.mjs';

const valido = { nombre: 'Doble Estándar', capacidad: '2', stockTotal: '3',
  tamanoM2: '21.5', camas: 'Matrimonial, Individual', comodidades: 'Wi-Fi, Baño privado', activa: true };

test('valida y normaliza los campos de una habitación nueva', () => {
  assert.deepEqual(validarHabitacion(valido), {
    nombre: 'Doble Estándar', capacidad: 2, stockTotal: 3, tamanoM2: 21.5,
    camas: ['Matrimonial', 'Individual'], comodidades: ['Wi-Fi', 'Baño privado'],
    fotos: [], activa: true,
  });
});
test('convierte las listas CSV ignorando entradas vacías', () => {
  assert.deepEqual(textoALista(' Cama doble, , Cama simple , '), ['Cama doble', 'Cama simple']);
});
test('evita nombre vacío y camas ausentes', () => {
  assert.throws(() => validarHabitacion({ ...valido, nombre: ' ' }), /nombre/);
  assert.throws(() => validarHabitacion({ ...valido, camas: '  ' }), /cama/);
});
test('rechaza números no enteros, negativos, vacíos y no finitos', () => {
  for (const capacidad of ['', '1.5', '-1', 'Infinity', 'foo', '0']) {
    assert.throws(() => validarHabitacion({ ...valido, capacidad }), /capacidad/);
  }
  assert.throws(() => validarHabitacion({ ...valido, stockTotal: '0' }), /stock/);
  assert.throws(() => validarHabitacion({ ...valido, tamanoM2: 'NaN' }), /superficie/);
});
test('rechaza dimensiones fuera de rango', () => {
  assert.throws(() => validarHabitacion({ ...valido, stockTotal: 501 }), /límites/);
});
test('conserva las fotografías existentes sin mutarlas al editar', () => {
  const fotos = ['https://ejemplo.cl/foto.jpg'];
  const p = validarHabitacion(valido, fotos);
  assert.deepEqual(p.fotos, fotos);
  assert.notEqual(p.fotos, fotos);
});
test('al desactivar la habitación, registra activa false', () => {
  assert.equal(validarHabitacion({ ...valido, activa: false }).activa, false);
});
test('permite iniciar edición de objeto existente conservando su forma', () => {
  const form = habitacionAFormulario({ ...valido, capacidad: 2,
    camas: ['Matrimonial'], comodidades: ['Wi-Fi'], activa: false });
  assert.equal(form.camas, 'Matrimonial');
  assert.equal(form.capacidad, '2');
  assert.equal(form.activa, false);
  assert.equal(habitacionAFormulario().nombre, HABITACION_VACIA.nombre);
});
test('panel conserva también habitaciones inactivas y ordena por nombre', () => {
  const rows = normalizarListaAdmin([
    { id: 'z', nombre: 'Zeta', activa: false }, { id: 'a', nombre: 'Alfa', activa: true },
    { id: '', nombre: 'Inválida' }, null,
  ]);
  assert.deepEqual(rows.map(x => x.id), ['a', 'z']);
  assert.deepEqual(rows[1].fotos, []);
});
