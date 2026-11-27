'use strict';
// RF-12 / CU-10: aviso por correo ante una SOLICITUD NUEVA.
// La clave privada NUNCA se carga en React ni se guarda en .env de Vite.
// Esta función no cambia montos, estados ni el flujo de creación de solicitudes.
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret, defineString } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const { crearCorreoAdministrativo } = require('./correoContenido');
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
const ADMIN_EMAIL = defineString('ADMIN_EMAIL');
const RESEND_FROM = defineString('RESEND_FROM');
const SITE_URL = defineString('SITE_URL');
// El disparador reacciona a la creación de un documento; no depende de una acción posterior del navegador.
exports.notificarNuevaSolicitud = onDocumentCreated({
  document: 'solicitudes/{solicitudId}',
  region: 'southamerica-west1',
  secrets: [RESEND_API_KEY],
  maxInstances: 3,
  retry: false, // Evita reintentos ilimitados si el proveedor devuelve un error permanente.
}, async (event) => {
  if (!event.data)
    return;
  const solicitudId = event.params.solicitudId;
  const apiKey = RESEND_API_KEY.value();
  const destinatario = ADMIN_EMAIL.value()?.trim();
  const remitente = RESEND_FROM.value()?.trim();
  const siteUrl = SITE_URL.value()?.trim();
  if (!apiKey || !destinatario || !remitente || !siteUrl) {
    logger.error('Notificación no enviada: falta la configuración de Resend.');
    return;
  }
  const correo = crearCorreoAdministrativo(event.data.data(), siteUrl, solicitudId);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Reduce correos duplicados si el mismo evento se procesa más de una vez.
        'Idempotency-Key': `casa-jose-solicitud/${solicitudId}`,
      },
      body: JSON.stringify({
        from: remitente,
        to: [destinatario],
        subject: correo.asunto,
        html: correo.html,
        text: correo.texto,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      // No incluir el cuerpo HTTP en logs: podría contener datos privados.
      logger.error('Resend rechazó la notificación', { solicitudId, status: response.status });
      return;
    }
    logger.info('Notificación al administrador solicitada a Resend', { solicitudId });
  }
  catch (err) {
    logger.error('No fue posible contactar a Resend', { solicitudId, tipo: err?.name || 'Error' });
  }
});
