'use strict';
// Reglas de negocio reutilizables: fáciles de probar sin Firebase.
function parseFecha(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v))
    throw Error('Fecha en formato AAAA-MM-DD incorrecto.');
  const date = new Date(v + 'T12:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== v)
    throw Error('Fecha inexistente.');
  return date;
}
function noches(entrada, salida) {
  const a = parseFecha(entrada), b = parseFecha(salida);
  const n = (b - a) / 86400000;
  if (!Number.isInteger(n) || n < 1 || n > 60)
    throw Error('La estadía debe ser de 1 a 60 noches.');
  return n;
}
function hoyChile(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const x = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${x.year}-${x.month}-${x.day}`;
}
// Valida los datos de entrada de una solicitud antes de consultar tarifas o escribir documentos.
function validarEntrada(data, now = new Date()) {
  if (!data || typeof data !== 'object')
    throw Error('Datos obligatorios.');
  const n = noches(data.fechaEntrada, data.fechaSalida);
  if (data.fechaEntrada < hoyChile(now))
    throw Error('La entrada no puede estar en el pasado.');
  if (typeof data.nombre !== 'string' || data.nombre.trim().length < 3 || data.nombre.trim().length > 80)
    throw Error('Nombre inválido.');
  if (typeof data.email !== 'string' || !/^\S+@\S+\.\S+$/.test(data.email) || data.email.length > 150)
    throw Error('Correo inválido.');
  // Mejora solicitada: teléfono obligatorio en solicitudes NUEVAS, con código internacional opcional.
  // Mantener las solicitudes históricas no implica modificarlas: la validación es al crear.
  if (typeof data.telefono !== 'string' || !/^\+?[0-9 ()-]{7,30}$/.test(data.telefono.trim()))
    throw Error('Teléfono de contacto obligatorio o inválido.');
  const digitosTelefono = data.telefono.replace(/\D/g, '');
  if (digitosTelefono.length < 7 || digitosTelefono.length > 15)
    throw Error('El teléfono debe contener entre 7 y 15 dígitos.');
  if (!Number.isInteger(data.huespedes) || data.huespedes < 1 || data.huespedes > 100)
    throw Error('Huéspedes inválidos.');
  if (typeof data.estacionamientoSolicitado !== 'boolean')
    throw Error('Indica estacionamiento.');
  if (!['es', 'en', 'pt', 'de', 'fr'].includes(data.idioma))
    throw Error('Idioma no admitido.');
  if (!Array.isArray(data.seleccion) || data.seleccion.length < 1 || data.seleccion.length > 12)
    throw Error('Selecciona de 1 a 12 categorías.');
  const seen = new Set();
  for (const line of data.seleccion) {
    if (!line || typeof line.habitacionId !== 'string' || !line.habitacionId || line.habitacionId.length > 200 || !Number.isInteger(line.cantidad) || line.cantidad < 1 || line.cantidad > 20)
      throw Error('Habitación o cantidad incorrecta.');
    if (seen.has(line.habitacionId))
      throw Error('Categoría duplicada.');
    seen.add(line.habitacionId);
  }
  return n;
}
// Selecciona la tarifa vigente más reciente aplicable a la fecha de entrada.
function escogerTarifa(tarifas, fechaEntrada) {
  const cutoff = parseFecha(fechaEntrada).getTime();
  const valid = tarifas.filter(t => t.vigente === true && Number.isSafeInteger(t.precioDirecto) && t.precioDirecto > 0 && t.fechaInicio?.toMillis && t.fechaInicio.toMillis() <= cutoff).sort((a, b) => b.fechaInicio.toMillis() - a.fechaInicio.toMillis());
  if (valid.length > 1 && valid[0].fechaInicio.toMillis() === valid[1].fechaInicio.toMillis())
    throw Error('Hay tarifas vigentes duplicadas con la misma fecha.');
  return valid[0] || null;
}
// Contrato fiscal versionado: los documentos previos sin tipoPrecio son
// históricos con IVA incluido; las tarifas nuevas se crean netas.
function calcularImporteTarifa(precioDirecto, cantidad, n, tipoPrecio = 'iva-incluido') {
  if (!Number.isSafeInteger(precioDirecto) || precioDirecto <= 0 || !Number.isSafeInteger(cantidad) || cantidad < 1 || !Number.isSafeInteger(n) || n < 1)
    throw Error('Importe inválido.');
  if (!['neto', 'iva-incluido'].includes(tipoPrecio))
    throw Error('Tipo de tarifa desconocido.');
  const base = precioDirecto * cantidad * n;
  if (!Number.isSafeInteger(base))
    throw Error('Importe fuera de rango.');
  if (tipoPrecio === 'neto') {
    const iva = Math.round(base * 19 / 100);
    const total = base + iva;
    if (!Number.isSafeInteger(total))
      throw Error('Importe fuera de rango.');
    return { neto: base, iva, total };
  }
  const neto = Math.round(base / 1.19);
  return { neto, iva: base - neto, total: base };
}
module.exports = { parseFecha, noches, hoyChile, validarEntrada, escogerTarifa, calcularImporteTarifa };
