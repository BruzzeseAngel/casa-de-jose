// Reglas puras para el formulario del CRUD de habitaciones.
// El resultado respeta el esquema de /habitaciones/{habitacionId} en Firestore.
export const HABITACION_VACIA = Object.freeze({
  nombre: '', capacidad: '2', stockTotal: '1', tamanoM2: '20',
  camas: '', comodidades: '', activa: false,
});

export function listaATexto(valor) {
  return Array.isArray(valor) ? valor.filter(x => typeof x === 'string').join(', ') : '';
}

export function textoALista(valor) {
  return String(valor ?? '').split(',').map(x => x.trim()).filter(Boolean);
}

export function habitacionAFormulario(habitacion = null) {
  if (!habitacion) return { ...HABITACION_VACIA };
  return {
    nombre: habitacion.nombre ?? '',
    capacidad: String(habitacion.capacidad ?? ''),
    stockTotal: String(habitacion.stockTotal ?? ''),
    tamanoM2: String(habitacion.tamanoM2 ?? ''),
    camas: listaATexto(habitacion.camas),
    comodidades: listaATexto(habitacion.comodidades),
    activa: habitacion.activa === true,
  };
}

function enteroPositivo(valor, etiqueta) {
  // Number('') y Number(' ') devuelven 0: nunca aceptamos entradas vacías.
  if (String(valor ?? '').trim() === '') throw new Error(`${etiqueta} es obligatorio.`);
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero) || numero < 1) {
    throw new Error(`${etiqueta} debe ser un entero positivo.`);
  }
  return numero;
}

export function validarHabitacion(formulario, fotosExistentes = []) {
  if (!formulario || typeof formulario !== 'object') throw new Error('Formulario inválido.');
  const nombre = String(formulario.nombre ?? '').trim();
  if (nombre.length < 2 || nombre.length > 100) throw new Error('El nombre debe tener entre 2 y 100 caracteres.');
  const capacidad = enteroPositivo(formulario.capacidad, 'La capacidad');
  const stockTotal = enteroPositivo(formulario.stockTotal, 'El stock');
  const superficieTexto = String(formulario.tamanoM2 ?? '').trim();
  const tamanoM2 = Number(superficieTexto);
  if (!superficieTexto || !Number.isFinite(tamanoM2) || tamanoM2 <= 0) {
    throw new Error('La superficie debe ser un número positivo.');
  }
  if (capacidad > 50 || stockTotal > 500 || tamanoM2 > 10000) {
    throw new Error('Revisa la capacidad, el stock o la superficie: exceden los límites permitidos.');
  }
  const camas = textoALista(formulario.camas);
  const comodidades = textoALista(formulario.comodidades);
  if (!camas.length) throw new Error('Indica al menos un tipo de cama.');
  if (camas.length > 20 || comodidades.length > 40 || [...camas, ...comodidades].some(x => x.length > 120)) {
    throw new Error('Revisa las listas de camas y comodidades.');
  }
  // Preservar las fotos existentes; el módulo de Storage llegará en la etapa 0.8.
  const fotos = Array.isArray(fotosExistentes) ? fotosExistentes.filter(x => typeof x === 'string') : [];
  return { nombre, capacidad, stockTotal, tamanoM2, camas, comodidades, fotos, activa: formulario.activa === true };
}

export function normalizarListaAdmin(documentos) {
  return (Array.isArray(documentos) ? documentos : [])
    .filter(x => x && typeof x.id === 'string' && x.id.trim())
    .map(x => ({ ...x, fotos: Array.isArray(x.fotos) ? x.fotos : [],
      camas: Array.isArray(x.camas) ? x.camas : [],
      comodidades: Array.isArray(x.comodidades) ? x.comodidades : [] }))
    .sort((a, b) => String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es'));
}
