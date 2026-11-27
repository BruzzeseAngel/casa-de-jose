'use strict';
// Módulo puro (sin Firebase ni red): fácilmente comprobable con pruebas unitarias.
const limpiar = (valor) => String(valor ?? '').trim();
// Escapa caracteres especiales antes de insertar texto del huésped en el HTML del correo.
const escapar = (valor) => limpiar(valor).replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);
function crearCorreoAdministrativo(solicitud, siteUrl, solicitudId) {
  const sitio = limpiar(siteUrl).replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(sitio))
    throw new Error('SITE_URL debe iniciar con http:// o https://.');
  const urlPanel = `${sitio}/admin`;
  const nombre = limpiar(solicitud?.nombre) || 'Huésped sin nombre';
  const email = limpiar(solicitud?.email) || 'Sin correo';
  const comentarios = limpiar(solicitud?.comentarios) || 'Sin comentarios adicionales';
  const monto = Number(solicitud?.totalCotizado || 0).toLocaleString('es-CL');
  const asunto = 'La Casa de José: nueva solicitud de alojamiento';
  const html = `
    <h2>Nueva solicitud de alojamiento</h2>
    <p><strong>Nombre:</strong> ${escapar(nombre)}</p>
    <p><strong>Correo:</strong> ${escapar(email)}</p>
    <p><strong>Comentarios del huésped:</strong> ${escapar(comentarios)}</p>
    <p><strong>Total cotizado:</strong> ${escapar(monto)} CLP</p>
    <p><strong>Referencia:</strong> ${escapar(solicitudId)}</p>
    <p>La solicitud está pendiente de verificación manual de disponibilidad en Booking.</p>
    <p><a href="${escapar(urlPanel)}">Entrar al panel administrativo</a></p>`;
  const texto = `Nueva solicitud de alojamiento\nNombre: ${nombre}\nCorreo: ${email}\nComentarios del huésped: ${comentarios}\nTotal cotizado: ${monto} CLP\nReferencia: ${solicitudId}\nRevisar disponibilidad antes de confirmar.\nPanel: ${urlPanel}`;
  return { asunto, html, texto, urlPanel };
}
module.exports = { crearCorreoAdministrativo };
