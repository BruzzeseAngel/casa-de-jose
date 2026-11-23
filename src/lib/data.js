import {collection,doc,getDoc,getDocs,query,where,addDoc,setDoc,updateDoc,deleteDoc,arrayRemove,runTransaction,serverTimestamp} from 'firebase/firestore';
import {getDownloadURL,getMetadata,ref,uploadBytes,deleteObject} from 'firebase/storage';
import {httpsCallable} from 'firebase/functions';
import {DEMO,db,storage,functions} from './firebase';
import {DEMO_ROOMS,DEMO_SERVICES} from './demo';
import {fotosValidas,mismoConjuntoDeFotos} from './photoManagement.mjs';

// Aquí quedan todas las consultas a Firestore, separadas de la presentación React.
const asItems = snap => snap.docs.map(d=>({id:d.id,...d.data()}));
export async function obtenerHabitaciones(administrador=false) {
  if(DEMO) return DEMO_ROOMS;
  const coll=collection(db,'habitaciones');
  return asItems(await getDocs(administrador?coll:query(coll,where('activa','==',true))));
}
export async function obtenerTarifas(habitacionId) {
  if(DEMO) return DEMO_ROOMS.find(h=>h.id===habitacionId)?.tarifas||[];
  return asItems(await getDocs(collection(db,'habitaciones',habitacionId,'tarifas')));
}
export async function obtenerServicios(administrador=false) {
  if(DEMO) return DEMO_SERVICES;
  const coll=collection(db,'servicios');
  return asItems(await getDocs(administrador?coll:query(coll,where('activo','==',true))));
}
export async function obtenerMisSolicitudes(uid) {
  if(DEMO) return [];
  // Firestore verifica usuarioId == UID gracias a esta consulta restringida.
  return asItems(await getDocs(query(collection(db,'solicitudes'),where('usuarioId','==',uid))));
}
export async function obtenerSolicitudesAdmin() {
  if(DEMO) return [];
  return asItems(await getDocs(collection(db,'solicitudes')));
}
export async function obtenerHistorial(id) {
  if(DEMO) return [];
  return asItems(await getDocs(collection(db,'solicitudes',id,'historial')));
}
export async function guardarHabitacion(payload,id=null) {
  if(DEMO) throw Error('Desactiva el modo demostración para guardar información.');
  if(id) {await updateDoc(doc(db,'habitaciones',id),payload);return id;}
  const refNueva=await addDoc(collection(db,'habitaciones'),payload);return refNueva.id;
}
export async function cambiarHabitacion(h) {
  if(DEMO) throw Error('No disponible en demo.');
  await updateDoc(doc(db,'habitaciones',h.id),{activa:!h.activa});
}
// RF-07: eliminación LÓGICA de categorías; no borramos tarifas ni fotografías.
// Las solicitudes anteriores referencian el habitacionId y deben mantenerse intactas.
export async function eliminarHabitacion(habitacionId) {
  if(DEMO) throw Error('No disponible en demo.');
  if(!habitacionId) throw Error('No se indicó la categoría que se quiere eliminar.');
  // Idempotente: fijamos false (no alternamos el estado por accidente).
  await updateDoc(doc(db,'habitaciones',habitacionId),{activa:false});
}

// Una categoría eliminada lógicamente se puede volver a publicar.
export async function restaurarHabitacion(habitacionId) {
  if(DEMO) throw Error('No disponible en demo.');
  if(!habitacionId) throw Error('No se indicó la categoría que se quiere restaurar.');
  await updateDoc(doc(db,'habitaciones',habitacionId),{activa:true});
}
// CU-09 ampliado: alta de servicios con el esquema existente de /servicios.
export async function crearServicio(payload){
  if(DEMO) throw Error('No disponible en demostración.');
  const nombre=String(payload.nombre||'').trim();
  const categoria=String(payload.categoria||'').trim();
  const modalidad=String(payload.modalidad||'').trim();
  const descripcion=String(payload.descripcion||'').trim();
  if(!nombre||!categoria||!modalidad||!descripcion)throw Error('Completa todos los datos del servicio.');
  if([nombre,categoria,modalidad].some(v=>v.length>100)||descripcion.length>500)throw Error('El texto del servicio es demasiado largo.');
  const refNuevo=await addDoc(collection(db,'servicios'),{nombre,categoria,modalidad,descripcion,activo:Boolean(payload.activo),fotos:[],mostrarPortada:Boolean(payload.mostrarPortada)});
  return refNuevo.id;
}
export async function guardarServicio(id,changes) {
  if(DEMO) throw Error('No disponible en demo.');
  await updateDoc(doc(db,'servicios',id),changes);
}

// -----------------------------------------------------------------------------
// GESTOR DE FOTOGRAFÍAS: habitaciones, servicios y portada independiente.
// La lista de imágenes visibles está en Firestore, no en el directorio de Storage.
// Borrar un archivo manualmente NO quita su URL del documento de Firestore.
// -----------------------------------------------------------------------------
const PORTADA = DEMO ? null : doc(db, 'configuracion', 'portada');
const portadaInicial = {fotos: [], incluirFotosServicios: true};

export async function obtenerConfiguracionPortada() {
  if (DEMO) return {...portadaInicial};
  const snap = await getDoc(PORTADA);
  return snap.exists() ? {...portadaInicial, ...snap.data(), fotos: fotosValidas(snap.data().fotos)} : {...portadaInicial};
}

export async function guardarConfiguracionPortada(cambios) {
  if (DEMO) throw Error('No disponible en demostración.');
  // Colección técnica de configuración, NO nuevo módulo CRUD de negocio.
  await setDoc(PORTADA, cambios, {merge: true});
}

function validarArchivoImagen(file) {
  if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size >= 5 * 1024 * 1024) {
    throw Error('Solo se permiten imágenes JPG, PNG o WebP menores de 5 MB.');
  }
}

async function subirFotoEnCarpeta(carpeta, archivo) {
  if (DEMO) throw Error('No disponible en demostración.');
  validarArchivoImagen(archivo);
  const nombreUnico = `${crypto.randomUUID()}`;
  const destino = ref(storage, `${carpeta}/${nombreUnico}`);
  await uploadBytes(destino, archivo, {contentType: archivo.type});
  return getDownloadURL(destino);
}

export const subirFoto = (habitacionId, file) => subirFotoEnCarpeta(`habitaciones/${habitacionId}`, file);
export const subirFotoServicio = (servicioId, file) => subirFotoEnCarpeta(`servicios/${servicioId}`, file);
export const subirFotoPortada = file => subirFotoEnCarpeta('portada', file);

// Los objetos antiguos del mismo bucket pueden estar eliminados. Comprobarlos
// exige un GET de metadatos; los fallos de red/permisos NO se interpretan como inexistentes.
export async function detectarFotosInexistentes(fotos) {
  if (DEMO) return [];
  const ausentes = [];
  for (const url of fotosValidas(fotos)) {
    // No verificamos ni eliminamos imágenes alojadas en sitios ajenos.
    if (!url.startsWith('https://firebasestorage.googleapis.com/') && !url.startsWith('gs://')) continue;
    let archivo;
    try { archivo = ref(storage, url); }
    catch { continue; }
    try { await getMetadata(archivo); }
    catch (e) {
      if (e.code === 'storage/object-not-found') ausentes.push(url);
      else throw new Error(`No se pudieron comprobar todas las fotos: ${e.message}`);
    }
  }
  return ausentes;
}

// Solamente la URL pertenece a la carpeta esperada. Nunca borrar fotografías
// de otra habitación, de otro servicio ni de un bucket diferente.
function archivoPropio(url, carpeta) {
  if (!url || !url.startsWith('https://firebasestorage.googleapis.com/')) return null;
  try {
    const objeto = ref(storage, url);
    return objeto.bucket === ref(storage).bucket && objeto.fullPath.startsWith(`${carpeta}/`) ? objeto : null;
  } catch { return null; }
}

async function eliminarFotoVinculada(documento, carpeta, url) {
  if (DEMO) throw Error('No disponible en demostración.');
  // Primero se quita la referencia: el contador queda correcto aunque en
  // Storage ya se haya borrado manualmente o falle la eliminación física.
  await updateDoc(documento, {fotos: arrayRemove(url)});
  const archivo = archivoPropio(url, carpeta);
  if (!archivo) return {advertencia: null};
  try { await deleteObject(archivo); return {advertencia: null}; }
  catch (e) {
    if (e.code === 'storage/object-not-found') return {advertencia: null};
    return {advertencia: `Referencia quitada. Revisa manualmente el archivo en Storage: ${e.message}`};
  }
}

export const eliminarFotoHabitacion = (id, url) => eliminarFotoVinculada(doc(db, 'habitaciones', id), `habitaciones/${id}`, url);
export const eliminarFotoServicio = (id, url) => eliminarFotoVinculada(doc(db, 'servicios', id), `servicios/${id}`, url);
export async function eliminarFotoPortada(url) {
  if (DEMO) throw Error('No disponible en demostración.');
  // setDoc con merge también funciona si aún no existía el documento técnico.
  const portada = await obtenerConfiguracionPortada();
  const restantes = fotosValidas(portada.fotos).filter(item => item !== url);
  await guardarConfiguracionPortada({fotos: restantes});
  const archivo = archivoPropio(url, 'portada');
  if (!archivo) return {advertencia: null};
  try { await deleteObject(archivo); return {advertencia: null}; }
  catch (e) {
    if (e.code === 'storage/object-not-found') return {advertencia: null};
    return {advertencia: `Referencia quitada; revisa el archivo en Storage: ${e.message}`};
  }
}

// Limpieza por lote para las imágenes que ya fueron borradas fuera de la app.
// En habitaciones/servicios, arrayRemove evita sobrescribir otras fotos agregadas.
export async function limpiarReferenciasFotos(tipo, id, urls) {
  if (DEMO) throw Error('No disponible en demostración.');
  const lista = fotosValidas(urls);
  if (!lista.length) return;
  if (tipo === 'portada') {
    const config = await obtenerConfiguracionPortada();
    await guardarConfiguracionPortada({fotos: config.fotos.filter(url => !lista.includes(url))});
    return;
  }
  if (!['habitaciones','servicios'].includes(tipo) || !id) throw Error('Destino de fotos inválido.');
  await updateDoc(doc(db, tipo, id), {fotos: arrayRemove(...lista)});
}

export async function guardarOrdenFotos(tipo, id, urls) {
  if (DEMO) throw Error('No disponible en demostración.');
  const ordenNuevo = fotosValidas(urls);
  const destino = tipo === 'portada' ? PORTADA :
    ['habitaciones','servicios'].includes(tipo) && id ? doc(db, tipo, id) : null;
  if (!destino) throw Error('Destino no válido.');
  await runTransaction(db, async transaccion => {
    const actual = await transaccion.get(destino);
    if (!actual.exists()) throw Error('El registro ya no existe. Recarga la página.');
    if (!mismoConjuntoDeFotos(actual.data().fotos, ordenNuevo)) {
      throw Error('La galería cambió en otra sesión. Recarga antes de reordenar.');
    }
    transaccion.update(destino, {fotos: ordenNuevo});
  });
}

// Eliminación definitiva de un servicio: su imagen desaparece del catálogo y
// también del carrusel del inicio. Los fallos de limpieza física se informan.
export async function eliminarServicio(servicio) {
  if (DEMO) throw Error('No disponible en demostración.');
  await deleteDoc(doc(db, 'servicios', servicio.id));
  const imagenes = fotosValidas(servicio.fotos).map(url => archivoPropio(url, `servicios/${servicio.id}`)).filter(Boolean);
  const resultados = await Promise.allSettled(imagenes.map(archivo => deleteObject(archivo)));
  return {fallosFotos: resultados.filter(x => x.status === 'rejected' && x.reason?.code !== 'storage/object-not-found').length};
}
// Funciones protegidas: los importes y cambios de estado se validan en el servidor.
const invocar = async (nombre,payload) => {
  if(DEMO) throw Error('La demostración no escribe en Firebase.');
  const response=await httpsCallable(functions,nombre)(payload);
  return response.data;
};
export const crearSolicitud = payload => invocar('crearSolicitud',payload);
export const guardarTarifa = payload => invocar('guardarTarifa',payload);
export const actualizarSolicitud = payload => invocar('actualizarSolicitud',payload);
