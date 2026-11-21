// ETAPA 04 — Flujo local de solicitudes ficticias; NO es un servidor ni autenticación.
// Solo se guarda información de la estadía en sessionStorage, jamás datos de contacto.
export const DEMO_REQUESTS_KEY = 'casa-de-jose-demo-requests-v1';
const MAX_REQUESTS = 20;
const MAX_ROOMS = 6;

function validarSolicitud(s) {
  return s && typeof s.id === 'string' && /^demo-[a-zA-Z0-9-]{6,}$/.test(s.id)
    && /^\d{4}-\d{2}-\d{2}$/.test(s.fechaEntrada)
    && /^\d{4}-\d{2}-\d{2}$/.test(s.fechaSalida)
    && Number.isInteger(s.huespedes) && s.huespedes >= 1 && s.huespedes <= 100
    && Array.isArray(s.detalleHabitaciones) && s.detalleHabitaciones.length > 0
    && s.detalleHabitaciones.length <= MAX_ROOMS
    && s.detalleHabitaciones.every(d => typeof d.habitacionId === 'string' && d.habitacionId.length < 100
      && Number.isInteger(d.cantidad) && d.cantidad >= 1 && d.cantidad <= 10)
    && ['neto', 'iva', 'totalCotizado'].every(k => Number.isSafeInteger(s[k]) && s[k] >= 0)
    && s.neto + s.iva === s.totalCotizado
    && s.estado === 'Pendiente' && typeof s.createdAt === 'string';
}

export function leerSolicitudesDemo(storage) {
  const texto = storage.getItem(DEMO_REQUESTS_KEY);
  if (!texto) return [];
  let parsed;
  try { parsed = JSON.parse(texto); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(validarSolicitud).slice(0, MAX_REQUESTS);
}

// Se reciben únicamente fechas, habitaciones y sumas. NOMBRE, EMAIL,
// TELÉFONO, COMENTARIOS y otros datos personales se descartan por diseño.
export function crearSolicitudDemo({ entrada, salida, huespedes, vista }, generateId = () => crypto.randomUUID()) {
  const s = {
    id: `demo-${generateId()}`,
    fechaEntrada: entrada,
    fechaSalida: salida,
    huespedes,
    detalleHabitaciones: (vista?.detalles ?? []).map(d => ({ habitacionId: d.habitacionId, cantidad: d.cantidad })),
    neto: vista?.neto,
    iva: vista?.iva,
    totalCotizado: vista?.total,
    estado: 'Pendiente',
    createdAt: new Date().toISOString(),
  };
  if (!validarSolicitud(s)) throw new Error('La cotización de prueba no es válida.');
  return s;
}

// Lista blanca: aunque se agregaran accidentalmente otros campos a la solicitud,
// el almacenamiento solo acepta los datos de prueba enumerados aquí.
function soloCamposDePrueba(s) {
  return {
    id: s.id, fechaEntrada: s.fechaEntrada, fechaSalida: s.fechaSalida,
    huespedes: s.huespedes,
    detalleHabitaciones: s.detalleHabitaciones.map(d => ({ habitacionId: d.habitacionId, cantidad: d.cantidad })),
    neto: s.neto, iva: s.iva, totalCotizado: s.totalCotizado,
    estado: s.estado, createdAt: s.createdAt,
  };
}

export function guardarSolicitudDemo(storage, solicitud) {
  if (!validarSolicitud(solicitud)) throw new Error('Solicitud de prueba inválida.');
  const anteriores = leerSolicitudesDemo(storage);
  if (anteriores.some(s => s.id === solicitud.id)) throw new Error('Esta solicitud ya se guardó.');
  const lista = [soloCamposDePrueba(solicitud), ...anteriores.map(soloCamposDePrueba)].slice(0, MAX_REQUESTS);
  storage.setItem(DEMO_REQUESTS_KEY, JSON.stringify(lista));
  return solicitud.id;
}

export function eliminarSolicitudDemo(storage, id) {
  const previas = leerSolicitudesDemo(storage);
  const restantes = previas.filter(s => s.id !== id);
  if (restantes.length === previas.length) return false;
  storage.setItem(DEMO_REQUESTS_KEY, JSON.stringify(restantes));
  return true;
}
