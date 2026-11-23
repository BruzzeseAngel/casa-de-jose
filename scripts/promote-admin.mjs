// Habilita al administrador únicamente desde un entorno confiable con Admin SDK.
// No usa una clave privada embebida ni permite cambiar roles desde el cliente.
import {initializeApp,applicationDefault} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
const email=process.argv[2];
if(!email||!/^\S+@\S+\.\S+$/.test(email)){
 console.error('Uso: npm run admin -- correo@ejemplo.cl');process.exit(1);
}
initializeApp({credential:applicationDefault()});
const auth=getAuth(),db=getFirestore();
const u=await auth.getUserByEmail(email);
await auth.setCustomUserClaims(u.uid,{...(u.customClaims||{}),admin:true});
await db.collection('usuarios').doc(u.uid).set({nombre:u.displayName||'Administrador',email:u.email,rol:'administrador'},{merge:true});
console.log(`Rol administrador asignado al UID ${u.uid}. Debe cerrar e iniciar sesión para actualizar el token.`);
