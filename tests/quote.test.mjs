import test from 'node:test';
import assert from 'node:assert/strict';
import {
  nochesEntre, seleccionarTarifa, vistaCotizacion, calcularImporteTarifa,
} from '../src/lib/quote.mjs';
import { DEMO_ROOMS, DEMO_RATES } from '../src/lib/demo.js';

const room = { id: 'a', nombre: 'Prueba', capacidad: 2, stockTotal: 3, activa: true };
const rate = (date, price, tipoPrecio = 'neto') => ({
  vigente: true, fechaInicio: date, precioDirecto: price, tipoPrecio,
});

test('calcula 1 y 3 noches, y rechaza salida previa o estadía mayor de 60 noches', () => {
  assert.equal(nochesEntre('2027-02-01', '2027-02-02'), 1);
  assert.equal(nochesEntre('2027-02-01', '2027-02-04'), 3);
  assert.equal(nochesEntre('2027-02-04', '2027-02-01'), 0);
  assert.equal(nochesEntre('2027-02-01', '2027-05-01'), 0);
});

test('elige la tarifa vigente con fecha de inicio más reciente aplicable', () => {
  const list = [rate('2026-01-01', 50_000), rate('2027-03-01', 90_000)];
  assert.equal(seleccionarTarifa(list, '2027-02-10').precioDirecto, 50_000);
  assert.equal(seleccionarTarifa(list, '2027-03-10').precioDirecto, 90_000);
  assert.equal(seleccionarTarifa([], '2027-02-10'), null);
});

test('desglosa precio neto más IVA del 19%', () => {
  assert.deepEqual(calcularImporteTarifa(62_000, 1, 2, 'neto'), {
    neto: 124_000, iva: 23_560, total: 147_560,
  });
});

test('cotiza cantidades respetando capacidad y stock', () => {
  const resultado = vistaCotizacion({
    entrada: '2027-02-10', salida: '2027-02-12',
    seleccion: [{ habitacionId: 'a', cantidad: 2 }],
    habitaciones: [room], tarifasPorHabitacion: { a: [rate('2026-01-01', 40_000)] },
  });
  assert.equal(resultado.noches, 2);
  assert.equal(resultado.capacidad, 4);
  assert.equal(resultado.neto, 160_000);
  assert.equal(resultado.iva, 30_400);
  assert.equal(resultado.total, 190_400);

  assert.equal(vistaCotizacion({
    entrada: '2027-02-10', salida: '2027-02-12',
    seleccion: [{ habitacionId: 'a', cantidad: 4 }],
    habitaciones: [room], tarifasPorHabitacion: { a: [rate('2026-01-01', 40_000)] },
  }), null);
});

test('todas las habitaciones demo tienen una tarifa activa y se pueden cotizar', () => {
  for (const habitacion of DEMO_ROOMS) {
    const tarifa = DEMO_RATES[habitacion.id];
    assert.ok(Array.isArray(tarifa) && tarifa.length > 0);
    const resultado = vistaCotizacion({
      entrada: '2027-02-10', salida: '2027-02-12',
      seleccion: [{ habitacionId: habitacion.id, cantidad: 1 }],
      habitaciones: DEMO_ROOMS, tarifasPorHabitacion: DEMO_RATES,
    });
    assert.ok(resultado && resultado.total > resultado.neto);
    assert.equal(resultado.total, resultado.neto + resultado.iva);
  }
});


test('suma varias categorías y separa neto, IVA y total', () => {
  const habitaciones = [room, { id: 'b', nombre: 'Suite', capacidad: 3, stockTotal: 2, activa: true }];
  const resultado = vistaCotizacion({
    entrada: '2027-02-10', salida: '2027-02-12',
    seleccion: [{ habitacionId: 'a', cantidad: 1 }, { habitacionId: 'b', cantidad: 1 }],
    habitaciones, tarifasPorHabitacion: {
      a: [rate('2026-01-01', 40_000)], b: [rate('2026-01-01', 100_000)],
    },
  });
  assert.equal(resultado.detalles.length, 2);
  assert.equal(resultado.noches, 2);
  assert.equal(resultado.capacidad, 5);
  assert.equal(resultado.neto, 280_000);
  assert.equal(resultado.iva, 53_200);
  assert.equal(resultado.total, 333_200);
});
