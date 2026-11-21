import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEMO_REQUESTS_KEY, crearSolicitudDemo, guardarSolicitudDemo,
  eliminarSolicitudDemo, leerSolicitudesDemo,
} from '../src/lib/demoRequests.mjs';

function memoria() {
  const map = new Map();
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, String(value)),
  };
}
const datos = () => ({
  entrada: '2026-12-01', salida: '2026-12-04', huespedes: 2,
  vista: {
    neto: 186000, iva: 35340, total: 221340,
    detalles: [{ habitacionId: 'doble-estandar', cantidad: 1 }],
  },
  nombre: 'Persona privada', email: 'privado@ejemplo.cl',
  contacto: { nombre: 'Ficticio', email: 'privado@ejemplo.cl', telefono: '12345' },
  comentarios: 'información sensible',
});

test('genera estructura de solicitud compatible con modelo del hostal', () => {
  const s = crearSolicitudDemo(datos(), () => 'abcde12345');
  assert.equal(s.id, 'demo-abcde12345');
  assert.equal(s.estado, 'Pendiente');
  assert.equal(s.fechaEntrada, '2026-12-01');
  assert.equal(s.totalCotizado, 221340);
  assert.deepEqual(s.detalleHabitaciones, [{ habitacionId: 'doble-estandar', cantidad: 1 }]);
});

test('no guarda ni nombre, ni correo, ni teléfono, ni comentarios', () => {
  const storage = memoria();
  const s = crearSolicitudDemo(datos(), () => 'abcde12345');
  guardarSolicitudDemo(storage, s);
  const text = storage.getItem(DEMO_REQUESTS_KEY);
  for (const privateText of ['privado', 'email', 'telefono', 'contacto', 'comentarios', 'Ficticio']) {
    assert.equal(text.includes(privateText), false, `${privateText} no debe persistir`);
  }
});

test('la escritura descarta extras aunque alguien los incluya en el objeto', () => {
  const storage = memoria();
  const s = { ...crearSolicitudDemo(datos(), () => 'abcde12345'), contacto: { email: 'no@guardar.cl' }, comentarios: 'secretos' };
  guardarSolicitudDemo(storage, s);
  assert.equal(storage.getItem(DEMO_REQUESTS_KEY).includes('no@guardar.cl'), false);
  assert.equal(storage.getItem(DEMO_REQUESTS_KEY).includes('secretos'), false);
});

test('guarda y lee solicitudes en orden nuevo primero', () => {
  const storage = memoria();
  const one = crearSolicitudDemo(datos(), () => 'abcde12345');
  const two = crearSolicitudDemo(datos(), () => 'abcde98765');
  guardarSolicitudDemo(storage, one);
  guardarSolicitudDemo(storage, two);
  assert.deepEqual(leerSolicitudesDemo(storage).map(s => s.id), [two.id, one.id]);
});

test('rechaza duplicados para evitar doble pulsación', () => {
  const storage = memoria();
  const one = crearSolicitudDemo(datos(), () => 'abcde12345');
  guardarSolicitudDemo(storage, one);
  assert.throws(() => guardarSolicitudDemo(storage, one), /ya se guardó/);
});

test('permite eliminar una solicitud por ID sin borrar otras', () => {
  const storage = memoria();
  const one = crearSolicitudDemo(datos(), () => 'abcde12345');
  const two = crearSolicitudDemo(datos(), () => 'abcde98765');
  guardarSolicitudDemo(storage, one);
  guardarSolicitudDemo(storage, two);
  assert.equal(eliminarSolicitudDemo(storage, one.id), true);
  assert.deepEqual(leerSolicitudesDemo(storage).map(s => s.id), [two.id]);
  assert.equal(eliminarSolicitudDemo(storage, one.id), false);
});

test('ignora JSON dañado y estructuras incompatibles', () => {
  const storage = memoria();
  storage.setItem(DEMO_REQUESTS_KEY, '{invalid');
  assert.deepEqual(leerSolicitudesDemo(storage), []);
  storage.setItem(DEMO_REQUESTS_KEY, JSON.stringify([{ id: 'fake', estado: 'Confirmada' }]));
  assert.deepEqual(leerSolicitudesDemo(storage), []);
});

test('rechaza cotizaciones inválidas o sin detalles de habitaciones', () => {
  assert.throws(() => crearSolicitudDemo({ ...datos(), vista: null }, () => 'abcde12345'), /no es válida/);
  assert.throws(() => crearSolicitudDemo({ ...datos(), huespedes: -1 }, () => 'abcde12345'), /no es válida/);
  assert.throws(() => crearSolicitudDemo({ ...datos(), vista: { ...datos().vista, total: 1 } }, () => 'abcde12345'), /no es válida/);
});

test('si se bloquea sessionStorage, propaga el fallo y nunca finge que guardó', () => {
  const blocked = { getItem: () => { throw new Error('sessionStorage bloqueado'); } };
  assert.throws(() => guardarSolicitudDemo(blocked, crearSolicitudDemo(datos(), () => 'abcde12345')), /bloqueado/);
});
