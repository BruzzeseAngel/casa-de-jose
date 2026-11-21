import test from 'node:test';
import assert from 'node:assert/strict';
import { codigoAcceso, revisarConfiguracionFirebase } from '../src/lib/authConfig.mjs';

test('sin variables se mantiene demostración', () => {
  assert.deepEqual(revisarConfiguracionFirebase({}), { modo: 'demo', faltantes: [] });
});
test('una configuración parcial no inicia Firebase', () => {
  const r = revisarConfiguracionFirebase({ VITE_DEMO_MODE: 'false', VITE_FIREBASE_API_KEY: 'a' });
  assert.equal(r.modo, 'incompleto');
  assert.ok(r.faltantes.includes('VITE_FIREBASE_PROJECT_ID'));
});
test('se reconoce una configuración web completa', () => {
  const r = revisarConfiguracionFirebase({
    VITE_DEMO_MODE: 'false', VITE_FIREBASE_API_KEY: 'a', VITE_FIREBASE_AUTH_DOMAIN: 'dom',
    VITE_FIREBASE_PROJECT_ID: 'proyecto', VITE_FIREBASE_APP_ID: 'app',
  });
  assert.equal(r.modo, 'firebase');
  assert.deepEqual(r.faltantes, []);
});
test('los errores de inicio de sesión tienen códigos manejables', () => {
  assert.equal(codigoAcceso({ code: 'auth/invalid-credential' }), 'credentials');
  assert.equal(codigoAcceso({ code: 'auth/too-many-requests' }), 'throttle');
  assert.equal(codigoAcceso({ code: 'auth/unknown' }), 'generic');
});
