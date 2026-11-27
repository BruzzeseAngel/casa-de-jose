import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
// Las variables VITE_* identifican el proyecto web; NO son secretos de servidor.
// Las claves privadas y la API de correo nunca van aquí.
// El modo demostración evita operar contra el proyecto Firebase cuando no está configurado.
export const DEMO = import.meta.env.VITE_DEMO_MODE !== 'false';
let app = null, auth = null, db = null, functions = null, storage = null;
if (!DEMO) {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  if (!config.apiKey || !config.projectId || !config.appId)
    throw new Error('Falta completar .env: revisa la guía PDF.');
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app, 'us-central1');
  storage = getStorage(app);
  // App Check opcional durante desarrollo; habilitar y exigir token antes de producción.
  if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    if (import.meta.env.DEV && import.meta.env.VITE_APPCHECK_DEBUG_TOKEN)
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
    initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
  }
  if (import.meta.env.VITE_USE_EMULATORS === 'true') {
    // Activar emuladores solamente al ejecutar localmente y con servicios ya iniciados.
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  }
}
export { app, auth, db, functions, storage };
