import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { revisarConfiguracionFirebase } from './authConfig.mjs';

// Etapa 0.5: solo Firebase Authentication. Firestore/Storage se agregan después.
// Las variables VITE_* son parámetros públicos de la aplicación web, nunca secretos privados.
const estado = revisarConfiguracionFirebase(import.meta.env);
export const DEMO = estado.modo === 'demo';
export const AUTH_SETUP_ERROR = estado.modo === 'incompleto' ? estado.faltantes : null;

let app = null;
let auth = null;
if (estado.modo === 'firebase') {
  app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  });
  auth = getAuth(app);
}
export const AUTH_ENABLED = Boolean(auth);
export { app, auth };
