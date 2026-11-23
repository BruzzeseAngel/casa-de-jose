'use strict';
// Texto libre del huésped: normalización y límites siempre en el servidor.
// null conserva compatibilidad con solicitudes creadas antes de este campo.
function normalizarComentarios(valor) {
  if (valor === undefined || valor === null) return null;
  if (typeof valor !== 'string') throw Error('Los comentarios deben ser texto.');
  const comentarios = valor.trim();
  if (comentarios.length > 500) throw Error('Los comentarios no pueden superar 500 caracteres.');
  return comentarios || null;
}
module.exports = {normalizarComentarios};
