// Transformaciones puras: no importan Firebase, React ni servicios externos.
// Mantienen el esquema /habitaciones/{id}, /servicios/{id} y /habitaciones/{id}/tarifas.
const textos = valor => Array.isArray(valor)
  ? valor.filter(v => typeof v === 'string' && v.trim()).map(v => v.trim())
  : [];
const numero = valor => Number.isFinite(Number(valor)) && Number(valor) >= 0 ? Number(valor) : 0;

export function normalizarHabitaciones(documentos) {
  return (Array.isArray(documentos) ? documentos : [])
    .filter(h => h && typeof h.id === 'string' && h.id.trim() && h.activa === true)
    .map((h, index) => ({
      ...h,
      id: h.id,
      nombre: typeof h.nombre === 'string' ? h.nombre : '',
      capacidad: numero(h.capacidad),
      stockTotal: numero(h.stockTotal),
      tamanoM2: numero(h.tamanoM2),
      camas: textos(h.camas),
      comodidades: textos(h.comodidades),
      fotos: textos(h.fotos),
      index,
    }));
}

export function normalizarServicios(documentos) {
  return (Array.isArray(documentos) ? documentos : [])
    .filter(s => s && typeof s.id === 'string' && s.id.trim() && s.activo === true)
    .map(s => ({
      ...s,
      nombre: typeof s.nombre === 'string' ? s.nombre : '',
      categoria: typeof s.categoria === 'string' ? s.categoria : '',
      modalidad: typeof s.modalidad === 'string' ? s.modalidad : '',
      descripcion: typeof s.descripcion === 'string' ? s.descripcion : '',
      fotos: textos(s.fotos),
    }));
}

export function normalizarTarifas(documentos) {
  return (Array.isArray(documentos) ? documentos : []).filter(t => t && t.vigente === true);
}

// No convierte las fechas Timestamp de Firestore a cadenas: quote.mjs ya las interpreta.
export function tarifasPorId(habitaciones, arreglosDeTarifas) {
  return Object.fromEntries(habitaciones.map((habitacion, i) => [
    habitacion.id,
    normalizarTarifas(arreglosDeTarifas[i]),
  ]));
}
