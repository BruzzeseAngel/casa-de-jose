'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {normalizarComentarios} = require('./comentarios');

test('comentarios ausentes son opcionales y se guardan como null', () => {
  assert.equal(normalizarComentarios(undefined), null);
  assert.equal(normalizarComentarios(null), null);
  assert.equal(normalizarComentarios(''), null);
  assert.equal(normalizarComentarios('   '), null);
});
test('se eliminan espacios externos y se conservan saltos de línea', () => {
  assert.equal(normalizarComentarios('  Llegada tarde\nNecesito cuna  '), 'Llegada tarde\nNecesito cuna');
});
test('acepta exactamente 500 caracteres', () => {
  assert.equal(normalizarComentarios('a'.repeat(500)).length, 500);
});
test('rechaza más de 500 caracteres', () => {
  assert.throws(() => normalizarComentarios('a'.repeat(501)), /500/);
});
test('rechaza tipos distintos de texto', () => {
  assert.throws(() => normalizarComentarios({mensaje:'hola'}), /texto/);
  assert.throws(() => normalizarComentarios(123), /texto/);
});
