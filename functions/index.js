'use strict';
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { parseFecha, validarEntrada, escogerTarifa, calcularImporteTarifa } = require('./pricing');
const { normalizarComentarios } = require('./comentarios');
initializeApp();
const db = getFirestore();
const REGION = 'us-central1';
// Las funciones invocables concentran las escrituras sensibles; el aviso por correo se activa al crear una solicitud.
const issue = (code, message) => {
  throw new HttpsError(code, message);
};
const isAdmin = request => request.auth?.token?.admin === true;
const safeString = s => String(s ?? '').trim();
// Crea una solicitud pendiente a partir de tarifas reales; no confía en importes enviados por el cliente.
exports.crearSolicitud = onCall({ region: REGION, maxInstances: 5, timeoutSeconds: 60 }, async (request) => {
  const data = request.data || {};
  let n;
  try {
    n = validarEntrada(data);
  }
  catch (e) {
    issue('invalid-argument', e.message);
  }
  let comentarios;
  try {
    comentarios = normalizarComentarios(data.comentarios);
  }
  catch (e) {
    issue('invalid-argument', e.message);
  }
  const detalles = [];
  let total = 0, neto = 0, iva = 0, capacidad = 0;
  for (const item of data.seleccion) {
    const roomRef = db.collection('habitaciones').doc(item.habitacionId);
    const roomSnap = await roomRef.get();
    if (!roomSnap.exists || roomSnap.data().activa !== true)
      issue('failed-precondition', 'Categoría no activa.');
    const h = roomSnap.data();
    if (!Number.isInteger(h.stockTotal) || item.cantidad > h.stockTotal || !Number.isInteger(h.capacidad) || h.capacidad < 1)
      issue('failed-precondition', 'Cantidad superior al stock físico o capacidad inválida.');
    // En el servidor leemos todas las tarifas y seleccionamos la válida para el ingreso.
    const rateSnaps = await roomRef.collection('tarifas').get();
    let rate;
    try {
      rate = escogerTarifa(rateSnaps.docs.map(d => ({ id: d.id, ...d.data() })), data.fechaEntrada);
    }
    catch (e) {
      issue('failed-precondition', e.message);
    }
    if (!rate)
      issue('failed-precondition', `No hay tarifa vigente para ${h.nombre}.`);
    let calculo;
    try {
      calculo = calcularImporteTarifa(rate.precioDirecto, item.cantidad, n, rate.tipoPrecio || 'iva-incluido');
    }
    catch (e) {
      issue('failed-precondition', e.message);
    }
    total += calculo.total;
    neto += calculo.neto;
    iva += calculo.iva;
    capacidad += h.capacidad * item.cantidad;
    // subtotal sigue significando importe FINAL por categoría; tarifaAplicada
    // conserva el valor unitario almacenado, indicando cómo se interpretó.
    detalles.push({
      habitacionId: roomSnap.id,
      cantidad: item.cantidad,
      tarifaAplicada: rate.precioDirecto,
      tipoPrecio: rate.tipoPrecio || 'iva-incluido',
      subtotal: calculo.total,
      subtotalNeto: calculo.neto,
      iva: calculo.iva
    });
  }
  if (data.huespedes > capacidad)
    issue('invalid-argument', 'Los huéspedes superan la capacidad seleccionada.');
  if (![total, neto, iva].every(Number.isSafeInteger) || total <= 0)
    issue('invalid-argument', 'Importe inválido.');
  // El modelo respeta el diccionario 6.3: totalCotizado y detalleHabitaciones[].
  const solicitud = {
    nombre: safeString(data.nombre),
    email: safeString(data.email).toLowerCase(),
    telefono: safeString(data.telefono) || null,
    comentarios,
    fechaEntrada: Timestamp.fromDate(parseFecha(data.fechaEntrada)),
    fechaSalida: Timestamp.fromDate(parseFecha(data.fechaSalida)),
    huespedes: data.huespedes,
    estacionamientoSolicitado: data.estacionamientoSolicitado,
    idioma: data.idioma,
    estado: 'Pendiente',
    totalCotizado: total,
    netoCotizado: neto,
    ivaCotizado: iva,
    createdAt: FieldValue.serverTimestamp(),
    detalleHabitaciones: detalles
  };
  if (request.auth?.uid)
    solicitud.usuarioId = request.auth.uid;
  const ref = await db.collection('solicitudes').add(solicitud);
  return {
    solicitudId: ref.id,
    totalCotizado: total,
    netoCotizado: neto,
    ivaCotizado: iva,
    estado: 'Pendiente',
    noches: n
  };
});
// El control administrativo y la transacción permiten validar tarifas antes de guardarlas.
exports.guardarTarifa = onCall({ region: REGION, maxInstances: 5 }, async (request) => {
  if (!isAdmin(request))
    issue('permission-denied', 'Solo administradores.');
  const data = request.data || {};
  if (typeof data.habitacionId !== 'string' || !data.habitacionId)
    issue('invalid-argument', 'Habitación obligatoria.');
  if (!Number.isSafeInteger(data.precioDirecto) || data.precioDirecto < 1)
    issue('invalid-argument', 'Precio directo debe ser un entero positivo.');
  if (data.precioReferencia !== null && data.precioReferencia !== undefined && (!Number.isSafeInteger(data.precioReferencia) || data.precioReferencia < 1))
    issue('invalid-argument', 'Referencia inválida.');
  if (typeof data.vigente !== 'boolean')
    issue('invalid-argument', 'Vigencia obligatoria.');
  // Sólo las tarifas nuevas se crean netas. Se permite conservar el tipo
  // heredado en un registro existente exclusivamente al activar/desactivar.
  const tipoPrecio = data.tipoPrecio ?? 'neto';
  if (!['neto', 'iva-incluido'].includes(tipoPrecio))
    issue('invalid-argument', 'Tipo de tarifa desconocido.');
  if (tipoPrecio === 'iva-incluido' && !data.tarifaId)
    issue('invalid-argument', 'Las tarifas nuevas deben ser netas.');
  let start;
  try {
    start = parseFecha(data.fechaInicio);
  }
  catch (e) {
    issue('invalid-argument', e.message);
  }
  const roomRef = db.collection('habitaciones').doc(data.habitacionId);
  const rateRef = data.tarifaId ? roomRef.collection('tarifas').doc(data.tarifaId) : roomRef.collection('tarifas').doc();
  await db.runTransaction(async (tx) => {
    const room = await tx.get(roomRef);
    if (!room.exists)
      issue('not-found', 'La habitación no existe.');
    const existing = await tx.get(roomRef.collection('tarifas'));
    const anterior = data.tarifaId ? existing.docs.find(d => d.id === data.tarifaId) : null;
    if (data.tarifaId && !anterior)
      issue('not-found', 'La tarifa no existe.');
    if (tipoPrecio === 'iva-incluido') {
      const old = anterior.data();
      // Sólo se autoriza conservar el esquema antiguo al cambiar la vigencia,
      // sin alterar montos o fecha. Editar un precio siempre crea esquema neto.
      if (old.tipoPrecio === 'neto' || old.precioDirecto !== data.precioDirecto ||
        (old.precioReferencia ?? null) !== (data.precioReferencia ?? null) ||
        old.fechaInicio?.toMillis() !== Timestamp.fromDate(start).toMillis())
        issue('invalid-argument', 'La tarifa heredada sólo puede cambiar su vigencia. Para editar el precio usa la tarifa neta.');
    }
    // Dos tarifas vigentes con la misma fecha de inicio ocasionarían ambigüedad.
    const collision = existing.docs.find(d => d.id !== rateRef.id && d.data().vigente === true && data.vigente === true && d.data().fechaInicio?.toMillis() === Timestamp.fromDate(start).toMillis());
    if (collision)
      issue('already-exists', 'Ya existe una tarifa vigente con esa fecha de inicio.');
    tx.set(rateRef, {
      precioDirecto: data.precioDirecto,
      precioReferencia: data.precioReferencia ?? null,
      fechaInicio: Timestamp.fromDate(start),
      vigente: data.vigente,
      tipoPrecio
    });
  });
  return { tarifaId: rateRef.id };
});
// Actualiza contacto y estado, y registra la modificación en el historial sin recalcular el precio histórico.
exports.actualizarSolicitud = onCall({ region: REGION, maxInstances: 5 }, async (request) => {
  if (!isAdmin(request))
    issue('permission-denied', 'Solo administradores.');
  const data = request.data || {};
  if (typeof data.solicitudId !== 'string' || !data.solicitudId)
    issue('invalid-argument', 'ID de solicitud obligatorio.');
  const estados = ['Pendiente', 'Confirmada', 'Rechazada', 'Archivada'];
  if (!estados.includes(data.estado))
    issue('invalid-argument', 'Estado no permitido.');
  if (typeof data.nombre !== 'string' || data.nombre.trim().length < 3 || data.nombre.trim().length > 80)
    issue('invalid-argument', 'Nombre inválido.');
  if (typeof data.email !== 'string' || !/^\S+@\S+\.\S+$/.test(data.email) || data.email.length > 150)
    issue('invalid-argument', 'Correo inválido.');
  if (typeof data.telefono !== 'string' || data.telefono.length > 30)
    issue('invalid-argument', 'Teléfono inválido.');
  if (typeof data.observaciones !== 'string' || data.observaciones.length > 500)
    issue('invalid-argument', 'Observación demasiado extensa.');
  const ref = db.collection('solicitudes').doc(data.solicitudId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists)
      issue('not-found', 'Solicitud no encontrada.');
    const old = snap.data();
    if (data.estado === 'Confirmada' && old.estado !== 'Confirmada' && data.verificacionManual !== true)
      issue('failed-precondition', 'Debes verificar la disponibilidad en Booking antes de confirmar.');
    // No se modifica el total ni las tarifas originales: trazabilidad y precio histórico.
    tx.update(ref, {
      nombre: data.nombre.trim(),
      email: data.email.trim().toLowerCase(),
      telefono: data.telefono.trim() || null,
      estado: data.estado
    });
    const accion = old.estado === data.estado ? 'Actualización de contacto' : `Cambio de estado: ${old.estado} → ${data.estado}`;
    let observaciones = data.observaciones.trim();
    if (data.verificacionManual)
      observaciones = `Disponibilidad revisada manualmente en Booking. ${observaciones}`.trim();
    tx.create(ref.collection('historial').doc(), {
      accion,
      fechaCambio: FieldValue.serverTimestamp(),
      administradorId: request.auth.uid,
      observaciones: observaciones || null
    });
  });
  return { solicitudId: ref.id, estado: data.estado };
});
// La notificación se mantiene en módulo separado para no modificar los tres CRUD.
// Se ejecuta únicamente al crearse /solicitudes/{solicitudId}.
exports.notificarNuevaSolicitud = require('./notificarNuevaSolicitud').notificarNuevaSolicitud;
