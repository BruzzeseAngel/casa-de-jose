import { addDoc, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, DEMO } from './firebase';
import { normalizarListaAdmin } from './adminRoomsModel.mjs';

function comprobarEscritura() {
  if (DEMO || !db) throw new Error('Modo demostración: los cambios no se almacenan.');
  // Firestore Security Rules debe exigir request.auth.token.admin == true.
  // Este control de interfaz NO reemplaza las reglas de autorización del servidor.
}

export async function obtenerHabitacionesAdmin() {
  if (DEMO || !db) throw new Error('No se puede consultar Firestore en modo demostración.');
  // Lee también habitaciones desactivadas: consulta únicamente para administradores.
  const resultado = await getDocs(collection(db, 'habitaciones'));
  return normalizarListaAdmin(resultado.docs.map(registro => ({ ...registro.data(), id: registro.id })));
}

export async function crearHabitacionAdmin(datos) {
  comprobarEscritura();
  const nueva = await addDoc(collection(db, 'habitaciones'), datos);
  return nueva.id;
}

export async function editarHabitacionAdmin(id, datos) {
  comprobarEscritura();
  if (!id) throw new Error('No se indicó la habitación que se debe editar.');
  await updateDoc(doc(db, 'habitaciones', id), datos);
}

export async function cambiarPublicacionHabitacion(id, activa) {
  comprobarEscritura();
  if (!id) throw new Error('No se indicó la habitación.');
  // Baja lógica. Nunca se eliminan tarifas, fotografías ni referencias históricas.
  await updateDoc(doc(db, 'habitaciones', id), { activa: activa === true });
}
