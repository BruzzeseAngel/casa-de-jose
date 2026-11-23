/**
 * Filtros de gestión de solicitudes (CU-08, RF-14).
 * Estos estados coinciden exactamente con los documentos de Firestore.
 * No realizan modificaciones en la base de datos: solo filtran listas ya leídas.
 */
export const ESTADOS_SOLICITUD=Object.freeze(['Pendiente','Confirmada','Rechazada','Archivada']);

export function filtrarSolicitudes(solicitudes=[],estado='Todas'){
  if(estado==='Todas')return solicitudes;
  if(!ESTADOS_SOLICITUD.includes(estado))return [];
  return solicitudes.filter(solicitud=>solicitud.estado===estado);
}

export function contarSolicitudes(solicitudes=[]){
  const conteo={Todas:solicitudes.length};
  for(const estado of ESTADOS_SOLICITUD)conteo[estado]=0;
  for(const solicitud of solicitudes){
    if(Object.hasOwn(conteo,solicitud.estado)&&solicitud.estado!=='Todas')conteo[solicitud.estado]++;
  }
  return conteo;
}
