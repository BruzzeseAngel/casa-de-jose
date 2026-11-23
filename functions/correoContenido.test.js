'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {crearCorreoAdministrativo} = require('./correoContenido');

test('correo crea un enlace al panel y conserva el importe final en CLP', () => {
  const correo = crearCorreoAdministrativo({nombre:'Cliente de prueba',email:'ejemplo@test.cl',totalCotizado:85680}, 'https://ejemplo.web.app/', 'abc123');
  assert.equal(correo.urlPanel, 'https://ejemplo.web.app/admin');
  assert.match(correo.texto, /85\.680 CLP/);
  assert.match(correo.html, /abc123/);
});
test('correo escapa HTML proveniente de la solicitud', () => {
  const correo = crearCorreoAdministrativo({nombre:'<script>alert(1)</script>',email:'a@b.cl',totalCotizado:10000}, 'http://localhost:5173', 'id');
  assert.ok(!correo.html.includes('<script>'));
  assert.ok(correo.html.includes('&lt;script&gt;'));
});
test('URL base no admite protocolos inseguros', () => {
  assert.throws(() => crearCorreoAdministrativo({},'javascript:alert(1)','id'), /SITE_URL/);
});

test('el correo incorpora los comentarios sin permitir HTML inyectado', () => {
  const correo = crearCorreoAdministrativo({nombre:'Huésped',email:'a@b.cl',comentarios:'<img src=x onerror=alert(1)>',totalCotizado:1}, 'https://ejemplo.web.app', 'abc');
  assert.ok(!correo.html.includes('<img src=x'));
  assert.ok(correo.html.includes('&lt;img'));
  assert.match(correo.texto, /Comentarios del huésped:/);
});
test('el correo sigue funcionando si la solicitud histórica no tenía comentarios', () => {
  const correo = crearCorreoAdministrativo({nombre:'Huésped',email:'a@b.cl',totalCotizado:1}, 'https://ejemplo.web.app', 'abc');
  assert.match(correo.html, /Sin comentarios adicionales/);
});
