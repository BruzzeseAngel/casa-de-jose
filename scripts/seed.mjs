// Carga inicial OPCIONAL para un proyecto Firebase DE PRUEBAS.
// Las seis categorías y cantidades provienen del informe; los otros datos son FICTICIOS.
import {initializeApp,applicationDefault} from 'firebase-admin/app';
import {getFirestore,Timestamp} from 'firebase-admin/firestore';
import {DEMO_ROOMS,DEMO_SERVICES} from '../src/lib/demo.js';
if(!process.argv.includes('--confirm-demo')) {
 console.error('AVISO: esta carga usa PRECIOS FICTICIOS. Ejecuta con --confirm-demo únicamente en un proyecto de pruebas.');
 process.exit(1);
}
initializeApp({credential:applicationDefault()});
const db=getFirestore();
for(const h of DEMO_ROOMS){
 const ref=db.collection('habitaciones').doc(h.id);const snap=await ref.get();
 if(snap.exists){console.log('Ya existe habitación',h.id,'(omitida)');continue;}
 const {id,index,tarifas,...room}=h;
 await ref.set(room);
 await ref.collection('tarifas').doc('inicial-demo').set({
  precioDirecto:tarifas[0].precioDirecto,tipoPrecio:'neto',precioReferencia:null,vigente:true,
  fechaInicio:Timestamp.fromDate(new Date('2026-01-01T12:00:00Z'))
 });
 console.log('Categoría creada:',h.nombre);
}
for(const s of DEMO_SERVICES){
 const {id,emoji,...service}=s;const ref=db.collection('servicios').doc(id);
 if(!(await ref.get()).exists){await ref.set(service);console.log('Servicio creado:',service.nombre);}
}
console.log('Carga de ejemplo completada. Reemplaza los valores ficticios antes de publicar.');
