// Adaptador de SOLO LECTURA. Las escrituras de negocio llegarán en otras etapas.
import { collection, getDocs, query, where } from 'firebase/firestore';
import { DEMO, db } from './firebase';
import { DEMO_ROOMS, DEMO_SERVICES, DEMO_RATES } from './demo';
import { normalizarHabitaciones, normalizarServicios, normalizarTarifas, tarifasPorId } from './catalogModel.mjs';

const documentos = snapshot => snapshot.docs.map(d => ({ ...d.data(), id: d.id }));

export async function obtenerCatalogoPublico() {
  if (DEMO) return {
    rooms: normalizarHabitaciones(DEMO_ROOMS),
    services: normalizarServicios(DEMO_SERVICES),
    rates: DEMO_RATES,
    errorTarifas: false,
  };
  if (!db) throw new Error('Configuración de Firebase incompleta. Revisa las variables VITE_FIREBASE_*.');

  // Solo se consultan los documentos activos. No exponemos información del panel administrador.
  const [roomsSnapshot, servicesSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'habitaciones'), where('activa', '==', true))),
    getDocs(query(collection(db, 'servicios'), where('activo', '==', true))),
  ]);
  const rooms = normalizarHabitaciones(documentos(roomsSnapshot));
  const services = normalizarServicios(documentos(servicesSnapshot));

  // Tarifas: una subcolección por habitación, asociada a su ID.
  // Si falla una consulta, NO se reemplaza por tarifas ficticias: se avisa en la UI.
  const resultados = await Promise.allSettled(rooms.map(room =>
    getDocs(collection(db, 'habitaciones', room.id, 'tarifas')).then(documentos)
  ));
  const errorTarifas = resultados.some(r => r.status === 'rejected');
  if (errorTarifas) console.warn('Alguna consulta pública de tarifas no pudo completarse. Revisa las reglas y la conexión.');
  const rates = tarifasPorId(rooms, resultados.map(r => r.status === 'fulfilled' ? normalizarTarifas(r.value) : []));
  return { rooms, services, rates, errorTarifas };
}
